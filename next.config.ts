import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Cố định gốc trace về thư mục dự án (tránh Next chọn nhầm lockfile ở ~/).
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Khi có Supabase Storage, mở dòng dưới (hoặc thay bằng host cụ thể):
    // remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
