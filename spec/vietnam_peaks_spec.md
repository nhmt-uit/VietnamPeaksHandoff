# Spec — Nền tảng thông tin leo núi Việt Nam

> Tên chính thức: **Vietnam Peaks** — tên miền dự kiến **vietnampeaks.com** (kiểm tra DNS + web cho thấy nhiều khả năng còn trống; cần vào nhà đăng ký bấm mua để xác nhận). Nghĩa kép: "đỉnh núi Việt Nam" (nghĩa đen) + "Việt Nam đỉnh cao / tự hào" (nghĩa bóng).
> Tài liệu này gom toàn bộ quyết định đã thống nhất. Identifier/slug dùng tiếng Anh; nội dung kế hoạch dùng tiếng Việt.

---

## 1. Bối cảnh & cơ hội

Hiện ở Việt Nam **chưa có một trang web duy nhất** tổng hợp đầy đủ và có cấu trúc thông tin leo núi (tên, độ cao, tỉnh, dãy núi, có leo được không, cung đường, lời khuyên). Thông tin đang nằm rải rác:

- **Blog / danh sách** (Decathlon, halophuot, shadow.vn...) — có nội dung nhưng không có cấu trúc, không lọc được.
- **App bản đồ** (ExoTrails, TrailMapp) — mạnh về cung đường/định vị, không phải thư viện thông tin núi.
- **Sàn tour** (Hub2S) — thiên về đặt dịch vụ porter/tour.

**Khoảng trống = một catalog có cấu trúc + lọc được**, thứ mà cả ba nhóm trên đều thiếu.

## 2. Định vị sản phẩm

Một "wiki / cơ sở dữ liệu" các ngọn núi Việt Nam, cho phép lọc theo tỉnh, độ cao, độ khó, trạng thái leo được hay không. Song ngữ Việt + Anh (hút thêm khách nước ngoài trekking ở VN).

## 3. Phạm vi MVP (v1)

**Có trong v1:**
- Các thực thể: `mountains`, `ranges`, `routes`, `waypoints`, `provinces`, `articles`.
- Nội dung do admin (chủ dự án) tự biên tập.
- UGC giới hạn: **comment + ảnh**, có duyệt trước khi hiển thị.
- Lọc & tìm kiếm bằng Postgres full-text.

**Để sau v1:**
- Tour & đơn vị tổ chức (operator/affiliate).
- Người dùng tự upload GPX / tạo cung đường.
- Search engine ngoài (Meilisearch/Typesense).

## 4. Các quyết định đã chốt

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Ngôn ngữ | Song ngữ **vi + en**, lưu cột riêng `_vi`/`_en`, không dùng bảng dịch |
| 2 | UGC | Người dùng chỉ **comment + ảnh**, mỗi bản ghi có `status` (pending/approved/rejected) |
| 3 | Độ khó | Thang **5 cấp chuẩn** (bảng mục 5) |
| 4 | Stack lõi | Next.js (App Router) + TS + Tailwind + Supabase + Vercel, `supabase-js` trực tiếp, **không ORM** |
| 5 | Quan hệ đỉnh–tỉnh | **Nhiều-nhiều** (đỉnh có thể nằm ranh giới 2 tỉnh) |
| 6 | Render | **SSG/ISR** cho trang đỉnh/cung (SEO), UGC tải động phía client |
| 7 | Bản đồ (v1) | **Leaflet + OpenTopoMap**, bọc sau interface `<TrailMap />` để dễ nâng lên MapLibre ở v2 |
| 8 | Tên & miền | **Vietnam Peaks** / vietnampeaks.com (cần bấm mua để xác nhận còn trống) |

**Phase 0–3 về cơ bản đã xong** (chốt quyết định, dữ liệu 49 đỉnh, schema, sitemap, wireframe, design system). Chi tiết trạng thái & index file ở mục 12.

## 5. Thang độ khó (5 cấp)

