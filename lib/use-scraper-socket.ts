"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const PROXY_URL =
  (process.env.NEXT_PUBLIC_PROXY_API_URL ?? "http://localhost:3001").replace(
    /\/+$/,
    "",
  );

export interface ScraperProgress {
  found: number;
  status: string;
}

export interface ScraperComplete {
  total: number;
  duration: number;
}

export function useScraperSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${PROXY_URL}/scrapers`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    socketRef.current?.emit("scraper:join", { sessionId });
  }, []);

  const onProgress = useCallback(
    (cb: (data: ScraperProgress) => void) => {
      socketRef.current?.on("scraper:progress", cb);
      return () => socketRef.current?.off("scraper:progress", cb);
    },
    [],
  );

  const onResult = useCallback(
    (cb: (data: any) => void) => {
      socketRef.current?.on("scraper:result", cb);
      return () => socketRef.current?.off("scraper:result", cb);
    },
    [],
  );

  const onComplete = useCallback(
    (cb: (data: ScraperComplete) => void) => {
      socketRef.current?.on("scraper:complete", cb);
      return () => socketRef.current?.off("scraper:complete", cb);
    },
    [],
  );

  const onError = useCallback(
    (cb: (data: { message: string }) => void) => {
      socketRef.current?.on("scraper:error", cb);
      return () => socketRef.current?.off("scraper:error", cb);
    },
    [],
  );

  return { connected, joinSession, onProgress, onResult, onComplete, onError };
}
