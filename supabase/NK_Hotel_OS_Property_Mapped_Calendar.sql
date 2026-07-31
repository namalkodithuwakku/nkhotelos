-- N K HOTEL OS — PROPERTY-MAPPED BOOKING CALENDAR
-- Run after the Super Property Profile and Individual Rooms migrations.

create extension if not exists pgcrypto;

create table if not exists public.os_calendar_bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.os_properties(id) on delete cascade,
  room_id uuid not null references public.os_rooms(id) on delete restrict,
  room_type_id uuid references public.os_property_room_types(id) on delete set null,
  booking_group_key text,
  booking_reference text,
  guest_name text not null,
  room_name text not null,
  room_type text,
  booking_source text not null default 'Direct',
  booking_status text not null default 'Confirmed',
  check_in date not null,
  check_out date not null,
  phone text,
  email text,
  adults integer not null default 1,
  children integer not null default 0,
  children_ages integer[] not null default array[]::integer[],
  meal_plan text,
  total_amount numeric(14,2),
  received_amount numeric(14,2),
  payment_status text not null default 'Not paid',
  currency_code text not null default 'LKR',
  voucher_sent boolean not null default false,
  notes text,
  cancellation_reason text,
  cancelled_at timestamptz,
  cancelled_by text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint os_calendar_booking_dates_valid check (check_out > check_in)
);

create index if not exists os_calendar_bookings_property_dates_idx
  on public.os_calendar_bookings(property_id, check_in, check_out);

create index if not exists os_calendar_bookings_room_dates_idx
  on public.os_calendar_bookings(room_id, check_in, check_out);

create index if not exists os_calendar_bookings_group_idx
  on public.os_calendar_bookings(booking_group_key);

alter table public.os_calendar_bookings enable row level security;

drop policy if exists "Authenticated users manage Hotel OS calendar bookings"
  on public.os_calendar_bookings;

create policy "Authenticated users manage Hotel OS calendar bookings"
  on public.os_calendar_bookings
  for all to authenticated
  using (true)
  with check (true);

create or replace function public.os_prevent_room_booking_overlap()
returns trigger
language plpgsql
as $$
begin
  if new.booking_status <> 'Cancelled' and exists (
    select 1
    from public.os_calendar_bookings existing
    where existing.property_id = new.property_id
      and existing.room_id = new.room_id
      and existing.booking_status <> 'Cancelled'
      and existing.id <> new.id
      and existing.check_in < new.check_out
      and existing.check_out > new.check_in
  ) then
    raise exception 'This room is already occupied for the selected dates.';
  end if;
  return new;
end;
$$;

drop trigger if exists os_calendar_prevent_overlap
  on public.os_calendar_bookings;

create trigger os_calendar_prevent_overlap
before insert or update of room_id, check_in, check_out, booking_status
on public.os_calendar_bookings
for each row
execute function public.os_prevent_room_booking_overlap();
