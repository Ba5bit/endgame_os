/// <reference lib="webworker" />

type WorkerRequest =
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

type WorkerResponse =
  | {
      type: "bestmove";
      requestId: number;
      bestMove: string;
    }
  | {
      type: "evaluation";
      requestId: number;
      bestMove: string;
      scoreCp: number | null;
      mate: number | null;
    }
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

const ctx = self as DedicatedWorkerGlobalScope;
let engine: Worker | null = null;
let activeRequestId: number | null = null;
let activeMode: "bestmove" | "evaluate" | null = null;
let latestScoreCp: number | null = null;
let latestMate: number | null = null;
const queuedCommands: string[] = [];

function send(message: WorkerResponse) {
  ctx.postMessage(message);
}

function getEngine() {
  if (engine) {
    return engine;
  }

  engine = new Worker(
    "/stockfish/stockfish-nnue-16-single.js#/stockfish/stockfish-nnue-16-single.wasm",
  );

  engine.addEventListener("message", (event: MessageEvent<string>) => {
    const line = String(event.data);

    if (activeRequestId !== null && line.startsWith("info ")) {
      const score = parseScore(line);

      if (score) {
        latestScoreCp = score.scoreCp;
        latestMate = score.mate;
      }

      send({ type: "info", requestId: activeRequestId, line });
      return;
    }

    if (line === "uciok" || line === "readyok") {
      send({ type: "ready" });
      return;
    }

    if (line.startsWith("bestmove ")) {
      const bestMove = line.split(/\s+/)[1];
      const requestId = activeRequestId;
      const mode = activeMode;
      activeRequestId = null;
      activeMode = null;

      if (requestId !== null && bestMove && bestMove !== "(none)") {
        if (mode === "evaluate") {
          send({
            type: "evaluation",
            requestId,
            bestMove,
            scoreCp: latestScoreCp,
            mate: latestMate,
          });
        } else {
          send({ type: "bestmove", requestId, bestMove });
        }
      } else if (requestId !== null && mode === "evaluate") {
        send({
          type: "evaluation",
          requestId,
          bestMove: "",
          scoreCp: latestScoreCp,
          mate: latestMate,
        });
      } else if (requestId !== null) {
        send({ type: "error", message: "Stockfish did not return a move." });
      }
    }
  });

  engine.addEventListener("error", (event) => {
    send({ type: "error", message: event.message });
  });

  flushQueuedCommands();
  postEngineCommand("uci");
  postEngineCommand("isready");

  return engine;
}

function parseScore(line: string) {
  const cpMatch = line.match(/\bscore cp (-?\d+)/);

  if (cpMatch) {
    return {
      scoreCp: Number(cpMatch[1]),
      mate: null,
    };
  }

  const mateMatch = line.match(/\bscore mate (-?\d+)/);

  if (mateMatch) {
    return {
      scoreCp: null,
      mate: Number(mateMatch[1]),
    };
  }

  return null;
}

function postEngineCommand(command: string) {
  const target = engine;

  if (!target) {
    queuedCommands.push(command);
    return;
  }

  target.postMessage(command);
}

function flushQueuedCommands() {
  const target = engine;

  if (!target) {
    return;
  }

  while (queuedCommands.length > 0) {
    target.postMessage(queuedCommands.shift());
  }
}

function search({
  requestId,
  fen,
  depth,
  type,
}: Extract<WorkerRequest, { type: "bestmove" | "evaluate" }>) {
  getEngine();

  if (activeRequestId !== null) {
    postEngineCommand("stop");
  }

  activeRequestId = requestId;
  activeMode = type;
  latestScoreCp = null;
  latestMate = null;
  postEngineCommand("ucinewgame");
  postEngineCommand(`position fen ${fen}`);
  postEngineCommand(`go depth ${depth}`);
}

ctx.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  if (message.type === "bestmove" || message.type === "evaluate") {
    search(message);
    return;
  }

  if (message.type === "stop") {
    activeRequestId = null;
    activeMode = null;
    postEngineCommand("stop");
  }
});

getEngine();

export {};
