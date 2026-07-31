"use client";

import { Plus, RefreshCw } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import ui from "../../components/os/CoreUI.module.css";
import { useOSProperty } from "../../lib/os/useOSProperty";

type StaffRow = {
  id: string;
  user_id: string;
  property_role: string;
  is_active: boolean;
  os_profiles: {
    full_name: string;
    display_name: string | null;
    platform_role: string;
    is_active: boolean;
  } | null;
};

const blank = {
  email: "",
  full_name: "",
  role: "hotel_team",
  temporary_password: "",
};

export default function StaffManager() {
  const { supabase, property, loading: propertyLoading, error: propertyError } = useOSProperty();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!property) return;
    setLoading(true);

    const { data, error: queryError } = await supabase
      .from("os_property_users")
      .select("id,user_id,property_role,is_active,os_profiles(full_name,display_name,platform_role,is_active)")
      .eq("property_id", property.id)
      .order("created_at");

    if (queryError) setError(queryError.message);
    else setStaff((data ?? []) as unknown as StaffRow[]);
    setLoading(false);
  }, [property, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (!property) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/os/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, property_id: property.id }),
    });
    const payload = await response.json();

    if (!response.ok) setError(payload.error || "Unable to create staff access.");
    else {
      setSuccess("Staff access created.");
      setForm(blank);
      await load();
    }
    setSaving(false);
  }

  async function updateAccess(id: string, changes: Partial<Pick<StaffRow, "property_role" | "is_active">>) {
    const { error: updateError } = await supabase
      .from("os_property_users")
      .update(changes)
      .eq("id", id);

    if (updateError) setError(updateError.message);
    else await load();
  }

  if (propertyLoading || loading) return <div className={ui.loading}>Loading staff accessâ€¦</div>;
  if (propertyError) return <div className={ui.error}>{propertyError}</div>;

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div><h2>Property staff access</h2><p>Create and control users assigned to this hotel.</p></div>
        <button className={ui.secondary} onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>
      </div>

      {error ? <div className={ui.error}>{error}</div> : null}
      {success ? <div className={ui.success}>{success}</div> : null}

      <div className={`${ui.grid} ${ui.twoColumn}`}>
        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Add staff user</h3><p>Master access is required.</p></div></div>
          <form className={ui.formGrid} onSubmit={invite}>
            <label className={ui.field}><span>Full name</span><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></label>
            <label className={ui.field}><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label className={ui.field}><span>Role</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="hotel_team">Hotel Team</option><option value="hotel_manager">Hotel Manager</option><option value="nkh_team">NKH Team</option><option value="supervisor">Supervisor</option></select></label>
            <label className={ui.field}><span>Temporary password</span><input type="password" minLength={8} value={form.temporary_password} onChange={(e) => setForm({ ...form, temporary_password: e.target.value })} required /></label>
            <button className={ui.primary} disabled={saving}><Plus size={15} /> Create access</button>
          </form>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Assigned users</h3><p>{staff.length} users connected.</p></div></div>
          <div className={ui.list}>
            {staff.length === 0 ? <div className={ui.empty}>No assigned users.</div> : staff.map((item) => (
              <div className={ui.listRow} key={item.id}>
                <div><strong>{item.os_profiles?.display_name || item.os_profiles?.full_name || item.user_id}</strong><small>{item.os_profiles?.platform_role || "OS user"}</small></div>
                <select value={item.property_role} onChange={(e) => void updateAccess(item.id, { property_role: e.target.value })}><option value="hotel_team">Hotel Team</option><option value="hotel_manager">Hotel Manager</option><option value="nkh_team">NKH Team</option><option value="supervisor">Supervisor</option><option value="master">Master</option></select>
                <span className={`${ui.badge} ${item.is_active ? ui.successBadge : ""}`}>{item.is_active ? "Active" : "Inactive"}</span>
                <button className={ui.smallButton} onClick={() => void updateAccess(item.id, { is_active: !item.is_active })}>{item.is_active ? "Disable" : "Enable"}</button>
                <span />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

