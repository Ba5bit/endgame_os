"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUser, saveCompletedGame } from "@/lib/supabase/queries";
import type { GameResult } from "@/lib/supabase/types";

type GameSavePanelProps = {
  isComplete: boolean;
  result: GameResult | null;
  pgn: string;
  finalFen: string;
  accuracy: number | null;
  opponentName: string;
};

export function GameSavePanel({
  isComplete,
  result,
  pgn,
  finalFen,
  accuracy,
  opponentName,
}: GameSavePanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const user = await getCurrentUser();

      if (active) {
        setIsLoggedIn(Boolean(user));
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSaved(false);
    setMessage(null);
  }, [pgn]);

  async function handleSave() {
    if (!result) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await saveCompletedGame({
        opponent_type: "ai",
        opponent_name: opponentName,
        result,
        pgn,
        final_fen: finalFen,
        accuracy,
      });
      setSaved(true);
      setMessage("Game saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save game.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-border/70 bg-card/72 p-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Training Log
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Save Your Result
        </h2>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {isComplete
          ? "Save this finished game so it counts toward your profile and leaderboard."
          : "Finish the game first. Then you can save the result."}
      </p>

      <Button
        className="w-full"
        variant={saved ? "secondary" : "default"}
        onClick={handleSave}
        disabled={!configured || !isLoggedIn || !isComplete || !result || saving || saved}
      >
        <Save />
        {saved ? "Saved" : saving ? "Saving..." : "Save completed game"}
      </Button>

      {!configured ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Database connection is not configured yet.
        </p>
      ) : !isLoggedIn ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Sign in to save games and appear on the leaderboard.
        </p>
      ) : null}

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
