import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { isMasterSession, readServerSession } from "../../lib/serverSession";

type OSProperty = {
  id: string;
  hotel_code: string;
  hotel_name: string;
  currency: string | null;
};

type OSRoom = {
  id: string;
  room_code: string | null;
  room_name: string | null;
  status: string | null;
  is_active: boolean;
  display_order: number | null;
  room_type: { name?: string } | { name?: string }[] | null;
};

type Booking = {
  id: string;
  property_id: string;
  booking_group_key: string | null;
  booking_reference: string | null;
  guest_name: string;
  room_name: string;
  room_type: string | null;
  booking_source: string;
  booking_status: string;
  check_in: string;
  check_out: string;
  phone?: string | null;
  email?: string | null;
  adults?: number;
  children?: number;
  children_ages?: number[];
  meal_plan?: string | null;
  total_amount?: number | null;
  received_amount?: number | null;
  payment_status?: string;
  currency_code?: string;
  voucher_sent?: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function validMonth(value: string | null) {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function roomTypeName(value: OSRoom["room_type"]) {
  if (Array.isArray(value)) return value[0]?.name || null;
  return value?.name || null;
}

export async function GET(request: NextRequest) {
  try {
    const session = readServerSession(request);
    if (!session) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const month = validMonth(request.nextUrl.searchParams.get("month"));
    const requestedProperty = String(
      request.nextUrl.searchParams.get("propertyId") || "",
    );

    const rawProperties = await supabaseAdmin<OSProperty[]>(
      "os_properties?deleted_at=is.null&status=eq.active&select=id,hotel_code,hotel_name,currency&order=hotel_name.asc",
    );

    const properties = rawProperties.map((property) => ({
      id: property.id,
      client_code: property.hotel_code,
      property_name: property.hotel_name,
      calendar_sheet_code: null,
      calendar_source_mode: "supabase" as const,
      currency_code: property.currency || "LKR",
    }));

    const property =
      properties.find((item) => item.id === requestedProperty) ||
      properties[0] ||
      null;

    if (!property) {
      return NextResponse.json({
        properties: [],
        property: null,
        rooms: [],
        bookings: [],
        sync: null,
        month,
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);
    const requestedFrom = validDate(request.nextUrl.searchParams.get("from"));
    const requestedTo = validDate(request.nextUrl.searchParams.get("to"));
    const from = requestedFrom || `${month}-01`;
    const nextMonth = new Date(Date.UTC(year, monthNumber, 1));
    const to =
      requestedTo ||
      `${nextMonth.getUTCFullYear()}-${String(
        nextMonth.getUTCMonth() + 1,
      ).padStart(2, "0")}-01`;

    const propertyId = encodeURIComponent(property.id);

    const [rawRooms, bookings] = await Promise.all([
      supabaseAdmin<OSRoom[]>(
        `os_rooms?property_id=eq.${propertyId}&is_active=eq.true&select=id,room_code,room_name,status,is_active,display_order,room_type:os_property_room_types(name)&order=display_order.asc,room_code.asc`,
      ),
      supabaseAdmin<Booking[]>(
        `os_calendar_bookings?property_id=eq.${propertyId}&booking_status=neq.Cancelled&check_in=lt.${encodeURIComponent(
          to,
        )}&check_out=gt.${encodeURIComponent(
          from,
        )}&select=*&order=check_in.asc,room_name.asc`,
      ),
    ]);

    const rooms = rawRooms.map((room, index) => ({
      id: room.id,
      room_name:
        room.room_name?.trim() ||
        room.room_code?.trim() ||
        `Room ${index + 1}`,
      room_type: roomTypeName(room.room_type),
      room_status: room.status || "active",
      sort_order: room.display_order ?? index,
    }));

    return NextResponse.json({
      properties,
      property,
      rooms,
      bookings,
      sync: {
        last_completed_at: new Date().toISOString(),
        last_status: "property_inventory",
        rooms_synced: rooms.length,
      },
      month,
      permissions: { canDelete: isMasterSession(session) },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load calendar.",
      },
      { status: 500 },
    );
  }
}
