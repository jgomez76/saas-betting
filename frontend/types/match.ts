import { TeamStats } from "./stats";

export type Odd = {
  odd: number;
  bookmaker: string;
};

export type Match = {
  home_team: string;
  away_team: string;
  league: string;
  league_id: number;
  date: string;
  fixture_id: number;

  value?: {
    home_value: number | null;
    draw_value: number | null;
    away_value: number | null;
  };

  markets?: {
    "1X2"?: {
      home?: Odd;
      draw?: Odd;
      away?: Odd;
    };
    OU25?: {
      over?: Odd;
      under?: Odd;
    };
    OU35?: {
      over?: Odd;
      under?: Odd;
    };
    BTTS?: {
      yes?: Odd;
      no?: Odd;
    };
  };

  market_values?: {
    OU25?: {
      over_value: number | null;
      under_value: number | null;
    };
    OU35?: {
      over_value: number | null;
      under_value: number | null;
    };
    BTTS?: {
      yes_value: number | null;
      no_value: number | null;
    };
  };

  home_form?: string;
  away_form?: string;

  probabilities?: {
    home_odds?: number;
    draw_odds?: number;
    away_odds?: number;
  };

  extra_probabilities?: {
    over15_prob?: number;
    under15_prob?: number;
    over25_prob?: number;
    under25_prob?: number;
    over35_prob?: number;
    under35_prob?: number;
    btts_yes_prob?: number;
    btts_no_prob?: number;
  };

  
  team_stats?: {
    home: TeamStats;
    away: TeamStats;
  };

};