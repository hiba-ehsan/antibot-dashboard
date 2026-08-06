"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, Radio, X } from "lucide-react";
import { SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

interface TopNavProps {
  email?: string | null;
  socketStatus?: "connecting" | "connected" | "reconnecting";
}

export default function TopNav({ email, socketStatus }: TopNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#2a2d33] bg-[#0e0e10]/85 backdrop-blur-xl px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 pl-1">
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8E9EE] to-[#8A8F9E]">
              <Radio className="relative w-4 h-4 text-[#0a0a0b] drop-shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-medium text-[#ceced7] leading-none tracking-tight">
                Anti-Bot
              </p>
              <p className="text-[8px] text-[#676a79] font-mono tracking-[0.22em] mt-1">
                COMMAND CENTER
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {/* Section links — top-right */}
            <nav className="flex items-center gap-1 overflow-x-auto">
              {SECTIONS.map(({ num, label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors whitespace-nowrap",
                      active
                        ? "bg-[#17191d] text-white border border-[#2a2d33]"
                        : "text-[#676a79] hover:text-[#ceced7] border border-transparent",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="topnav-active"
                        className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px] rounded-full bg-[#E8E9EE] shadow-[0_0_8px_rgba(206,206,215,0.8)]"
                      />
                    )}
                    <span className="font-mono text-[9px] text-[#676a79] group-hover:text-[#E8E9EE]">
                      {num}
                    </span>
                    <span className="hidden md:inline">{label}</span>
                  </Link>
                );
              })}

              {/* Stream status */}
              <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg border border-[#2a2d33] bg-[#0a0a0b]">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    socketStatus === "connected"
                      ? "bg-[#03c567] shadow-[0_0_8px_rgba(3,197,103,0.8)]"
                      : socketStatus === "reconnecting"
                        ? "bg-[#ff7701] animate-pulse shadow-[0_0_8px_rgba(255,119,1,0.6)]"
                        : "bg-[#676a79]",
                  )}
                />
                <span className="font-mono text-[10px] text-[#676a79]">
                  {socketStatus === "connected"
                    ? "LIVE"
                    : socketStatus === "reconnecting"
                      ? "LINK"
                      : "OFF"}
                </span>
              </div>
            </nav>

            {/* Menu dropdown */}
            <div
              className="relative ml-1"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title={menuOpen ? "Close menu" : "Open menu"}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#2a2d33] bg-[#17191d] text-[#ceced7] hover:border-[#E8E9EE] hover:text-white transition-colors"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Dropdown panel — anchored below the dashes */}
              <Sidebar
                email={email}
                socketStatus={socketStatus}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
