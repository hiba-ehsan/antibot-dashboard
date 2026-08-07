"use client";

import { useEffect, useState } from "react";
import { proxyFetch } from "./api";
import type { TelemetryRow } from "@/components/TelemetryTable";

// Telemetry is read through the authenticated proxy API (GET /api/v1/telemetry),
// which scopes rows to the signed-in user server-side. Never query request_logs
// directly from the client — RLS alone is easy to misconfigure and leaks other
// users' data.
export function useTelemetry(limit = 50, refreshMs = 5000) {
  const [rows, setRows] = useState<TelemetryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await proxyFetch<TelemetryRow[]>(
          `/api/v1/telemetry?limit=${limit}`,
        );
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch {
        // transient failure — keep the last known data
      } finally {
        if (!cancelled) timer = setTimeout(load, refreshMs);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [limit, refreshMs]);

  return { rows };
}
