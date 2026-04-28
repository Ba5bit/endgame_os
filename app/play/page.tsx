import { ChessBoard } from "@/components/chess/ChessBoard";
import { AppHeader } from "@/components/product/AppHeader";

export default function PlayPage() {
  return (
    <div className="min-h-screen">
      <AppHeader active="trainer" maxWidth="max-w-7xl" />
      <ChessBoard />
    </div>
  );
}
