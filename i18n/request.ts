import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

/**
 * Cấu hình mỗi request cho next-intl: chọn locale hợp lệ + nạp messages tương ứng.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && routing.locales.includes(requested as Locale)
      ? (requested as Locale)
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
