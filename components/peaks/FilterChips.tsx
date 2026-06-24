import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Province } from "@/types";
import { buildQuery, type FilterState } from "./filters";

/** Mỗi chip = bộ lọc đang bật; bấm ✕ -> link gỡ đúng giá trị đó (reset về trang 1). */
export async function FilterChips({
  state,
  provinces,
}: {
  state: FilterState;
  provinces: Province[];
}) {
  const t = await getTranslations("Filters");
  const tr = await getTranslations("Region");
  const ts = await getTranslations("Status");

  const chips: { key: string; label: string; href: string }[] = [];
  const reset = (next: Partial<FilterState>) => `/mountains${buildQuery({ ...state, ...next, page: 1 })}`;

  if (state.q) chips.push({ key: "q", label: `“${state.q}”`, href: reset({ q: "" }) });

  for (const r of state.regions)
    chips.push({
      key: `region-${r}`,
      label: tr(r),
      href: reset({ regions: state.regions.filter((x) => x !== r) }),
    });

  if (state.provinceSlug) {
    const p = provinces.find((x) => x.slug === state.provinceSlug);
    chips.push({
      key: "province",
      label: p ? p.name_vi : state.provinceSlug,
      href: reset({ provinceSlug: null }),
    });
  }

  for (const d of state.difficulties)
    chips.push({
      key: `diff-${d}`,
      label: `${t("difficulty")} ${d}`,
      href: reset({ difficulties: state.difficulties.filter((x) => x !== d) }),
    });

  for (const s of state.statuses)
    chips.push({
      key: `status-${s}`,
      label: ts(s),
      href: reset({ statuses: state.statuses.filter((x) => x !== s) }),
    });

  if (state.elevMin != null)
    chips.push({ key: "elevmin", label: `≥ ${state.elevMin} m`, href: reset({ elevMin: null }) });
  if (state.elevMax != null)
    chips.push({ key: "elevmax", label: `≤ ${state.elevMax} m`, href: reset({ elevMax: null }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          className="inline-flex items-center gap-1 rounded-pill border border-forest-100 bg-forest-100 px-2.5 py-0.5 text-xs text-forest-700 hover:bg-forest-500/15"
        >
          {c.label} <span aria-hidden>✕</span>
        </Link>
      ))}
    </div>
  );
}
