/**
 * lib/data/mock.ts — DỮ LIỆU MẪU (chỉ dùng khi chưa nối Supabase).
 * ------------------------------------------------------------------
 * Nguồn: spec/seed_peaks_v1.md (49 đỉnh). Toạ độ lat/lng để null (chưa có CSV
 * Phase 1). Cung đường/waypoint chưa có dữ liệu thật -> 1 cung MẪU cho Fansipan,
 * mô tả gắn nhãn "[Mẫu]" để không nhầm là nội dung biên tập thật.
 *
 * id là UUID tất định (8-4-4-4-12, version 4) sinh theo nhóm + chỉ số để ổn định
 * giữa các lần chạy. Quan hệ giải bằng slug ở tầng data, không phụ thuộc id.
 * ------------------------------------------------------------------
 */

import type {
  DifficultyLevel,
  Mountain,
  MountainStatus,
  Province,
  Range,
  Region,
  Route,
  Waypoint,
} from "@/types";

const DATE = "2025-06-01";
const TS = "2025-06-01T00:00:00.000Z";

/** UUID tất định: group (loại thực thể) + n (chỉ số). */
const uuid = (group: number, n: number) =>
  `${String(group).padStart(8, "0")}-0000-4000-8000-${String(n).padStart(12, "0")}`;

/* ============================================================
 * Provinces (chỉ các tỉnh được tham chiếu; alias = tên cũ trước sáp nhập 2025)
 * ========================================================== */

const provinceData: Array<{ slug: string; vi: string; en: string; aliases: string[] }> = [
  { slug: "lao-cai", vi: "Lào Cai", en: "Lao Cai", aliases: ["Yên Bái"] },
  { slug: "lai-chau", vi: "Lai Châu", en: "Lai Chau", aliases: [] },
  { slug: "son-la", vi: "Sơn La", en: "Son La", aliases: [] },
  { slug: "cao-bang", vi: "Cao Bằng", en: "Cao Bang", aliases: [] },
  { slug: "lang-son", vi: "Lạng Sơn", en: "Lang Son", aliases: [] },
  { slug: "phu-tho", vi: "Phú Thọ", en: "Phu Tho", aliases: ["Vĩnh Phúc"] },
  { slug: "ha-noi", vi: "Hà Nội", en: "Hanoi", aliases: [] },
  { slug: "quang-ninh", vi: "Quảng Ninh", en: "Quang Ninh", aliases: [] },
  { slug: "tuyen-quang", vi: "Tuyên Quang", en: "Tuyen Quang", aliases: ["Hà Giang"] },
  { slug: "quang-ngai", vi: "Quảng Ngãi", en: "Quang Ngai", aliases: ["Kon Tum"] },
  { slug: "da-nang", vi: "Đà Nẵng", en: "Da Nang", aliases: ["Quảng Nam"] },
  { slug: "ha-tinh", vi: "Hà Tĩnh", en: "Ha Tinh", aliases: [] },
  { slug: "quang-tri", vi: "Quảng Trị", en: "Quang Tri", aliases: [] },
  { slug: "thanh-hoa", vi: "Thanh Hóa", en: "Thanh Hoa", aliases: [] },
  { slug: "hue", vi: "Huế", en: "Hue", aliases: ["Thừa Thiên Huế"] },
  { slug: "dak-lak", vi: "Đắk Lắk", en: "Dak Lak", aliases: [] },
  { slug: "lam-dong", vi: "Lâm Đồng", en: "Lam Dong", aliases: [] },
  { slug: "khanh-hoa", vi: "Khánh Hòa", en: "Khanh Hoa", aliases: ["Ninh Thuận"] },
  { slug: "tay-ninh", vi: "Tây Ninh", en: "Tay Ninh", aliases: [] },
  { slug: "dong-nai", vi: "Đồng Nai", en: "Dong Nai", aliases: ["Bình Phước"] },
  { slug: "an-giang", vi: "An Giang", en: "An Giang", aliases: [] },
  { slug: "ho-chi-minh", vi: "TP.HCM", en: "Ho Chi Minh City", aliases: ["Bà Rịa – Vũng Tàu"] },
];

