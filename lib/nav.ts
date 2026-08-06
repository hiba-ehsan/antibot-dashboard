import {
  LayoutDashboard,
  Network,
  Activity,
  ShieldAlert,
  Settings,
} from "lucide-react";

export const SECTIONS = [
  { num: "01", label: "Overview", href: "/", icon: LayoutDashboard },
  { num: "02", label: "Scrapers", href: "/scrapers", icon: Network },
  { num: "03", label: "Telemetry", href: "/telemetry", icon: Activity },
  { num: "04", label: "Threat Intel", href: "/threat-intel", icon: ShieldAlert },
  { num: "05", label: "Settings", href: "/settings", icon: Settings },
];
