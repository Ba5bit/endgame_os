export type EngineDifficulty = "casual" | "focused" | "brutal";

export type EngineDifficultyConfig = {
  label: string;
  depth: number;
  description: string;
};

export const ENGINE_DIFFICULTIES: Record<
  EngineDifficulty,
  EngineDifficultyConfig
> = {
  casual: {
    label: "Casual",
    depth: 4,
    description: "Quick replies with shallow search.",
  },
  focused: {
    label: "Focused",
    depth: 8,
    description: "Balanced search for useful training games.",
  },
  brutal: {
    label: "Brutal",
    depth: 12,
    description: "Deeper calculation when you want resistance.",
  },
};

export type EngineEvaluation = {
  bestMove: string;
  scoreCp: number | null;
  mate: number | null;
};

type EngineWorkerRequest =
  | {
      type: "bestmove";
      requestId: number;
      fen: string;
      depth: number;
    }
  | {
      type: "evaluate";
      requestId: number;
      fen: string;
      depth: number;
    }
  | {
      type: "stop";
    };

type EngineWorkerResponse =
  | {
      type: "bestmove";
      requestId: number;
      bestMove: string;
    }
  | ({
      type: "evaluation";
      requestId: number;
    } & EngineEvaluation)
  | {
      type: "info";
      requestId: number;
      line: string;
    }
  | {
      type: "ready";
    }
  | {
      type: "error";
      message: string;
    };

export class StockfishEngine {
  private worker: Worker | null = null;
  private nextRequestId = 1;
  private pending = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
    }
  >();

  getBestMove(fen: string, difficulty: EngineDifficulty) {
    const requestId = this.nextRequestId++;
    const depth = ENGINE_DIFFICULTIES[difficulty].depth;

    this.ensureWorker();

    return new Promise<string>((resolve, reject) => {
      this.pending.set(requestId, {
        resolve: (value) => resolve(value as string),
        reject,
      });
      this.postMessage({ type: "bestmove", requestId, fen, depth });
    });
  }

  evaluatePosition(fen: string, depth = 8) {
    const requestId = this.nextRequestId++;

    this.ensureWorker();

    return new Promise<EngineEvaluation>((resolve, reject) => {
      this.pending.set(requestId, {
        resolve: (value) => resolve(value as EngineEvaluation),
        reject,
      });
      this.postMessage({ type: "evaluate", requestId, fen, depth });
    });
  }

  stop() {
    this.worker?.postMessage({ type: "stop" });

    for (const { reject } of this.pending.values()) {
      reject(new Error("Search stopped."));
    }

    this.pending.clear();
  }

  dispose() {
    this.stop();
    this.worker?.terminate();
    this.worker = null;
  }

  private ensureWorker() {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(
      new URL("../../workers/stockfish.worker.ts", import.meta.url),
      { type: "module" },
    );

    this.worker.addEventListener("message", (event: MessageEvent<EngineWorkerResponse>) => {
      const message = event.data;

      if (message.type === "bestmove") {
        const pending = this.pending.get(message.requestId);
        this.pending.delete(message.requestId);
        pending?.resolve(message.bestMove);
        return;
      }

      if (message.type === "evaluation") {
        const pending = this.pending.get(message.requestId);
        this.pending.delete(message.requestId);
        pending?.resolve({
          bestMove: message.bestMove,
          scoreCp: message.scoreCp,
          mate: message.mate,
        });
        return;
      }

      if (message.type === "error") {
        const error = new Error(message.message);

        for (const { reject } of this.pending.values()) {
          reject(error);
        }

        this.pending.clear();
      }
    });

    this.worker.addEventListener("error", (event) => {
      const error = new Error(event.message);

      for (const { reject } of this.pending.values()) {
        reject(error);
      }

      this.pending.clear();
    });
  }

  private postMessage(message: EngineWorkerRequest) {
    this.ensureWorker();
    this.worker?.postMessage(message);
  }
}
