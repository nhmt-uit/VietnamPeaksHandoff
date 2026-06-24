# Build Brief — Trang chi tiết cung đường (Route Detail)

> Dùng kèm `wireframe_route_detail.html`. Stack như các trang khác.

## Route & render
- Đường dẫn: `/[locale]/nui/[slug]/cung/[route]`
- Render: **SSG/ISR** — `generateStaticParams` duyệt (mountain slug × route slug).
- Truy vấn (supabase-js): 1 `route` theo slug + đỉnh cha (`mountains`) + `waypoints` (sắp theo `sort_order`) + `photos`(approved) + `comments`(approved của route).

## Các khối

| Khối | Nguồn dữ liệu | Component | Ghi chú |
|---|---|---|---|
| Header | `routes.name_{locale}`, đỉnh cha, badges: `distance_km`, `elevation_gain_m`, `duration_days`, `difficulty_level`, `audience`, `best_season`, `permit_required`, `guide_required` | `<RouteHeader>` | link về `/nui/[slug]` |
| Bản đồ | `routes.gpx_url` (GPX→GeoJSON: polyline) + `waypoints[]` (markers) + điểm đầu/cuối | `<TrailMap>` | dùng lại component của trang đỉnh; client + `ssr:false` |
| Biểu đồ độ cao | mảng elevation trong GPX | `<ElevationProfile>` (Recharts) | parse GPX **ở server**, truyền mảng điểm xuống |
| Dải facts | các trường `routes` ở trên | `<FactStrip>` | 8 ô |
| Mô tả | `routes.description_{locale}` | — | **trường mới thêm vào schema** |
| Waypoints | `waypoints[]`: `type`, `name_{locale}`, `notes_{locale}`, `lat/lng`, `sort_order` | `<WaypointList>` | dạng timeline theo km/sort_order; icon theo `type` |
| Ảnh + bình luận | `photos`/`comments` where `route_id = ?` and `status='approved'` | `<PhotoGrid>` / `<CommentList>` | đăng cần session; insert `status='pending'` |
| An toàn | `routes.last_verified_at` | — | hộp cảnh báo + ngày cập nhật |
| Footer | — | — | ghi công © OpenStreetMap contributors |

## Điểm dữ liệu cần lưu ý
- **GPX là trung tâm trang này.** Parse `gpx_url` ở server (dùng `@tmcw/togeojson`): vẽ polyline + tính/đối chiếu `distance_km`, `elevation_gain_m`, và lấy mảng độ cao cho biểu đồ. Nếu route **chưa có `gpx_url`** → ẩn bản đồ tuyến + biểu đồ, chỉ hiện facts + mô tả + waypoints.
- `waypoints.type` ∈ camp/water/viewpoint/marker/gate/other → map sang icon + nhãn VI/EN.
- Comment/photo ở trang này gắn `route_id` (khác trang đỉnh gắn `mountain_id`).

## i18n / Auth / UGC
- Như các trang khác: locale từ route; nội dung `_vi/_en`; UGC qua Supabase Auth + RLS (`status='pending'` khi tạo).

## Liên quan schema (đã cập nhật)
- Đã thêm `routes.description_vi` / `routes.description_en` vào `schema.sql` cho khối Mô tả.

## Tham chiếu
- Bố cục: `wireframe_route_detail.html` · Tokens: `design_tokens.md` · Schema: `schema.sql`
- Brief liên quan: `ui_peak_detail_brief.md` (component `<TrailMap>` dùng chung)
