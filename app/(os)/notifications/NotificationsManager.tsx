"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ui from "../../components/os/CoreUI.module.css";
import { useOSProperty } from "../../lib/os/useOSProperty";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  notification_type: string;
  severity: string;
  status: string;
  action_url: string | null;
  created_at: string;
};

export default function NotificationsManager() {
  const { supabase, property, loading: propertyLoading, error: propertyError } = useOSProperty();
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("unread");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("os_notifications")
      .select("id,title,message,notification_type,severity,status,action_url,created_at")
      .eq("property_id", property.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) setError(queryError.message);
    else setItems((data ?? []) as Notification[]);
    setLoading(false);
  }, [property, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(id: string, status: "read" | "dismissed") {
    const { error: updateError } = await supabase
      .from("os_notifications")
      .update({
        status,
        read_at: status === "read" ? new Date().toISOString() : null,
        dismissed_at: status === "dismissed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) setError(updateError.message);
    else await load();
  }

  const visible = items.filter((item) => filter === "all" || item.status === filter);

  if (propertyLoading || loading) return <div className={ui.loading}>Loading notificationsâ€¦</div>;
  if (propertyError) return <div className={ui.error}>{propertyError}</div>;

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div><h2>Notification centre</h2><p>Booking, revenue, marketing, reputation and system alerts.</p></div>
        <button className={ui.secondary} onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>
      </div>

      {error ? <div className={ui.error}>{error}</div> : null}

      <div className={ui.tabs}>
        {["unread", "read", "dismissed", "all"].map((value) => <button key={value} className={filter === value ? ui.activeTab : ""} onClick={() => setFilter(value)}>{value}</button>)}
      </div>

      <div className={ui.list}>
        {visible.length === 0 ? <div className={ui.empty}>No notifications in this view.</div> : visible.map((item) => (
          <div className={ui.listRow} key={item.id}>
            <div><strong>{item.title || "Notification"}</strong><small>{item.message || item.notification_type}</small></div>
            <span className={`${ui.badge} ${item.severity === "warning" || item.severity === "critical" ? ui.warningBadge : ""}`}>{item.severity}</span>
            <span className={ui.badge}>{item.notification_type}</span>
            <button className={ui.smallButton} onClick={() => void updateStatus(item.id, "read")}><Check size={14} /></button>
            <button className={ui.smallButton} onClick={() => void updateStatus(item.id, "dismissed")}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

