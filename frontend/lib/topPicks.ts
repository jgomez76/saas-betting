import { Match } from "@/types/match";
import { getStakeFromOdd } from "@/lib/stake";

/* =========================
   🎯 PICK TYPE
========================= */

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
  tier: "high" | "medium" | "low";
  bookmaker?: string;
  stake?: number;
  stakeLevel?: number;
};

/* =========================
   🧠 TOP PICKS ENGINE
========================= */

export const getTopPicks = (matches: Match[]): Pick[] => {
  const picks: Pick[] = [];

  /* ---------- HELPER ---------- */
  const addPick = (
    m: Match,
    market: string,
    selection: string,
    odd: number,
    value: number,
    probability: number,
    bookmaker?: string,
  ) => {
    // 🎯 filtros de calidad
    if (
      value < 0.04 || value > 0.25 ||
      probability < 0.40 || probability > 0.80 ||
      odd < 1.5 || odd > 4.5
    ) {
      return;
    }

    // 🧠 score
    const score =
      value * 0.5 +
      probability * 0.3 +
      (1 / odd) * 0.2;

    // 🏷️ tier
    let tier: "high" | "medium" | "low" = "medium";

    // if (probability >= 0.65 && value <= 0.12) {
    //   tier = "high";
    // } else if (probability < 0.5 || value > 0.18) {
    //   tier = "low";
    // }
    if (probability >= 0.65) tier = "high";
    else if (probability >= 0.55) tier = "medium";
    else tier = "low";

    const stakeRule = getStakeFromOdd(odd);

    picks.push({
      match: `${m.home_team} vs ${m.away_team}`,
      market,
      selection,
      odd,
      value,
      probability,
      league: m.league,
      date: m.date,
      score,
      fixture_id: m.fixture_id,
      tier,
      bookmaker,
      stake: stakeRule.amount,
      stakeLevel: stakeRule.level,
    });
  };

  /* =========================
     🔄 LOOP MATCHES
  ========================= */

  matches.forEach((m) => {
    if (!m.markets) return;

    /* -------- 1X2 -------- */
    if (m.markets["1X2"] && m.value && m.probabilities) {
      const map = [
        { key: "home", prob: m.probabilities.home_odds },
        { key: "draw", prob: m.probabilities.draw_odds },
        { key: "away", prob: m.probabilities.away_odds },
      ] as const;

      map.forEach(({ key, prob }) => {
        const marketdata = m.markets?.["1X2"]?.[key];
        const odd = m.markets?.["1X2"]?.[key]?.odd;
        const value = m.value?.[`${key}_value` as keyof typeof m.value];

        if (!odd || value == null || !prob) return;

        const probability = 1 / prob;
        if (!probability) return;
        const bookmaker = marketdata?.bookmaker;

        addPick(m, "1X2", key, odd, value, probability, bookmaker);
      });
    }

    /* -------- OU25 -------- */
    if (m.markets?.OU25 && m.market_values?.OU25 && m.extra_probabilities) {
      const overdata =  m.markets.OU25.over;
      const overOdd = m.markets.OU25.over?.odd;
      const overValue = m.market_values.OU25.over_value;
      const overProb = m.extra_probabilities.over25_prob;

      if (overOdd && overValue != null && overProb) {
        const bookmaker = overdata?.bookmaker;
        addPick(m, "OU25", "over", overOdd, overValue, overProb, bookmaker);
      }
      const underdata =  m.markets.OU25.under;
      const underOdd = m.markets.OU25.under?.odd;
      const underValue = m.market_values.OU25.under_value;
      const underProb = m.extra_probabilities.under25_prob;

      if (underOdd && underValue != null && underProb) {
        const bookmaker = underdata?.bookmaker;
        addPick(m, "OU25", "under", underOdd, underValue, underProb, bookmaker);
      }
    }

    /* -------- OU35 -------- */
    if (m.markets?.OU35 && m.market_values?.OU35 && m.extra_probabilities) {
      const overdata =  m.markets.OU35.over;
      const overOdd = m.markets.OU35.over?.odd;
      const overValue = m.market_values.OU35.over_value;
      const overProb = m.extra_probabilities.over35_prob;

      if (overOdd && overValue != null && overProb) {
        const bookmaker = overdata?.bookmaker;
        addPick(m, "OU35", "over", overOdd, overValue, overProb, bookmaker);
      }

      const underdata =  m.markets.OU35.under;
      const underOdd = m.markets.OU35.under?.odd;
      const underValue = m.market_values.OU35.under_value;
      const underProb = m.extra_probabilities.under35_prob;

      if (underOdd && underValue != null && underProb) {
        const bookmaker = underdata?.bookmaker;
        addPick(m, "OU35", "under", underOdd, underValue, underProb, bookmaker);
      }
    }

    /* -------- BTTS -------- */
    if (m.markets?.BTTS && m.market_values?.BTTS && m.extra_probabilities) {
      const yesdata =  m.markets.BTTS.yes;
      const yesOdd = m.markets.BTTS.yes?.odd;
      const yesValue = m.market_values.BTTS.yes_value;
      const yesProb = m.extra_probabilities.btts_yes_prob;

      if (yesOdd && yesValue != null && yesProb) {
        const bookmaker = yesdata?.bookmaker;
        addPick(m, "BTTS", "yes", yesOdd, yesValue, yesProb, bookmaker);
      }

      const nodata =  m.markets.BTTS.no;
      const noOdd = m.markets.BTTS.no?.odd;
      const noValue = m.market_values.BTTS.no_value;
      const noProb = m.extra_probabilities.btts_no_prob;

      if (noOdd && noValue != null && noProb) {
        const bookmaker = nodata?.bookmaker;
        addPick(m, "BTTS", "no", noOdd, noValue, noProb, bookmaker);
      }
    }
  });

  /* =========================
     🏆 RANKING + UNIQUE
  ========================= */

  const sorted = picks.sort((a, b) => b.probability - a.probability);

  const unique = new Map<number, Pick>();

  sorted.forEach((p) => {
    if (!unique.has(p.fixture_id)) {
      unique.set(p.fixture_id, p);
    }
  });

  return Array.from(unique.values());
};