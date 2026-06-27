import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getMountains } from "@/lib/data";
import { PeakCard } from "@/components/peaks/PeakCard";
import { REGIONS } from "@/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const tr = await getTranslations("Region");

  const all = await getMountains({ sort: "elev_desc", locale });
  const featured = all.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-forest-100">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-semibold text-forest-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-rock-600">{t("tagline")}</p>
          <Link
            href="/mountains"
            className="mt-6 inline-block rounded-btn bg-forest-700 px-6 py-3 font-medium text-white hover:bg-forest-900"
          >
            {t("ctaExplore")}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        {/* Đỉnh nổi bật */}
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest-900">
              {t("featuredTitle")}
            </h2>
            <Link
              href="/mountains"
              className="text-sm font-medium text-forest-700 hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((peak) => (
              <PeakCard key={peak.id} peak={peak} locale={locale} />
            ))}
          </div>
        </section>

        {/* Khám phá theo vùng */}
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold text-forest-900">
            {t("exploreByRegion")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {REGIONS.map((r) => (
              <Link
                key={r}
                href={`/mountains?region=${r}`}
                className="rounded-card border border-border bg-surface p-6 transition hover:border-forest-700 hover:shadow-md"
              >
                <div className="font-display text-xl font-semibold text-forest-900">{tr(r)}</div>
                <div className="mt-1 text-sm text-rock-600">
                  {t("peakCount", { count: all.filter((m) => m.region === r).length })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
