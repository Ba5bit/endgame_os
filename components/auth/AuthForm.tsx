"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KAZAKHSTAN_CITIES } from "@/lib/kazakhstan/cities";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  signInWithPassword,
  signUpWithProfile,
} from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === "signup") {
        const data = await signUpWithProfile({
          email,
          password,
          username,
          city,
        });
        setMessage(
          data.session
            ? "Account created. You can now save completed games."
            : "Account created. Check your email, then sign in.",
        );
        if (data.session) {
          router.push("/play");
        }
      } else {
        await signInWithPassword({ email, password });
        setMessage("Signed in. You can now save completed games.");
        router.push("/play");
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-lg border border-border/70 bg-card/72 p-5 shadow-glow"
    >
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Player Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {mode === "signup" ? "Create your profile" : "Sign in to save games"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accounts are only needed for saving games, reviews, and leaderboard
          stats. You can still play without signing in.
        </p>
      </div>

      {!configured ? (
        <div className="mb-4 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary">
          Supabase is not connected yet, so accounts are disabled.
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-background/55 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={cn(
            "rounded px-3 py-2 text-sm font-medium text-muted-foreground",
            mode === "signin" && "bg-secondary text-foreground",
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "rounded px-3 py-2 text-sm font-medium text-muted-foreground",
            mode === "signup" && "bg-secondary text-foreground",
          )}
        >
          Sign up
        </button>
      </div>

      <div className="space-y-3">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        {mode === "signup" ? (
          <>
            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              required
            />
            <CityField value={city} onChange={setCity} />
          </>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="mt-5 w-full"
        disabled={loading || !configured}
      >
        {mode === "signup" ? <UserPlus /> : <LogIn />}
        {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}

function CityField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">
        City
      </span>
      <select
        className="h-10 w-full rounded-md border border-border/80 bg-background/70 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        <option value="" disabled>
          Choose your city
        </option>
        {KAZAKHSTAN_CITIES.map((cityName) => (
          <option key={cityName} value={cityName}>
            {cityName}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <input
        className="h-10 w-full rounded-md border border-border/80 bg-background/70 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}
