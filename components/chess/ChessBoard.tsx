"use client";

import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";

import { Button } from "@/components/ui/button";
import { MoveReviewCard } from "@/components/coach/MoveReviewCard";
import { ReviewSummary } from "@/components/coach/ReviewSummary";
import { EnginePanel } from "@/components/chess/EnginePanel";
import { GamePanel } from "@/components/chess/GamePanel";
import { GameSavePanel } from "@/components/chess/GameSavePanel";
import { MoveHistory } from "@/components/chess/MoveHistory";
import {
  StockfishEngine,
  type EngineDifficulty,
} from "@/lib/chess/engine";
import {
  createGame,
  estimateAccuracyFromResult,
  getCompletedGameResultForWhite,
  getGameStatus,
  getMoveHistory,
  isPromotionMove,
  PROMOTION_PIECES,
  type BoardOrientation,
  type PendingPromotion,
  type PromotionPiece,
  tryMove,
} from "@/lib/chess/game";
import {
  reviewGameFromPgn,
  type CoachReview,
} from "@/lib/chess/review";
import { saveReviewWithGame } from "@/lib/supabase/queries";

const pieceLabels: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

export function ChessBoard() {
  const gameRef = useRef(createGame());
  const engineRef = useRef<StockfishEngine | null>(null);
  const engineRequestRef = useRef(0);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [difficulty, setDifficulty] = useState<EngineDifficulty>("focused");
  const [aiThinking, setAiThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [review, setReview] = useState<CoachReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState({ completed: 0, total: 0 });
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);

  const game = gameRef.current;
  const moves = getMoveHistory(game);
  const gameResult = getCompletedGameResultForWhite(game);
  const accuracy = gameResult ? estimateAccuracyFromResult(gameResult) : null;
  const status = aiThinking
    ? {
        label: "Black to move",
        detail: "AI is thinking...",
        tone: "neutral" as const,
      }
    : getGameStatus(game);
  const canUserMove =
    !aiThinking &&
    !pendingPromotion &&
    !game.isGameOver() &&
    game.turn() === "w";

  useEffect(() => {
    engineRef.current = new StockfishEngine();

    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  function syncBoard() {
    setFen(gameRef.current.fen());
  }

  async function analyzeGame() {
    if (!gameResult || !engineRef.current) {
      return;
    }

    setReviewing(true);
    setReview(null);
    setReviewMessage(null);
    setReviewProgress({ completed: 0, total: moves.length });

    try {
      const pgn = gameRef.current.pgn();
      const finalFen = gameRef.current.fen();
      const coachReview = await reviewGameFromPgn({
        pgn,
        result: gameResult,
        engine: engineRef.current,
        onProgress: (completed, total) =>
          setReviewProgress({ completed, total }),
      });

      setReview(coachReview);

      try {
        await saveReviewWithGame({
          game: {
            opponent_type: "ai",
            opponent_name: "Stockfish",
            result: gameResult,
            pgn,
            final_fen: finalFen,
            accuracy: coachReview.accuracy,
          },
          review: coachReview,
        });
        setReviewMessage("Review saved to Supabase.");
      } catch (saveError) {
        setReviewMessage(
          saveError instanceof Error
            ? saveError.message
            : "Review generated locally, but was not saved.",
        );
      }
    } catch (error) {
      setReviewMessage(
        error instanceof Error ? error.message : "Unable to analyze game.",
      );
    } finally {
      setReviewing(false);
    }
  }

  async function requestAiMove(positionFen: string) {
    const currentGame = gameRef.current;

    if (currentGame.isGameOver() || currentGame.turn() !== "b") {
      return;
    }

    const requestId = ++engineRequestRef.current;
    setAiThinking(true);
    setEngineError(null);

    try {
      const bestMove = await engineRef.current?.getBestMove(
        positionFen,
        difficulty,
      );

      if (!bestMove || requestId !== engineRequestRef.current) {
        return;
      }

      const latestGame = gameRef.current;

      if (latestGame.isGameOver() || latestGame.turn() !== "b") {
        return;
      }

      const move = tryMove(
        latestGame,
        bestMove.slice(0, 2) as Square,
        bestMove.slice(2, 4) as Square,
        bestMove[4] as PromotionPiece | undefined,
      );

      if (!move) {
        setEngineError(`Stockfish returned an illegal move: ${bestMove}`);
        return;
      }

      syncBoard();
    } catch (error) {
      if (requestId === engineRequestRef.current) {
        setEngineError(
          error instanceof Error ? error.message : "Stockfish search failed.",
        );
      }
    } finally {
      if (requestId === engineRequestRef.current) {
        setAiThinking(false);
      }
    }
  }

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare || !canUserMove) {
      return false;
    }

    const from = sourceSquare as Square;
    const to = targetSquare as Square;

    if (isPromotionMove(game, from, to)) {
      setPendingPromotion({ from, to });
      return false;
    }

    const move = tryMove(game, from, to);

    if (!move) {
      return false;
    }

    syncBoard();
    void requestAiMove(gameRef.current.fen());
    return true;
  }

  function promote(piece: PromotionPiece) {
    if (!pendingPromotion) {
      return;
    }

    const move = tryMove(
      game,
      pendingPromotion.from,
      pendingPromotion.to,
      piece,
    );

    setPendingPromotion(null);

    if (move) {
      syncBoard();
      void requestAiMove(gameRef.current.fen());
    }
  }

  function newGame() {
    engineRequestRef.current += 1;
    engineRef.current?.stop();
    gameRef.current = createGame();
    setAiThinking(false);
    setEngineError(null);
    setReview(null);
    setReviewing(false);
    setReviewMessage(null);
    setReviewProgress({ completed: 0, total: 0 });
    setPendingPromotion(null);
    setFen(gameRef.current.fen());
  }

  function undoMove() {
    engineRequestRef.current += 1;
    engineRef.current?.stop();
    setAiThinking(false);
    setEngineError(null);
    setReview(null);
    setReviewing(false);
    setReviewMessage(null);
    setReviewProgress({ completed: 0, total: 0 });

    const currentGame = gameRef.current;

    if (currentGame.history().length === 0) {
      return;
    }

    if (currentGame.turn() === "w" && currentGame.history().length >= 2) {
      currentGame.undo();
      currentGame.undo();
    } else {
      currentGame.undo();
    }

    setPendingPromotion(null);
    syncBoard();
  }

  function flipBoard() {
    setOrientation((current) => (current === "white" ? "black" : "white"));
  }

  return (
    <>
      <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-8">
      <main className="flex min-w-0 flex-col items-center justify-center gap-5">
        <div className="w-full max-w-[min(92vw,calc(100vh-6rem),46rem)] lg:max-w-[min(calc(100vw-28rem),calc(100vh-7rem),48rem)]">
          <div className="rounded-lg border border-border/70 bg-card/72 p-2 shadow-2xl shadow-black/40">
            <Chessboard
              options={{
                id: "endgame-os-board",
                boardOrientation: orientation,
                position: fen,
                onPieceDrop: handlePieceDrop,
                allowDragging: canUserMove,
                canDragPiece: ({ piece }) =>
                  Boolean(
                    piece.pieceType.startsWith("w") ||
                      piece.pieceType === piece.pieceType.toUpperCase(),
                  ),
                boardStyle: {
                  borderRadius: "6px",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                },
                darkSquareStyle: { backgroundColor: "#31443e" },
                lightSquareStyle: { backgroundColor: "#d9cda8" },
                dropSquareStyle: {
                  boxShadow: "inset 0 0 0 4px rgba(248, 196, 94, 0.8)",
                },
              }}
            />
          </div>
        </div>

        {review ? (
          <section className="w-full max-w-4xl space-y-4">
            <ReviewSummary review={review} />
            <div className="grid gap-3 md:grid-cols-2">
              {review.moves
                .filter((move) => move.classification !== "Best")
                .slice(0, 8)
                .map((move) => (
                  <MoveReviewCard key={move.ply} move={move} />
                ))}
            </div>
          </section>
        ) : null}
      </main>

      <aside className="flex min-h-0 flex-col gap-4 lg:max-h-[calc(100vh-4rem)]">
        <GamePanel
          status={status}
          orientation={orientation}
          canUndo={moves.length > 0}
          onNewGame={newGame}
          onUndo={undoMove}
          onFlip={flipBoard}
        />
        <EnginePanel
          difficulty={difficulty}
          isThinking={aiThinking}
          onDifficultyChange={setDifficulty}
        />
        <GameSavePanel
          isComplete={game.isGameOver()}
          result={gameResult}
          pgn={game.pgn()}
          finalFen={game.fen()}
          accuracy={accuracy}
          opponentName="Stockfish"
        />
        {game.isGameOver() ? (
          <section className="rounded-lg border border-border/70 bg-card/72 p-4">
            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                After the Game
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Review Your Mistakes
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Click Analyze Game to get a move-by-move coach review and see
                what to improve next.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => void analyzeGame()}
              disabled={reviewing || !gameResult || Boolean(review)}
            >
              {reviewing
                ? "Analyzing..."
                : review
                  ? "Review Complete"
                  : "Analyze Game"}
            </Button>
            {reviewing ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Evaluating move {reviewProgress.completed} of{" "}
                {reviewProgress.total || moves.length}...
              </p>
            ) : null}
            {reviewMessage ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {reviewMessage}
              </p>
            ) : null}
          </section>
        ) : null}
        {engineError ? (
          <div className="rounded-lg border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {engineError}
          </div>
        ) : null}
        <MoveHistory moves={moves} />
      </aside>
      </div>

      {pendingPromotion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-2xl">
            <div className="mb-4">
              <p className="text-lg font-semibold text-foreground">
                Choose promotion
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Promote the pawn on {pendingPromotion.to}.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PROMOTION_PIECES.map((piece) => (
                <Button key={piece} variant="secondary" onClick={() => promote(piece)}>
                  {pieceLabels[piece]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
