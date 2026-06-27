import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getRouteBySlug, getRouteParams } from "@/lib/data";
import { SafetyNote } from "@/components/peaks/SafetyNote";
import { RouteFactStrip } from "@/components/routes/RouteFactStrip";
import { RouteHeader } from "@/components/routes/RouteHeader";
import { WaypointList } from "@/components/routes/WaypointList";

type Params = { locale: Locale; slug: string; routeSlug: string };

export async function generateStaticParams() {
  const params = await getRouteParams();
  // Trả về cặp { slug, routeSlug }; locale do segment cha sinh.
  return params.map(({ slug, routeSlug }) => ({ slug, routeSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, routeSlug } = await params;
  const detail = await getRouteBySlug(routeSlug);
  if (!detail) return {};
  const name = locale === "en" ? detail.name_en : detail.name_vi;
  const description = locale === "en" ? detail.description_en : detail.description_vi;
  return { title: name, description: description ?? undefined };
}

export default async function RouteDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, slug, routeSlug } = await params;
  setRequestLocale(locale);

  const detail = await getRouteBySlug(routeSlug);
  // 404 nếu không có cung HOẶC cung không thuộc đỉnh trên URL (giữ URL canonical).
  if (!detail || detail.mountain.slug !== slug) notFound();

  const t = await getTranslations("Route");
  const tp = await getTranslations("Peak");

  const routeName = locale === "en" ? detail.name_en : detail.name_vi;
  const mountainName = locale === "en" ? detail.mountain.name_en : detail.mountain.name_vi;
  const description = locale === "en" ? detail.description_en : detail.description_vi;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-rock-600"
      >
        <Link href="/" className="hover:text-forest-700">
          {tp("breadcrumbHome")}
        </Link>
        <span aria-hidden>›</span>
        <Link href="/mountains" className="hover:text-forest-700">
          {tp("breadcrumbList")}
        </Link>
        <span aria-hidden>›</span>
        <Link href={`/mountains/${detail.mountain.slug}`} className="hover:text-forest-700">
          {mountainName}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-rock-900">{routeName}</span>
      </nav>

      <div className="mt-4 space-y-5">
        <RouteHeader detail={detail} locale={locale} />

        {/* Bản đồ tuyến — mock chưa có gpx_url -> fallback (ẩn elevation profile theo brief) */}
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rock-600">
            {t("mapTitle")}
          </div>
          <div className="flex h-56 items-center justify-center bg-mist p-4 text-center text-sm text-rock-600">
            {detail.gpx_url ? "TrailMap + ElevationProfile" : t("mapPending")}
          </div>
        </div>

        <RouteFactStrip detail={detail} locale={locale} />

        {/* Mô tả */}
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-semibold text-forest-900">
            {t("descriptionTitle")}
          </h2>
          <p className="mt-2 text-rock-900">
            {description ?? <span className="text-rock-600">{t("descriptionEmpty")}</span>}
          </p>
        </section>

        {/* Waypoints */}
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-semibold text-forest-900">
            {t("waypointsTitle")}
          </h2>
          <WaypointList waypoints={detail.waypoints} locale={locale} />
        </section>

        {/* Cộng đồng — empty-state, UGC đến cùng Auth/Supabase (gắn route_id) */}
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-semibold text-forest-900">
            {tp("communityPhotos")}
          </h2>
          <p className="mt-2 text-sm text-rock-600">{tp("photosEmpty")}</p>
          <button
            type="button"
            disabled
            className="mt-3 cursor-not-allowed rounded-btn border border-border px-3 py-2 text-sm text-rock-300"
          >
            {tp("postPhoto")}
          </button>

          <h2 className="mt-6 font-display text-xl font-semibold text-forest-900">
            {tp("commentsTitle")}
          </h2>
          <p className="mt-2 text-sm text-rock-600">{tp("commentsEmpty")}</p>
          <p className="mt-1 text-sm text-rock-600">{tp("loginToComment")}</p>
        </section>

        <SafetyNote lastVerifiedAt={detail.last_verified_at} />
      </div>
    </div>
  );
}
