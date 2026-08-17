"use client";

import { useEffect, useState } from "react";
import { getSession, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Copy, Check, Server, Cpu, Database, LogOut, User } from "lucide-react";

const PROXY_API = process.env.NEXT_PUBLIC_PROXY_API_URL ?? "http://localhost:3001";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    getSession().then((s) => {
      if (s) setUser({ email: s.user.email ?? "", id: s.user.id });
    });
  }, []);

  const copy = async (val: string, id: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-2">
          SETTINGS
        </p>
        <h1 className="text-2xl font-bold silver-text tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#676a79] mt-1">
          Your account and service URLs for this deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#E8E9EE]" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79]">
              YOUR ACCOUNT
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] text-[#676a79] mb-1">
                EMAIL
              </label>
              <p className="text-sm text-white">{user?.email ?? "â€”"}</p>
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] text-[#676a79] mb-1">
                USER ID
              </label>
              <code className="font-mono text-xs text-[#ceced7] block break-all">
                {user?.id ?? "â€”"}
              </code>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Service endpoints */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-[#E8E9EE]" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79]">
              SERVICE URLS
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "PROXY GATEWAY", value: PROXY_API, icon: Server },
              { label: "ML SERVICE", value: "http://localhost:8000", icon: Cpu },
              { label: "SUPABASE", value: "https://vgxvdzjxlsxluwtrlvmy.supabase.co", icon: Database },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-[#17191d] border border-[#2a2d33] p-3"
              >
                <Icon className="w-4 h-4 text-[#676a79] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#676a79]">
                    {label}
                  </p>
                  <code className="font-mono text-xs text-white truncate block">
                    {value}
                  </code>
                </div>
                <button
                  onClick={() => copy(value, label)}
                  className="p-1.5 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors shrink-0"
                >
                  {copied === label ? (
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture note */}
      <div className="glass-panel p-5 mt-4">
        <p className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79] mb-3">
          HOW IT WORKS
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: "01", title: "Forward", desc: "Your scraper sends traffic through the proxy using a session ID." },
            { step: "02", title: "Analyze", desc: "The proxy checks request timing and IP reputation, then scores the risk." },
            { step: "03", title: "Throttle", desc: "Risky requests are slowed down before being sent to the target site." },
            { step: "04", title: "Log", desc: "Every request is saved and shown live on this dashboard." },
          ].map((c) => (
            <div key={c.step} className="rounded-xl bg-[#17191d] border border-[#2a2d33] p-4">
              <p className="font-mono text-xs text-[#E8E9EE] mb-2">({c.step})</p>
              <p className="text-sm font-semibold text-white mb-1">{c.title}</p>
              <p className="text-xs text-[#676a79] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
