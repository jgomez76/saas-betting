import { Match } from "@/types/match"; // si no tienes este tipo, te adapto luego

// type Match = any;

export type Pick = {
  match: string;
  market: string;
  selection: string;
  odd: number;
  value: number;
  probability: number;
  league: string;
  date: string;
  score: number;
  fixture_id: number;
};

export const getTopPicks = (matches: Match[], isPremium: boolean): Pick[] => {
  const picks: Pick[] = [];

  matches.forEach((m) => {
    const markets = m.markets;
    if (!markets) return;

    // -------- 1X2 --------
    if (markets["1X2"] && m.value && m.probabilities) {
      const map = [
        { key: "home", prob: m.probabilities.home_odds },
        { key: "draw", prob: m.probabilities.draw_odds },
        { key: "away", prob: m.probabilities.away_odds },
      ] as const;

      map.forEach(({ key, prob }) => {
        const odd = markets["1X2"]?.[key]?.odd;
        const value = m.value?.[`${key}_value` as keyof typeof m.value];

        if (!odd || value == null || !prob) return;

        const probability = 1 / prob;

        if (
          value >= 0.05 &&
          value <= 0.15 &&
          probability >= 0.55 &&
          odd >= 1.6 &&
          odd <= 3.5
        ) {
          const score = value * 0.6 + probability * 0.4;

          picks.push({
            match: `${m.home_team} vs ${m.away_team}`,
            market: "1X2",
            selection: key,
            odd,
            value,
            probability,
            league: m.league,
            date: m.date,
            score,
            fixture_id: m.fixture_id,
          });
        }
      });
    }

    // -------- OU25 --------
    if (markets.OU25 && m.market_values?.OU25 && m.extra_probabilities) {
      const map = [
        { key: "over", prob: m.extra_probabilities.over25_prob },
        { key: "under", prob: m.extra_probabilities.under25_prob },
      ] as const;

      map.forEach(({ key, prob }) => {
        const odd = markets.OU25?.[key]?.odd;
        const value =
          key === "over"
            ? m.market_values?.OU25?.over_value
            : m.market_values?.OU25?.under_value;

        if (!odd || value == null || !prob) return;

        if (
          value >= 0.05 &&
          value <= 0.15 &&
          prob >= 0.55 &&
          odd >= 1.6 &&
          odd <= 3.5
        ) {
          const score = value * 0.6 + prob * 0.4;

          picks.push({
            match: `${m.home_team} vs ${m.away_team}`,
            market: "OU25",
            selection: key,
            odd,
            value,
            probability: prob,
            league: m.league,
            date: m.date,
            score,
            fixture_id: m.fixture_id,
          });
        }
      });
    }
  });

  const sorted = picks.sort((a, b) => b.score - a.score);

  return isPremium ? sorted.slice(0, 5) : sorted.slice(0, 1);
};