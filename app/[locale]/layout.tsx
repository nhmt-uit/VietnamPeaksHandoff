import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { display, sans } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Vietnam Peaks",
  description: "Cẩm nang leo núi Việt Nam — có cấu trúc, lọc được, song ngữ.",
};

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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
