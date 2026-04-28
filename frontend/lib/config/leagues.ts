export type League = {
  id: number;
  name: string;
  country?: string;
  logo?: string;
};

export const LEAGUES: League[] = [
  { id: 140, name: "La Liga EA Sports" },
  { id: 141, name: "La Liga Hypermotion" },
  { id: 39, name: "Premier League" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 2, name: "Champions League" },
  { id: 3, name: "Europa League" },
  { id: 848, name: "Conference League" },
];

export const PRIORITY_LEAGUES = [
  "La Liga",
  "Segunda División",
  "Premier League",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
];