import { getTranslations } from "next-intl/server";
import type { MountainStatus } from "@/types";

const STATUS_BG: Record<MountainStatus, string> = {
  open: "bg-status-open",
  permit: "bg-status-permit",
  restricted: "bg-status-restricted",
  closed: "bg-status-closed",
};

export async function StatusBadge({ status }: { status: MountainStatus }) {
  const t = await getTranslations("Status");
  return (
    <span
      className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium text-white ${STATUS_BG[status]}`}
    >
      {t(status)}
    </span>
  );
}