export const mockProvinces: Province[] = provinceData.map((p, i) => ({
  id: uuid(1, i + 1),
  name_vi: p.vi,
  name_en: p.en,
  slug: p.slug,
  aliases: p.aliases,
  created_at: TS,
}));

const provinceIdBySlug = new Map(mockProvinces.map((p) => [p.slug, p.id]));

/* ============================================================
 * Ranges (một vài dãy tiêu biểu; phần lớn đỉnh để range = null)
 * ========================================================== */

const rangeData: Array<{ slug: string; vi: string; en: string }> = [
  { slug: "hoang-lien-son", vi: "Hoàng Liên Sơn", en: "Hoang Lien Son" },
  { slug: "truong-son", vi: "Trường Sơn", en: "Truong Son (Annamite Range)" },
];

export const mockRanges: Range[] = rangeData.map((r, i) => ({
  id: uuid(2, i + 1),
  name_vi: r.vi,
  name_en: r.en,
  slug: r.slug,
  created_at: TS,
}));

const rangeIdBySlug = new Map(mockRanges.map((r) => [r.slug, r.id]));

/* ============================================================
 * Mountains (49 đỉnh)
 * ========================================================== */

type Seed = {
  slug: string;
  vi: string;
  en: string;
  elev: number;
  region: Region;
  status: MountainStatus;
  diff: DifficultyLevel;
  provinces: string[];
  range?: string;
  rank?: number;
};

