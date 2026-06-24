import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getMountains, getProvinces, type MountainSort } from "@/lib/data";
import { FilterChips } from "@/components/peaks/FilterChips";
import { FilterSidebar } from "@/components/peaks/FilterSidebar";
import { PeakCard } from "@/components/peaks/PeakCard";
import { Pagination } from "@/components/peaks/Pagination";
import { buildQuery, PAGE_SIZE, parseFilters, SORTS } from "@/components/peaks/filters";

export const metadata: Metadata = {
  title: "Đỉnh núi Việt Nam — Vietnam Peaks",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PeaksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const state = parseFilters(sp);

  const t = await getTranslations("Filters");
  const tSort = await getTranslations("Sort");

  const [provinces, all] = await Promise.all([
    getProvinces(),
    getMountains({
      q: state.q || undefined,
      regions: state.regions,
      statuses: state.statuses,
      difficulties: state.difficulties,
      provinceSlug: state.provinceSlug ?? undefined,
      elevMin: state.elevMin ?? undefined,
      elevMax: state.elevMax ?? undefined,
      sort: state.sort,
      locale,
    }),
  ]);

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(state.page, totalPages);
  const pageItems = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header trang */}
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium text-forest-700 hover:underline">
          ⛰ Vietnam Peaks
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest-900">
          {t("pageTitle")}
        </h1>
        <p className="mt-1 text-sm text-rock-600">{t("pageSubtitle", { count: total })}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside>
          <FilterSidebar locale={locale} state={state} provinces={provinces} />
        </aside>

        <section>
          {/* Thanh kết quả: số lượng + sắp xếp */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <strong className="text-rock-900">{t("results", { count: total })}</strong>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-rock-600">{t("sortBy")}:</span>
              {SORTS.map((s: MountainSort) => {
                const activeSort = s === state.sort;
                return (
                  <Link
                    key={s}
                    href={`/mountains${buildQuery({ ...state, sort: s, page: 1 })}`}
                    className={`rounded-btn px-2 py-1 ${
                      activeSort
                        ? "bg-forest-100 font-medium text-forest-700"
                        : "text-rock-600 hover:text-forest-700"
                    }`}
                  >
                    {tSort(s)}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Chip filter đang bật */}
          <div className="mb-4">
            <FilterChips state={state} provinces={provinces} />
          </div>

          {/* Lưới kết quả */}
          {pageItems.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center text-rock-600">
              {t("noResults")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((peak) => (
                <PeakCard key={peak.id} peak={peak} locale={locale} />
              ))}
            </div>
          )}

          <Pagination state={{ ...state, page }} totalPages={totalPages} />
        </section>
      </div>

      <footer className="mt-10 border-t border-border pt-4 text-xs text-rock-600">
        © Vietnam Peaks · {t("osmCredit")}
      </footer>
    </div>
  );
}
