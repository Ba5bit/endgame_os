import type { MoveReview } from "@/lib/chess/review";
import { cn } from "@/lib/utils";

type MoveReviewCardProps = {
  move: MoveReview;
};

const labelStyles: Record<MoveReview["classification"], string> = {
  Best: "border-primary/60 bg-primary/10 text-primary",
  Good:
    "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  Inaccuracy:
    "border-yellow-500/60 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  Mistake:
    "border-orange-500/60 bg-orange-500/10 text-orange-950 dark:text-orange-100",
  Blunder:
    "border-destructive/70 bg-destructive/10 text-red-950 dark:text-destructive-foreground",
};

export function MoveReviewCard({ move }: MoveReviewCardProps) {
  return (
    <article className="rounded-lg border border-border/70 bg-card/72 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {move.moveNumber}
            {move.color === "b" ? "..." : "."}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {move.san}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-semibold",
            labelStyles[move.classification],
          )}
        >
          {move.classification}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{move.comment}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Detail label="Points lost" value={`${move.centipawnLoss} cp`} />
        <Detail label="Try instead" value={move.bestMove ?? "Not critical"} />
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/55 p-2">
      <p className="uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-foreground">{value}</p>
    </div>
  );
}