const seeds: Seed[] = [
  // ----- Tây Bắc (north) -----
  { slug: "fansipan", vi: "Fansipan", en: "Fansipan", elev: 3147, region: "north", status: "open", diff: 4, provinces: ["lao-cai"], range: "hoang-lien-son", rank: 1 },
  { slug: "pu-si-lung", vi: "Pu Si Lung", en: "Pu Si Lung", elev: 3083, region: "north", status: "permit", diff: 5, provinces: ["lai-chau"], rank: 2 },
  { slug: "pu-ta-leng", vi: "Pu Ta Leng", en: "Pu Ta Leng", elev: 3049, region: "north", status: "open", diff: 4, provinces: ["lai-chau"], range: "hoang-lien-son", rank: 3 },
  { slug: "ky-quan-san", vi: "Ky Quan San (Bạch Mộc Lương Tử)", en: "Ky Quan San", elev: 3046, region: "north", status: "open", diff: 4, provinces: ["lai-chau", "lao-cai"], range: "hoang-lien-son", rank: 4 },
  { slug: "khang-su-van", vi: "Khang Su Văn (Phàn Liên San)", en: "Khang Su Van", elev: 3012, region: "north", status: "permit", diff: 5, provinces: ["lai-chau"], rank: 5 },
  { slug: "ta-lien-son", vi: "Tả Liên Sơn (Cổ Trâu)", en: "Ta Lien Son", elev: 2996, region: "north", status: "open", diff: 3, provinces: ["lai-chau"], range: "hoang-lien-son" },
  { slug: "ta-chi-nhu", vi: "Tà Chì Nhù (Phu Song Sung)", en: "Ta Chi Nhu", elev: 2979, region: "north", status: "open", diff: 3, provinces: ["lao-cai"] },
  { slug: "po-ma-lung", vi: "Pờ Ma Lung (Bạch Mộc Lương)", en: "Po Ma Lung", elev: 2967, region: "north", status: "permit", diff: 5, provinces: ["lai-chau"] },
  { slug: "nhiu-co-san", vi: "Nhìu Cồ San", en: "Nhiu Co San", elev: 2965, region: "north", status: "open", diff: 3, provinces: ["lao-cai"], range: "hoang-lien-son" },
  { slug: "chung-nhia-vu", vi: "Chung Nhía Vũ", en: "Chung Nhia Vu", elev: 2918, region: "north", status: "open", diff: 4, provinces: ["lai-chau"] },
  { slug: "lung-cung", vi: "Lùng Cúng", en: "Lung Cung", elev: 2913, region: "north", status: "open", diff: 3, provinces: ["lao-cai"] },
  { slug: "nam-kang-ho-tao", vi: "Nam Kang Ho Tao", en: "Nam Kang Ho Tao", elev: 2881, region: "north", status: "open", diff: 5, provinces: ["lai-chau", "lao-cai"] },
  { slug: "phu-sa-phin", vi: "Phu Sa Phìn", en: "Phu Sa Phin", elev: 2873, region: "north", status: "open", diff: 4, provinces: ["lao-cai"] },
  { slug: "ta-xua", vi: "Tà Xùa", en: "Ta Xua", elev: 2865, region: "north", status: "open", diff: 4, provinces: ["son-la", "lao-cai"] },
  { slug: "lao-than", vi: "Lảo Thẩn", en: "Lao Than", elev: 2862, region: "north", status: "open", diff: 3, provinces: ["lao-cai"], range: "hoang-lien-son" },
  { slug: "ngu-chi-son", vi: "Ngũ Chỉ Sơn", en: "Ngu Chi Son", elev: 2858, region: "north", status: "open", diff: 4, provinces: ["lao-cai"], range: "hoang-lien-son" },
  { slug: "sa-mu", vi: "Sa Mu (U Bò)", en: "Sa Mu", elev: 2756, region: "north", status: "open", diff: 4, provinces: ["son-la"] },
  { slug: "pha-luong", vi: "Pha Luông", en: "Pha Luong", elev: 1880, region: "north", status: "permit", diff: 3, provinces: ["son-la"] },
  { slug: "ham-rong", vi: "Hàm Rồng (Sa Pa)", en: "Ham Rong", elev: 1800, region: "north", status: "open", diff: 1, provinces: ["lao-cai"] },
  { slug: "cao-ly", vi: "Cao Ly", en: "Cao Ly", elev: 1200, region: "north", status: "open", diff: 2, provinces: ["lao-cai"] },
  // ----- Đông Bắc (north) -----
  { slug: "tay-con-linh", vi: "Tây Côn Lĩnh", en: "Tay Con Linh", elev: 2428, region: "north", status: "open", diff: 4, provinces: ["tuyen-quang"] },
  { slug: "kieu-lieu-ti", vi: "Kiều Liêu Ti", en: "Kieu Lieu Ti", elev: 2402, region: "north", status: "open", diff: 5, provinces: ["tuyen-quang"] },
  { slug: "chieu-lau-thi", vi: "Chiêu Lầu Thi", en: "Chieu Lau Thi", elev: 2402, region: "north", status: "open", diff: 3, provinces: ["tuyen-quang"] },
  { slug: "phia-oac", vi: "Phia Oắc", en: "Phia Oac", elev: 1931, region: "north", status: "open", diff: 3, provinces: ["cao-bang"] },
  { slug: "mau-son", vi: "Mẫu Sơn", en: "Mau Son", elev: 1541, region: "north", status: "open", diff: 2, provinces: ["lang-son"] },
  // ----- Đồng bằng & trung du Bắc Bộ (north) -----
  { slug: "tam-dao", vi: "Tam Đảo (Thiên Thị)", en: "Tam Dao", elev: 1591, region: "north", status: "open", diff: 2, provinces: ["phu-tho"] },
  { slug: "ba-vi", vi: "Ba Vì (đỉnh Vua)", en: "Ba Vi", elev: 1296, region: "north", status: "open", diff: 2, provinces: ["ha-noi"] },
  { slug: "yen-tu", vi: "Yên Tử (chùa Đồng)", en: "Yen Tu", elev: 1068, region: "north", status: "open", diff: 2, provinces: ["quang-ninh"] },
  { slug: "ham-lon", vi: "Hàm Lợn", en: "Ham Lon", elev: 462, region: "north", status: "open", diff: 1, provinces: ["ha-noi"] },
  // ----- Bắc Trung Bộ & Trung Bộ (central) -----
  { slug: "ngoc-linh", vi: "Ngọc Linh", en: "Ngoc Linh", elev: 2598, region: "central", status: "permit", diff: 5, provinces: ["quang-ngai", "da-nang"], range: "truong-son" },
  { slug: "rao-co", vi: "Rào Cỏ", en: "Rao Co", elev: 2235, region: "central", status: "permit", diff: 4, provinces: ["ha-tinh"], range: "truong-son" },
  { slug: "dong-voi-mep", vi: "Động Voi Mẹp (Sa Mù)", en: "Dong Voi Mep", elev: 1771, region: "central", status: "open", diff: 4, provinces: ["quang-tri"], range: "truong-son" },
  { slug: "pu-luong", vi: "Pù Luông", en: "Pu Luong", elev: 1700, region: "central", status: "open", diff: 3, provinces: ["thanh-hoa"] },
  { slug: "bach-ma", vi: "Bạch Mã", en: "Bach Ma", elev: 1450, region: "central", status: "open", diff: 2, provinces: ["hue"], range: "truong-son" },
  { slug: "son-tra", vi: "Sơn Trà (đỉnh Bàn Cờ)", en: "Son Tra", elev: 696, region: "central", status: "open", diff: 2, provinces: ["da-nang"] },
  // ----- Tây Nguyên & Nam Trung Bộ (central) -----
  { slug: "chu-yang-sin", vi: "Chư Yang Sin", en: "Chu Yang Sin", elev: 2442, region: "central", status: "open", diff: 5, provinces: ["dak-lak"], range: "truong-son" },
  { slug: "bidoup", vi: "Bidoup", en: "Bidoup", elev: 2287, region: "central", status: "open", diff: 4, provinces: ["lam-dong"], range: "truong-son" },
  { slug: "lang-biang", vi: "Lang Biang", en: "Lang Biang", elev: 2167, region: "central", status: "open", diff: 2, provinces: ["lam-dong"] },
  { slug: "chu-mom-ray", vi: "Chư Mom Ray", en: "Chu Mom Ray", elev: 1773, region: "central", status: "open", diff: 4, provinces: ["quang-ngai"] },
  { slug: "hon-ba", vi: "Hòn Bà", en: "Hon Ba", elev: 1578, region: "central", status: "open", diff: 3, provinces: ["khanh-hoa"] },
  { slug: "dai-binh", vi: "Đại Bình", en: "Dai Binh", elev: 1100, region: "central", status: "open", diff: 2, provinces: ["lam-dong"] },
  { slug: "nui-chua", vi: "Núi Chúa", en: "Nui Chua", elev: 1040, region: "central", status: "open", diff: 3, provinces: ["khanh-hoa"] },
  { slug: "nui-co-tien", vi: "Núi Cô Tiên", en: "Nui Co Tien", elev: 900, region: "central", status: "open", diff: 2, provinces: ["khanh-hoa"] },
  // ----- Nam Bộ (south) -----
  { slug: "nui-ba-den", vi: "Núi Bà Đen", en: "Nui Ba Den", elev: 986, region: "south", status: "open", diff: 1, provinces: ["tay-ninh"] },
  { slug: "chua-chan", vi: "Chứa Chan (Gia Lào)", en: "Chua Chan", elev: 837, region: "south", status: "open", diff: 2, provinces: ["dong-nai"] },
  { slug: "ba-ra", vi: "Bà Rá", en: "Ba Ra", elev: 736, region: "south", status: "open", diff: 2, provinces: ["dong-nai"] },
  { slug: "nui-cam", vi: "Núi Cấm (Thiên Cấm Sơn)", en: "Nui Cam", elev: 705, region: "south", status: "open", diff: 2, provinces: ["an-giang"] },
  { slug: "nui-dinh", vi: "Núi Dinh", en: "Nui Dinh", elev: 500, region: "south", status: "open", diff: 2, provinces: ["ho-chi-minh"] },
  { slug: "nui-sam", vi: "Núi Sam", en: "Nui Sam", elev: 284, region: "south", status: "open", diff: 1, provinces: ["an-giang"] },
];

