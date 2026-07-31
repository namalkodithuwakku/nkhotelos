"use client";

import { Save } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import ui from "../components/os/CoreUI.module.css";
import { useOSProperty } from "../lib/os/useOSProperty";

type Settings = {
  booking_prefix: string;
  default_booking_status: string;
  default_payment_status: string;
  low_occupancy_threshold: number;
  high_occupancy_threshold: number;
  revenue_alerts_enabled: boolean;
  marketing_alerts_enabled: boolean;
  reputation_alerts_enabled: boolean;
  email_notifications_enabled: boolean;
  backup_enabled: boolean;
  backup_frequency: string;
  date_format: string;
  number_format: string;
};

const defaults: Settings = {
  booking_prefix: "BK",
  default_booking_status: "confirmed",
  default_payment_status: "not_paid",
  low_occupancy_threshold: 35,
  high_occupancy_threshold: 80,
  revenue_alerts_enabled: true,
  marketing_alerts_enabled: true,
  reputation_alerts_enabled: true,
  email_notifications_enabled: true,
  backup_enabled: false,
  backup_frequency: "daily",
  date_format: "DD/MM/YYYY",
  number_format: "en-LK",
};

export default function SettingsManager() {
  const { supabase, property, userId, loading: propertyLoading, error: propertyError } = useOSProperty();
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("os_property_settings")
      .select("booking_prefix,default_booking_status,default_payment_status,low_occupancy_threshold,high_occupancy_threshold,revenue_alerts_enabled,marketing_alerts_enabled,reputation_alerts_enabled,email_notifications_enabled,backup_enabled,backup_frequency,date_format,number_format")
      .eq("property_id", property.id)
      .maybeSingle<Settings>();

    if (queryError) setError(queryError.message);
    else if (data) setForm(data);
    setLoading(false);
  }, [property, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!property) return;
    setSaving(true);
    setMessage("");
    setError("");

    const { error: upsertError } = await supabase
      .from("os_property_settings")
      .upsert({
        property_id: property.id,
        ...form,
        updated_by: userId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "property_id" });

    if (upsertError) setError(upsertError.message);
    else setMessage("Settings saved.");
    setSaving(false);
  }

  if (propertyLoading || loading) return <div className={ui.loading}>Loading settings…</div>;
  if (propertyError) return <div className={ui.error}>{propertyError}</div>;

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}><div><h2>Property settings</h2><p>Simple defaults used throughout the OS.</p></div></div>
      {error ? <div className={ui.error}>{error}</div> : null}
      {message ? <div className={ui.success}>{message}</div> : null}

      <form className={`${ui.grid} ${ui.twoColumn}`} onSubmit={save}>
        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Booking defaults</h3><p>Values used for new bookings.</p></div></div>
          <div className={ui.formGrid}>
            <label className={ui.field}><span>Booking prefix</span><input value={form.booking_prefix} onChange={(e) => setForm({ ...form, booking_prefix: e.target.value })} /></label>
            <label className={ui.field}><span>Default booking status</span><select value={form.default_booking_status} onChange={(e) => setForm({ ...form, default_booking_status: e.target.value })}><option value="tentative">Tentative</option><option value="confirmed">Confirmed</option></select></label>
            <label className={ui.field}><span>Default payment status</span><select value={form.default_payment_status} onChange={(e) => setForm({ ...form, default_payment_status: e.target.value })}><option value="not_paid">Not paid</option><option value="partially_paid">Partially paid</option><option value="fully_paid">Fully paid</option></select></label>
            <label className={ui.field}><span>Date format</span><select value={form.date_format} onChange={(e) => setForm({ ...form, date_format: e.target.value })}><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></label>
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Smart thresholds</h3><p>Controls occupancy alerts and manager priorities.</p></div></div>
          <div className={ui.formGrid}>
            <label className={ui.field}><span>Low occupancy %</span><input type="number" min="0" max="100" value={form.low_occupancy_threshold} onChange={(e) => setForm({ ...form, low_occupancy_threshold: Number(e.target.value) })} /></label>
            <label className={ui.field}><span>High occupancy %</span><input type="number" min="0" max="100" value={form.high_occupancy_threshold} onChange={(e) => setForm({ ...form, high_occupancy_threshold: Number(e.target.value) })} /></label>
            <label className={ui.field}><span>Backup frequency</span><select value={form.backup_frequency} onChange={(e) => setForm({ ...form, backup_frequency: e.target.value })}><option value="hourly">Hourly</option><option value="daily">Daily</option></select></label>
            <label className={ui.field}><span>Number format</span><input value={form.number_format} onChange={(e) => setForm({ ...form, number_format: e.target.value })} /></label>
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Manager alerts</h3><p>Choose which smart managers create alerts.</p></div></div>
          <div className={ui.formGrid}>
            {[
              ["revenue_alerts_enabled", "Revenue alerts"],
              ["marketing_alerts_enabled", "Marketing alerts"],
              ["reputation_alerts_enabled", "Reputation alerts"],
              ["email_notifications_enabled", "Email notifications"],
              ["backup_enabled", "Google Sheets backup"],
            ].map(([key, label]) => (
              <label className={ui.field} key={key}>
                <span>{label}</span>
                <select value={form[key as keyof Settings] ? "yes" : "no"} onChange={(e) => setForm({ ...form, [key]: e.target.value === "yes" })}>
                  <option value="yes">Enabled</option>
                  <option value="no">Disabled</option>
                </select>
              </label>
            ))}
          </div>
        </section>

        <div>
          <button className={ui.primary} disabled={saving}><Save size={15} /> Save settings</button>
        </div>
      </form>
    </div>
  );
}
