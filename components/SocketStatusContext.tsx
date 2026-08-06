"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type SocketStatus = "connecting" | "connected" | "reconnecting";

const SocketStatusContext = createContext<{
  socketStatus: SocketStatus;
  setSocketStatus: (s: SocketStatus) => void;
}>({
  socketStatus: "connecting",
  setSocketStatus: () => {},
});

export function SocketStatusProvider({ children }: { children: ReactNode }) {
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  return (
    <SocketStatusContext.Provider value={{ socketStatus, setSocketStatus }}>
      {children}
    </SocketStatusContext.Provider>
  );
}

export function useSocketStatus() {
  return useContext(SocketStatusContext);
}
