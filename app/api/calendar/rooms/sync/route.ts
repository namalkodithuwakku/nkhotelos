import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { readServerSession } from "../../../../lib/serverSession";

type Room = { id: string };

export async function POST(request: NextRequest) {
  try {
    if (!readServerSession(request)) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const input = await request.json();
    const propertyId = String(input.propertyId || "");
    if (!propertyId) {
      return NextResponse.json({ error: "Property is required." }, { status: 400 });
    }

    const rooms = await supabaseAdmin<Room[]>(
      `os_rooms?property_id=eq.${encodeURIComponent(
        propertyId,
      )}&is_active=eq.true&select=id`,
    );

    return NextResponse.json({
      success: true,
      rooms_synced: rooms.length,
      source: "os_rooms",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to refresh calendar rooms.",
      },
      { status: 500 },
    );
  }
}
