import { NextRequest, NextResponse } from "next/server";
import {
  createServerSession,
  SESSION_COOKIE,
} from "../../../lib/serverSession";

type SupabaseUserResponse = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function supabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return value.replace(/\/+$/, "");
}

function supabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error("Supabase publishable key is not configured.");
  }

  return value;
}

function displayName(user: SupabaseUserResponse) {
  const metadata = user.user_metadata || {};
  return String(
    metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      user.email ||
      "Hotel OS User",
  ).trim();
}

function accessRole(user: SupabaseUserResponse) {
  const app = user.app_metadata || {};
  const userMetadata = user.user_metadata || {};

  return String(
    app.access ||
      app.role ||
      userMetadata.access ||
      userMetadata.role ||
      "Master",
  ).trim();
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Supabase access token is required." },
        { status: 401 },
      );
    }

    const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Supabase session is invalid or expired." },
        { status: 401 },
      );
    }

    const user = (await response.json()) as SupabaseUserResponse;

    if (!user.id || !user.email) {
      return NextResponse.json(
        { error: "Unable to verify the signed-in user." },
        { status: 401 },
      );
    }

    const token = createServerSession({
      name: displayName(user),
      access: accessRole(user),
    });

    const result = NextResponse.json({
      success: true,
      name: displayName(user),
      access: accessRole(user),
    });

    result.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Hotel OS session.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const result = NextResponse.json({ success: true });

  result.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return result;
}
