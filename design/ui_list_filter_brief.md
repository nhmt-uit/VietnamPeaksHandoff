# Build Brief — Trang danh sách + bộ lọc (`/nui`)

> Dùng kèm `wireframe_list_filter.html`. Stack như trang chi tiết.

## Route & render
- Đường dẫn: `/[locale]/nui`
- **Bộ lọc đặt trong URL searchParams** (`?region=&province=&difficulty=&elev_min=&elev_max=&status=&q=&sort=&page=`) → URL chia sẻ được, thân thiện SEO, và render server-side.
- Render: server component đọc `searchParams`, query Supabase theo filter. Trang gốc (không filter) có thể ISR.

## Bố cục
- Sidebar lọc (sticky, trái) + lưới kết quả (phải). Mobile: sidebar xếp trên, dạng thu gọn.

## Bộ lọc → truy vấn

| Bộ lọc | Cột / cách query |
|---|---|
| Tìm tên (`q`) | full-text `search_tsv` (đã có index GIN) |
| Vùng (`region`) | `mountains.region in (...)` |
| Tỉnh (`province`) | join `mountain_provinces` → `provinces.slug in (...)` |
| Độ cao (`elev_min/max`) | `elevation_m between ...` |
| Độ khó (`difficulty`) | **xem khuyến nghị bên dưới** |
| Trạng thái (`status`) | `status in (...)` |
| Sắp xếp (`sort`) | `elevation_m desc/asc`, `name_{locale}`, `difficulty` |

## ⚠ Khuyến nghị schema: thêm `difficulty` vào `mountains`
Hiện `difficulty_level` chỉ nằm ở `routes`. Nhưng trang này **lọc & sắp xếp theo độ khó ở cấp đỉnh**, nên cần một giá trị độ khó đại diện trên `mountains`:
```sql
alter table mountains add column difficulty smallint check (difficulty between 1 and 5);
```
- Ý nghĩa: độ khó *điển hình* của đỉnh (= cung dễ nhất). Đã có sẵn trong cột "Độ khó" của `seed_peaks_v1.md`.
- `routes.difficulty_level` vẫn giữ độ khó riêng từng cung.
- Giúp filter/sort đơn giản (không phải gom từ routes). Khớp hướng "đơn giản, thực dụng".

## Component gợi ý
`<FilterSidebar>`, `<FilterChips>` (chip filter đang bật, bấm ✕ để gỡ), `<SortControl>`,
`<ViewToggle>` (Lưới / Bản đồ), `<PeakCard>`, `<Pagination>`.

## Thẻ đỉnh (`<PeakCard>`)
Dữ liệu: `cover_image_url`, `name_{locale}`, `name_en` phụ, `elevation_m`, tỉnh (1 hoặc nhiều),
`status`, `difficulty` (chấm). Click → `/nui/[slug]`.

## Chế độ bản đồ (toggle "Bản đồ")
Dùng lại `<TrailMap>` nhưng hiển thị **tất cả đỉnh đã lọc** dạng pin (gom cụm nếu nhiều).
Bỏ qua đỉnh chưa có `lat/lng`. v1 có thể làm sau, nhưng thiết kế chừa sẵn nút toggle.

## i18n / phân trang
- Locale từ route; nội dung chọn `_vi/_en`.
- Phân trang qua `?page=`; mỗi trang ~12–18 thẻ.

## Tham chiếu
- Bố cục: `wireframe_list_filter.html` · Sơ đồ trang: `sitemap.mermaid` · Schema: `schema.sql`
