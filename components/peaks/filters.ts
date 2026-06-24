/**
 * components/peaks/filters.ts
 * Parse/serialize trạng thái bộ lọc ⇄ URL searchParams.
 * Dùng chung cho form lọc, chip filter và phân trang để chúng luôn nhất quán.
 * (Hàm thuần, không "use client".)
 */

import { MOUNTAIN_STATUSES, REGIONS } from "@/types";
import type { MountainStatus, Region } from "@/types";
import type { MountainSort } from "@/lib/data";

export const SORTS: MountainSort[] = ["elev_desc", "elev_asc", "name", "diff_asc", "diff_desc"];
export const PAGE_SIZE = 12;

export type FilterState = {
  q: string;
  regions: Region[];
  provinceSlug: string | null;
  difficulties: number[];
  statuses: MountainStatus[];
  elevMin: number | null;
  elevMax: number | null;
  sort: MountainSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

/** Hỗ trợ cả param lặp (?a=1&a=2) lẫn dạng phẩy (?a=1,2). */
function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function toInt(v: string | string[] | undefined): number | null {
  const n = Number(first(v));
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(sp: RawParams): FilterState {
  const regions = toArray(sp.region).filter((r): r is Region =>
    (REGIONS as readonly string[]).includes(r),
  );
  const statuses = toArray(sp.status).filter((s): s is MountainStatus =>
    (MOUNTAIN_STATUSES as readonly string[]).includes(s),
  );
  const difficulties = toArray(sp.difficulty)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);

  const provRaw = first(sp.province);
  const sortRaw = first(sp.sort);
  const sort = (SORTS as string[]).includes(sortRaw ?? "")
    ? (sortRaw as MountainSort)
    : "elev_desc";

  return {
    q: (first(sp.q) ?? "").trim(),
    regions,
    provinceSlug: provRaw && provRaw.length ? provRaw : null,
    difficulties,
    statuses,
    elevMin: toInt(sp.elev_min),
    elevMax: toInt(sp.elev_max),
    sort,
    page: Math.max(1, toInt(sp.page) ?? 1),
  };
}

/** Serialize state -> "?..." (bỏ giá trị mặc định/rỗng cho URL sạch). */
export function buildQuery(state: Partial<FilterState>): string {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  for (const r of state.regions ?? []) p.append("region", r);
  if (state.provinceSlug) p.set("province", state.provinceSlug);
  for (const d of state.difficulties ?? []) p.append("difficulty", String(d));
  for (const s of state.statuses ?? []) p.append("status", s);
  if (state.elevMin != null) p.set("elev_min", String(state.elevMin));
  if (state.elevMax != null) p.set("elev_max", String(state.elevMax));
  if (state.sort && state.sort !== "elev_desc") p.set("sort", state.sort);
  if (state.page && state.page > 1) p.set("page", String(state.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Có bộ lọc nào đang bật không (để hiện nút "Đặt lại" / thanh chip). */
export function hasActiveFilters(s: FilterState): boolean {
  return Boolean(
    s.q ||
      s.regions.length ||
      s.provinceSlug ||
      s.difficulties.length ||
      s.statuses.length ||
      s.elevMin != null ||
      s.elevMax != null,
  );
}
