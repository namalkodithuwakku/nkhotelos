"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "./lib/supabase/client";

export default function RootPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function routeUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      router.replace(session ? "/dashboard" : "/login");
    }

    void routeUser();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      color: "#ef7d00",
      background: "#f3f5f7",
    }}>
      <Loader2 style={{ animation: "spin .8s linear infinite" }} />
    </main>
  );
}
