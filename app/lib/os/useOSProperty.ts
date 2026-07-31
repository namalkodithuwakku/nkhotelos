"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../supabase/client";

export type OSProperty = {
  id: string;
  hotel_code: string;
  hotel_name: string;
  number_of_rooms: number;
  currency: string;
  timezone: string;
};

export function useOSProperty() {
  const supabase = useMemo(() => createClient(), []);
  const [property, setProperty] = useState<OSProperty | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error: queryError } = await supabase
      .from("os_properties")
      .select("id,hotel_code,hotel_name,number_of_rooms,currency,timezone")
      .eq("hotel_code", "NKH001")
      .is("deleted_at", null)
      .maybeSingle<OSProperty>();

    if (queryError) setError(queryError.message);
    else if (!data) setError("No assigned property was found.");
    else setProperty(data);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { supabase, property, userId, loading, error, reload };
}
