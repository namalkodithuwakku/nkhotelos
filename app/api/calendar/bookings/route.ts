import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { isMasterSession, readServerSession } from "../../../lib/serverSession";

type Room = {
  id: string;
  room_code: string | null;
  room_name: string | null;
  room_type_id: string | null;
  room_type: { name?: string } | { name?: string }[] | null;
};

function todayInSriLanka() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
type Existing = {
  id: string;
  room_id: string;
  booking_group_key: string | null;
  room_name: string;
  check_in: string;
  check_out: string;
  booking_status: string;
};

function roomTypeName(value: Room["room_type"]) {
  if (Array.isArray(value)) return value[0]?.name || null;
  return value?.name || null;
}

function displayName(room: Room) {
  return room.room_name?.trim() || room.room_code?.trim() || "Room";
}

async function propertyRooms(propertyId: string) {
  return supabaseAdmin<Room[]>(
    `os_rooms?property_id=eq.${encodeURIComponent(
      propertyId,
    )}&is_active=eq.true&select=id,room_code,room_name,room_type_id,room_type:os_property_room_types(name)`,
  );
}

function requestedRoomNames(input: Record<string, unknown>) {
  const supplied = Array.isArray(input.room_names)
    ? input.room_names
    : [input.room_name];

  return supplied
    .map((value) => String(value || "").trim())
    .filter(
      (value, index, values) =>
        Boolean(value) && values.indexOf(value) === index,
    );
}

async function overlapping(
  propertyId: string,
  checkIn: string,
  checkOut: string,
) {
  return supabaseAdmin<Existing[]>(
    `os_calendar_bookings?property_id=eq.${encodeURIComponent(
      propertyId,
    )}&booking_status=neq.Cancelled&check_in=lt.${encodeURIComponent(
      checkOut,
    )}&check_out=gt.${encodeURIComponent(
      checkIn,
    )}&select=id,room_id,booking_group_key,room_name,check_in,check_out,booking_status`,
  );
}

function paymentStatus(total: unknown, received: unknown) {
  const amount = Number(total || 0);
  const paid = Number(received || 0);
  if (!amount || paid <= 0) return "Not paid";
  if (paid >= amount) return "Fully paid";
  return "Partially paid";
}

function childrenAges(value: unknown) {
  const supplied = Array.isArray(value)
    ? value
    : String(value || "").split(",");

  return supplied
    .map((item) => Number(String(item).trim()))
    .filter(
      (age) => Number.isInteger(age) && age >= 0 && age <= 17,
    );
}

