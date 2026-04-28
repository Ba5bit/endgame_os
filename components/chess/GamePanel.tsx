import { FlipHorizontal2, RotateCcw, StepBack } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BoardOrientation, GameStatus } from "@/lib/chess/game";
import { cn } from "@/lib/utils";

type GamePanelProps = {
  status: GameStatus;
  orientation: BoardOrientation;
  canUndo: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
};

export function GamePanel({
  status,
  orientation,
  canUndo,
  onNewGame,
  onUndo,
  onFlip,
}: GamePanelProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-card/72 p-4 shadow-glow">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Chess Trainer
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
            Play vs AI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You play White. Drag a piece, then Stockfish replies as Black.
          </p>
        </div>
        <div className="rounded-md border border-border/80 bg-background/65 px-3 py-2 text-right">
          <p className="font-mono text-[0.65rem] uppercase text-muted-foreground">
            View
          </p>
          <p className="text-sm font-medium capitalize text-foreground">
            {orientation}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mb-5 rounded-md border px-4 py-3",
          status.tone === "ended" &&
            "border-primary/55 bg-primary/10 text-primary",
          status.tone === "check" &&
            "border-destructive/55 bg-destructive/10 text-destructive-foreground",
          status.tone === "neutral" && "border-border/80 bg-background/55",
        )}
      >
        <p className="text-base font-semibold">{status.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{status.detail}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <Button onClick={onNewGame}>
          <RotateCcw />
          Restart
        </Button>
        <Button variant="secondary" onClick={onUndo} disabled={!canUndo}>
          <StepBack />
          Take Back
        </Button>
        <Button variant="secondary" onClick={onFlip}>
          <FlipHorizontal2 />
          Flip View
        </Button>
      </div>
    </section>
  );
}
