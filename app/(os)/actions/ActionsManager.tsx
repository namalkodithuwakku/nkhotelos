"use client";

import { CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import ui from "../../components/os/CoreUI.module.css";
import { useOSProperty } from "../../lib/os/useOSProperty";

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  module: string;
  priority: string;
  status: string;
  due_date: string | null;
  expected_impact: string | null;
  created_at: string;
};

const blank = {
  title: "",
  description: "",
  module: "operations",
  priority: "normal",
  due_date: "",
  expected_impact: "",
};

export default function ActionsManager() {
  const { supabase, property, userId, loading: propertyLoading, error: propertyError } = useOSProperty();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [form, setForm] = useState(blank);
  const [filter, setFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("os_actions")
      .select("id,title,description,module,priority,status,due_date,expected_impact,created_at")
      .eq("property_id", property.id)
      .order("created_at", { ascending: false });

    if (queryError) setError(queryError.message);
    else setItems((data ?? []) as ActionItem[]);
    setLoading(false);
  }, [property, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function createAction(event: FormEvent) {
    event.preventDefault();
    if (!property || !form.title.trim()) return;
    setError("");

    const { error: insertError } = await supabase.from("os_actions").insert({
      property_id: property.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      module: form.module,
      priority: form.priority,
      due_date: form.due_date || null,
      expected_impact: form.expected_impact.trim() || null,
      status: "pending",
      created_by: userId || null,
    });

    if (insertError) setError(insertError.message);
    else {
      setForm(blank);
      await load();
    }
  }

  async function setStatus(id: string, status: string) {
    const completed = status === "completed";
    const { error: updateError } = await supabase
      .from("os_actions")
      .update({
        status,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: completed ? userId || null : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) setError(updateError.message);
    else await load();
  }

  const visible = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "open") return !["completed", "ignored", "cancelled"].includes(item.status);
    return item.status === filter;
  });

  if (propertyLoading || loading) return <div className={ui.loading}>Loading actionsâ€¦</div>;
  if (propertyError) return <div className={ui.error}>{propertyError}</div>;

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div><h2>Property action centre</h2><p>Turn every important recommendation into clear work.</p></div>
        <button className={ui.secondary} onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>
      </div>

      {error ? <div className={ui.error}>{error}</div> : null}

      <div className={`${ui.grid} ${ui.twoColumn}`}>
        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Create action</h3><p>Assign the next important task.</p></div></div>
          <form className={ui.formGrid} onSubmit={createAction}>
            <label className={`${ui.field} ${ui.fieldWide}`}><span>Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label className={ui.field}><span>Module</span><select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}><option value="operations">Operations</option><option value="revenue">Revenue</option><option value="marketing">Marketing</option><option value="reputation">Reputation</option></select></label>
            <label className={ui.field}><span>Priority</span><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
            <label className={ui.field}><span>Due date</span><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
            <label className={ui.field}><span>Expected impact</span><input value={form.expected_impact} onChange={(e) => setForm({ ...form, expected_impact: e.target.value })} /></label>
            <label className={`${ui.field} ${ui.fieldWide}`}><span>Description</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className={ui.primary}><Plus size={15} /> Create action</button>
          </form>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHeader}><div><h3>Action queue</h3><p>{visible.length} actions shown.</p></div></div>
          <div className={ui.tabs}>
            {["open", "pending", "started", "completed", "all"].map((value) => <button key={value} className={filter === value ? ui.activeTab : ""} onClick={() => setFilter(value)}>{value}</button>)}
          </div>
          <div className={ui.list}>
            {visible.length === 0 ? <div className={ui.empty}>No actions in this view.</div> : visible.map((item) => (
              <div className={ui.listRow} key={item.id}>
                <div><strong>{item.title}</strong><small>{item.module} â€¢ {item.due_date || "No due date"}</small></div>
                <span className={`${ui.badge} ${item.priority === "urgent" || item.priority === "high" ? ui.warningBadge : ""}`}>{item.priority}</span>
                <span className={ui.badge}>{item.status}</span>
                <button className={ui.smallButton} onClick={() => void setStatus(item.id, "started")}>Start</button>
                <button className={ui.smallButton} onClick={() => void setStatus(item.id, "completed")}><CheckCircle2 size={14} /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

