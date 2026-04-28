import type { Move } from "chess.js";

import { cn } from "@/lib/utils";

type MoveHistoryProps = {
  moves: Move[];
};

export function MoveHistory({ moves }: MoveHistoryProps) {
  const rows = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      number: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-border/70 bg-card/72">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Move History</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {moves.length} plies
        </span>
      </div>

      <div className="min-h-[12rem] flex-1 overflow-y-auto p-2">
        {rows.length === 0 ? (
          <div className="flex h-full min-h-[10rem] items-center justify-center rounded-md border border-dashed border-border/70 px-4 text-center text-sm text-muted-foreground">
            Make the first move.
          </div>
        ) : (
          <ol className="space-y-1">
            {rows.map((row) => (
              <li
                className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/55"
                key={row.number}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {row.number}.
                </span>
                <MoveText move={row.white} />
                <MoveText move={row.black} muted={!row.black} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function MoveText({ move, muted }: { move?: Move; muted?: boolean }) {
  return (
    <span
      className={cn(
        "truncate rounded bg-background/55 px-2 py-1 font-mono text-xs text-foreground",
        muted && "text-muted-foreground",
      )}
      title={move?.san}
    >
      {move?.san ?? "..."}
    </span>
  );
}
