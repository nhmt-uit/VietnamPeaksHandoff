/**
 * db.ts
 * ------------------------------------------------------------------
 * Lớp alias TIỆN DÙNG đặt trên `database.types.ts`.
 *
 * Mọi nơi trong app import từ đây (qua `@/types`), KHÔNG import trực tiếp
 * `database.types.ts`. Nhờ vậy khi đổi nguồn type (bản mirror tay -> bản
 * `supabase gen types`), code ứng dụng không phải sửa.
 *
 * Helper generic (Tables/TablesInsert/TablesUpdate/Enums) và `Constants`
 * được TÁI XUẤT thẳng từ file gen — không định nghĩa lại để tránh lệch.
 * ------------------------------------------------------------------
 */

import { Constants } from "./database.types";
import type { Enums, Tables, TablesInsert, TablesUpdate } from "./database.types";

// Tái xuất helper generic của Supabase để dùng chung qua "@/types".
export { Constants };
export type { Tables, TablesInsert, TablesUpdate, Enums };

/* ============================================================
 * 1) Alias từng bảng (Row / Insert / Update)
 * ========================================================== */

export type Province = Tables<"provinces">;
export type ProvinceInsert = TablesInsert<"provinces">;
export type ProvinceUpdate = TablesUpdate<"provinces">;

export type Range = Tables<"ranges">;
export type RangeInsert = TablesInsert<"ranges">;
export type RangeUpdate = TablesUpdate<"ranges">;

export type Mountain = Tables<"mountains">;
export type MountainInsert = TablesInsert<"mountains">;
export type MountainUpdate = TablesUpdate<"mountains">;

export type MountainProvince = Tables<"mountain_provinces">;
export type MountainProvinceInsert = TablesInsert<"mountain_provinces">;
export type MountainProvinceUpdate = TablesUpdate<"mountain_provinces">;

export type Route = Tables<"routes">;
export type RouteInsert = TablesInsert<"routes">;
export type RouteUpdate = TablesUpdate<"routes">;

export type Waypoint = Tables<"waypoints">;
export type WaypointInsert = TablesInsert<"waypoints">;
export type WaypointUpdate = TablesUpdate<"waypoints">;

export type Article = Tables<"articles">;
export type ArticleInsert = TablesInsert<"articles">;
export type ArticleUpdate = TablesUpdate<"articles">;

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export type Comment = Tables<"comments">;
export type CommentInsert = TablesInsert<"comments">;
export type CommentUpdate = TablesUpdate<"comments">;

export type Photo = Tables<"photos">;
export type PhotoInsert = TablesInsert<"photos">;
export type PhotoUpdate = TablesUpdate<"photos">;

/* ============================================================
 * 2) Enum: union + hằng số runtime
 *    Union lấy từ helper `Enums<>`; mảng runtime lấy thẳng từ `Constants`
 *    => cùng MỘT nguồn với type, không thể lệch (không cần guard thủ công).
 * ========================================================== */

export type Region = Enums<"region">;
export type MountainStatus = Enums<"mountain_status">;
export type RouteAudience = Enums<"route_audience">;
export type WaypointType = Enums<"waypoint_type">;
export type ArticleType = Enums<"article_type">;
export type UgcStatus = Enums<"ugc_status">;

export const REGIONS = Constants.public.Enums.region;
export const MOUNTAIN_STATUSES = Constants.public.Enums.mountain_status;
export const ROUTE_AUDIENCES = Constants.public.Enums.route_audience;
export const WAYPOINT_TYPES = Constants.public.Enums.waypoint_type;
export const ARTICLE_TYPES = Constants.public.Enums.article_type;
export const UGC_STATUSES = Constants.public.Enums.ugc_status;

/** Độ khó 1..5 (CHECK constraint trong schema). Không phải enum Postgres nên khai báo tay. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;

/* ============================================================
 * 3) Type quan hệ (view-model) — ghép từ FK trong schema.
 *    Đây là hình dạng dữ liệu sau khi JOIN/embed bằng supabase-js,
 *    dùng cho các trang chi tiết & danh sách.
 *    (UI thuần tuý chỉ phụ thuộc các type này + alias ở mục 1.)
 * ========================================================== */

/** Đỉnh kèm dãy núi (có thể null) + danh sách tỉnh (nhiều-nhiều). */
export type MountainWithRelations = Mountain & {
  range: Range | null;
  provinces: Province[];
};

/** Cung đường kèm waypoint đã sắp theo sort_order. */
export type RouteWithWaypoints = Route & {
  waypoints: Waypoint[];
};

/** Trang chi tiết đỉnh: đỉnh + quan hệ + các cung của nó. */
export type MountainDetail = MountainWithRelations & {
  routes: Route[];
};

/** Trang chi tiết cung: cung + waypoint + đỉnh cha (để hiển thị breadcrumb/tên). */
export type RouteDetail = RouteWithWaypoints & {
  mountain: Mountain;
};

/** Item rút gọn cho danh sách/thẻ trong trang list + filter. */
export type MountainListItem = Pick<
  Mountain,
  "id" | "name_vi" | "name_en" | "slug" | "elevation_m" | "region" | "status" | "difficulty" | "cover_image_url"
> & {
  provinces: Pick<Province, "id" | "name_vi" | "name_en" | "slug">[];
};

/** Comment/Photo kèm hồ sơ người đăng (để hiển thị tên + avatar). */
export type CommentWithAuthor = Comment & {
  author: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
};

export type PhotoWithAuthor = Photo & {
  author: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
};
