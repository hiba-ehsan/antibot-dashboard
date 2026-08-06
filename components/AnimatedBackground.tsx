"use client";

import { AnimatedGradient } from "@/components/ui/animated-gradient";

interface AnimatedBackgroundProps {
  opacity?: number;
  className?: string;
}

export default function AnimatedBackground({
  opacity = 0.5,
  className,
}: AnimatedBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 ${className ?? ""}`}
      style={{ opacity }}
    >
      <AnimatedGradient
        config={{
          preset: "custom",
          color1: "#050d05",
          color2: "#0a2419",
          color3: "#03c567",
          rotation: -45,
          proportion: 55,
          scale: 0.6,
          speed: 18,
          distortion: 40,
          swirl: 80,
          swirlIterations: 10,
          softness: 100,
          offset: 200,
          shape: "Edge",
          shapeSize: 50,
        }}
        noise={{ opacity: 0.06 }}
      />
    </div>
  );
}
