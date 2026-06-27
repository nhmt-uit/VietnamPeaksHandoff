import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { display, sans } from "../fonts";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    // `default` cho trang không tự đặt title; `template` bọc title của trang con.
    title: { default: t("siteTitleDefault"), template: `%s · ${t("siteName")}` },
    description: t("siteDescription"),
  };
}

// Render tĩnh cả 2 locale (SSG).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  // Bật render tĩnh cho nhánh này.
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Provider tự kế thừa locale + messages từ i18n/request.ts */}
        <NextIntlClientProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale as Locale} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
