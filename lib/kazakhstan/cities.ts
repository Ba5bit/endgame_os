export const KAZAKHSTAN_CITIES = [
  "Astana",
  "Almaty",
  "Shymkent",
  "Aktobe",
  "Karaganda",
  "Taraz",
  "Pavlodar",
  "Oskemen",
  "Semey",
  "Atyrau",
  "Kostanay",
  "Kyzylorda",
  "Oral",
  "Petropavl",
  "Aktau",
  "Turkistan",
  "Kokshetau",
  "Taldykorgan",
  "Ekibastuz",
  "Rudny",
  "Zhezkazgan",
  "Balkhash",
  "Temirtau",
] as const;

export const LEADERBOARD_CITY_OPTIONS = [
  "All Kazakhstan",
  ...KAZAKHSTAN_CITIES,
] as const;

export type KazakhstanCity = (typeof KAZAKHSTAN_CITIES)[number];
