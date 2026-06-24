/**
 * lib/validation — zod schema bám theo types/ (nguồn = schema.sql).
 * ------------------------------------------------------------------
 * Dùng để validate dữ liệu ở RUNTIME: cả mock lẫn (sau này) response Supabase.
 * Mỗi schema có GUARD compile-time `MutualAssign<...>` bảo đảm kiểu suy ra từ
 * zod KHỚP đúng type DB — sai một field là lỗi biên dịch ngay.
 * ------------------------------------------------------------------
 */

import { z } from "zod";
import {
  ARTICLE_TYPES,
  MOUNTAIN_STATUSES,
  REGIONS,
  ROUTE_AUDIENCES,
  UGC_STATUSES,
  WAYPOINT_TYPES,
} from "@/types";
import type {
  Comment,
  CommentWithAuthor,
  Mountain,
  MountainDetail,
  MountainListItem,
  Photo,
  PhotoWithAuthor,
  Profile,
  Province,
  Range,
  Route,
  RouteDetail,
  Waypoint,
} from "@/types";

/** true nếu A và B gán được cho nhau (≈ bằng nhau về cấu trúc), ngược lại false. */
type MutualAssign<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/* ---------- mảnh ghép dùng lại ---------- */
const uuid = z.string().uuid();
const ts = z.string(); // timestamptz / date -> chuỗi ISO

/* ---------- enum ---------- */
export const regionSchema = z.enum(REGIONS);
export const mountainStatusSchema = z.enum(MOUNTAIN_STATUSES);
export const routeAudienceSchema = z.enum(ROUTE_AUDIENCES);
export const waypointTypeSchema = z.enum(WAYPOINT_TYPES);
export const articleTypeSchema = z.enum(ARTICLE_TYPES);
export const ugcStatusSchema = z.enum(UGC_STATUSES);
/** Độ khó 1..5 (CHECK trong schema; không phải enum Postgres). */
export const difficultySchema = z.number().int().min(1).max(5);

/* ============================================================
 * Row schema (khớp *.Row sau khi đã bỏ search_tsv ở Mountain)
 * ========================================================== */

export const provinceSchema = z.object({
  id: uuid,
  name_vi: z.string(),
  name_en: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()),
  created_at: ts,
});

export const rangeSchema = z.object({
  id: uuid,
  name_vi: z.string(),
  name_en: z.string(),
  slug: z.string(),
  created_at: ts,
});

export const mountainSchema = z.object({
  id: uuid,
  range_id: uuid.nullable(),
  name_vi: z.string(),
  name_en: z.string(),
  slug: z.string(),
  elevation_m: z.number().int().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  region: regionSchema.nullable(),
  status: mountainStatusSchema,
  difficulty: z.number().int().nullable(),
  rank: z.number().int().nullable(),
  summary_vi: z.string().nullable(),
  summary_en: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  last_verified_at: ts.nullable(),
  created_at: ts,
  updated_at: ts,
});

export const routeSchema = z.object({
  id: uuid,
  mountain_id: uuid,
  name_vi: z.string(),
  name_en: z.string(),
  slug: z.string(),
  start_point: z.string().nullable(),
  end_point: z.string().nullable(),
  description_vi: z.string().nullable(),
  description_en: z.string().nullable(),
  distance_km: z.number().nullable(),
  elevation_gain_m: z.number().int().nullable(),
  duration_days: z.number().nullable(),
  difficulty_level: z.number().int().nullable(),
  best_season: z.string().nullable(),
  permit_required: z.boolean(),
  guide_required: z.boolean(),
  gpx_url: z.string().nullable(),
  audience: routeAudienceSchema.nullable(),
  last_verified_at: ts.nullable(),
  created_at: ts,
  updated_at: ts,
});

export const waypointSchema = z.object({
  id: uuid,
  route_id: uuid,
  name_vi: z.string().nullable(),
  name_en: z.string().nullable(),
  type: waypointTypeSchema,
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  notes_vi: z.string().nullable(),
  notes_en: z.string().nullable(),
  sort_order: z.number().int(),
  created_at: ts,
});

export const profileSchema = z.object({
  id: uuid,
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: ts,
});

export const commentSchema = z.object({
  id: uuid,
  user_id: uuid,
  mountain_id: uuid.nullable(),
  route_id: uuid.nullable(),
  body: z.string(),
  status: ugcStatusSchema,
  created_at: ts,
});

export const photoSchema = z.object({
  id: uuid,
  user_id: uuid,
  mountain_id: uuid.nullable(),
  route_id: uuid.nullable(),
  url: z.string(),
  caption: z.string().nullable(),
  status: ugcStatusSchema,
  created_at: ts,
});

/* ============================================================
 * View-model schema (khớp các type quan hệ trong types/db.ts)
 * ========================================================== */

const provinceMiniSchema = provinceSchema.pick({
  id: true,
  name_vi: true,
  name_en: true,
  slug: true,
});

const authorMiniSchema = profileSchema.pick({
  id: true,
  display_name: true,
  avatar_url: true,
});

export const mountainListItemSchema = mountainSchema
  .pick({
    id: true,
    name_vi: true,
    name_en: true,
    slug: true,
    elevation_m: true,
    region: true,
    status: true,
    difficulty: true,
    cover_image_url: true,
  })
  .extend({ provinces: z.array(provinceMiniSchema) });

export const mountainDetailSchema = mountainSchema.extend({
  range: rangeSchema.nullable(),
  provinces: z.array(provinceSchema),
  routes: z.array(routeSchema),
});

export const routeDetailSchema = routeSchema.extend({
  waypoints: z.array(waypointSchema),
  mountain: mountainSchema,
});

export const commentWithAuthorSchema = commentSchema.extend({
  author: authorMiniSchema.nullable(),
});

export const photoWithAuthorSchema = photoSchema.extend({
  author: authorMiniSchema.nullable(),
});

/* ============================================================
 * GUARD parity (compile-time) — zod output PHẢI khớp type DB.
 * Sai field nào -> `true satisfies false` -> lỗi biên dịch tại đây.
 * ========================================================== */

true satisfies MutualAssign<z.infer<typeof provinceSchema>, Province>;
true satisfies MutualAssign<z.infer<typeof rangeSchema>, Range>;
true satisfies MutualAssign<z.infer<typeof mountainSchema>, Mountain>;
true satisfies MutualAssign<z.infer<typeof routeSchema>, Route>;
true satisfies MutualAssign<z.infer<typeof waypointSchema>, Waypoint>;
true satisfies MutualAssign<z.infer<typeof profileSchema>, Profile>;
true satisfies MutualAssign<z.infer<typeof commentSchema>, Comment>;
true satisfies MutualAssign<z.infer<typeof photoSchema>, Photo>;
true satisfies MutualAssign<z.infer<typeof mountainListItemSchema>, MountainListItem>;
true satisfies MutualAssign<z.infer<typeof mountainDetailSchema>, MountainDetail>;
true satisfies MutualAssign<z.infer<typeof routeDetailSchema>, RouteDetail>;
true satisfies MutualAssign<z.infer<typeof commentWithAuthorSchema>, CommentWithAuthor>;
true satisfies MutualAssign<z.infer<typeof photoWithAuthorSchema>, PhotoWithAuthor>;
