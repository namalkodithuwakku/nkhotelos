import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

if (!secret) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase
  .from("os_properties")
  .select("id, hotel_code, hotel_name, number_of_rooms, currency, timezone, status")
  .eq("hotel_code", "NKH001")
  .maybeSingle();

if (error) {
  console.error("Supabase connection failed:");
  console.error(error);
  process.exit(1);
}

if (!data) {
  console.error("Connected, but NKH001 was not found.");
  process.exit(1);
}

console.log("Supabase connection successful");
console.table([data]);
