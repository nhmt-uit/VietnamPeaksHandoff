/**
 * types/index.ts — barrel.
 * Import gọn ở mọi nơi:  import type { Mountain, RouteDetail } from "@/types";
 * Hằng số runtime:        import { DIFFICULTY_LEVELS, REGIONS, Constants } from "@/types";
 */
export type { Database, Json, CompositeTypes } from "./database.types";
export * from "./db";
