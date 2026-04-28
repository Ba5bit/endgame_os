import type { CoachReview } from "@/lib/chess/review";

type ReviewSummaryProps = {
  review: CoachReview;
};

export function ReviewSummary({ review }: ReviewSummaryProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-card/72 p-4">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Coach Review
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          What Happened
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Result" value={review.result} />
        <Metric label="Accuracy" value={`${review.accuracy}%`} />
        <Metric label="Blunders" value={review.blunders} />
        <Metric label="Mistakes" value={review.mistakes} />
      </div>

      <div className="mt-3 rounded-md border border-border/70 bg-background/55 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Critical move
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {review.criticalMove
            ? `${review.criticalMove.moveNumber}${review.criticalMove.color === "b" ? "..." : "."} ${review.criticalMove.san}`
            : "No critical move found"}
        </p>
      </div>

      <div className="mt-3 rounded-md border border-border/70 bg-background/55 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Biggest weakness
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {review.biggestWeakness}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/55 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}
