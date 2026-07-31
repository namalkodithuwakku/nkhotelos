create extension if not exists pgcrypto;

create table if not exists public.os_property_profiles (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.os_properties(id) on delete cascade,
  public_name text,
  short_description text,
  full_description text,
  star_rating numeric(2,1),
  opening_year integer,
  languages text[] not null default array['English']::text[],
  reservation_email text,
  general_email text,
  emergency_phone text,
  postcode text,
  district text,
  province text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  google_maps_url text,
  front_desk_hours text,
  airport_distance_km numeric(8,2),
  railway_distance_km numeric(8,2),
  beach_distance_km numeric(8,2),
  directions text,
  arrival_notes text,
  overall_min_rate numeric(12,2),
  overall_max_rate numeric(12,2),
  tax_percent numeric(6,3) not null default 0,
  service_charge_percent numeric(6,3) not null default 0,
  accepted_payments text[] not null default array[]::text[],
  direct_booking_benefits text,
  booking_confirmation_text text,
  child_policy text,
  cancellation_policy text,
  payment_policy text,
  pet_policy text,
  smoking_policy text,
  damage_policy text,
  extra_bed_policy text,
  amenities text[] not null default array[]::text[],
  meal_plans jsonb not null default '[]'::jsonb,
  profile_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_property_room_types (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.os_properties(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  room_count integer not null default 0,
  standard_adults integer not null default 2,
  max_adults integer not null default 2,
  max_children integer not null default 0,
  max_occupancy integer not null default 2,
  room_size_sqm numeric(8,2),
  bed_configuration text,
  view_type text,
  smoking_policy text not null default 'Non-smoking',
  extra_bed_available boolean not null default false,
  extra_bed_charge numeric(12,2),
  child_charge numeric(12,2),
  default_rate numeric(12,2),
  minimum_rate numeric(12,2),
  maximum_rate numeric(12,2),
  amenities text[] not null default array[]::text[],
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, code)
);

create table if not exists public.os_property_channels (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.os_properties(id) on delete cascade,
  channel_name text not null,
  channel_type text not null default 'ota',
  public_url text,
  extranet_url text,
  listing_id text,
  login_username text,
  commission_percent numeric(6,3),
  payout_currency text,
  payment_method text,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, channel_name)
);

create table if not exists public.os_property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.os_properties(id) on delete cascade,
  room_type_id uuid references public.os_property_room_types(id) on delete set null,
  storage_path text not null,
  public_url text not null,
  category text not null default 'property',
  caption text,
  alt_text text,
  is_cover boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.os_property_profiles enable row level security;
alter table public.os_property_room_types enable row level security;
alter table public.os_property_channels enable row level security;
alter table public.os_property_photos enable row level security;

drop policy if exists "Authenticated manage property profiles" on public.os_property_profiles;
create policy "Authenticated manage property profiles" on public.os_property_profiles for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated manage room types" on public.os_property_room_types;
create policy "Authenticated manage room types" on public.os_property_room_types for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated manage property channels" on public.os_property_channels;
create policy "Authenticated manage property channels" on public.os_property_channels for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated manage property photos" on public.os_property_photos;
create policy "Authenticated manage property photos" on public.os_property_photos for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('os-property-media','os-property-media',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Authenticated upload property media" on storage.objects;
create policy "Authenticated upload property media" on storage.objects for insert to authenticated with check (bucket_id='os-property-media');
drop policy if exists "Authenticated delete property media" on storage.objects;
create policy "Authenticated delete property media" on storage.objects for delete to authenticated using (bucket_id='os-property-media');
drop policy if exists "Public view property media" on storage.objects;
create policy "Public view property media" on storage.objects for select to public using (bucket_id='os-property-media');

insert into public.os_property_profiles(property_id,public_name)
select id,hotel_name from public.os_properties where hotel_code='NKH001'
on conflict(property_id) do nothing;
