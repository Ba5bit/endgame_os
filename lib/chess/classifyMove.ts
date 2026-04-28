export type MoveClassification =
  | "Best"
  | "Good"
  | "Inaccuracy"
  | "Mistake"
  | "Blunder";

export type MoveClassificationResult = {
  label: MoveClassification;
  centipawnLoss: number;
};

export function classifyMoveByEvalSwing(
  beforeWhiteEval: number,
  afterWhiteEval: number,
  mover: "w" | "b",
): MoveClassificationResult {
  const swingForMover =
    mover === "w"
      ? afterWhiteEval - beforeWhiteEval
      : beforeWhiteEval - afterWhiteEval;
  const centipawnLoss = Math.max(0, Math.round(-swingForMover));

  if (centipawnLoss <= 20) {
    return { label: "Best", centipawnLoss };
  }

  if (centipawnLoss <= 60) {
    return { label: "Good", centipawnLoss };
  }

  if (centipawnLoss <= 120) {
    return { label: "Inaccuracy", centipawnLoss };
  }

  if (centipawnLoss <= 250) {
    return { label: "Mistake", centipawnLoss };
  }

  return { label: "Blunder", centipawnLoss };
}
