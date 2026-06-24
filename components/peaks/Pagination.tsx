import { Link } from "@/i18n/navigation";
import { buildQuery, type FilterState } from "./filters";

/** Phân trang giữ nguyên bộ lọc trên URL. */
export function Pagination({
  state,
  totalPages,
}: {
  state: FilterState;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => `/mountains${buildQuery({ ...state, page })}`;
  const current = Math.min(state.page, totalPages);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const cell =
    "min-w-9 rounded-btn border border-border px-3 py-1.5 text-center text-sm hover:border-forest-700";
  const active = "border-forest-700 bg-forest-100 font-medium text-forest-700";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav className="mt-6 flex justify-center gap-1.5" aria-label="Phân trang">
      <Link href={href(current - 1)} className={`${cell} ${current <= 1 ? disabled : ""}`}>
        ‹
      </Link>
      {pages.map((p) => (
        <Link key={p} href={href(p)} className={`${cell} ${p === current ? active : ""}`}>
          {p}
        </Link>
      ))}
      <Link
        href={href(current + 1)}
        className={`${cell} ${current >= totalPages ? disabled : ""}`}
      >
        ›
      </Link>
    </nav>
  );
}
