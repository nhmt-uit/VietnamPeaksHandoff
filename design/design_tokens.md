# Design Tokens — Vietnam Peaks (cho Claude Code)

> Codify từ `design_system_sample.html`. Stack: Next.js App Router + Tailwind + next-intl.
> Palette: xanh rêu (rừng) · xám đá · nền mây · nhấn đất nung. Font: Lora (tiêu đề) + Be Vietnam Pro (nội dung).

## 1. Nạp font (next/font/google) — nhớ subset `vietnamese`

```ts
// app/fonts.ts
import { Lora, Be_Vietnam_Pro } from "next/font/google";

export const display = Lora({
  subsets: ["latin", "vietnamese"], weight: ["500", "600", "700"],
  variable: "--font-display", display: "swap",
});
export const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"],
  variable: "--font-sans", display: "swap",
});
```
```tsx
// app/[locale]/layout.tsx
<html lang={locale} className={`${display.variable} ${sans.variable}`}>
```

## 2. CSS variables (globals.css)

```css
:root{
  /* brand */
  --forest-900:#10402f; --forest-700:#1f6f54; --forest-500:#2f9b74; --forest-100:#e6f1ec;
  /* trung tính (đá) */
  --rock-900:#262a28; --rock-600:#5c635f; --rock-300:#c7ccc8;
  --mist:#f5f7f5; --surface:#ffffff; --border:#e5e9e6;
  /* nhấn — dùng tiết chế */
  --clay:#c2622d; --gold:#c9912b;
  /* trạng thái đỉnh (mountain_status) */
  --status-open:#2f9b74; --status-permit:#c9912b; --status-restricted:#d2762a; --status-closed:#9a3b2e;
  /* độ khó 1..5 */
  --diff-1:#4a9d6a; --diff-2:#8fb43f; --diff-3:#d8a72b; --diff-4:#d2762a; --diff-5:#b1402e;
  /* bo góc */
  --radius-card:14px; --radius-btn:9px; --radius-pill:999px;
}
body{ background:var(--mist); color:var(--rock-900);
      font-family:var(--font-sans), system-ui, sans-serif; }
h1,h2,h3,.font-display{ font-family:var(--font-display), Georgia, serif; }
```

## 3. Tailwind

**Tailwind v3** — `tailwind.config.ts`:
```ts
theme: { extend: {
  colors: {
    forest: { 900:"var(--forest-900)", 700:"var(--forest-700)", 500:"var(--forest-500)", 100:"var(--forest-100)" },
    rock:   { 900:"var(--rock-900)",   600:"var(--rock-600)",   300:"var(--rock-300)" },
    mist:"var(--mist)", surface:"var(--surface)", clay:"var(--clay)", gold:"var(--gold)",
    status: { open:"var(--status-open)", permit:"var(--status-permit)",
              restricted:"var(--status-restricted)", closed:"var(--status-closed)" },
    diff:   { 1:"var(--diff-1)", 2:"var(--diff-2)", 3:"var(--diff-3)", 4:"var(--diff-4)", 5:"var(--diff-5)" },
  },
  fontFamily: { sans:["var(--font-sans)","system-ui","sans-serif"], display:["var(--font-display)","Georgia","serif"] },
  borderRadius: { card:"14px", btn:"9px" },
}}
```
> Lưu ý: đặt trung tính là **`rock`** (không phải `stone`) để khỏi đè bảng màu `stone` mặc định của Tailwind.

**Tailwind v4** — bỏ block trên, khai báo trong CSS:
```css
@theme {
  --color-forest-700:#1f6f54; --color-forest-900:#10402f; /* …v.v… */
  --color-rock-900:#262a28; --color-mist:#f5f7f5;
  --font-sans:"Be Vietnam Pro", system-ui, sans-serif;
  --font-display:"Lora", Georgia, serif;
}
```

## 4. Quy ước dùng

- **Chính:** hành động chính / link / filter đang bật → `forest-700`, hover `forest-900`.
- **Nền & bề mặt:** trang `mist`; card/khối `surface` (trắng) + viền `border` 1px, bo `radius-card`.
- **Chữ:** body `rock-900`, phụ/mờ `rock-600`.
- **Nhấn:** `clay` dùng tiết chế cho nút phụ (vd "Đăng ảnh"); `gold` cho điểm nhấn nhỏ (vd nhấn độ cao). **Không** dùng màu nhấn cho mảng lớn.
- **Tiêu đề** (tên đỉnh, h1/h2) → `font-display` (Lora); còn lại → `font-sans` (Be Vietnam Pro).

## 5. Map trạng thái & độ khó (khớp enum trong schema)

```ts
const STATUS_COLOR = {
  open:"var(--status-open)", permit:"var(--status-permit)",
  restricted:"var(--status-restricted)", closed:"var(--status-closed)",
} as const;
const STATUS_LABEL_VI = { open:"Leo được", permit:"Cần giấy phép", restricted:"Hạn chế", closed:"Tạm đóng" };
const DIFF_COLOR = ["", "var(--diff-1)","var(--diff-2)","var(--diff-3)","var(--diff-4)","var(--diff-5)"]; // index 1..5
```
- Badge trạng thái: nền theo `STATUS_COLOR`, chữ trắng.
- Độ khó: 5 chấm, tô `DIFF_COLOR[1..n]`, còn lại `rock-300`.

## 6. Bản đồ (Leaflet + OpenTopoMap)

- Polyline cung đường: `forest-700`; marker waypoint: ghim `forest-900`; đỉnh đang chọn: ghim `clay` để nổi trên nền topo.

## Tham chiếu
- Bản mẫu: `design_system_sample.html`
- Wireframe: `wireframe_peak_detail.html`, `wireframe_list_filter.html`
- Build brief: `ui_peak_detail_brief.md`, `ui_list_filter_brief.md`
- Schema: `schema.sql`
