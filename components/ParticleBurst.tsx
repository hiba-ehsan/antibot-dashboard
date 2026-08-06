"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ParticleBurstProps {
  trigger: number;
  origin?: { x: number; y: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: string;
  life: number;
  maxLife: number;
}

interface Ring {
  radius: number;
  maxRadius: number;
  opacity: number;
}

const COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#94a3b8", "#ffffff"];

function runBurst(canvas: HTMLCanvasElement, originX: number, originY: number) {
  const raw = canvas.getContext("2d");
  if (!raw) return;
  const ctx: CanvasRenderingContext2D = raw;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const particles: Particle[] = [];
  const rings: Ring[] = [];

  const COUNT = 90;
  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 2.5,
      hue: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 55 + Math.random() * 30,
    });
  }

  rings.push({ radius: 4, maxRadius: 160, opacity: 0.9 });

  let raf = 0;
  const start = performance.now();

  function frame(now: number) {
    const elapsed = (now - start) / 16.7;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.life += 1;
      const t = p.life / p.maxLife;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.vx += (Math.random() - 0.5) * 0.12;
      p.vy += (Math.random() - 0.5) * 0.12;
      const alpha = Math.max(0, 1 - t);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.hue;
      ctx.shadowColor = p.hue;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    for (const r of rings) {
      r.radius += 4.5;
      r.opacity *= 0.94;
      ctx.globalAlpha = Math.max(0, r.opacity);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(originX, originY, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (elapsed < 70) {
      raf = requestAnimationFrame(frame);
    } else {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

export default function ParticleBurst({ trigger, origin }: ParticleBurstProps) {
  const onFrame = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node && trigger > 0) {
        const ox = origin?.x ?? window.innerWidth / 2;
        const oy = origin?.y ?? window.innerHeight / 2;
        runBurst(node, ox, oy);
      }
    },
    [trigger, origin],
  );

  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="pointer-events-none fixed inset-0 z-50"
        >
          <canvas ref={onFrame} className="w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
