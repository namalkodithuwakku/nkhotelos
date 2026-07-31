"use client";

import { useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function CalendarSessionRepair({
  onReady,
}: {
  onReady: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function repair() {
    setBusy(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/auth/os-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to restore the server session.");
      setBusy(false);
      return;
    }

    onReady();
  }

  return (
    <div
      style={{
        minHeight: 260,
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        gap: 12,
        color: "#657682",
      }}
    >
      <span>
        {error || "Your secure Calendar session needs to be refreshed."}
      </span>
      <button
        type="button"
        onClick={repair}
        disabled={busy}
        style={{
          border: 0,
          borderRadius: 10,
          background: "#159777",
          color: "white",
          padding: "11px 18px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {busy ? "Restoring…" : "Restore session"}
      </button>
    </div>
  );
}
