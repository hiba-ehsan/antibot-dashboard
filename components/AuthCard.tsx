"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signup, login } from "@/lib/auth";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import ParticleBurst from "@/components/ParticleBurst";

interface AuthCardProps {
  mode: "login" | "signup";
}

export default function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(
    null,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isLogin && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = isLogin ? await login(email, password) : await signup(email, password);

      if (!res.ok) {
        setError(res.message ?? "Something went wrong.");
        return;
      }

      if (res.requiresEmailConfirmation) {
        setInfo(
          "Account created! Please check your email to confirm before signing in.",
        );
        return;
      }

      const rect = cardRef.current?.getBoundingClientRect();
      setBurst({
        id: Date.now(),
        x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
        y: (rect?.top ?? 0) + (rect?.height ?? 0) / 2,
      });
      setTimeout(() => {
        router.push("/");
      }, 700);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md" ref={cardRef}>
      {burst && (
        <ParticleBurst trigger={burst.id} origin={{ x: burst.x, y: burst.y }} />
      )}
      <TiltCard maxTilt={4}>
        <div className="glass-panel p-8">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-[#E8E9EE] to-[#8A8F9E] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#0a0a0b]" />
            </div>
            <h1 className="text-3xl font-normal tracking-tight headline">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-[#676a79]">
              {isLogin
                ? "Sign in to access the Anti-Bot Command Center"
                : "Register to start monitoring bot risk"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#ceced7] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-[14px] bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#ceced7] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-[14px] bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#ceced7] mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-[14px] bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors"
                />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, x: -12 }}
                  animate={{ opacity: 1, height: "auto", x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-start gap-2 px-3 py-2.5 rounded-[14px] bg-[#ff2f43]/10 border border-[#ff2f43]/30 text-[#ff8795] text-sm overflow-hidden"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {info && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, height: 0, x: 12 }}
                  animate={{ opacity: 1, height: "auto", x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-start gap-2 px-3 py-2.5 rounded-[14px] bg-[#ceced7]/10 border border-[#ceced7]/30 text-[#E8E9EE] text-sm overflow-hidden"
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{info}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <MagneticButton
              type="submit"
              disabled={loading}
              strength={0.25}
              className="btn-primary w-full py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </MagneticButton>
          </form>

          <p className="mt-6 text-center text-sm text-[#676a79]">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#ceced7] hover:text-white font-medium"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#ceced7] hover:text-white font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </TiltCard>
    </div>
  );
}
