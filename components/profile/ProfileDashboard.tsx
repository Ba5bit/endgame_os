"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/product/AppHeader";
import { signOut } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getProfileStats,
  type ProfileStats,
} from "@/lib/supabase/queries";

export function ProfileDashboard() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const profileStats = await getProfileStats();

        if (active) {
          setStats(profileStats);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load profile.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    setStats(null);
  }

  return (
    <div className="min-h-screen">
      <AppHeader active="profile" />
      <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-lg border border-border/70 bg-card/72 p-5 shadow-glow">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Profile
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-foreground">
                {stats?.profile.username ?? "Endgame OS"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats?.profile.city ?? "Sign in to view your training record."}
              </p>
            </div>
            {stats ? (
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut />
                Sign out
              </Button>
            ) : null}
          </div>

          {!configured ? (
            <EmptyState message="Supabase env vars are missing." />
          ) : loading ? (
            <EmptyState message="Loading profile..." />
          ) : error ? (
            <EmptyState message={error} />
          ) : !stats ? (
            <EmptyState message="Sign in or create an account to see your profile." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Total games" value={stats.totalGames} />
              <Stat label="Wins" value={stats.wins} />
              <Stat label="Losses" value={stats.losses} />
              <Stat label="Draws" value={stats.draws} />
              <Stat label="Avg accuracy" value={`${stats.averageAccuracy}%`} />
              <Stat
                label="Discipline score"
                value={stats.disciplineScore}
                className="sm:col-span-2 lg:col-span-5"
              />
            </div>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`rounded-md border border-border/70 bg-background/55 p-4 ${className ?? ""}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}{" "}
      <Link className="text-primary hover:text-primary/80" href="/auth">
        Open auth
      </Link>
    </div>
  );
}
