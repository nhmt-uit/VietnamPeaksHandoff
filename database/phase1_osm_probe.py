#!/usr/bin/env python3
"""
Vietnam Peaks — Phase 1 (phần 2): OSM / Overpass probe cho các đỉnh còn thiếu.

Bổ sung cho phase1_wikidata_probe.py. Chạy trong môi trường mạng mở (Colab/VS Code).

Nó kéo TẤT CẢ node natural=peak ở Việt Nam từ OSM rồi đối chiếu với các đỉnh đang
thiếu/nghi ngờ, dùng matcher CHẶT HƠN (bỏ luật 'contains' lỏng đã gây khớp nhầm
Pu Ta Leng → Tả Lèng). Xuất: peaks_osm_matched.csv

Phụ thuộc:  pip install requests
Giấy phép:  dữ liệu OSM là ODbL → khi dùng phải GHI CÔNG "© OpenStreetMap contributors".
"""

import csv
import re
import sys
import unicodedata
from difflib import SequenceMatcher

try:
    import requests
except ImportError:
    sys.exit("Cần cài requests:  pip install requests")

OVERPASS = "https://overpass-api.de/api/interpreter"
HEADERS = {"User-Agent": "VietnamPeaks-DataProbe/0.1 (contact: you@vietnampeaks.com)"}

QUERY = """
[out:json][timeout:120];
area["ISO3166-1"="VN"]->.vn;
node["natural"="peak"](area.vn);
out body;
"""

# Các đỉnh cần tra OSM: (tên chính, [alias]).
# = 8 đỉnh không có trên Wikidata + 2 đỉnh nghi khớp nhầm trên Wikidata.
TARGETS = [
    ("Pờ Ma Lung", ["Bạch Mộc Lương", "Po Ma Lung"]),
    ("Chung Nhía Vũ", ["Chung Nhia Vu"]),
    ("Tà Xùa", ["Ta Xua"]),
    ("Lảo Thẩn", ["Lao Than", "Nhìu Cồ San Y Tý"]),
    ("Cao Ly", ["Cao Ly Bắc Hà"]),
    ("Chiêu Lầu Thi", ["Chieu Lau Thi", "Kiều Liều Ti"]),
    ("Phia Oắc", ["Phja Oắc", "Phia Oac"]),
    ("Đại Bình", ["Dai Binh", "Núi Đại Bình"]),
    # nghi khớp nhầm trên Wikidata → tra lại từ OSM:
    ("Pu Ta Leng", ["Putaleng", "Pú Tả Lèng"]),
    ("Sơn Trà", ["đỉnh Bàn Cờ", "Son Tra", "Núi Sơn Trà"]),
]


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "D")
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def compact(s: str) -> str:
    return norm(s).replace(" ", "")


def best_match(name, aliases, peaks):
    """Matcher chặt: exact (space-insensitive) hoặc fuzzy>=0.86. Bỏ 'contains' lỏng."""
    targets = [name] + aliases
    ncompact = {compact(t) for t in targets}
    nnorm = [norm(t) for t in targets]
    # 1) exact sau khi bỏ dấu & khoảng trắng
    for p in peaks:
        if compact(p["name"]) in ncompact:
            return p, "exact"
    # 2) fuzzy chặt
    best, score = None, 0.0
    for p in peaks:
        pn = norm(p["name"])
        for nt in nnorm:
            r = SequenceMatcher(None, pn, nt).ratio()
            if r > score:
                best, score = p, r
    if score >= 0.86:
        return best, f"fuzzy:{score:.2f}"
    return None, "none"


def fetch_osm_peaks():
    r = requests.post(OVERPASS, data={"data": QUERY}, headers=HEADERS, timeout=180)
    r.raise_for_status()
    els = r.json()["elements"]
    peaks = []
    for e in els:
        name = e.get("tags", {}).get("name")
        if not name:
            continue
        ele = e.get("tags", {}).get("ele")
        try:
            ele = float(re.sub(r"[^\d.]", "", ele)) if ele else None
        except ValueError:
            ele = None
        peaks.append({"name": name, "lat": e["lat"], "lng": e["lon"], "ele": ele,
                      "osm_id": e["id"]})
    return peaks


def main():
    print("Đang query Overpass/OSM (có thể mất 30–60s)...")
    peaks = fetch_osm_peaks()
    print(f"  → OSM có {len(peaks)} đỉnh (natural=peak có tên) ở Việt Nam.\n")

    rows, still_missing = [], []
    for name, aliases in TARGETS:
        p, how = best_match(name, aliases, peaks)
        if p:
            rows.append({"seed_name": name, "match_type": how,
                         "osm_name": p["name"], "osm_id": p["osm_id"],
                         "ele_m": p["ele"], "lat": p["lat"], "lng": p["lng"]})
        else:
            still_missing.append(name)

    with open("peaks_osm_matched.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=[
            "seed_name", "match_type", "osm_name", "osm_id", "ele_m", "lat", "lng"])
        w.writeheader()
        w.writerows(rows)

    print(f"OSM TÌM THẤY: {len(rows)}/{len(TARGETS)}")
    for r in rows:
        ele = f"{r['ele_m']}m" if r["ele_m"] else "(thiếu ele)"
        print(f"  {r['seed_name']:16s} ← OSM '{r['osm_name']}'  {ele}  "
              f"({r['lat']:.4f},{r['lng']:.4f})  [{r['match_type']}]")
    if still_missing:
        print(f"\nVẪN KHÔNG thấy ({len(still_missing)}) → phải nhập tay: "
              f"{', '.join(still_missing)}")
    print("\nĐã ghi: peaks_osm_matched.csv")
    print("Nhớ: dữ liệu OSM là ODbL — ghi công '© OpenStreetMap contributors' khi dùng.")


if __name__ == "__main__":
    main()
