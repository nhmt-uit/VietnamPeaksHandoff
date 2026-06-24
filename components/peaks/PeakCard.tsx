import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { MountainListItem } from "@/types";
import { DifficultyDots } from "./DifficultyDots";
import { StatusBadge } from "./StatusBadge";

export function PeakCard({ peak, locale }: { peak: MountainListItem; locale: Locale }) {
  const name = locale === "en" ? peak.name_en : peak.name_vi;
  const secondary = locale === "en" ? peak.name_vi : peak.name_en;
  const provinceNames = peak.provinces
    .map((p) => (locale === "en" ? p.name_en : p.name_vi))
    .join(" / ");
  const elev =
    peak.elevation_m != null ? new Intl.NumberFormat(locale).format(peak.elevation_m) : null;

  return (
    <Link
      href={`/mountains/${peak.slug}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface transition hover:shadow-md"
    >
      {/* cover_image_url chưa có trong mock -> placeholder địa hình */}
      <div className="flex h-28 items-center justify-center bg-forest-100 text-3xl">🏔️</div>
      <div className="p-3">
        <div className="font-display text-lg font-semibold text-forest-900 group-hover:text-forest-700">
          {name}
        </div>
        {secondary && secondary !== name && (
          <div className="truncate text-xs text-rock-600">{secondary}</div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {elev && (
            <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-rock-600">
              {elev} m
            </span>
          )}
          {provinceNames && (
            <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs text-rock-600">
              {provinceNames}
            </span>
          )}
          <StatusBadge status={peak.status} />
          <DifficultyDots level={peak.difficulty} />
        </div>
      </div>
    </Link>
  );
}
