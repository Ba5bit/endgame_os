import { Chess, type Move } from "chess.js";

import {
  classifyMoveByEvalSwing,
  type MoveClassification,
} from "@/lib/chess/classifyMove";
import type { StockfishEngine } from "@/lib/chess/engine";
import type { GameResult } from "@/lib/supabase/types";

export type MoveReview = {
  ply: number;
  moveNumber: number;
  color: "w" | "b";
  san: string;
  uci: string;
  beforeFen: string;
  afterFen: string;
  beforeEval: number;
  afterEval: number;
  centipawnLoss: number;
  classification: MoveClassification;
  bestMove: string | null;
  comment: string;
};

export type CoachReview = {
  result: GameResult;
  accuracy: number;
  blunders: number;
  mistakes: number;
  criticalMove: MoveReview | null;
  biggestWeakness: string;
  moves: MoveReview[];
};

const REVIEW_DEPTH = 7;
const MATE_SCORE = 10000;

export async function reviewGameFromPgn({
  pgn,
  result,
  engine,
  onProgress,
}: {
  pgn: string;
  result: GameResult;
  engine: StockfishEngine;
  onProgress?: (completed: number, total: number) => void;
}): Promise<CoachReview> {
  const source = new Chess();
  source.loadPgn(pgn);
  const playedMoves = source.history({ verbose: true });
  const replay = new Chess();
  const reviews: MoveReview[] = [];

  for (const [index, playedMove] of playedMoves.entries()) {
    const beforeFen = replay.fen();
    const mover = replay.turn();
    const before = await engine.evaluatePosition(beforeFen, REVIEW_DEPTH);
    const move = replay.move({
      from: playedMove.from,
      to: playedMove.to,
      promotion: playedMove.promotion,
    });

    if (!move) {
      throw new Error(`Unable to replay move ${playedMove.san}.`);
    }

    const afterFen = replay.fen();
    const after = replay.isGameOver()
      ? terminalEvaluation(replay)
      : await engine.evaluatePosition(afterFen, REVIEW_DEPTH);
    const beforeEval = normalizeEvalForWhite(beforeFen, before.scoreCp, before.mate);
    const afterEval = normalizeEvalForWhite(afterFen, after.scoreCp, after.mate);
    const classification = classifyMoveByEvalSwing(
      beforeEval,
      afterEval,
      mover,
    );
    const bestMove = isCritical(classification.label) ? before.bestMove : null;

    reviews.push({
      ply: index + 1,
      moveNumber: Math.floor(index / 2) + 1,
      color: mover,
      san: playedMove.san,
      uci: toUci(move),
      beforeFen,
      afterFen,
      beforeEval,
      afterEval,
      centipawnLoss: classification.centipawnLoss,
      classification: classification.label,
      bestMove,
      comment: coachComment(classification.label, playedMove, before.bestMove),
    });

    onProgress?.(index + 1, playedMoves.length);
  }

  return summarizeReview(result, reviews);
}

function terminalEvaluation(game: Chess) {
  if (game.isCheckmate()) {
    return {
      bestMove: "",
      scoreCp: null,
      mate: -1,
    };
  }

  return {
    bestMove: "",
    scoreCp: 0,
    mate: null,
  };
}

function normalizeEvalForWhite(
  fen: string,
  scoreCp: number | null,
  mate: number | null,
) {
  const activeColor = fen.split(" ")[1] === "b" ? "b" : "w";
  const sideToMoveMultiplier = activeColor === "w" ? 1 : -1;

  if (typeof mate === "number") {
    const mateScore = Math.sign(mate || 1) * (MATE_SCORE - Math.abs(mate));
    return mateScore * sideToMoveMultiplier;
  }

  return (scoreCp ?? 0) * sideToMoveMultiplier;
}

function summarizeReview(result: GameResult, moves: MoveReview[]): CoachReview {
  const blunders = moves.filter((move) => move.classification === "Blunder").length;
  const mistakes = moves.filter((move) => move.classification === "Mistake").length;
  const averageLoss =
    moves.length > 0
      ? moves.reduce((total, move) => total + move.centipawnLoss, 0) /
        moves.length
      : 0;
  const accuracy = Math.max(0, Math.min(100, Math.round(100 - averageLoss / 5)));
  const criticalMove =
    moves.reduce<MoveReview | null>(
      (worst, move) =>
        !worst || move.centipawnLoss > worst.centipawnLoss ? move : worst,
      null,
    ) ?? null;

  return {
    result,
    accuracy,
    blunders,
    mistakes,
    criticalMove,
    biggestWeakness: inferWeakness(moves),
    moves,
  };
}

function inferWeakness(moves: MoveReview[]) {
  const criticalMoves = moves.filter((move) => isCritical(move.classification));

  if (criticalMoves.length === 0) {
    return "Converting without major tactical drops";
  }

  const queenMoves = criticalMoves.filter((move) => move.san.includes("Q")).length;
  const kingMoves = criticalMoves.filter((move) => move.san.includes("K")).length;
  const captures = criticalMoves.filter((move) => move.san.includes("x")).length;
  const checks = criticalMoves.filter((move) => move.san.includes("+")).length;

  if (checks >= Math.max(2, captures)) {
    return "Handling forcing checks";
  }

  if (captures >= Math.max(2, queenMoves)) {
    return "Evaluating captures and trades";
  }

  if (queenMoves > kingMoves) {
    return "Queen activity and tactical safety";
  }

  if (kingMoves > 0) {
    return "King safety during transitions";
  }

  return "Spotting opponent threats before committing";
}

function coachComment(
  classification: MoveClassification,
  move: Move,
  bestMove: string,
) {
  if (classification === "Best") {
    return "Clean choice. You kept the position under control.";
  }

  if (classification === "Good") {
    return "A playable move with only a small concession.";
  }

  const bestMoveText = bestMove ? ` Stockfish preferred ${bestMove}.` : "";

  if (classification === "Inaccuracy") {
    return `This slightly loosened the position.${bestMoveText}`;
  }

  if (classification === "Mistake") {
    return move.captured
      ? `This capture missed a stronger resource.${bestMoveText}`
      : `This let the evaluation swing noticeably. Look for forcing replies before moving.${bestMoveText}`;
  }

  return move.san.includes("+")
    ? `The check looked active, but it gave away too much control.${bestMoveText}`
    : `This was the key tactical drop. Pause here and compare candidate moves.${bestMoveText}`;
}

function isCritical(classification: MoveClassification) {
  return (
    classification === "Inaccuracy" ||
    classification === "Mistake" ||
    classification === "Blunder"
  );
}

function toUci(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}
