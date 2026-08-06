"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { getSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.replace("/");
      }
    });
  }, [router]);

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <AnimatedGradient
          config={{
            preset: "custom",
            color1: "#050d05",
            color2: "#0a2419",
            color3: "#03c567",
            rotation: -45,
            proportion: 60,
            scale: 0.55,
            speed: 18,
            distortion: 45,
            swirl: 90,
            swirlIterations: 12,
            softness: 100,
            offset: 200,
            shape: "Edge",
            shapeSize: 50,
          }}
          noise={{ opacity: 0.06 }}
        />
      </div>
      <div className="relative z-10">
        <AuthCard mode="login" />
      </div>
    </main>
  );
}
