import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Province } from "@/types";
import { MOUNTAIN_STATUSES, REGIONS } from "@/types";
import type { FilterState } from "./filters";

/**
 * Sidebar lọc = một <form method="get"> thuần (không JS client).
 * Submit -> điều hướng tới /[locale]/mountains?<query> -> server render lại.
 * `sort` đưa vào hidden input để giữ nguyên khi đổi bộ lọc.
 */
export async function FilterSidebar({
  locale,
  state,
  provinces,
}: {
  locale: Locale;
  state: FilterState;
  provinces: Province[];
}) {
  const t = await getTranslations("Filters");
  const tr = await getTranslations("Region");
  const ts = await getTranslations("Status");

  const inputCls =
    "w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-forest-700";
  const labelCls = "mb-2 block text-xs font-semibold uppercase tracking-wide text-rock-600";

  return (
    <form
      method="get"
      action={`/${locale}/mountains`}
      className="sticky top-4 rounded-card border border-border bg-surface p-4"
    >
      <input type="hidden" name="sort" value={state.sort} />

      {/* Tìm theo tên */}
      <div className="border-b border-border pb-4">
        <label className={labelCls} htmlFor="q">
          {t("search")}
        </label>
        <input
          id="q"
          type="text"
          name="q"
          defaultValue={state.q}
          placeholder={t("searchPlaceholder")}
          className={inputCls}
        />
      </div>

      {/* Vùng */}
      <fieldset className="border-b border-border py-4">
        <legend className={labelCls}>{t("region")}</legend>
        {REGIONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              name="region"
              value={r}
              defaultChecked={state.regions.includes(r)}
              className="peer sr-only"
            />
            <span className="grid h-4 w-4 place-items-center rounded border border-rock-300 text-[10px] text-transparent peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-white">
              ✓
            </span>
            {tr(r)}
          </label>
        ))}
      </fieldset>

      {/* Tỉnh */}
      <div className="border-b border-border py-4">
        <label className={labelCls} htmlFor="province">
          {t("province")}
        </label>
        <select
          id="province"
          name="province"
          defaultValue={state.provinceSlug ?? ""}
          className={inputCls}
        >
          <option value="">{t("allProvinces")}</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.slug}>
              {locale === "en" ? p.name_en : p.name_vi}
            </option>
          ))}
        </select>
      </div>

      {/* Độ cao */}
      <div className="border-b border-border py-4">
        <span className={labelCls}>{t("elevation")}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="elev_min"
            min={0}
            defaultValue={state.elevMin ?? ""}
            placeholder="0"
            className={inputCls}
            aria-label={`${t("elevation")} min`}
          />
          <span className="text-rock-600">—</span>
          <input
            type="number"
            name="elev_max"
            min={0}
            defaultValue={state.elevMax ?? ""}
            placeholder="3147"
            className={inputCls}
            aria-label={`${t("elevation")} max`}
          />
        </div>
      </div>

      {/* Độ khó */}
      <fieldset className="border-b border-border py-4">
        <legend className={labelCls}>{t("difficulty")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((d) => (
            <label key={d} className="cursor-pointer">
              <input
                type="checkbox"
                name="difficulty"
                value={d}
                defaultChecked={state.difficulties.includes(d)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-pill border border-rock-300 px-3 py-1 text-sm peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-white">
                {d}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Trạng thái */}
      <fieldset className="py-4">
        <legend className={labelCls}>{t("status")}</legend>
        {MOUNTAIN_STATUSES.map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              name="status"
              value={s}
              defaultChecked={state.statuses.includes(s)}
              className="peer sr-only"
            />
            <span className="grid h-4 w-4 place-items-center rounded border border-rock-300 text-[10px] text-transparent peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-white">
              ✓
            </span>
            {ts(s)}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-btn bg-forest-700 px-3 py-2 text-sm font-medium text-white hover:bg-forest-900"
        >
          {t("apply")}
        </button>
        <Link
          href="/mountains"
          className="rounded-btn border border-border px-3 py-2 text-center text-sm text-rock-600 hover:border-forest-700 hover:text-forest-700"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
