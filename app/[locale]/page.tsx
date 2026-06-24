import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const other: Locale = locale === "vi" ? "en" : "vi";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="rounded-card border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-forest-700">
          🏔️ {locale.toUpperCase()}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-rock-600">{t("tagline")}</p>

        <div className="mt-6 flex items-center gap-3">
          <span className="rounded-pill bg-status-open px-3 py-1 text-sm text-white">
            open
          </span>
          <span className="rounded-pill bg-status-permit px-3 py-1 text-sm text-white">
            permit
          </span>
          <span className="rounded-pill bg-status-restricted px-3 py-1 text-sm text-white">
            restricted
          </span>
          <span className="rounded-pill bg-status-closed px-3 py-1 text-sm text-white">
            closed
          </span>
        </div>

        <p className="mt-6 rounded-btn bg-mist px-4 py-3 text-sm text-rock-600">
          {t("wip")}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/mountains"
            className="rounded-btn bg-forest-700 px-4 py-2 font-medium text-white hover:bg-forest-900"
          >
            {t("browsePeaks")}
          </Link>
          <Link
            href="/"
            locale={other}
            className="font-medium text-clay hover:underline"
          >
            {t("switchLanguage")} →
          </Link>
        </div>
      </div>
    </main>
  );
}
