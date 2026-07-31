"use client";

import {
  Building2,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogOut,
  Save,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type PropertyRecord = {
  id: string;
  hotel_code: string;
  hotel_name: string;
  property_type: string;
  address: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  number_of_rooms: number;
  currency: string;
  timezone: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
};

type EditableProperty = Omit<PropertyRecord, "id">;

const EMPTY_PROPERTY: EditableProperty = {
  hotel_code: "NKH001",
  hotel_name: "",
  property_type: "Hotel",
  address: "",
  city: "",
  country: "Sri Lanka",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  number_of_rooms: 0,
  currency: "LKR",
  timezone: "Asia/Colombo",
  check_in_time: "14:00",
  check_out_time: "11:00",
  status: "active",
};

function normalizeTime(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export default function PropertyEditor() {
  const supabase = createClient();

  const [checkingSession, setCheckingSession] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("nkhotelsup@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [property, setProperty] =
    useState<EditableProperty>(EMPTY_PROPERTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProperty = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const { data, error: queryError } = await supabase
      .from("os_properties")
      .select(
        "id, hotel_code, hotel_name, property_type, address, city, country, phone, whatsapp, email, website, number_of_rooms, currency, timezone, check_in_time, check_out_time, status",
      )
      .eq("hotel_code", "NKH001")
      .is("deleted_at", null)
      .maybeSingle<PropertyRecord>();

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setError(
        "Queens Beach Hotel was not found or this account does not have access.",
      );
      setLoading(false);
      return;
    }

    setPropertyId(data.id);
    setProperty({
      hotel_code: data.hotel_code,
      hotel_name: data.hotel_name,
      property_type: data.property_type,
      address: data.address ?? "",
      city: data.city ?? "",
      country: data.country,
      phone: data.phone ?? "",
      whatsapp: data.whatsapp ?? "",
      email: data.email ?? "",
      website: data.website ?? "",
      number_of_rooms: data.number_of_rooms,
      currency: data.currency,
      timezone: data.timezone,
      check_in_time: normalizeTime(data.check_in_time),
      check_out_time: normalizeTime(data.check_out_time),
      status: data.status,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      const hasSession = Boolean(session);
      setSignedIn(hasSession);
      setCheckingSession(false);

      if (hasSession) {
        await loadProperty();
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSignedIn(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProperty, supabase]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    setSuccess("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

    if (loginError) {
      setError(loginError.message);
      setLoginBusy(false);
      return;
    }

    setSignedIn(true);
    setLoginPassword("");
    setLoginBusy(false);
    await loadProperty();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSignedIn(false);
    setPropertyId(null);
    setProperty(EMPTY_PROPERTY);
    setSuccess("");
    setError("");
  }

  function updateField<K extends keyof EditableProperty>(
    field: K,
    value: EditableProperty[K],
  ) {
    setProperty((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!propertyId) {
      setError("Property record is not loaded.");
      return;
    }

    if (!property.hotel_name.trim()) {
      setError("Hotel name is required.");
      return;
    }

    if (property.number_of_rooms < 0) {
      setError("Number of rooms cannot be negative.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("os_properties")
      .update({
        hotel_name: property.hotel_name.trim(),
        property_type: property.property_type.trim() || "Hotel",
        address: property.address?.trim() || null,
        city: property.city?.trim() || null,
        country: property.country.trim() || "Sri Lanka",
        phone: property.phone?.trim() || null,
        whatsapp: property.whatsapp?.trim() || null,
        email: property.email?.trim() || null,
        website: property.website?.trim() || null,
        number_of_rooms: Number(property.number_of_rooms),
        currency: property.currency.trim().toUpperCase() || "LKR",
        timezone: property.timezone.trim() || "Asia/Colombo",
        check_in_time: property.check_in_time || null,
        check_out_time: property.check_out_time || null,
        status: property.status,
      })
      .eq("id", propertyId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess("Property profile saved successfully.");
    setSaving(false);
    await loadProperty();
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] p-6">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#ef7d00]" />
        </div>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3e5] text-[#ef7d00]">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef7d00]">
            N K Hotel OS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#20252b]">
            Secure property access
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#66707a]">
            Sign in with the Supabase account assigned to Queens Beach Hotel.
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            <Field label="Email">
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                autoComplete="email"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </Field>

            {error ? <Alert type="error" message={error} /> : null}

            <button
              type="submit"
              disabled={loginBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#20252b] px-4 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LockKeyhole className="h-5 w-5" />
              )}
              Sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff3e5] text-[#ef7d00]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef7d00]">
                Property
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#20252b]">
                Hotel profile
              </h1>
              <p className="mt-1 text-sm text-[#66707a]">
                Live information stored in Supabase and used throughout N K Hotel OS.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold text-[#20252b] hover:bg-black/[0.03]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        {loading ? (
          <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-black/10 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#ef7d00]" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle
                title="Basic information"
                description="Main identity, location and contact information."
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Hotel code">
                  <input
                    value={property.hotel_code}
                    disabled
                    className={`${inputClass} bg-[#f4f4f2] text-[#7a828a]`}
                  />
                </Field>

                <Field label="Hotel name">
                  <input
                    value={property.hotel_name}
                    onChange={(event) =>
                      updateField("hotel_name", event.target.value)
                    }
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Property type">
                  <input
                    value={property.property_type}
                    onChange={(event) =>
                      updateField("property_type", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Number of rooms">
                  <input
                    type="number"
                    min="0"
                    value={property.number_of_rooms}
                    onChange={(event) =>
                      updateField(
                        "number_of_rooms",
                        Number(event.target.value),
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Address" wide>
                  <input
                    value={property.address ?? ""}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="City">
                  <input
                    value={property.city ?? ""}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Country">
                  <input
                    value={property.country}
                    onChange={(event) =>
                      updateField("country", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle
                title="Contacts and online presence"
                description="Details guests and business partners use to contact the property."
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Telephone">
                  <input
                    value={property.phone ?? ""}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    value={property.whatsapp ?? ""}
                    onChange={(event) =>
                      updateField("whatsapp", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={property.email ?? ""}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Website">
                  <input
                    type="url"
                    placeholder="https://"
                    value={property.website ?? ""}
                    onChange={(event) =>
                      updateField("website", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle
                title="Operating settings"
                description="Core values used by booking, occupancy and reporting modules."
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Currency">
                  <input
                    value={property.currency}
                    onChange={(event) =>
                      updateField("currency", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Time zone">
                  <input
                    value={property.timezone}
                    onChange={(event) =>
                      updateField("timezone", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Check-in time">
                  <input
                    type="time"
                    value={property.check_in_time ?? ""}
                    onChange={(event) =>
                      updateField("check_in_time", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Check-out time">
                  <input
                    type="time"
                    value={property.check_out_time ?? ""}
                    onChange={(event) =>
                      updateField("check_out_time", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={property.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>
            </section>

            {error ? <Alert type="error" message={error} /> : null}
            {success ? <Alert type="success" message={success} /> : null}

            <div className="sticky bottom-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-[#ef7d00] px-6 py-3.5 font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#d96f00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Save property
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-medium text-[#20252b] outline-none transition placeholder:text-[#a2a8ad] focus:border-[#ef7d00] focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed";

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="mb-2 block text-sm font-bold text-[#3d444b]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-[#20252b]">{title}</h2>
      <p className="mt-1 text-sm text-[#737b83]">{description}</p>
    </div>
  );
}

function Alert({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  const success = type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
