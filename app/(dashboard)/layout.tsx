"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import TopNav from "@/components/TopNav";
import {
  SocketStatusProvider,
  useSocketStatus,
} from "@/components/SocketStatusContext";

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { socketStatus, setSocketStatus } = useSocketStatus();

  useEffect(() => {
    let mounted = true;
    getSession().then((session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email ?? null);
      setChecked(true);
    });

    const supabase = createSupabaseClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted && (event === "SIGNED_OUT" || (!session && event === "INITIAL_SESSION"))) {
          router.replace("/login");
        }
      },
    );

    // Lightweight socket-status probe channel
    const channel = supabase
      .channel("dashboard:status")
      .subscribe((status) => {
        if (!mounted) return;
        if (status === "SUBSCRIBED") setSocketStatus("connected");
        else setSocketStatus("reconnecting");
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [router, setSocketStatus]);

  if (!checked) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2a2d33] border-t-[#E8E9EE] animate-spin" />
          <p className="font-mono text-xs tracking-[0.3em] text-[#676a79]">
            LOADING
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <TopNav email={email} socketStatus={socketStatus} />
      <main className="min-w-0 px-4 sm:px-8 pt-24 pb-16 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SocketStatusProvider>
      <AuthGate>{children}</AuthGate>
    </SocketStatusProvider>
  );
}