function bookingBody(
  input: Record<string, unknown>,
  room: Room,
  staffName: string,
) {
  return {
    room_id: room.id,
    room_type_id: room.room_type_id,
    guest_name: String(input.guest_name || "").trim(),
    room_name: displayName(room),
    room_type: roomTypeName(room.room_type),
    booking_reference:
      String(input.booking_reference || "").trim() || null,
    booking_source: String(input.booking_source || "FIT").trim() === "Direct" ? "FIT" : String(input.booking_source || "FIT").trim(),
    booking_status: String(input.booking_status || "Confirmed").trim(),
    check_in: String(input.check_in || ""),
    check_out: String(input.check_out || ""),
    phone: String(input.phone || "").trim() || null,
    email: String(input.email || "").trim().toLowerCase() || null,
    adults: Math.max(0, Number(input.adults || 1)),
    children: Math.max(0, Number(input.children || 0)),
    children_ages: childrenAges(input.children_ages),
    meal_plan: String(input.meal_plan || "").trim() || null,
    total_amount:
      input.total_amount === "" || input.total_amount == null
        ? null
        : Number(input.total_amount),
    received_amount:
      input.received_amount === "" || input.received_amount == null
        ? null
        : Number(input.received_amount),
    payment_status: paymentStatus(
      input.total_amount,
      input.received_amount,
    ),
    voucher_sent:
      input.voucher_sent === true ||
      input.voucher_sent === "true" ||
      input.voucher_sent === "on",
    currency_code: String(input.currency_code || "LKR")
      .trim()
      .toUpperCase()
      .slice(0, 3),
    notes: String(input.notes || "").trim() || null,
    updated_by: staffName,
    updated_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = readServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    }

    const input = (await request.json()) as Record<string, unknown>;
    const propertyId = String(input.property_id || "");
    const names = requestedRoomNames(input);
    const checkIn = String(input.check_in || "");
    const checkOut = String(input.check_out || "");

    if (checkIn < todayInSriLanka()) {
      return NextResponse.json(
        { error: "Past dates are locked. A booking cannot be moved into the past." },
        { status: 400 },
      );
    }
    const isBlock = input.action === "block";
    const today = todayInSriLanka();

    if (checkIn < today) {
      return NextResponse.json(
        { error: "Past dates are locked. New bookings can start from today." },
        { status: 400 },
      );
    }

    if (
      !propertyId ||
      !names.length ||
      (!isBlock && !String(input.guest_name || "").trim()) ||
      !checkIn ||
      !checkOut ||
      checkOut <= checkIn
    ) {
      return NextResponse.json(
        { error: "Guest, rooms and valid stay dates are required." },
        { status: 400 },
      );
    }

    const allRooms = await propertyRooms(propertyId);
    const selected = names
      .map((name) => allRooms.find((room) => displayName(room) === name))
      .filter(Boolean) as Room[];

    if (selected.length !== names.length) {
      return NextResponse.json(
        { error: "One or more selected rooms no longer exist." },
        { status: 400 },
      );
    }

    const collisions = await overlapping(propertyId, checkIn, checkOut);
    const unavailable = selected.filter((room) =>
      collisions.some((item) => item.room_id === room.id),
    );

    if (unavailable.length) {
      return NextResponse.json(
        {
          error: `Unavailable: ${unavailable
            .map(displayName)
            .join(", ")}`,
        },
        { status: 409 },
      );
    }

    const groupKey = `os:${randomUUID()}`;
    const now = new Date().toISOString();

    const rows = selected.map((room) => ({
      property_id: propertyId,
      booking_group_key: groupKey,
      created_by: session.name,
      created_at: now,
      ...bookingBody(
        {
          ...input,
          guest_name: isBlock ? "Blocked" : input.guest_name,
          booking_source: isBlock ? "Blocked" : input.booking_source,
          booking_status: isBlock ? "Blocked" : input.booking_status,
        },
        room,
        session.name,
      ),
    }));

    const created = await supabaseAdmin<Record<string, unknown>[]>(
      "os_calendar_bookings",
      {
        method: "POST",
        prefer: "return=representation",
        body: rows,
      },
    );

    return NextResponse.json(
      {
        success: true,
        booking: created[0],
        allocations: created,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add booking.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = readServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    }

    const input = (await request.json()) as Record<string, unknown>;
    const id = String(input.id || "");
    const propertyId = String(input.property_id || "");

    const rows = await supabaseAdmin<Existing[]>(
      `os_calendar_bookings?id=eq.${encodeURIComponent(
        id,
      )}&property_id=eq.${encodeURIComponent(
        propertyId,
      )}&select=id,room_id,booking_group_key,room_name,check_in,check_out,booking_status`,
    );

    const original = rows[0];
    if (!original) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    const groupKey = original.booking_group_key || original.id;
    const group = await supabaseAdmin<Existing[]>(
      `os_calendar_bookings?property_id=eq.${encodeURIComponent(
        propertyId,
      )}&or=(booking_group_key.eq.${encodeURIComponent(
        groupKey,
      )},id.eq.${encodeURIComponent(
        id,
      )})&select=id,room_id,booking_group_key,room_name,check_in,check_out,booking_status`,
    );

    if (input.action === "cancel") {
      const reason =
        String(input.reason || "").trim() || "Cancelled by staff";

      await supabaseAdmin(
        `os_calendar_bookings?property_id=eq.${encodeURIComponent(
          propertyId,
        )}&or=(booking_group_key.eq.${encodeURIComponent(
          groupKey,
        )},id.eq.${encodeURIComponent(id)})`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: {
            booking_status: "Cancelled",
            cancelled_at: new Date().toISOString(),
            cancelled_by: session.name,
            cancellation_reason: reason,
            updated_by: session.name,
            updated_at: new Date().toISOString(),
          },
        },
      );

      return NextResponse.json({ success: true, status: "Cancelled" });
    }

    const allRooms = await propertyRooms(propertyId);

    if (input.action === "move") {
      const targetName = String(input.target_room || "");
      const target = allRooms.find(
        (room) => displayName(room) === targetName,
      );

      if (!target) {
        return NextResponse.json(
          { error: "Target room was not found." },
          { status: 400 },
        );
      }

      const collisions = await overlapping(
        propertyId,
        original.check_in,
        original.check_out,
      );

      if (
        collisions.some(
          (item) =>
            item.room_id === target.id &&
            !group.some((member) => member.id === item.id),
        )
      ) {
        return NextResponse.json(
          { error: `${targetName} is unavailable for these dates.` },
          { status: 409 },
        );
      }

      const updated = await supabaseAdmin<Record<string, unknown>[]>(
        `os_calendar_bookings?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          prefer: "return=representation",
          body: {
            room_id: target.id,
            room_type_id: target.room_type_id,
            room_name: displayName(target),
            room_type: roomTypeName(target.room_type),
            updated_by: session.name,
            updated_at: new Date().toISOString(),
          },
        },
      );

      return NextResponse.json(updated[0]);
    }

    const names = requestedRoomNames(input);
    const checkIn = String(input.check_in || "");
    const checkOut = String(input.check_out || "");

    if (checkIn < todayInSriLanka()) {
      return NextResponse.json(
        { error: "Past dates are locked. A booking cannot be moved into the past." },
        { status: 400 },
      );
    }

    if (
      !names.length ||
      !String(input.guest_name || "").trim() ||
      !checkIn ||
      !checkOut ||
      checkOut <= checkIn
    ) {
      return NextResponse.json(
        { error: "Guest, rooms and valid dates are required." },
        { status: 400 },
      );
    }

    const selected = names
      .map((name) => allRooms.find((room) => displayName(room) === name))
      .filter(Boolean) as Room[];

    if (selected.length !== names.length) {
      return NextResponse.json(
        { error: "One or more selected rooms no longer exist." },
        { status: 400 },
      );
    }

    const collisions = await overlapping(propertyId, checkIn, checkOut);
    const groupIds = new Set(group.map((item) => item.id));
    const unavailable = selected.filter((room) =>
      collisions.some(
        (item) => item.room_id === room.id && !groupIds.has(item.id),
      ),
    );

    if (unavailable.length) {
      return NextResponse.json(
        {
          error: `Unavailable: ${unavailable
            .map(displayName)
            .join(", ")}`,
        },
        { status: 409 },
      );
    }

    const existingByRoomId = new Map(
      group.map((item) => [item.room_id, item]),
    );
    const keepIds: string[] = [];
    const results: Record<string, unknown>[] = [];

    for (const room of selected) {
      const existing = existingByRoomId.get(room.id);

      if (existing) {
        keepIds.push(existing.id);
        const updated = await supabaseAdmin<Record<string, unknown>[]>(
          `os_calendar_bookings?id=eq.${encodeURIComponent(existing.id)}`,
          {
            method: "PATCH",
            prefer: "return=representation",
            body: bookingBody(input, room, session.name),
          },
        );
        if (updated[0]) results.push(updated[0]);
      } else {
        const created = await supabaseAdmin<Record<string, unknown>[]>(
          "os_calendar_bookings",
          {
            method: "POST",
            prefer: "return=representation",
            body: {
              property_id: propertyId,
              booking_group_key: groupKey,
              created_by: session.name,
              ...bookingBody(input, room, session.name),
            },
          },
        );
        if (created[0]) {
          results.push(created[0]);
          keepIds.push(String(created[0].id));
        }
      }
    }

    for (const member of group) {
      if (!keepIds.includes(member.id)) {
        await supabaseAdmin(
          `os_calendar_bookings?id=eq.${encodeURIComponent(member.id)}`,
          { method: "DELETE", prefer: "return=minimal" },
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking: results[0],
      allocations: results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update booking.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = readServerSession(request);
    if (!isMasterSession(session)) {
      return NextResponse.json(
        { error: "Only Master can permanently delete a booking." },
        { status: 403 },
      );
    }

    const input = await request.json();
    const id = String(input.id || "");
    const propertyId = String(input.property_id || "");

    const rows = await supabaseAdmin<Existing[]>(
      `os_calendar_bookings?id=eq.${encodeURIComponent(
        id,
      )}&property_id=eq.${encodeURIComponent(
        propertyId,
      )}&select=id,room_id,booking_group_key,room_name,check_in,check_out,booking_status`,
    );

    const groupKey = rows[0]?.booking_group_key || id;

    await supabaseAdmin(
      `os_calendar_bookings?property_id=eq.${encodeURIComponent(
        propertyId,
      )}&or=(booking_group_key.eq.${encodeURIComponent(
        groupKey,
      )},id.eq.${encodeURIComponent(id)})`,
      { method: "DELETE", prefer: "return=minimal" },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete booking.",
      },
      { status: 500 },
    );
  }
}


