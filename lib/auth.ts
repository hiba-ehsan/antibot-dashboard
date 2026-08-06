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