| Cấp | Mức | Đặc điểm | Ví dụ |
|---|---|---|---|
| 1 | Dễ | Đường mòn rõ, đi trong ngày, không cần thể lực đặc biệt | Núi Bà Đen (đường bộ), Hàm Lợn |
| 2 | Trung bình thấp | 1 ngày hoặc 2N1Đ nhẹ, dốc vừa | Chứa Chan |
| 3 | Trung bình | 2N1Đ, nhiều dốc dài, cần thể lực khá | Tà Chì Nhù |
| 4 | Khó | 2–3 ngày, địa hình phức tạp, cần kinh nghiệm | Pu Ta Leng |
| 5 | Rất khó | Nhiều ngày, hiểm trở, bắt buộc porter/guide + kinh nghiệm dày | Nam Kang Ho Tao, Khang Su Văn |

## 6. Mô hình dữ liệu

Chi tiết quan hệ xem file `mountain_db_erd.mermaid` kèm theo. Tóm tắt thực thể:

- **`mountains`** (trung tâm): `name_vi/en`, `slug`, `elevation_m`, `lat/lng`, `range_id`, `region`, `status` (open/restricted/permit/closed), `rank`, `summary_vi/en`, `cover_image_url`, `last_verified_at`.
- **`ranges`**: dãy núi, nhóm các đỉnh.
- **`provinces`**: 34 đơn vị hành chính mới + `aliases[]` (tên tỉnh cũ để tìm kiếm).
- **`mountain_provinces`**: bảng nối nhiều-nhiều đỉnh ↔ tỉnh.
- **`routes`**: `mountain_id`, `start/end_point`, `distance_km`, `elevation_gain_m`, `duration_days`, `difficulty_level` (1–5), `best_season`, `permit_required`, `guide_required`, `gpx_url`, `audience`, `last_verified_at`.
- **`waypoints`**: `route_id`, `type` (camp/water/viewpoint/marker/gate), `lat/lng`, `notes_vi/en`.
- **`articles`**: bài viết/guide, gắn `mountain_id` (nullable) hoặc đứng độc lập.
- **`profiles`**: nối `auth.users` của Supabase.
- **`comments`** & **`photos`**: UGC, mỗi cái có `mountain_id` HOẶC `route_id` (đều nullable) + `status`.

## 7. Công nghệ

**Lõi (tái dùng từ dự án tiếng Nhật):** Next.js App Router, TypeScript, Tailwind, Supabase (Postgres + Auth + Storage), `supabase-js` không ORM, Vercel, `zod`.

**Thêm cho đặc thù dự án:**
- **Bản đồ:** **Leaflet + react-leaflet** với tile **OpenTopoMap** (địa hình + đường đồng mức, hợp chủ đề hiking, gần như $0). Bọc sau interface `<TrailMap routes={...} waypoints={...} />` để v2 nâng lên MapLibre chỉ thay phần ruột. Component phải là client + `dynamic(..., { ssr: false })`.
- **GPX:** `@tmcw/togeojson` (GPX → GeoJSON). Parse ở server một lần để tính sẵn `distance_km`, `elevation_gain_m`.
- **Biểu đồ độ cao:** `Recharts`.
- **i18n:** `next-intl` (route `/vi` `/en` + chuỗi UI). Nội dung đã tách cột `_vi`/`_en` trong DB.
- **Ảnh người dùng:** Supabase Storage + `next/image`, nén client bằng `browser-image-compression`.
- **Tìm/lọc:** Postgres full-text search + filter.

## 8. Chi phí (USD, giá hiện tại)

| Dịch vụ | Free | Trả phí | Ghi chú |
|---|---|---|---|
| Vercel | Hobby $0 (phi thương mại) | Pro $20/tháng | Có affiliate/ads → bắt buộc Pro |
| Supabase | Free $0 | Pro $25/tháng | Free tự pause sau 1 tuần không hoạt động |
| Tile bản đồ | MapTiler Free (phi thương mại) / Protomaps self-host $0 | theo dùng | Muốn $0 thật → self-host Protomaps |
| Tên miền | — | ~$12/năm | |
| Email (Resend) | Free | — | Đủ cho reset mật khẩu |

**Hai mốc:** MVP/thử nghiệm ≈ **$0/tháng**; ra mắt production ≈ **$45/tháng** (~1,1 triệu VND).

