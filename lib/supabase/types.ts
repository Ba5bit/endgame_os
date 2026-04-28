export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GameResult = "win" | "loss" | "draw";
export type OpponentType = "ai" | "human";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          city: string;
          discipline_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          city: string;
          discipline_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          city?: string;
          discipline_score?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          user_id: string;
          opponent_type: OpponentType;
          opponent_name: string;
          result: GameResult;
          pgn: string;
          final_fen: string;
          accuracy: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opponent_type: OpponentType;
          opponent_name: string;
          result: GameResult;
          pgn: string;
          final_fen: string;
          accuracy?: number | null;
          created_at?: string;
        };
        Update: {
          opponent_type?: OpponentType;
          opponent_name?: string;
          result?: GameResult;
          pgn?: string;
          final_fen?: string;
          accuracy?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "games_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      game_reviews: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          accuracy: number | null;
          discipline_score_delta: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          accuracy?: number | null;
          discipline_score_delta?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          accuracy?: number | null;
          discipline_score_delta?: number | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_reviews_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
export type GameReview =
  Database["public"]["Tables"]["game_reviews"]["Row"];
