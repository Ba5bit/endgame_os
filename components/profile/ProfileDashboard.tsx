"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { MoveReviewCard } from "@/components/coach/MoveReviewCard";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/product/AppHeader";
import { signOut } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getSavedGameLogs,
  getProfileStats,
  type SavedGameLog,
  type ProfileStats,
} from "@/lib/supabase/queries";
import type { MoveReview } from "@/lib/chess/review";

export function ProfileDashboard() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [gameLogs, setGameLogs] = useState<SavedGameLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const [profileStats, savedGames] = await Promise.all([
          getProfileStats(),
          getSavedGameLogs(),
        ]);

        if (active) {
          setStats(profileStats);
          setGameLogs(savedGames);
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
    setGameLogs([]);
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
            <>
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
              <TrainingLog games={gameLogs} />
            </>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}

function TrainingLog({ games }: { games: SavedGameLog[] }) {
  return (
    <section className="mt-6 rounded-lg border border-border/70 bg-background/35 p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Training Log
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Saved Games
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {games.length} recent {games.length === 1 ? "game" : "games"}
        </p>
      </div>

      {games.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No saved games yet. Finish a game on the trainer page, then click
          Save Your Result.
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <details
              className="group rounded-md border border-border/70 bg-card/60 p-3"
              key={game.id}
            >
              <summary className="cursor-pointer list-none">
                <div className="grid gap-3 sm:grid-cols-[1fr_6rem_6rem_7rem] sm:items-center">
                  <div>
                    <p className="font-semibold text-foreground">
                      vs {game.opponent_name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(game.created_at)}
                    </p>
                  </div>
                  <Badge result={game.result} />
                  <p className="text-sm text-muted-foreground">
                    {game.accuracy ?? 0}% accuracy
                  </p>
                  <p className="text-sm text-primary group-open:hidden">
                    View details
                  </p>
                  <p className="hidden text-sm text-primary group-open:block">
                    Hide details
                  </p>
                </div>
              </summary>

              <div className="mt-4 grid gap-3">
                {game.review?.notes ? (
                  <ReviewNotes notes={game.review.notes} />
                ) : (
                  <div className="rounded-md border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    This game was saved without coach analysis.
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function Badge({ result }: { result: SavedGameLog["result"] }) {
  const label = result === "win" ? "Win" : result === "loss" ? "Loss" : "Draw";

  return (
    <span className="w-fit rounded-md border border-border/70 bg-background/60 px-3 py-1 text-sm font-semibold capitalize text-foreground">
      {label}
    </span>
  );
}

function ReviewNotes({ notes }: { notes: string }) {
  try {
    const parsed = JSON.parse(notes) as {
      blunders?: number;
      mistakes?: number;
      biggestWeakness?: string;
      criticalMove?: string | null;
      moves?: Array<{
        ply: number;
        san: string;
        classification: MoveReview["classification"];
        centipawnLoss: number;
        bestMove: string | null;
        comment: string;
      }>;
    };
    const moves = (parsed.moves ?? []).map((move) => ({
      ply: move.ply,
      moveNumber: Math.ceil(move.ply / 2),
      color: move.ply % 2 === 1 ? "w" : "b",
      san: move.san,
      uci: "",
      beforeFen: "",
      afterFen: "",
      beforeEval: 0,
      afterEval: 0,
      centipawnLoss: move.centipawnLoss,
      classification: move.classification,
      bestMove: move.bestMove,
      comment: move.comment,
    })) satisfies MoveReview[];

    return (
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <MiniStat label="Blunders" value={parsed.blunders ?? 0} />
          <MiniStat label="Mistakes" value={parsed.mistakes ?? 0} />
          <MiniStat label="Critical move" value={parsed.criticalMove ?? "None"} />
          <MiniStat
            label="Weakness"
            value={parsed.biggestWeakness ?? "Not reviewed"}
          />
        </div>

        {moves.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Saved Coach Analysis
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {moves.map((move) => (
                <MoveReviewCard key={move.ply} move={move} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  } catch {
    return <LogText label="Review notes" value={notes} />;
  }
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/55 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function LogText({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/55 p-3">
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
        {value}
      </pre>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
