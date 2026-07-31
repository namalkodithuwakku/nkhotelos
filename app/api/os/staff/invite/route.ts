import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("os_profiles")
    .select("platform_role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active || profile.platform_role !== "master") {
    return NextResponse.json({ error: "Master access is required." }, { status: 403 });
  }

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.full_name || "").trim();
  const password = String(body.temporary_password || "");
  const role = String(body.role || "hotel_team");
  const propertyId = String(body.property_id || "");

  if (!email || !fullName || password.length < 8 || !propertyId) {
    return NextResponse.json(
      { error: "Name, email, property and an 8-character password are required." },
      { status: 400 },
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Unable to create authentication user." },
      { status: 400 },
    );
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from("os_profiles").upsert({
    id: userId,
    full_name: fullName,
    display_name: fullName.split(" ")[0],
    platform_role: role,
    is_active: true,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: accessError } = await admin.from("os_property_users").insert({
    property_id: propertyId,
    user_id: userId,
    property_role: role,
    is_active: true,
  });

  if (accessError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: accessError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user_id: userId });
}
