import { defineRouting } from "next-intl/routing";

/**
 * Định tuyến i18n — nguồn sự thật cho locale.
 * vi là mặc định; localePrefix mặc định 'always' => URL luôn có /vi hoặc /en.
 */
export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
});

export type Locale = (typeof routing.locales)[number];