export const mockMountains: Mountain[] = seeds.map((s, i) => ({
  id: uuid(3, i + 1),
  range_id: s.range ? (rangeIdBySlug.get(s.range) ?? null) : null,
  name_vi: s.vi,
  name_en: s.en,
  slug: s.slug,
  elevation_m: s.elev,
  lat: null,
  lng: null,
  region: s.region,
  status: s.status,
  difficulty: s.diff,
  rank: s.rank ?? null,
  summary_vi: null,
  summary_en: null,
  cover_image_url: null,
  last_verified_at: DATE,
  created_at: TS,
  updated_at: TS,
}));

/** Bảng nối nhiều-nhiều đỉnh ↔ tỉnh. */
export const mockMountainProvinces: Array<{ mountain_id: string; province_id: string }> =
  seeds.flatMap((s, i) =>
    s.provinces.map((slug) => ({
      mountain_id: uuid(3, i + 1),
      province_id: provinceIdBySlug.get(slug)!,
    })),
  );

/* ============================================================
 * Routes + waypoints — 1 cung MẪU cho Fansipan (dữ liệu thật chưa có)
 * ========================================================== */

const fansipanId = mockMountains.find((m) => m.slug === "fansipan")!.id;
const tramTonId = uuid(4, 1);

export const mockRoutes: Route[] = [
  {
    id: tramTonId,
    mountain_id: fansipanId,
    name_vi: "Cung Trạm Tôn",
    name_en: "Tram Ton Route",
    slug: "fansipan-tram-ton",
    start_point: "Trạm Tôn (đèo Ô Quý Hồ)",
    end_point: "Đỉnh Fansipan 3147 m",
    description_vi: "[Mẫu] Cung phổ biến và ngắn nhất lên Fansipan, đa số đi 2 ngày 1 đêm.",
    description_en: "[Sample] The most popular and shortest route up Fansipan, usually 2 days 1 night.",
    distance_km: 11.2,
    elevation_gain_m: 1900,
    duration_days: 2,
    difficulty_level: 4,
    best_season: "Tháng 9 – Tháng 4",
    permit_required: false,
    guide_required: true,
    gpx_url: null,
    audience: "intermediate",
    last_verified_at: DATE,
    created_at: TS,
    updated_at: TS,
  },
];

export const mockWaypoints: Waypoint[] = [
  { id: uuid(5, 1), route_id: tramTonId, name_vi: "Trạm Tôn", name_en: "Tram Ton", type: "gate", lat: null, lng: null, notes_vi: "Điểm khởi đầu, mua vé vào VQG Hoàng Liên", notes_en: "Trailhead, buy national park ticket", sort_order: 0, created_at: TS },
  { id: uuid(5, 2), route_id: tramTonId, name_vi: "Lán 2200", name_en: "Camp 2200", type: "camp", lat: null, lng: null, notes_vi: "Lán nghỉ đêm phổ biến", notes_en: "Common overnight camp", sort_order: 1, created_at: TS },
  { id: uuid(5, 3), route_id: tramTonId, name_vi: "Đỉnh Fansipan", name_en: "Fansipan Summit", type: "viewpoint", lat: null, lng: null, notes_vi: "Chóp inox 3147 m", notes_en: "Stainless steel marker at 3147 m", sort_order: 2, created_at: TS },
];
