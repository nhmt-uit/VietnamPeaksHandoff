#!/usr/bin/env python3
"""
Vietnam Peaks — Phase 1: Wikidata coverage probe

Chạy script này trong môi trường có mạng (Claude Code / VS Code), KHÔNG chạy trong
sandbox bị giới hạn domain.

Nó sẽ:
  1. Query Wikidata (SPARQL) lấy mọi item là 'mountain' ở Việt Nam, kèm độ cao + toạ độ.
  2. Đối chiếu với danh sách 49 đỉnh seed (khớp theo tên chính + alias, có fuzzy fallback).
  3. In báo cáo độ phủ và ghi ra:
       - peaks_wikidata_matched.csv  (các đỉnh tìm thấy: QID, toạ độ, độ cao Wikidata vs ta)
       - peaks_unmatched.txt         (các đỉnh phải nhập tay / tìm trên OSM)

Phụ thuộc:  pip install requests
Lưu ý:
  - Toạ độ Wikidata là CC0 → dùng tự do.
  - Độ cao Wikidata có thể cũ (vd Fansipan ghi 3143, số đo lại là 3147.3) → cột so sánh
    'elev_diff' giúp phát hiện lệch; ưu tiên số biên tập của ta khi chênh nhiều.
  - Đỉnh nằm trong peaks_unmatched.txt: lấy toạ độ từ OSM/Overpass (ODbL, nhớ ghi công).
"""

import csv
import re
import sys
import time
import unicodedata
from difflib import SequenceMatcher

try:
    import requests
except ImportError:
    sys.exit("Cần cài requests:  pip install requests")

WDQS = "https://query.wikidata.org/sparql"
# Wikidata yêu cầu User-Agent mô tả rõ; đổi email cho đúng của bạn.
HEADERS = {"User-Agent": "VietnamPeaks-DataProbe/0.1 (contact: you@vietnampeaks.com)"}

SPARQL = """
SELECT ?m ?mLabel ?elev ?coord WHERE {
  ?m wdt:P31/wdt:P279* wd:Q8502 .   # instance/subclass of mountain
  ?m wdt:P17 wd:Q881 .              # country = Vietnam
  OPTIONAL { ?m wdt:P2044 ?elev. }  # elevation above sea level
  OPTIONAL { ?m wdt:P625 ?coord. }  # coordinate location
  SERVICE wikibase:label { bd:serviceParam wikibase:language "vi,en". }
}
ORDER BY DESC(?elev)
"""

# 49 đỉnh seed: (tên chính, [alias để khớp], độ cao biên tập của ta)
SEED = [
    ("Fansipan", ["Phan Xi Păng", "Phan Xi Pang", "Fan Si Pan"], 3147),
    ("Pu Si Lung", ["Pusilung", "Pu Si Lung"], 3083),
    ("Pu Ta Leng", ["Putaleng", "Pú Tả Lèng"], 3049),
    ("Ky Quan San", ["Bạch Mộc Lương Tử", "Kỳ Quan San", "Ki Quan San"], 3046),
    ("Khang Su Văn", ["Phàn Liên San", "U Thái San"], 3012),
    ("Tả Liên Sơn", ["Tả Liên", "Cổ Trâu"], 2996),
    ("Tà Chì Nhù", ["Phu Song Sung", "Chung Chua Nhà", "Pú Luông"], 2979),
    ("Pờ Ma Lung", ["Bạch Mộc Lương", "Pờ Ma Lung"], 2967),
    ("Nhìu Cồ San", ["Nhìu Cô San", "Nhiều Cồ San"], 2965),
    ("Chung Nhía Vũ", [], 2918),
    ("Lùng Cúng", [], 2913),
    ("Nam Kang Ho Tao", ["Nam Kang"], 2881),
    ("Phu Sa Phìn", ["Phu Sa Phin"], 2873),
    ("Tà Xùa", ["Ta Xua"], 2865),
    ("Lảo Thẩn", ["Lao Than"], 2862),
    ("Ngũ Chỉ Sơn", [], 2858),
    ("Sa Mu", ["U Bò", "Sa Mu U Bò"], 2756),
    ("Pha Luông", ["Pha Luong"], 1880),
    ("Hàm Rồng", ["Hàm Rồng Sa Pa", "Ham Rong"], 1800),
    ("Cao Ly", [], 1200),
    ("Tây Côn Lĩnh", ["Tay Con Linh"], 2428),
    ("Kiều Liêu Ti", ["Kiều Liều Ti"], 2402),
    ("Chiêu Lầu Thi", ["Chiêu Lầu Thi"], 2402),
    ("Phia Oắc", ["Phja Oắc", "Phia Oac"], 1931),
    ("Mẫu Sơn", ["Mau Son"], 1541),
    ("Tam Đảo", ["Thiên Thị", "Tam Dao"], 1591),
    ("Ba Vì", ["đỉnh Vua", "Ba Vi"], 1296),
    ("Yên Tử", ["chùa Đồng", "Yen Tu"], 1068),
    ("Hàm Lợn", ["Ham Lon"], 462),
    ("Ngọc Linh", ["Ngoc Linh"], 2598),
    ("Rào Cỏ", ["Rao Co"], 2235),
    ("Động Voi Mẹp", ["Sa Mù", "Voi Mẹp"], 1771),
    ("Pù Luông", ["Pu Luong"], 1700),
    ("Bạch Mã", ["Bach Ma"], 1450),
    ("Sơn Trà", ["đỉnh Bàn Cờ", "Son Tra"], 696),
    ("Chư Yang Sin", ["Chu Yang Sin"], 2442),
    ("Bidoup", ["Bi Doup", "Bidoup Núi Bà"], 2287),
    ("Lang Biang", ["Langbiang", "Lang Bian"], 2167),
    ("Chư Mom Ray", ["Chu Mom Ray"], 1773),
    ("Hòn Bà", ["Hon Ba"], 1578),
    ("Đại Bình", ["Dai Binh"], 1100),
    ("Núi Chúa", ["Nui Chua"], 1040),
    ("Núi Cô Tiên", ["Cô Tiên", "Hoàng Ngưu Sơn"], 900),
    ("Núi Bà Đen", ["Bà Đen", "Ba Den"], 986),
    ("Chứa Chan", ["Gia Lào", "Chua Chan"], 837),
    ("Bà Rá", ["Ba Ra"], 736),
    ("Núi Cấm", ["Thiên Cấm Sơn", "Nui Cam"], 705),
    ("Núi Dinh", ["Nui Dinh"], 500),
    ("Núi Sam", ["Nui Sam"], 284),
]


