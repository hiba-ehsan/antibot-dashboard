"use client";

import { createSupabaseClient } from "./supabase";

export type AuthResult = {
  ok: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
};

function friendlyMessage(raw: string | null): string {
  const msg = raw?.toLowerCase() ?? "";
  if (msg.includes("invalid login credentials")) {
    return "Invalid credentials. Check your email and password.";
  }
  if (msg.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox.";
  }
  if (msg.includes("password should be at least 6")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("invalid email")) {
    return "That email address doesn't look valid.";
  }
  if (msg.includes("email address") && msg.includes("invalid")) {
    return "That email address is not allowed on this project.";
  }
  return raw ?? "Something went wrong. Please try again.";
}

export async function signup(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: friendlyMessage(error.message) };
  }

  if (!data.session) {
    return {
      ok: true,
      requiresEmailConfirmation: true,
    };
  }

  return { ok: true };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: friendlyMessage(error.message) };
  }

  return { ok: true };
}

export async function logout() {
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = createSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// getSession() can resolve to null before the supabase client finishes
// restoring the session from storage on a fresh page load. This waits for the
// client to finish so authenticated API calls always send a bearer token.
export async function getAccessToken(timeoutMs = 4000): Promise<string | null> {
  const supabase = createSupabaseClient();

  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }

  return new Promise<string | null>((resolve) => {
    let done = false;
    let sub: { unsubscribe: () => void } | undefined;

    const finish = (token: string | null) => {
      if (done) return;
      done = true;
      sub?.unsubscribe();
      resolve(token);
    };

    sub = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        finish(session?.access_token ?? null);
      }
    }).data.subscription;

    setTimeout(() => finish(null), timeoutMs);
  });
}
