import { BrainCircuit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ENGINE_DIFFICULTIES,
  type EngineDifficulty,
} from "@/lib/chess/engine";
import { cn } from "@/lib/utils";

type EnginePanelProps = {
  difficulty: EngineDifficulty;
  isThinking: boolean;
  onDifficultyChange: (difficulty: EngineDifficulty) => void;
};

export function EnginePanel({
  difficulty,
  isThinking,
  onDifficultyChange,
}: EnginePanelProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-card/72 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            AI Difficulty
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <BrainCircuit className="size-5 text-primary" />
            Choose Opponent Strength
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with Casual, then increase when games feel too easy.
          </p>
        </div>
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-right",
            isThinking
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border/80 bg-background/65 text-muted-foreground",
          )}
        >
          <p className="font-mono text-[0.65rem] uppercase">State</p>
          <p className="text-sm font-medium">
            {isThinking ? "Thinking" : "Ready"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(ENGINE_DIFFICULTIES) as EngineDifficulty[]).map((key) => {
          const option = ENGINE_DIFFICULTIES[key];

          return (
            <Button
              key={key}
              variant={difficulty === key ? "default" : "secondary"}
              size="sm"
              onClick={() => onDifficultyChange(key)}
              disabled={isThinking}
              title={option.description}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {isThinking
          ? "AI is thinking..."
          : ENGINE_DIFFICULTIES[difficulty].description}
      </p>
    </section>
  );
}
