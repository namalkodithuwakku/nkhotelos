-- N K HOTEL OS — INDIVIDUAL ROOMS UPDATE
-- Run once after the Super Property Profile migration.

create table if not exists public.os_rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.os_properties(id) on delete cascade,
  room_type_id uuid references public.os_property_room_types(id) on delete set null,
  room_code text not null,
  room_name text not null,
  floor text,
  building_or_wing text,
  view_type text,
  status text not null default 'active'
    check (status in ('active','maintenance','out_of_order','inactive')),
  is_active boolean not null default true,
  notes text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, room_code)
);

create index if not exists os_rooms_property_idx on public.os_rooms(property_id);
create index if not exists os_rooms_room_type_idx on public.os_rooms(room_type_id);

alter table public.os_rooms enable row level security;

drop policy if exists "Authenticated users manage individual rooms" on public.os_rooms;
create policy "Authenticated users manage individual rooms"
  on public.os_rooms
  for all to authenticated
  using (true) with check (true);
