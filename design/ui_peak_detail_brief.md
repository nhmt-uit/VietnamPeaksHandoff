# Build Brief — Trang chi tiết đỉnh (Peak Detail)

> Dùng kèm `wireframe_peak_detail.html` (tham chiếu bố cục) khi build bằng Claude Code.
> Stack: Next.js App Router + TS + Tailwind + supabase-js (no ORM) + next-intl + Leaflet/OpenTopoMap.

## Route & render
- Đường dẫn: `/[locale]/nui/[slug]` (locale = vi | en).
- Render: **SSG/ISR** — `generateStaticParams` duyệt slug các đỉnh, `revalidate` định kỳ.
- Truy vấn (server component, supabase-js): 1 đỉnh theo `slug` + tỉnh (qua `mountain_provinces`) + `range` + `routes` + `waypoints` + `photos`(approved) + `comments`(approved).

## Các khối (trên → dưới)

| Khối | Nguồn dữ liệu | Component gợi ý | Ghi chú |
|---|---|---|---|
| Nav | — | `<SiteNav>` | ô tìm kiếm, chuyển VI/EN (next-intl), nút Đăng nhập |
| Breadcrumb | `mountains.name_{locale}` | — | Trang chủ › Đỉnh núi › {tên} |
| Hero | `cover_image_url`, `name_vi/en`, `elevation_m`, tỉnh[], `region`, `status` | `<PeakHero>` | badge độ khó **suy từ routes** (xem dưới) |
| Dải facts | `elevation_m`, tỉnh[], `range`, `status`, độ khó + mùa (từ routes) | `<FactStrip>` | 6 ô, quét nhanh |
| Giới thiệu | `summary_{locale}` | — | |
| Cung đường | `routes[]`: `name_{locale}`, `start/end_point`, `distance_km`, `elevation_gain_m`, `duration_days`, `difficulty_level`, `best_season`, `permit_required`, `guide_required` | `<RouteCard>` | mỗi thẻ link `/nui/[slug]/cung/[route]` |
| Bản đồ (sticky) | `lat/lng` đỉnh + `routes.gpx_url` (GPX→GeoJSON) + `waypoints[]` | `<TrailMap>` | client component, `dynamic(..., { ssr:false })` |
| An toàn | `last_verified_at` | — | hộp cảnh báo + ngày cập nhật |
| Ảnh cộng đồng | `photos` where `status='approved'` | `<PhotoGrid>` | nút đăng ảnh chỉ hiện khi có session; insert `status='pending'` |
| Bình luận | `comments` where `status='approved'` | `<CommentList>` / `<CommentForm>` | đăng cần session; insert `status='pending'` |
| Footer | — | — | **bắt buộc ghi công** © OpenStreetMap contributors (ODbL) |

## Điểm dữ liệu cần lưu ý
- **Độ khó & mùa đẹp nằm ở `routes`, không ở `mountains`.** Hero/facts hiển thị độ khó của **cung dễ nhất** (hoặc khoảng "3–5" nếu nhiều cung); mùa đẹp lấy giá trị phổ biến nhất trong các cung. Nếu đỉnh chưa có cung nào → ẩn 2 mục này.
- Đỉnh nằm **ranh giới 2 tỉnh** → render nhiều tỉnh (qua `mountain_provinces`).
- 3 đỉnh chưa có toạ độ (Chung Nhía Vũ, Cao Ly, Phia Oắc) → `<TrailMap>` cần fallback khi `lat/lng` null (ẩn map hoặc hiện thông báo "đang cập nhật vị trí").

## i18n
- Locale lấy từ route; trường nội dung chọn `_vi`/`_en` theo locale; chuỗi giao diện qua next-intl.

## Auth / UGC (RLS đã có trong schema.sql)
- Đăng ảnh/bình luận yêu cầu đăng nhập (Supabase Auth).
- RLS: người dùng chỉ `insert` được bản `status='pending'` đứng tên mình; chỉ thấy bản `approved` + của mình. Duyệt làm ở admin (service role).

## Tham chiếu
- Bố cục: `wireframe_peak_detail.html`
- Sơ đồ trang: `sitemap.mermaid`
- Schema: `schema.sql`