## 9. Nguồn dữ liệu

- **Seed sạch bản quyền:** Wikidata (CC0 — tên, độ cao, toạ độ, dãy, tỉnh), OpenStreetMap/Overpass (ODbL — `natural=peak`, đường mòn).
- **Độ cao/profile:** DEM (SRTM / Copernicus).
- **Cung đường (GPX):** tự thu thập hoặc cộng đồng (lưu ý ToS khi lấy từ Strava/Wikiloc).
- **Nội dung mô tả/lời khuyên:** **tự viết** (không copy blog — bản quyền). Đây là "moat" của sản phẩm.
- **Ranh giới tỉnh:** 34 đơn vị mới (sáp nhập từ 12/6/2025) + bảng ánh xạ tên cũ → mới.

## 10. Lưu ý an toàn & pháp lý

- `last_verified_at` ở `mountains` và `routes` → hiển thị "cập nhật lần cuối".
- Disclaimer rõ ràng: thông tin tham khảo, người dùng tự kiểm tra trước khi đi.
- Đánh dấu các đỉnh cần giấy phép / vùng biên giới / cấm theo mùa (`status`, `permit_required`).

---

## 11. TODO — Backlog nghiên cứu & xây dựng

> Làm lần lượt từng việc. `[ ]` = chưa làm.

### Phase 0 — Chốt các quyết định còn mở
- [x] ~~Chốt **thư viện bản đồ**~~ → **Leaflet + react-leaflet**
- [x] ~~Chốt **nguồn tile**~~ → **OpenTopoMap** cho v1 (chuyển nguồn topo trả phí/self-host khi traffic lớn)
- [x] ~~Chốt **tên dự án + tên miền**~~ → **Vietnam Peaks** / vietnampeaks.com (bấm mua để xác nhận)
- [x] ~~Chốt **danh sách đỉnh seed cho v1**~~ → 49 đỉnh trong `seed_peaks_v1.md` (đang tinh chỉnh; số liệu chính xác khoá ở Phase 1)

### Phase 1 — Nghiên cứu dữ liệu
- [x] ~~Query **Wikidata**~~ → 41/49 đỉnh có toạ độ (`phase1_wikidata_probe.py`)
- [x] ~~Query **Overpass/OSM**~~ → lấp Chiêu Lầu Thi, Sơn Trà (`phase1_osm_probe.py`)
- [x] ~~**Ánh xạ tên tỉnh** cũ→mới~~ → 34 đơn vị + aliases (trong seed). *Polygon ranh giới để sau nếu cần lọc địa lý.*
- [x] ~~Phân loại **độ khó**~~ → đủ 49 đỉnh (thang 5 cấp)
- [ ] Backfill toạ độ 3 đỉnh: Chung Nhía Vũ, Cao Ly, Phia Oắc
- [ ] Tìm **nguồn DEM** (cần khi làm elevation profile cung đường)
- [ ] Xác định **nguồn GPX hợp pháp** cho cung đường

### Phase 2 — Schema & dữ liệu
- [x] ~~**DDL Supabase**~~ → `schema.sql` (tables, enums, indexes, FK, trigger; + fix `f_unaccent`, bucket Storage, `routes.description_vi/en`, `mountains.difficulty`)
- [x] ~~**RLS** cho comments/photos~~ → trong `schema.sql`
- [x] ~~**Full-text search**~~ → cột generated `search_tsv` + GIN (qua `f_unaccent`)
- [x] ~~**Seed script**~~ → `phase2_make_seed.py` (sinh `seed.sql`: 34 tỉnh + 49 đỉnh + liên kết)
- [ ] **Seed routes/waypoints** — chưa có dữ liệu cung đường nào

### Phase 3 — Thiết kế UI/UX
- [x] ~~**Sitemap**~~ → `sitemap.mermaid`
- [x] ~~**Wireframe trang đỉnh**~~ → `wireframe_peak_detail.html` + `ui_peak_detail_brief.md`
- [x] ~~**Wireframe danh sách + bộ lọc**~~ → `wireframe_list_filter.html` + `ui_list_filter_brief.md`
- [x] ~~**Wireframe chi tiết cung đường**~~ → `wireframe_route_detail.html` + `ui_route_detail_brief.md`
- [x] ~~**Design system**~~ → `design_system_sample.html` + `design_tokens.md`
- [ ] Wireframe còn thiếu: **trang chủ, bài viết, admin, đăng nhập**

