-- Convert any existing old Direct bookings to FIT.
update public.os_calendar_bookings
set booking_source = 'FIT',
    updated_at = now()
where lower(trim(booking_source)) = 'direct';
