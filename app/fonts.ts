import { Be_Vietnam_Pro, Lora } from "next/font/google";

// Tiêu đề (h1/h2, tên đỉnh) — Lora. Nhớ subset 'vietnamese' để render dấu đúng.
export const display = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

// Nội dung — Be Vietnam Pro.
export const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bvp",
  display: "swap",
});
