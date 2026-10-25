"use client";

import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { PetalLogo } from "@/components/PetalLogo";
type Mode = "login" | "signup" | "forgot";

interface AuthGateProps {
  children: React.ReactNode;
}

function Field({
  label,
  icon: Icon,
  ...inputProps
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-[#38280a]">{label}</span>
      <div className="relative">
        <Icon className="w-4 h-4 text-[#998884] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          {...inputProps}
          className="w-full min-h-[46px] pl-9 pr-3 rounded-xl bg-white border border-[#dfc278] text-sm text-[#2C2220] focus:outline-none focus:ring-2 focus:ring-[#c66974]"
        />
      </div>
    </label>
  );
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [recovering, setRecovering] = useState(false);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // Opened from a reset-password email link
    if (window.location.hash.includes("type=recovery")) {
      setRecovering(true);
    }

    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "PASSWORD_RECOVERY") setRecovering(true);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const resetForm = () => {
    setPassword("");
    setConfirm("");
    setError("");
    setNotice("");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetForm();
  };

  const leaveRecovery = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setRecovering(false);
    switchMode("login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    // 1. Set a new password (after clicking the email link)
    if (recovering) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords don't match.");
        return;
      }
      setBusy(true);
      const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
      setBusy(false);
      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes("session")
            ? "This reset link has expired. Please request a new one."
            : updateError.message
        );
        return;
      }
      window.history.replaceState(null, "", window.location.pathname);
      setRecovering(false);
      return;
    }

    // 2. Request the reset email
    if (mode === "forgot") {
      setBusy(true);
      const { error: resetError } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setBusy(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      // Same message whether or not the email has an account
      setNotice("If an account exists for that email, we've sent a link to reset your password.");
      return;
    }

    // 3. Log in or sign up
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    const { data, error: authError } =
      mode === "signup"
        ? await supabaseBrowser.auth.signUp({ email, password })
        : await supabaseBrowser.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    if (mode === "signup" && !data.session) {
      switchMode("login");
      setNotice("Check your email to confirm your account, then log in.");
    }
    // when a session exists, onAuthStateChange above shows the app
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#e6abb2] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#8b4650]" />
      </div>
    );
  }

  if (session && !recovering) {
    return <>{children}</>;
  }

  const heading = recovering
    ? "Choose a new password"
    : mode === "login"
    ? "Welcome back"
    : mode === "signup"
    ? "Create your account"
    : "Reset your password";

  const subtext = recovering
    ? "Pick a new password for your account."
    : mode === "login"
    ? "Log in to pick up where you left off."
    : mode === "signup"
    ? "Your email is only used to sign in. It is never shown to other members."
    : "Enter your email and we'll send you a link to reset it.";

  const submitLabel = recovering
    ? "Save new password"
    : mode === "login"
    ? "Log in"
    : mode === "signup"
    ? "Sign up"
    : "Send reset link";

  const showEmail = !recovering;
  const showPassword = recovering || mode !== "forgot";
  const showConfirm = recovering || mode === "signup";

  return (
    <div className="min-h-screen bg-[#e6abb2] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#f4db9a] rounded-3xl p-5 sm:p-7 shadow-lg border border-[#dfc278] text-center space-y-4">
        <div className="flex justify-center pt-1">
          <PetalLogo size="3xl" frameless />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#c66974] tracking-tight">{heading}</h1>
          <p className="text-xs sm:text-sm text-[#523d13] leading-relaxed max-w-sm mx-auto">
            {subtext}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {showEmail && (
            <Field
              label="Email"
              icon={Mail}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {showPassword && (
            <Field
              label={recovering ? "New password" : "Password"}
              icon={Lock}
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" && !recovering ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {showConfirm && (
            <Field
              label="Confirm password"
              icon={Lock}
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {mode === "login" && !recovering && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-[#78591d] hover:text-[#38280a] underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-[#9F1239] bg-white/80 border border-[#FAD4D2] rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-xs text-[#3D6647] bg-[#EBF3ED] border border-[#D5E6D8] rounded-xl px-3 py-2">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[50px] bg-[#c66974] hover:bg-[#b35762] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-2xl shadow-sm text-base transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
        </form>

        {recovering ? (
          <button
            type="button"
            onClick={leaveRecovery}
            className="text-xs text-[#78591d] hover:text-[#38280a] underline cursor-pointer"
          >
            Back to log in
          </button>
        ) : mode === "forgot" ? (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-xs text-[#78591d] hover:text-[#38280a] underline cursor-pointer"
          >
            Back to log in
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="text-xs text-[#78591d] hover:text-[#38280a] underline cursor-pointer"
          >
            {mode === "login"
              ? "New to Petal? Create an account"
              : "Already have an account? Log in"}
          </button>
        )}
      </div>
    </div>
  );
}