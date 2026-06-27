import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getMountainBySlug, getMountainSlugs } from "@/lib/data";
import { FactStrip } from "@/components/peaks/FactStrip";
import { MapPanel } from "@/components/peaks/MapPanel";
import { PeakHero } from "@/components/peaks/PeakHero";
import { RouteCard } from "@/components/peaks/RouteCard";
import { SafetyNote } from "@/components/peaks/SafetyNote";

type Params = { locale: Locale; slug: string };

// SSG: prerender mọi đỉnh.
export async function generateStaticParams() {
  const slugs = await getMountainSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await getMountainBySlug(slug);
  if (!detail) return {};
  const name = locale === "en" ? detail.name_en : detail.name_vi;
  const summary = locale === "en" ? detail.summary_en : detail.summary_vi;
  return { title: name, description: summary ?? undefined };
}

export default async function PeakDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await getMountainBySlug(slug);
  if (!detail) notFound();

  const t = await getTranslations("Peak");
  const name = locale === "en" ? detail.name_en : detail.name_vi;
  const summary = locale === "en" ? detail.summary_en : detail.summary_vi;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-rock-600">
        <Link href="/" className="hover:text-forest-700">
          {t("breadcrumbHome")}
        </Link>
        <span aria-hidden>›</span>
        <Link href="/mountains" className="hover:text-forest-700">
          {t("breadcrumbList")}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-rock-900">{name}</span>
      </nav>

      <div className="mt-4 space-y-5">
        <PeakHero detail={detail} locale={locale} />
        <FactStrip detail={detail} locale={locale} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          {/* Nội dung trái */}
          <div className="space-y-5">
            <section className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-display text-xl font-semibold text-forest-900">
                {t("introTitle")}
              </h2>
              <p className="mt-2 text-rock-900">
                {summary ?? <span className="text-rock-600">{t("introEmpty")}</span>}
              </p>
            </section>

            <section className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-display text-xl font-semibold text-forest-900">
                {t("routesCount", { count: detail.routes.length })}
              </h2>
              {detail.routes.length === 0 ? (
                <p className="mt-2 text-rock-600">{t("routesEmpty")}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {detail.routes.map((r) => (
                    <RouteCard key={r.id} route={r} mountainSlug={detail.slug} locale={locale} />
                  ))}
                </div>
              )}
            </section>

            {/* Cộng đồng — empty-state, UGC đến cùng Auth/Supabase */}
            <section className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-display text-xl font-semibold text-forest-900">
                {t("communityPhotos")}
              </h2>
              <p className="mt-2 text-sm text-rock-600">{t("photosEmpty")}</p>
              <button
                type="button"
                disabled
                className="mt-3 cursor-not-allowed rounded-btn border border-border px-3 py-2 text-sm text-rock-300"
              >
                {t("postPhoto")}
              </button>

              <h2 className="mt-6 font-display text-xl font-semibold text-forest-900">
                {t("commentsTitle")}
              </h2>
              <p className="mt-2 text-sm text-rock-600">{t("commentsEmpty")}</p>
              <p className="mt-1 text-sm text-rock-600">{t("loginToComment")}</p>
            </section>
          </div>

          {/* Bản đồ + an toàn (sticky) */}
          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <MapPanel detail={detail} />
            <SafetyNote lastVerifiedAt={detail.last_verified_at} />
          </aside>
        </div>
      </div>
    </div>
  );
}
