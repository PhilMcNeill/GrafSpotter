-- Enable PostGIS for spatial queries
create extension if not exists postgis;

-- Entries table
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  writer_name text not null,
  writer_name_normalized text not null generated always as (lower(trim(writer_name))) stored,
  type text not null check (type in ('tag','throw-up','sticker','stencil','piece','mural')),
  photo_url text not null,
  location geography(Point, 4326) not null,
  latitude float8 not null,
  longitude float8 not null,
  location_label text,
  date_spotted date not null,
  submitted_by uuid references auth.users(id) not null,
  created_at timestamptz default now() not null,
  ai_suggested_name text,
  ai_detection_id text,
  bounding_box jsonb
);

-- Spatial index for bbox queries
create index if not exists entries_location_idx on entries using gist(location);

-- Index for writer name filtering
create index if not exists entries_writer_normalized_idx on entries(writer_name_normalized);

-- Index for date filtering
create index if not exists entries_date_spotted_idx on entries(date_spotted);

-- Index for type filtering
create index if not exists entries_type_idx on entries(type);

-- Row Level Security
alter table entries enable row level security;

-- Anyone can read entries
create policy "Public read entries"
  on entries for select
  using (true);

-- Only authenticated users can insert, and only as themselves
create policy "Auth insert entries"
  on entries for insert
  with check (auth.uid() = submitted_by);

-- Function for bbox spatial filter (used by GET /entries?bbox=)
create or replace function entries_in_bbox(
  min_lng float8,
  min_lat float8,
  max_lng float8,
  max_lat float8
)
returns setof entries
language sql
stable
as $$
  select * from entries
  where ST_Within(
    location::geometry,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
  )
$$;
