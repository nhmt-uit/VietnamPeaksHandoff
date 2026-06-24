/**
 * lib/data — TẦNG TRUY CẬP DỮ LIỆU (data access layer).
 * ------------------------------------------------------------------
 * UI chỉ gọi các hàm async ở đây và nhận về view-model đã validate bằng zod.
 * Hiện chạy bằng mock (lib/data/mock.ts). Khi có Supabase: GIỮ NGUYÊN chữ ký
 * các hàm, chỉ thay phần ruột bằng truy vấn supabase-js — UI không phải sửa.
 * ------------------------------------------------------------------
 */

import "server-only";

import type {
  MountainDetail,
  MountainListItem,
  MountainStatus,
  Province,
  Region,
  RouteDetail,
} from "@/types";
import {
  mountainDetailSchema,
  mountainListItemSchema,
  provinceSchema,
  routeDetailSchema,
} from "@/lib/validation";
import {
  mockMountainProvinces,
  mockMountains,
  mockProvinces,
  mockRanges,
  mockRoutes,
  mockWaypoints,
} from "./mock";

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu (mô phỏng f_unaccent của Postgres). */
function unaccent(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function provincesForMountain(mountainId: string): Province[] {
  const ids = new Set(
    mockMountainProvinces.filter((l) => l.mountain_id === mountainId).map((l) => l.province_id),
  );
  return mockProvinces.filter((p) => ids.has(p.id));
}

export type MountainSort = "elev_desc" | "elev_asc" | "name" | "diff_asc" | "diff_desc";

export type MountainFilters = {
  q?: string;
  regions?: Region[];
  statuses?: MountainStatus[];
  difficulties?: number[];
  provinceSlug?: string;
  elevMin?: number;
  elevMax?: number;
  sort?: MountainSort;
  locale?: "vi" | "en";
};

function comparator(
  sort: MountainSort,
  locale: "vi" | "en",
): (a: (typeof mockMountains)[number], b: (typeof mockMountains)[number]) => number {
  switch (sort) {
    case "elev_asc":
      return (a, b) => (a.elevation_m ?? 0) - (b.elevation_m ?? 0);
    case "diff_asc":
      return (a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0);
    case "diff_desc":
      return (a, b) => (b.difficulty ?? 0) - (a.difficulty ?? 0);
    case "name":
      return (a, b) => {
        const an = locale === "en" ? a.name_en : a.name_vi;
        const bn = locale === "en" ? b.name_en : b.name_vi;
        return an.localeCompare(bn, locale);
      };
    case "elev_desc":
    default:
      return (a, b) => (b.elevation_m ?? 0) - (a.elevation_m ?? 0);
  }
}

/** Danh sách tỉnh (cho dropdown bộ lọc), sắp theo tên tiếng Việt. */
export async function getProvinces(): Promise<Province[]> {
  return [...mockProvinces]
    .sort((a, b) => a.name_vi.localeCompare(b.name_vi, "vi"))
    .map((p) => provinceSchema.parse(p));
}

/** Danh sách đỉnh (đã lọc), sắp theo độ cao giảm dần — cho trang list + filter. */
export async function getMountains(
  filters: MountainFilters = {},
): Promise<MountainListItem[]> {
  const {
    q,
    regions,
    statuses,
    difficulties,
    provinceSlug,
    elevMin,
    elevMax,
    sort = "elev_desc",
    locale = "vi",
  } = filters;
  const needle = q ? unaccent(q) : null;

  return mockMountains
    .filter((m) => {
      if (regions?.length && (!m.region || !regions.includes(m.region))) return false;
      if (statuses?.length && !statuses.includes(m.status)) return false;
      if (difficulties?.length && (m.difficulty == null || !difficulties.includes(m.difficulty)))
        return false;
      if (elevMin != null && (m.elevation_m == null || m.elevation_m < elevMin)) return false;
      if (elevMax != null && (m.elevation_m == null || m.elevation_m > elevMax)) return false;

      const provs = provincesForMountain(m.id);
      if (provinceSlug && !provs.some((p) => p.slug === provinceSlug)) return false;

      if (needle) {
        const hay = unaccent(
          [m.name_vi, m.name_en, ...provs.map((p) => `${p.name_vi} ${p.aliases.join(" ")}`)].join(
            " ",
          ),
        );
        if (!hay.includes(needle)) return false;
      }
      return true;
    })
    .sort(comparator(sort, locale))
    .map((m) =>
      mountainListItemSchema.parse({
        id: m.id,
        name_vi: m.name_vi,
        name_en: m.name_en,
        slug: m.slug,
        elevation_m: m.elevation_m,
        region: m.region,
        status: m.status,
        difficulty: m.difficulty,
        cover_image_url: m.cover_image_url,
        provinces: provincesForMountain(m.id).map((p) => ({
          id: p.id,
          name_vi: p.name_vi,
          name_en: p.name_en,
          slug: p.slug,
        })),
      }),
    );
}

/** Tất cả slug đỉnh — cho generateStaticParams (SSG). */
export async function getMountainSlugs(): Promise<string[]> {
  return mockMountains.map((m) => m.slug);
}

/** Chi tiết một đỉnh theo slug (kèm dãy, tỉnh, các cung). null nếu không có. */
export async function getMountainBySlug(slug: string): Promise<MountainDetail | null> {
  const m = mockMountains.find((x) => x.slug === slug);
  if (!m) return null;

  const range = m.range_id ? (mockRanges.find((r) => r.id === m.range_id) ?? null) : null;
  const routes = mockRoutes.filter((r) => r.mountain_id === m.id);

  return mountainDetailSchema.parse({
    ...m,
    range,
    provinces: provincesForMountain(m.id),
    routes,
  });
}

/** Chi tiết một cung theo slug (kèm waypoint đã sắp + đỉnh cha). null nếu không có. */
export async function getRouteBySlug(slug: string): Promise<RouteDetail | null> {
  const r = mockRoutes.find((x) => x.slug === slug);
  if (!r) return null;

  const mountain = mockMountains.find((m) => m.id === r.mountain_id);
  if (!mountain) return null;

  const waypoints = mockWaypoints
    .filter((w) => w.route_id === r.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return routeDetailSchema.parse({ ...r, waypoints, mountain });
}
