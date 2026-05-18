"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { AppHeader } from "@/components/product/AppHeader";
import { LEADERBOARD_CITY_OPTIONS } from "@/lib/kazakhstan/cities";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getLeaderboardByCity,
  type LeaderboardEntry,
} from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

export function CityLeaderboard() {
  const [selectedCity, setSelectedCity] = useState("All Kazakhstan");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const loadLeaderboard = useCallback(async (nextCity = "") => {
    setLoading(true);
    setMessage(null);

    try {
      const cityFilter = nextCity === "All Kazakhstan" ? "" : nextCity;
      const data = await getLeaderboardByCity(cityFilter);
      setEntries(data);

      if (data.length === 0) {
        setMessage(
          cityFilter
            ? "No players found for that city yet."
            : "No players found yet.",
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load leaderboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialLeaderboard() {
      if (active) {
        await loadLeaderboard("");
      }
    }

    if (configured) {
      void loadInitialLeaderboard();
    }

    return () => {
      active = false;
    };
  }, [configured, loadLeaderboard]);

  return (
    <div className="min-h-screen">
      <AppHeader active="leaderboard" />
      <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-lg border border-border/70 bg-card/72 p-5 shadow-glow">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Player Rankings
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">
              Kazakhstan Leaderboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Players appear here after they save completed games. Pick a city
              to see the local table, or choose All Kazakhstan.
            </p>
          </div>

          {!configured ? (
            <div className="rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary">
              Add Supabase env vars to enable leaderboard data.
            </div>
          ) : (
            <>
              <div className="relative mb-5">
                <button
                  className="flex h-11 w-full items-center justify-between rounded-md border border-border/80 bg-background/70 px-3 text-left text-sm font-medium text-foreground transition hover:border-primary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  type="button"
                  disabled={loading}
                  onClick={() => setCityMenuOpen((open) => !open)}
                >
                  <span>{loading ? "Loading..." : selectedCity}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>

                {cityMenuOpen ? (
                  <div className="absolute left-0 right-0 top-12 z-20 max-h-72 overflow-y-auto rounded-md border border-border/80 bg-card p-1 shadow-2xl">
                  {LEADERBOARD_CITY_OPTIONS.map((cityName) => {
                    const isAll = cityName === "All Kazakhstan";
                    const value = isAll ? "" : cityName;

                    return (
                      <button
                        className={cn(
                          "block w-full rounded px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                          selectedCity === cityName &&
                            "bg-primary/10 text-primary",
                        )}
                        key={cityName}
                        type="button"
                        onClick={() => {
                          setSelectedCity(cityName);
                          setCityMenuOpen(false);
                          void loadLeaderboard(value);
                        }}
                      >
                        {cityName}
                      </button>
                    );
                  })}
                  </div>
                ) : null}
                </div>

              {message ? (
                <p className="mb-4 rounded-md border border-border/70 bg-background/55 px-3 py-2 text-sm text-muted-foreground">
                  {message}
                </p>
              ) : null}

              <div className="overflow-hidden rounded-lg border border-border/70">
                <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 bg-background/70 px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground sm:grid-cols-[3rem_1fr_8rem_5rem_5rem_6rem]">
                  <span>#</span>
                  <span>Player</span>
                  <span className="hidden sm:block">City</span>
                  <span>Games</span>
                  <span>Wins</span>
                  <span className="hidden sm:block">Accuracy</span>
                </div>
                {entries.map((entry, index) => (
                  <div
                    className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 border-t border-border/60 px-3 py-3 text-sm sm:grid-cols-[3rem_1fr_8rem_5rem_5rem_6rem]"
                    key={entry.profile.id}
                  >
                    <span className="font-mono text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">
                      {entry.profile.username}
                    </span>
                    <span className="hidden truncate text-muted-foreground sm:block">
                      {entry.profile.city}
                    </span>
                    <span>{entry.totalGames}</span>
                    <span>{entry.wins}</span>
                    <span className="hidden sm:block">
                      {entry.averageAccuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}
