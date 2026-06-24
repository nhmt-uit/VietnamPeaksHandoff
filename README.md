# Vietnam Peaks — Bộ tài liệu thiết kế & dữ liệu

Gói đầy đủ để **dựng v1** trang web thông tin leo núi Việt Nam: catalog đỉnh núi có cấu trúc, lọc theo tỉnh/độ cao/độ khó, bản đồ địa hình, song ngữ vi/en. Phần **dữ liệu + thiết kế đã hoàn tất**; gói này dùng cho giai đoạn build (Claude Code / VS Code).

## Cấu trúc thư mục

```
vietnam-peaks-handoff/
├── README.md                      ← bạn đang đọc
├── spec/
│   ├── vietnam_peaks_spec.md       — tài liệu tổng (ĐỌC ĐẦU TIÊN)
│   ├── mountain_db_erd.mermaid     — sơ đồ quan hệ DB
│   └── seed_peaks_v1.md            — 49 đỉnh: độ cao, tỉnh, độ khó, link Maps
├── database/
│   ├── schema.sql                  — DDL Supabase (CHẠY ĐẦU TIÊN)
│   ├── phase2_make_seed.py         — sinh seed.sql từ CSV + dữ liệu biên tập
│   ├── phase1_wikidata_probe.py    — lấy toạ độ từ Wikidata
│   └── phase1_osm_probe.py         — lấy toạ độ từ OpenStreetMap
└── design/
    ├── sitemap.mermaid             — cấu trúc trang
    ├── design_system_sample.html   — bản mẫu giao diện (mở bằng trình duyệt)
    ├── design_tokens.md            — màu / font / tokens cho Tailwind
    ├── wireframe_peak_detail.html   + ui_peak_detail_brief.md
    ├── wireframe_list_filter.html   + ui_list_filter_brief.md
    └── wireframe_route_detail.html  + ui_route_detail_brief.md
```
> File `.html` mở bằng trình duyệt để xem. File `.mermaid` xem trên mermaid.live hoặc trình xem hỗ trợ Mermaid.

## Trình tự build

1. Mua tên miền **vietnampeaks.com** (xác nhận còn trống).
2. Tạo project **Supabase** → SQL Editor → chạy `database/schema.sql` (đã gồm bucket Storage `photos`).
3. **Lấy toạ độ:** chạy `database/phase1_wikidata_probe.py` rồi `phase1_osm_probe.py` (máy có internet) → ra 2 file CSV. Backfill tay 3 đỉnh còn thiếu (Chung Nhía Vũ, Cao Ly, Phia Oắc).
4. **Sinh dữ liệu:** đặt `phase2_make_seed.py` cùng thư mục 2 CSV → chạy → ra `seed.sql` → chạy `seed.sql` trên Supabase.
5. **Scaffold Next.js** (App Router + TS + Tailwind + supabase-js + next-intl) theo `design/design_tokens.md`.
6. **Dựng trang** theo brief: danh sách + lọc → chi tiết đỉnh → chi tiết cung.
7. **Auth + UGC** (comment/ảnh) + **admin CRUD**.
8. **SEO, i18n, deploy Vercel.**

## Cách dùng với Claude Code

1. Đặt cả thư mục này vào repo dự án (hoặc mở trực tiếp trong Claude Code).
2. Cho nó nắm bối cảnh trước:
   > "Đọc `README.md` và `spec/vietnam_peaks_spec.md` để nắm toàn bộ dự án trước khi bắt đầu."
3. Làm **từng bước một**, mỗi lần đưa file liên quan. Ví dụ các lệnh:
   - "Tạo project Next.js + Tailwind + supabase-js + next-intl, áp dụng màu/font theo `design/design_tokens.md`."
   - "Dựng trang danh sách + bộ lọc theo `design/ui_list_filter_brief.md` và `wireframe_list_filter.html`."
   - "Dựng trang chi tiết đỉnh theo `ui_peak_detail_brief.md`, dùng dữ liệu thật từ Supabase."
   - "Tạo component `<TrailMap>` (Leaflet + OpenTopoMap, dynamic ssr:false) dùng cho cả trang đỉnh và cung."
4. Mỗi **brief** đã ghi sẵn: route, cách render, **ánh xạ UI → bảng/cột DB**, component gợi ý, và các bẫy dữ liệu — để Claude Code dựng đúng ngay.

## Trạng thái & việc còn lại

- **Đã xong:** mọi quyết định lõi, schema (đã vá lỗi `f_unaccent` + Storage), 49 đỉnh (46 có toạ độ), 3 wireframe trang chính + brief, design system + tokens.
- **Việc lớn còn lại (nội dung & build, không còn ẩn số thiết kế):** dữ liệu **cung đường** (GPX + mô tả), **nội dung biên tập** (mô tả đỉnh, bài viết), **bản dịch EN**, wireframe **admin** + **trang chủ**.

## Lưu ý quan trọng

- **Bản quyền dữ liệu:** toạ độ Wikidata là CC0; dữ liệu OSM là ODbL → **bắt buộc ghi công "© OpenStreetMap contributors"** khi hiển thị bản đồ. Nội dung mô tả phải tự viết, không copy blog.
- **An toàn:** hiển thị `last_verified_at` + disclaimer "thông tin tham khảo"; đánh dấu đỉnh cần giấy phép / vùng biên giới.
- **Chi phí:** ~$0 khi thử nghiệm → ~$45/tháng khi production (Supabase Pro $25 + Vercel Pro $20) + tên miền ~$12/năm.