def norm(s: str) -> str:
    """bỏ dấu + thường hoá để so khớp."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "D")
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def fetch_wikidata():
    r = requests.get(WDQS, params={"query": SPARQL, "format": "json"},
                     headers=HEADERS, timeout=60)
    r.raise_for_status()
    rows = r.json()["results"]["bindings"]
    out = []
    for b in rows:
        label = b.get("mLabel", {}).get("value", "")
        qid = b["m"]["value"].rsplit("/", 1)[-1]
        elev = b.get("elev", {}).get("value")
        lat = lng = None
        if "coord" in b:
            mobj = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", b["coord"]["value"])
            if mobj:
                lng, lat = float(mobj.group(1)), float(mobj.group(2))
        out.append({"qid": qid, "label": label,
                    "elev": float(elev) if elev else None, "lat": lat, "lng": lng})
    # gộp theo QID (một đỉnh có thể ra nhiều dòng nếu nhiều toạ độ)
    by_qid = {}
    for row in out:
        by_qid.setdefault(row["qid"], row)
    return list(by_qid.values())


def best_match(seed_name, aliases, wd):
    targets = [seed_name] + aliases
    ntargets = [norm(t) for t in targets]
    # 1) khớp chính xác (sau khi bỏ dấu)
    for w in wd:
        nl = norm(w["label"])
        if any(nl == nt for nt in ntargets):
            return w, "exact"
    # 2) chứa nhau
    for w in wd:
        nl = norm(w["label"])
        if any(nt and (nt in nl or nl in nt) for nt in ntargets):
            return w, "contains"
    # 3) fuzzy
    best, score = None, 0.0
    for w in wd:
        nl = norm(w["label"])
        for nt in ntargets:
            r = SequenceMatcher(None, nl, nt).ratio()
            if r > score:
                best, score = w, r
    if score >= 0.82:
        return best, f"fuzzy:{score:.2f}"
    return None, "none"


def main():
    print("Đang query Wikidata...")
    wd = fetch_wikidata()
    print(f"  → Wikidata trả về {len(wd)} núi ở Việt Nam.\n")

    matched, unmatched = [], []
    for name, aliases, our_elev in SEED:
        w, how = best_match(name, aliases, wd)
        if w:
            wd_elev = w["elev"]
            diff = (abs(wd_elev - our_elev) if (wd_elev is not None) else None)
            matched.append({
                "seed_name": name, "match_type": how, "qid": w["qid"],
                "wd_label": w["label"], "wd_elev_m": wd_elev, "our_elev_m": our_elev,
                "elev_diff": diff, "lat": w["lat"], "lng": w["lng"],
            })
        else:
            unmatched.append(name)

    with open("peaks_wikidata_matched.csv", "w", newline="", encoding="utf-8") as f:
        wcsv = csv.DictWriter(f, fieldnames=[
            "seed_name", "match_type", "qid", "wd_label",
            "wd_elev_m", "our_elev_m", "elev_diff", "lat", "lng"])
        wcsv.writeheader()
        wcsv.writerows(matched)

    with open("peaks_unmatched.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(unmatched))

    n = len(SEED)
    no_coord = [m["seed_name"] for m in matched if m["lat"] is None]
    big_diff = [m for m in matched if m["elev_diff"] and m["elev_diff"] > 50]

    print(f"ĐỘ PHỦ: {len(matched)}/{n} đỉnh có trên Wikidata "
          f"({len(matched)*100//n}%).")
    print(f"  - Có toạ độ: {len(matched) - len(no_coord)}/{len(matched)}")
    if no_coord:
        print(f"  - Khớp nhưng THIẾU toạ độ (cần OSM): {', '.join(no_coord)}")
    if big_diff:
        print(f"\nLỆCH ĐỘ CAO > 50 m (cần rà tay):")
        for m in big_diff:
            print(f"  {m['seed_name']:22s} Wikidata={m['wd_elev_m']}  ta={m['our_elev_m']}")
    print(f"\nKHÔNG tìm thấy trên Wikidata ({len(unmatched)}): "
          f"{', '.join(unmatched) if unmatched else '—'}")
    print("\nĐã ghi: peaks_wikidata_matched.csv, peaks_unmatched.txt")


if __name__ == "__main__":
    main()
