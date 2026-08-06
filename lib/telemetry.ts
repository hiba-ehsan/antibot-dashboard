"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "./supabase";
import type { TelemetryRow } from "@/components/TelemetryTable";

export function useTelemetry(limit = 50) {
  const [rows, setRows] = useState<TelemetryRow[]>([]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    let mounted = true;

    supabase
      .from("request_logs")
      .select("*")
      .order("timestamp_epoch_ms", { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error && data && mounted) {
          setRows(data as TelemetryRow[]);
        }
      });

    const channel = supabase
      .channel("public:request_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "request_logs" },
        (payload) => {
          if (!mounted) return;
          const row = payload.new as TelemetryRow;
          setRows((prev) => [row, ...prev].slice(0, limit));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { rows };
}
