import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoachReview } from "@/lib/chess/review";
import type {
  Game,
  GameInsert,
  GameResult,
  GameReview,
  Profile,
} from "@/lib/supabase/types";

export type ProfileStats = {
  profile: Profile;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  averageAccuracy: number;
  disciplineScore: number;
};

export type LeaderboardEntry = {
  profile: Profile;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  averageAccuracy: number;
  disciplineScore: number;
};

export type SavedGameLog = Game & {
  review: GameReview | null;
};

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveCompletedGame(game: Omit<GameInsert, "user_id">) {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    throw new Error("Sign in to save completed games.");
  }

  const { data, error } = await supabase
    .from("games")
    .insert({
      ...game,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveReviewWithGame({
  game,
  review,
}: {
  game: Omit<GameInsert, "user_id" | "accuracy"> & { accuracy: number };
  review: CoachReview;
}) {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    throw new Error("Sign in to save game reviews.");
  }

  const { data: savedGame, error: gameError } = await supabase
    .from("games")
    .insert({
      ...game,
      accuracy: review.accuracy,
      user_id: user.id,
    })
    .select()
    .single();

  if (gameError) {
    throw gameError;
  }

  const { error: reviewError } = await supabase.from("game_reviews").insert({
    game_id: savedGame.id,
    user_id: user.id,
    accuracy: review.accuracy,
    discipline_score_delta:
      review.blunders > 0 ? -review.blunders * 2 : review.mistakes > 0 ? -1 : 1,
    notes: JSON.stringify({
      result: review.result,
      blunders: review.blunders,
      mistakes: review.mistakes,
      criticalMove: review.criticalMove?.uci ?? null,
      biggestWeakness: review.biggestWeakness,
      moves: review.moves.map((move) => ({
        ply: move.ply,
        san: move.san,
        classification: move.classification,
        centipawnLoss: move.centipawnLoss,
        bestMove: move.bestMove,
        comment: move.comment,
      })),
    }),
  });

  if (reviewError) {
    throw reviewError;
  }

  return savedGame;
}

export async function getProfileStats(user?: User | null) {
  const supabase = getSupabaseBrowserClient();
  const currentUser = user ?? (await getCurrentUser());

  if (!supabase || !currentUser) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: games, error: gamesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single(),
      supabase
        .from("games")
        .select("result, accuracy")
        .eq("user_id", currentUser.id),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (gamesError) {
    throw gamesError;
  }

  return buildStats(profile, games ?? []);
}

export async function getSavedGameLogs(limit = 25): Promise<SavedGameLog[]> {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    return [];
  }

  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (gamesError) {
    throw gamesError;
  }

  if (!games?.length) {
    return [];
  }

  const gameIds = games.map((game) => game.id);
  const { data: reviews, error: reviewsError } = await supabase
    .from("game_reviews")
    .select("*")
    .eq("user_id", user.id)
    .in("game_id", gameIds);

  if (reviewsError) {
    throw reviewsError;
  }

  return games.map((game) => ({
    ...game,
    review:
      reviews?.find((review) => review.game_id === game.id) ?? null,
  }));
}

export async function getLeaderboardByCity(city: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const normalizedCity = city.trim();
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .ilike("city", normalizedCity || "%");

  if (profilesError) {
    throw profilesError;
  }

  if (!profiles?.length) {
    return [];
  }

  const profileIds = profiles.map((profile) => profile.id);
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("user_id, result, accuracy")
    .in("user_id", profileIds);

  if (gamesError) {
    throw gamesError;
  }

  return profiles
    .map((profile) =>
      buildStats(
        profile,
        (games ?? []).filter((game) => game.user_id === profile.id),
      ),
    )
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (b.averageAccuracy !== a.averageAccuracy) {
        return b.averageAccuracy - a.averageAccuracy;
      }

      if (b.totalGames !== a.totalGames) {
        return b.totalGames - a.totalGames;
      }

      if (b.disciplineScore !== a.disciplineScore) {
        return b.disciplineScore - a.disciplineScore;
      }

      return a.profile.username.localeCompare(b.profile.username);
    });
}

function buildStats(
  profile: Profile,
  games: { result: GameResult; accuracy: number | null }[],
): ProfileStats {
  const totalGames = games.length;
  const wins = games.filter((game) => game.result === "win").length;
  const losses = games.filter((game) => game.result === "loss").length;
  const draws = games.filter((game) => game.result === "draw").length;
  const accuracyGames = games.filter(
    (game): game is { result: GameResult; accuracy: number } =>
      typeof game.accuracy === "number",
  );
  const averageAccuracy =
    accuracyGames.length > 0
      ? Math.round(
          accuracyGames.reduce((total, game) => total + game.accuracy, 0) /
            accuracyGames.length,
        )
      : 0;

  return {
    profile,
    totalGames,
    wins,
    losses,
    draws,
    averageAccuracy,
    disciplineScore: profile.discipline_score,
  };
}
