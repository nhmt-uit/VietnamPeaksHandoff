import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Bản bọc i18n của các API điều hướng Next.
 * Dùng Link/redirect/useRouter… từ đây để tự động giữ locale trên URL.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
