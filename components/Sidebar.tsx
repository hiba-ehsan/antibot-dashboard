"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  email?: string | null;
  socketStatus?: "connecting" | "connected" | "reconnecting";
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ email, socketStatus, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-panel"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute right-0 top-full z-50 mt-2 w-[280px] origin-top-right overflow-hidden rounded-2xl border border-[#2a2d33] bg-[#0e0e10] shadow-2xl"
        >
          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[9px] font-mono tracking-[0.28em] text-[#676a79]">
              PAGES
            </p>
            {SECTIONS.map(({ num, label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} onClick={onClose} className="block group relative">
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-300 border",
                      active
                        ? "bg-[#17191d] border-[#2a2d33]"
                        : "hover:bg-[#17191d]/60 border-transparent",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#E8E9EE] shadow-[0_0_10px_rgba(206,206,215,0.8)]"
                      />
                    )}
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-widest",
                        active ? "text-[#E8E9EE]" : "text-[#676a79]",
                      )}
                    >
                      ({num})
                    </span>
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        active
                          ? "text-[#E8E9EE] drop-shadow-[0_0_5px_rgba(206,206,215,0.4)]"
                          : "text-[#676a79] group-hover:text-[#ceced7]",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[13px] font-medium transition-colors",
                        active ? "text-white" : "text-[#676a79] group-hover:text-[#ceced7]",
                      )}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer: status + user */}
          <div className="px-4 py-4 border-t border-[#2a2d33] bg-[#0a0a0b] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-mono tracking-[0.24em] text-[#676a79]">
                STATUS
              </span>
              <div className="flex items-center gap-1.5">
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
                <span className="font-mono text-[10px] text-[#ceced7] font-medium">
                  {socketStatus === "connected"
                    ? "LIVE"
                    : socketStatus === "reconnecting"
                      ? "LINK"
                      : "OFF"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-[#ceced7] truncate font-medium">
                  {email ?? "operator"}
                </p>
                <p className="text-[9px] text-[#676a79] font-mono tracking-[0.2em] mt-0.5">
                  ACCOUNT
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl border border-[#2a2d33] text-[#676a79] hover:bg-[#17191d] hover:text-white hover:border-[#E8E9EE] transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
