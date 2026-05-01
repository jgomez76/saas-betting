export type TeamStats = {
  matches: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  results: {
    win: number;
    draw: number;
    loss: number;
  };
  markets?: {
    over_2_5: number;
    over_3_5: number;
    btts: number;
  };

};