### Phase 4 — Code
- [ ] Khởi tạo project: Next.js App Router + TS + Tailwind + supabase-js + next-intl
- [ ] Tích hợp **Supabase Auth** (đăng nhập để comment/đăng ảnh)
- [ ] **Component bản đồ** (client, dynamic ssr:false) + render GPX
- [ ] **Elevation profile** (Recharts)
- [ ] **Trang danh sách + bộ lọc** (filter server-side qua Postgres)
- [ ] **Trang chi tiết đỉnh + cung** (SSG/ISR)
- [ ] **Comment + upload ảnh** (Storage, nén client, hàng đợi duyệt)
- [ ] **Admin panel** CRUD (mountains/routes/ranges/articles/waypoints), bảo vệ bằng role
- [ ] **i18n**: tách chuỗi UI, render nội dung theo locale
- [ ] **SEO**: metadata API, sitemap, OG image

### Phase 5 — Vận hành & ra mắt
- [ ] Quy trình **duyệt UGC**
- [ ] Gắn **disclaimer an toàn** + hiển thị `last_verified_at`
- [ ] **Seed nội dung biên tập** cho ~50 đỉnh
- [ ] Nâng **Supabase Pro + Vercel Pro** khi public
- [ ] Cấu hình **tên miền + analytics**

---

## 12. Trạng thái & bộ tài liệu

**Đã xong (sẵn cho build):** định vị, phạm vi, mọi quyết định lõi, mô hình dữ liệu, `schema.sql` (đã sửa `f_unaccent`, thêm Storage bucket + `routes.description`), dữ liệu 49 đỉnh (46 có toạ độ), sitemap, 3 wireframe + brief, design system + tokens.

**Còn lo lúc build (nhỏ):** tạo bucket `photos` trên Supabase (SQL đã có), backfill toạ độ 3 đỉnh (Chung Nhía Vũ, Cao Ly, Phia Oắc).

**Gating để ra mắt hữu ích (việc lớn còn lại):** dữ liệu **cung đường** (routes/waypoints/GPX), **nội dung biên tập** (mô tả đỉnh, bài viết), **admin panel**, **bản dịch tiếng Anh**.

### Index bộ tài liệu
| File | Công dụng |
|---|---|
| `vietnam_peaks_spec.md` | Tài liệu tổng (file này) |
| `mountain_db_erd.mermaid` | Sơ đồ quan hệ thực thể |
| `schema.sql` | DDL Supabase — chạy đầu tiên |
| `phase2_make_seed.py` | Sinh `seed.sql` từ CSV toạ độ + dữ liệu biên tập |
| `phase1_wikidata_probe.py` · `phase1_osm_probe.py` | Lấy toạ độ (Phase 1) |
| `seed_peaks_v1.md` | 49 đỉnh: độ cao, tỉnh, độ khó, link Maps |
| `sitemap.mermaid` | Cấu trúc trang |
| `wireframe_peak_detail.html` · `ui_peak_detail_brief.md` | Trang chi tiết đỉnh |
| `wireframe_list_filter.html` · `ui_list_filter_brief.md` | Trang danh sách + lọc |
| `wireframe_route_detail.html` · `ui_route_detail_brief.md` | Trang chi tiết cung đường |
| `design_system_sample.html` · `design_tokens.md` | Giao diện & tokens |

### Trình tự build gợi ý (cho Claude Code)
1. Chạy `schema.sql` trên Supabase (đã gồm bucket `photos`).
2. Chạy `phase2_make_seed.py` → `seed.sql` → chạy `seed.sql`.
3. Scaffold Next.js theo `design_tokens.md`; dựng trang danh sách → chi tiết đỉnh → chi tiết cung theo brief.
4. Auth + UGC (comment/ảnh) + admin CRUD.
5. SEO, i18n, deploy Vercel.
