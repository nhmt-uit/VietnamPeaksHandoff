-- ============================================================
-- Vietnam Peaks — Supabase schema (Phase 2)
-- Postgres / Supabase. Chạy trong SQL Editor của Supabase.
-- Quy ước: identifier tiếng Anh; nội dung song ngữ tách cột _vi / _en.
-- Ghi dữ liệu lõi (mountains/routes/...) qua service role (bypass RLS) từ admin.
-- UGC (comments/photos) do người dùng đăng, có kiểm duyệt qua RLS.
-- Dữ liệu toạ độ: Wikidata (CC0) + OSM (ODbL — nhớ ghi công khi hiển thị).
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists unaccent;      -- bỏ dấu cho full-text tiếng Việt

-- ---------- Enums ----------
create type region          as enum ('north', 'central', 'south');
create type mountain_status as enum ('open', 'restricted', 'permit', 'closed');
create type route_audience  as enum ('beginner', 'intermediate', 'advanced');
create type waypoint_type   as enum ('camp', 'water', 'viewpoint', 'marker', 'gate', 'other');
create type article_type    as enum ('guide', 'gear', 'safety', 'general');
create type ugc_status      as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- Bảng tham chiếu
-- ============================================================

create table provinces (
  id         uuid primary key default gen_random_uuid(),
  name_vi    text not null,
  name_en    text not null,
  slug       text not null unique,
  aliases    text[] not null default '{}',   -- tên tỉnh cũ trước sáp nhập 2025
  created_at timestamptz not null default now()
);

