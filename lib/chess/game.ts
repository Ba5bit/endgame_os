import { Chess, type Move, type Square } from "chess.js";

import type { GameResult } from "@/lib/supabase/types";

export type BoardOrientation = "white" | "black";

export type GameStatus = {
  label: string;
  detail: string;
  tone: "neutral" | "check" | "ended";
};

export type PendingPromotion = {
  from: Square;
  to: Square;
};

export const PROMOTION_PIECES = ["q", "r", "b", "n"] as const;
export type PromotionPiece = (typeof PROMOTION_PIECES)[number];

export function createGame() {
  return new Chess();
}

export function getGameStatus(game: Chess): GameStatus {
  const turn = game.turn() === "w" ? "White" : "Black";

  if (game.isCheckmate()) {
    return {
      label: "Checkmate",
      detail: `${turn} is checkmated. ${turn === "White" ? "Black" : "White"} wins.`,
      tone: "ended",
    };
  }

  if (game.isStalemate()) {
    return {
      label: "Stalemate",
      detail: `${turn} has no legal moves. The game is drawn.`,
      tone: "ended",
    };
  }

  if (game.isDraw()) {
    return {
      label: "Draw",
      detail: "The position is drawn by the rules of chess.",
      tone: "ended",
    };
  }

  if (game.isCheck()) {
    return {
      label: `${turn} to move`,
      detail: `${turn} is in check.`,
      tone: "check",
    };
  }

  return {
    label: `${turn} to move`,
    detail: "Legal moves, captures, castling, en passant, and promotion are enabled.",
    tone: "neutral",
  };
}

export function getLegalMovesFrom(game: Chess, square: Square): Move[] {
  return game.moves({ square, verbose: true });
}

export function isPromotionMove(game: Chess, from: Square, to: Square) {
  return getLegalMovesFrom(game, from).some(
    (move) => move.to === to && move.promotion,
  );
}

export function tryMove(
  game: Chess,
  from: Square,
  to: Square,
  promotion?: PromotionPiece,
) {
  try {
    return game.move({ from, to, promotion });
  } catch {
    return null;
  }
}

export function getMoveHistory(game: Chess) {
  return game.history({ verbose: true });
}

export function getCompletedGameResultForWhite(
  game: Chess,
): GameResult | null {
  if (!game.isGameOver()) {
    return null;
  }

  if (game.isCheckmate()) {
    return game.turn() === "b" ? "win" : "loss";
  }

  return "draw";
}

export function estimateAccuracyFromResult(result: GameResult) {
  if (result === "win") {
    return 85;
  }

  if (result === "draw") {
    return 70;
  }

  return 45;
}
