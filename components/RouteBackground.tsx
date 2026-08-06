"use client";

import { usePathname } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import CursorGlow from "@/components/CursorGlow";

export default function RouteBackground({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showAuthBackground = pathname === "/login" || pathname === "/signup";

    return (
        <>
            {showAuthBackground ? <AnimatedBackground opacity={0.4} /> : null}
            {showAuthBackground ? <div aria-hidden className="ambient" /> : null}
            {showAuthBackground ? <CursorGlow /> : null}
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        </>
    );
}