create table ranges (
  id         uuid primary key default gen_random_uuid(),
  name_vi    text not null,
  name_en    text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Núi (thực thể trung tâm)
-- ============================================================

create table mountains (
  id            uuid primary key default gen_random_uuid(),
  range_id      uuid references ranges(id) on delete set null,
  name_vi       text not null,
  name_en       text not null,
  slug          text not null unique,
  elevation_m   integer,                      -- độ cao biên tập = nguồn chuẩn
  lat           double precision,
  lng           double precision,
  region        region,
  status        mountain_status not null default 'open',
  difficulty    smallint check (difficulty between 1 and 5),  -- độ khó điển hình (cung dễ nhất)
  rank          integer,                       -- vd cao thứ 3 VN (nullable)
  summary_vi    text,
  summary_en    text,
  cover_image_url text,
  last_verified_at date,                       -- mốc an toàn: cập nhật lần cuối
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Quan hệ nhiều-nhiều núi ↔ tỉnh (đỉnh có thể nằm ranh giới 2 tỉnh)
create table mountain_provinces (
  mountain_id uuid not null references mountains(id) on delete cascade,
  province_id uuid not null references provinces(id) on delete cascade,
  primary key (mountain_id, province_id)
);

-- ============================================================
-- Cung đường
-- ============================================================

create table routes (
  id               uuid primary key default gen_random_uuid(),
  mountain_id      uuid not null references mountains(id) on delete cascade,
  name_vi          text not null,
  name_en          text not null,
  slug             text not null unique,
  start_point      text,
  end_point        text,
  description_vi   text,
  description_en   text,
  distance_km      numeric(6,2),
  elevation_gain_m integer,
  duration_days    numeric(4,1),
  difficulty_level smallint check (difficulty_level between 1 and 5),
  best_season      text,
  permit_required  boolean not null default false,
  guide_required   boolean not null default false,
  gpx_url          text,
  audience         route_audience,
  last_verified_at date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table waypoints (
  id         uuid primary key default gen_random_uuid(),
  route_id   uuid not null references routes(id) on delete cascade,
  name_vi    text,
  name_en    text,
  type       waypoint_type not null default 'other',
  lat        double precision,
  lng        double precision,
  notes_vi   text,
  notes_en   text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Bài viết / lời khuyên
-- ============================================================

create table articles (
  id          uuid primary key default gen_random_uuid(),
  mountain_id uuid references mountains(id) on delete set null,  -- nullable: bài chung
  title_vi    text not null,
  title_en    text not null,
  slug        text not null unique,
  body_vi     text,
  body_en     text,
  type        article_type not null default 'general',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- Người dùng & UGC
-- ============================================================

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- comment gắn vào MỘT đỉnh HOẶC một cung (đúng một trong hai)
create table comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  mountain_id uuid references mountains(id) on delete cascade,
  route_id    uuid references routes(id) on delete cascade,
  body        text not null,
  status      ugc_status not null default 'pending',
  created_at  timestamptz not null default now(),
  constraint comment_one_target check (
    (mountain_id is not null)::int + (route_id is not null)::int = 1
  )
);

create table photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  mountain_id uuid references mountains(id) on delete cascade,
  route_id    uuid references routes(id) on delete cascade,
  url         text not null,
  caption     text,
  status      ugc_status not null default 'pending',
  created_at  timestamptz not null default now(),
  constraint photo_one_target check (
    (mountain_id is not null)::int + (route_id is not null)::int = 1
  )
);

-- ============================================================
-- Full-text search (lọc/tìm theo tên + mô tả, bỏ dấu)
-- ============================================================

-- unaccent() là STABLE, không dùng được trực tiếp trong cột generated (cần IMMUTABLE).
-- Bọc một wrapper immutable. (Trên Supabase, unaccent nằm ở schema 'extensions'.)
create or replace function f_unaccent(text) returns text
  language sql immutable strict parallel safe
  as $$ select extensions.unaccent('unaccent', $1) $$;

alter table mountains add column search_tsv tsvector
  generated always as (
    to_tsvector('simple',
      f_unaccent(coalesce(name_vi,'') || ' ' || coalesce(name_en,'') || ' ' ||
                 coalesce(summary_vi,'') || ' ' || coalesce(summary_en,''))
    )
  ) stored;

-- ============================================================
-- Indexes
-- ============================================================

create index mountains_range_idx       on mountains(range_id);
create index mountains_status_idx      on mountains(status);
create index mountains_elev_idx        on mountains(elevation_m);
create index mountains_difficulty_idx  on mountains(difficulty);
create index mountains_search_idx      on mountains using gin(search_tsv);
create index mtn_prov_province_idx     on mountain_provinces(province_id);
create index routes_mountain_idx       on routes(mountain_id);
create index routes_difficulty_idx     on routes(difficulty_level);
create index waypoints_route_idx       on waypoints(route_id);
create index articles_mountain_idx     on articles(mountain_id);
create index comments_mountain_idx     on comments(mountain_id);
create index comments_route_idx        on comments(route_id);
create index comments_user_idx         on comments(user_id);
create index photos_mountain_idx       on photos(mountain_id);
create index photos_route_idx          on photos(route_id);
create index photos_user_idx           on photos(user_id);

-- ============================================================
-- updated_at tự cập nhật
-- ============================================================

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger mountains_updated before update on mountains
  for each row execute function set_updated_at();
create trigger routes_updated before update on routes
  for each row execute function set_updated_at();
create trigger articles_updated before update on articles
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
--   Lõi: ai cũng ĐỌC được; GHI chỉ qua service role (bypass RLS) từ admin.
--   UGC: người dùng đăng nhập tự đăng, chỉ thấy nội dung đã duyệt + của mình.
-- ============================================================

-- Bật RLS toàn bộ
alter table provinces          enable row level security;
alter table ranges             enable row level security;
alter table mountains          enable row level security;
alter table mountain_provinces enable row level security;
alter table routes             enable row level security;
alter table waypoints          enable row level security;
alter table articles           enable row level security;
alter table profiles           enable row level security;
alter table comments           enable row level security;
alter table photos             enable row level security;

-- Đọc công khai cho dữ liệu lõi (không có policy insert/update ⇒ chỉ service role ghi được)
create policy "public read" on provinces          for select using (true);
create policy "public read" on ranges             for select using (true);
create policy "public read" on mountains          for select using (true);
create policy "public read" on mountain_provinces for select using (true);
create policy "public read" on routes             for select using (true);
create policy "public read" on waypoints          for select using (true);
create policy "public read published" on articles for select using (published = true);

-- profiles: ai cũng xem; tự sửa hồ sơ mình
create policy "profiles read"   on profiles for select using (true);
create policy "profiles insert" on profiles for insert with check (id = auth.uid());
create policy "profiles update" on profiles for update using (id = auth.uid());

-- comments: thấy bản đã duyệt + của chính mình; chỉ tạo bản 'pending' đứng tên mình
create policy "comments read" on comments for select
  using (status = 'approved' or user_id = auth.uid());
create policy "comments insert" on comments for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "comments delete own" on comments for delete
  using (user_id = auth.uid());

-- photos: tương tự comments
create policy "photos read" on photos for select
  using (status = 'approved' or user_id = auth.uid());
create policy "photos insert" on photos for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "photos delete own" on photos for delete
  using (user_id = auth.uid());

-- Lưu ý: kiểm duyệt (đổi status sang 'approved'/'rejected') làm qua service role/admin,
-- không cấp policy update cho người dùng thường nên họ không tự duyệt được.

-- ============================================================
-- Supabase Storage — bucket ảnh người dùng
--   Bucket public: file đọc được qua URL; việc HIỂN THỊ ảnh trên web vẫn lọc theo
--   photos.status='approved'. (Muốn chặt hơn: dùng bucket private + signed URL ở v2.)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- storage.objects đã bật RLS sẵn trên Supabase; chỉ cần thêm policy:
create policy "photos bucket public read" on storage.objects for select
  using (bucket_id = 'photos');

create policy "photos bucket auth upload" on storage.objects for insert
  to authenticated with check (bucket_id = 'photos' and owner = auth.uid());

create policy "photos bucket owner delete" on storage.objects for delete
  to authenticated using (bucket_id = 'photos' and owner = auth.uid());
