import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Chạy cho mọi path TRỪ api, file nội bộ Next/Vercel, và file tĩnh (có dấu chấm).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
