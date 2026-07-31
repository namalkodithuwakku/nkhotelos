begin;

create extension if not exists pgcrypto;

-- Room types: add the fields required by the commercial OS.
alter table public.os_room_types
  add column if not exists name text,
  add column if not exists code text,
  add column if not exists description text,
  add column if not exists max_adults integer not null default 2,
  add column if not exists max_children integer not null default 0,
  add column if not exists max_occupancy integer not null default 2,
  add column if not exists standard_rate numeric(14,2),
  add column if not exists minimum_rate numeric(14,2),
  add column if not exists maximum_rate numeric(14,2),
  add column if not exists amenities jsonb not null default '[]'::jsonb,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- Rooms: operational and housekeeping fields.
alter table public.os_rooms
  add column if not exists room_number text,
  add column if not exists room_name text,
  add column if not exists room_type_id uuid references public.os_room_types(id) on delete set null,
  add column if not exists floor text,
  add column if not exists operational_status text not null default 'operational',
  add column if not exists housekeeping_status text not null default 'clean',
  add column if not exists notes text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill common display values without depending on older column names.
update public.os_room_types
set name = coalesce(nullif(name, ''), 'Standard Room')
where name is null or name = '';

update public.os_rooms
set room_number = coalesce(nullif(room_number, ''), right(id::text, 4)),
    room_name = coalesce(nullif(room_name, ''), 'Room ' || coalesce(nullif(room_number, ''), right(id::text, 4)))
where room_number is null or room_number = '' or room_name is null or room_name = '';

-- Actions: make the existing table usable as the central work queue.
alter table public.os_actions
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists module text not null default 'operations',
  add column if not exists priority text not null default 'normal',
  add column if not exists status text not null default 'pending',
  add column if not exists assigned_user_id uuid references auth.users(id) on delete set null,
  add column if not exists due_date date,
  add column if not exists expected_impact text,
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists completion_note text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists completed_by uuid references auth.users(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Notifications: central hotel alert inbox.
alter table public.os_notifications
  add column if not exists title text,
  add column if not exists message text,
  add column if not exists notification_type text not null default 'system',
  add column if not exists severity text not null default 'info',
  add column if not exists status text not null default 'unread',
  add column if not exists action_url text,
  add column if not exists action_id uuid references public.os_actions(id) on delete set null,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists read_at timestamptz,
  add column if not exists dismissed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Property settings are stored separately to keep the property profile simple.
create table if not exists public.os_property_settings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.os_properties(id) on delete cascade,
  booking_prefix text not null default 'BK',
  default_booking_status text not null default 'confirmed',
  default_payment_status text not null default 'not_paid',
  low_occupancy_threshold numeric(5,2) not null default 35,
  high_occupancy_threshold numeric(5,2) not null default 80,
  revenue_alerts_enabled boolean not null default true,
  marketing_alerts_enabled boolean not null default true,
  reputation_alerts_enabled boolean not null default true,
  email_notifications_enabled boolean not null default true,
  backup_enabled boolean not null default false,
  backup_frequency text not null default 'daily',
  date_format text not null default 'DD/MM/YYYY',
  number_format text not null default 'en-LK',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_audit_log (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.os_properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists os_room_types_property_sort_idx
  on public.os_room_types(property_id, sort_order, name);

create index if not exists os_rooms_property_sort_idx
  on public.os_rooms(property_id, sort_order, room_number);

create index if not exists os_actions_property_status_idx
  on public.os_actions(property_id, status, due_date);

create index if not exists os_notifications_property_status_idx
  on public.os_notifications(property_id, status, created_at desc);

alter table public.os_property_settings enable row level security;
alter table public.os_audit_log enable row level security;

drop policy if exists "OS users can read property settings" on public.os_property_settings;
create policy "OS users can read property settings"
on public.os_property_settings for select
to authenticated
using (public.os_has_property_access(property_id));

drop policy if exists "OS users can manage property settings" on public.os_property_settings;
create policy "OS users can manage property settings"
on public.os_property_settings for all
to authenticated
using (public.os_has_property_access(property_id))
with check (public.os_has_property_access(property_id));

drop policy if exists "OS users can read property audit log" on public.os_audit_log;
create policy "OS users can read property audit log"
on public.os_audit_log for select
to authenticated
using (property_id is null or public.os_has_property_access(property_id));

-- Ensure the sample property has one settings row.
insert into public.os_property_settings(property_id)
select id
from public.os_properties
where hotel_code = 'NKH001'
on conflict (property_id) do nothing;

commit;

select
  (select count(*) from public.os_room_types rt join public.os_properties p on p.id = rt.property_id where p.hotel_code = 'NKH001') as room_types,
  (select count(*) from public.os_rooms r join public.os_properties p on p.id = r.property_id where p.hotel_code = 'NKH001') as rooms,
  (select count(*) from public.os_property_settings s join public.os_properties p on p.id = s.property_id where p.hotel_code = 'NKH001') as settings_rows;
