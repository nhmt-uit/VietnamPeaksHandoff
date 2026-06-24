#!/usr/bin/env python3
"""
Vietnam Peaks — Phase 2: sinh seed.sql

Chạy cùng thư mục với 2 file đã tạo ở Phase 1:
  - peaks_wikidata_matched.csv
  - peaks_osm_matched.csv

Nó gộp: dữ liệu biên tập (49 đỉnh) + toạ độ (ưu tiên: tay > OSM > Wikidata)
rồi xuất seed.sql gồm INSERT cho provinces, mountains, mountain_provinces.
Mở seed.sql, kiểm tra, dán vào Supabase SQL Editor để chạy.

Độ cao luôn dùng số biên tập (không lấy của Wikidata).
"""

import csv, os, re, unicodedata

def ascii_(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace("đ", "d").replace("Đ", "D")

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", ascii_(s).lower()).strip("-")

def q(s):
    return "'" + s.replace("'", "''") + "'" if s is not None else "null"

# ---- Tỉnh (đơn vị mới) : name_vi -> (name_en, [alias tên cũ]) ----
PROV = {
    "Lào Cai":   ("Lao Cai",   ["Yên Bái"]),
    "Lai Châu":  ("Lai Chau",  []),
    "Sơn La":    ("Son La",    []),
    "Tuyên Quang": ("Tuyen Quang", ["Hà Giang"]),
    "Cao Bằng":  ("Cao Bang",  []),
    "Lạng Sơn":  ("Lang Son",  []),
    "Phú Thọ":   ("Phu Tho",   ["Vĩnh Phúc", "Hòa Bình"]),
    "Hà Nội":    ("Ha Noi",    []),
    "Quảng Ninh":("Quang Ninh",[]),
    "Quảng Ngãi":("Quang Ngai",["Kon Tum"]),
    "Đà Nẵng":   ("Da Nang",   ["Quảng Nam"]),
    "Hà Tĩnh":   ("Ha Tinh",   []),
    "Quảng Trị": ("Quang Tri", []),
    "Thanh Hóa": ("Thanh Hoa", []),
    "Huế":       ("Hue",       ["Thừa Thiên Huế"]),
    "Đắk Lắk":   ("Dak Lak",   ["Phú Yên"]),
    "Lâm Đồng":  ("Lam Dong",  ["Đắk Nông", "Bình Thuận"]),
    "Khánh Hòa": ("Khanh Hoa", ["Ninh Thuận"]),
    "Tây Ninh":  ("Tay Ninh",  []),
    "Đồng Nai":  ("Dong Nai",  ["Bình Phước"]),
    "An Giang":  ("An Giang",  []),
    "TP.HCM":    ("Ho Chi Minh City", ["Bà Rịa – Vũng Tàu"]),
}

# ---- 49 đỉnh: key | độ cao | vùng | [tỉnh mới] ----
# key phải trùng seed_name trong 2 CSV (để dò toạ độ).
N, C, S = "north", "central", "south"
PEAKS = [
    ("Fansipan", 3147, N, ["Lào Cai"]),
    ("Pu Si Lung", 3083, N, ["Lai Châu"]),
    ("Pu Ta Leng", 3049, N, ["Lai Châu"]),
    ("Ky Quan San", 3046, N, ["Lai Châu", "Lào Cai"]),
    ("Khang Su Văn", 3012, N, ["Lai Châu"]),
    ("Tả Liên Sơn", 2996, N, ["Lai Châu"]),
    ("Tà Chì Nhù", 2979, N, ["Lào Cai"]),
    ("Pờ Ma Lung", 2967, N, ["Lai Châu"]),
    ("Nhìu Cồ San", 2965, N, ["Lào Cai"]),
    ("Chung Nhía Vũ", 2918, N, ["Lai Châu"]),
    ("Lùng Cúng", 2913, N, ["Lào Cai"]),
    ("Nam Kang Ho Tao", 2881, N, ["Lai Châu", "Lào Cai"]),
    ("Phu Sa Phìn", 2873, N, ["Lào Cai"]),
    ("Tà Xùa", 2865, N, ["Sơn La", "Lào Cai"]),
    ("Lảo Thẩn", 2862, N, ["Lào Cai"]),
    ("Ngũ Chỉ Sơn", 2858, N, ["Lào Cai"]),
    ("Sa Mu", 2756, N, ["Sơn La"]),
    ("Pha Luông", 1880, N, ["Sơn La"]),
    ("Hàm Rồng", 1800, N, ["Lào Cai"]),
    ("Cao Ly", 1200, N, ["Lào Cai"]),
    ("Tây Côn Lĩnh", 2428, N, ["Tuyên Quang"]),
    ("Kiều Liêu Ti", 2402, N, ["Tuyên Quang"]),
    ("Chiêu Lầu Thi", 2402, N, ["Tuyên Quang"]),
    ("Phia Oắc", 1931, N, ["Cao Bằng"]),
    ("Mẫu Sơn", 1541, N, ["Lạng Sơn"]),
    ("Tam Đảo", 1591, N, ["Phú Thọ"]),
    ("Ba Vì", 1296, N, ["Hà Nội"]),
    ("Yên Tử", 1068, N, ["Quảng Ninh"]),
    ("Hàm Lợn", 462, N, ["Hà Nội"]),
    ("Ngọc Linh", 2598, C, ["Quảng Ngãi", "Đà Nẵng"]),
    ("Rào Cỏ", 2235, C, ["Hà Tĩnh"]),
    ("Động Voi Mẹp", 1771, C, ["Quảng Trị"]),
    ("Pù Luông", 1700, C, ["Thanh Hóa"]),
    ("Bạch Mã", 1450, C, ["Huế"]),
    ("Sơn Trà", 696, C, ["Đà Nẵng"]),
    ("Chư Yang Sin", 2442, C, ["Đắk Lắk"]),
    ("Bidoup", 2287, C, ["Lâm Đồng"]),
    ("Lang Biang", 2167, C, ["Lâm Đồng"]),
    ("Chư Mom Ray", 1773, C, ["Quảng Ngãi"]),
    ("Hòn Bà", 1578, C, ["Khánh Hòa"]),
    ("Đại Bình", 1100, C, ["Lâm Đồng"]),
    ("Núi Chúa", 1040, C, ["Khánh Hòa"]),
    ("Núi Cô Tiên", 900, C, ["Khánh Hòa"]),
    ("Núi Bà Đen", 986, S, ["Tây Ninh"]),
    ("Chứa Chan", 837, S, ["Đồng Nai"]),
    ("Bà Rá", 736, S, ["Đồng Nai"]),
    ("Núi Cấm", 705, S, ["An Giang"]),
    ("Núi Dinh", 500, S, ["TP.HCM"]),
    ("Núi Sam", 284, S, ["An Giang"]),
]

STATUS = {"Chung Nhía Vũ": "closed", "Pu Si Lung": "permit",
          "Khang Su Văn": "permit", "Pờ Ma Lung": "permit"}
RANK = {"Fansipan": 1, "Pu Si Lung": 2, "Pu Ta Leng": 3, "Ky Quan San": 4}

# Độ khó điển hình (cung dễ nhất), thang 1–5 — lấy từ seed_peaks_v1.md
DIFF = {
    "Fansipan": 4, "Pu Si Lung": 5, "Pu Ta Leng": 4, "Ky Quan San": 4, "Khang Su Văn": 5,
    "Tả Liên Sơn": 3, "Tà Chì Nhù": 3, "Pờ Ma Lung": 5, "Nhìu Cồ San": 3, "Chung Nhía Vũ": 4,
    "Lùng Cúng": 3, "Nam Kang Ho Tao": 5, "Phu Sa Phìn": 4, "Tà Xùa": 4, "Lảo Thẩn": 3,
    "Ngũ Chỉ Sơn": 4, "Sa Mu": 4, "Pha Luông": 3, "Hàm Rồng": 1, "Cao Ly": 2,
    "Tây Côn Lĩnh": 4, "Kiều Liêu Ti": 5, "Chiêu Lầu Thi": 3, "Phia Oắc": 3, "Mẫu Sơn": 2,
    "Tam Đảo": 2, "Ba Vì": 2, "Yên Tử": 2, "Hàm Lợn": 1, "Ngọc Linh": 5,
    "Rào Cỏ": 4, "Động Voi Mẹp": 4, "Pù Luông": 3, "Bạch Mã": 2, "Sơn Trà": 2,
    "Chư Yang Sin": 5, "Bidoup": 4, "Lang Biang": 2, "Chư Mom Ray": 4, "Hòn Bà": 3,
    "Đại Bình": 2, "Núi Chúa": 3, "Núi Cô Tiên": 2, "Núi Bà Đen": 1, "Chứa Chan": 2,
    "Bà Rá": 2, "Núi Cấm": 2, "Núi Dinh": 2, "Núi Sam": 1,
}

# Độ khó điển hình (cung dễ nhất), 1–5 — lấy từ seed_peaks_v1.md
DIFF = {
    "Fansipan":4,"Pu Si Lung":5,"Pu Ta Leng":4,"Ky Quan San":4,"Khang Su Văn":5,
    "Tả Liên Sơn":3,"Tà Chì Nhù":3,"Pờ Ma Lung":5,"Nhìu Cồ San":3,"Chung Nhía Vũ":4,
    "Lùng Cúng":3,"Nam Kang Ho Tao":5,"Phu Sa Phìn":4,"Tà Xùa":4,"Lảo Thẩn":3,
    "Ngũ Chỉ Sơn":4,"Sa Mu":4,"Pha Luông":3,"Hàm Rồng":1,"Cao Ly":2,
    "Tây Côn Lĩnh":4,"Kiều Liêu Ti":5,"Chiêu Lầu Thi":3,"Phia Oắc":3,"Mẫu Sơn":2,
    "Tam Đảo":2,"Ba Vì":2,"Yên Tử":2,"Hàm Lợn":1,"Ngọc Linh":5,
    "Rào Cỏ":4,"Động Voi Mẹp":4,"Pù Luông":3,"Bạch Mã":2,"Sơn Trà":2,
    "Chư Yang Sin":5,"Bidoup":4,"Lang Biang":2,"Chư Mom Ray":4,"Hòn Bà":3,
    "Đại Bình":2,"Núi Chúa":3,"Núi Cô Tiên":2,"Núi Bà Đen":1,"Chứa Chan":2,
    "Bà Rá":2,"Núi Cấm":2,"Núi Dinh":2,"Núi Sam":1,
}

# Độ khó điển hình từng đỉnh (cung dễ nhất), thang 1–5 — từ seed_peaks_v1.md
DIFF = {
    "Fansipan": 4, "Pu Si Lung": 5, "Pu Ta Leng": 4, "Ky Quan San": 4,
    "Khang Su Văn": 5, "Tả Liên Sơn": 3, "Tà Chì Nhù": 3, "Pờ Ma Lung": 5,
    "Nhìu Cồ San": 3, "Chung Nhía Vũ": 4, "Lùng Cúng": 3, "Nam Kang Ho Tao": 5,
    "Phu Sa Phìn": 4, "Tà Xùa": 4, "Lảo Thẩn": 3, "Ngũ Chỉ Sơn": 4,
    "Sa Mu": 4, "Pha Luông": 3, "Hàm Rồng": 1, "Cao Ly": 2,
    "Tây Côn Lĩnh": 4, "Kiều Liêu Ti": 5, "Chiêu Lầu Thi": 3, "Phia Oắc": 3,
    "Mẫu Sơn": 2, "Tam Đảo": 2, "Ba Vì": 2, "Yên Tử": 2, "Hàm Lợn": 1,
    "Ngọc Linh": 5, "Rào Cỏ": 4, "Động Voi Mẹp": 4, "Pù Luông": 3,
    "Bạch Mã": 2, "Sơn Trà": 2, "Chư Yang Sin": 5, "Bidoup": 4, "Lang Biang": 2,
    "Chư Mom Ray": 4, "Hòn Bà": 3, "Đại Bình": 2, "Núi Chúa": 3, "Núi Cô Tiên": 2,
    "Núi Bà Đen": 1, "Chứa Chan": 2, "Bà Rá": 2, "Núi Cấm": 2, "Núi Dinh": 2,
    "Núi Sam": 1,
}

# Toạ độ pin tay (ưu tiên cao nhất)
MANUAL = {
    "Pu Ta Leng": (22.4333333, 103.5666667),
    "Pờ Ma Lung": (22.6131062, 103.5024839),
    "Tà Xùa":     (21.4584026, 104.3442794),
    "Lảo Thẩn":   (22.6105512, 103.6864944),
    "Đại Bình":   (11.4970722, 107.8075595),
}

def read_coords(path):
    d = {}
    if not os.path.exists(path):
        print(f"  (cảnh báo: thiếu {path})")
        return d
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                d[r["seed_name"]] = (float(r["lat"]), float(r["lng"]))
            except (ValueError, KeyError, TypeError):
                pass
    return d

def resolve(key, wd, osm):
    if key in MANUAL: return MANUAL[key]
    if key in osm:    return osm[key]
    if key in wd:     return wd[key]
    return (None, None)

def main():
    wd = read_coords("peaks_wikidata_matched.csv")
    osm = read_coords("peaks_osm_matched.csv")

    out = ["-- Vietnam Peaks seed (provinces + mountains + mountain_provinces)",
           "-- Toạ độ: tay > OSM > Wikidata. Độ cao = số biên tập.\n",
           "begin;\n"]

    # provinces
    out.append("insert into provinces (name_vi, name_en, slug, aliases) values")
    rows = []
    for vi, (en, al) in PROV.items():
        arr = "array[" + ",".join(q(a) for a in al) + "]::text[]" if al else "'{}'::text[]"
        rows.append(f"  ({q(vi)}, {q(en)}, {q(slug(en))}, {arr})")
    out.append(",\n".join(rows) + "\non conflict (slug) do nothing;\n")

    # mountains
    out.append("insert into mountains (name_vi, name_en, slug, elevation_m, lat, lng, region, status, rank, difficulty) values")
    rows, no_coord = [], []
    for key, elev, region, provs in PEAKS:
        en = ascii_(key); sl = slug(key)
        lat, lng = resolve(key, wd, osm)
        if lat is None: no_coord.append(key)
        st = STATUS.get(key, "open")
        rk = RANK.get(key)
        df = DIFF.get(key)
        rows.append(
            f"  ({q(key)}, {q(en)}, {q(sl)}, {elev}, "
            f"{lat if lat is not None else 'null'}, {lng if lng is not None else 'null'}, "
            f"{q(region)}, {q(st)}, {rk if rk is not None else 'null'}, "
            f"{df if df is not None else 'null'})")
    out.append(",\n".join(rows) + "\non conflict (slug) do nothing;\n")

    # mountain_provinces (link theo slug)
    out.append("insert into mountain_provinces (mountain_id, province_id)")
    links = []
    for key, elev, region, provs in PEAKS:
        msl = slug(key)
        for p in provs:
            psl = slug(PROV[p][0])
            links.append(f"  select m.id, p.id from mountains m, provinces p "
                         f"where m.slug={q(msl)} and p.slug={q(psl)}")
    out.append("\n  union all\n".join(links) + "\non conflict do nothing;\n")

    out.append("commit;")
    open("seed.sql", "w", encoding="utf-8").write("\n".join(out))

    print(f"Đã ghi seed.sql: {len(PROV)} tỉnh, {len(PEAKS)} đỉnh.")
    print(f"Toạ độ: {len(PEAKS)-len(no_coord)}/{len(PEAKS)} có điểm.")
    if no_coord:
        print(f"Chưa có toạ độ (lat/lng = null): {', '.join(no_coord)}")

if __name__ == "__main__":
    main()
