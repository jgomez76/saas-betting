type Match = {
  home_team: string;
  away_team: string;

  league: string;
  date: string;

  value: {
    home_value: number;
    draw_value: number;
    away_value: number;
  };
  best_odds: {
    home?: {
      odd: number;
      bookmaker: string;
    };
    draw?: {
      odd: number;
      bookmaker: string;
    };
    away?: {
      odd: number;
      bookmaker: string;
    };
  };
  probabilities?: {
    home_win_prob: number;
    draw_prob: number;
    away_win_prob: number;
  };
};

async function getData(): Promise<Match[]> {
  try {
    const res = await fetch("http://127.0.0.1:8000/value-bets", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function Home() {
  const matches = await getData();

  const isPremium = false; // 🔐 luego lo haremos dinámico
  const visibleMatches = isPremium ? matches : matches.slice(0, 3);

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔥 Top Value Bets</h1>

      <div className="grid gap-4">
        {visibleMatches.map((match, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {match.league} — {new Date(match.date).toLocaleDateString()}
            </p>

            {/* Cuotas */}
            <div className="flex gap-4 text-sm">
              {/* <p>🏠 {match.bookmaker_odds.home_odds_book}</p> */}
              <p>🏠 {match.best_odds.home?.odd} ({match.best_odds.home?.bookmaker})</p>
              {/* <p>🤝 {match.bookmaker_odds.draw_odds_book}</p> */}
              <p>🤝 {match.best_odds.draw?.odd} ({match.best_odds.draw?.bookmaker})</p>
              {/* <p>🚶 {match.bookmaker_odds.away_odds_book}</p> */}
              <p>🚶 {match.best_odds.away?.odd} ({match.best_odds.away?.bookmaker})</p>
            </div>

            {/* Value */}
            <div className="flex gap-4 mt-3">
              <p
                className={
                  match.value.home_value > 0
                    ? "text-green-600 font-bold"
                    : "text-red-500"
                }
              >
                Home: {match.value.home_value}
              </p>
              <p
                className={
                  match.value.draw_value > 0
                    ? "text-green-600 font-bold"
                    : "text-red-500"
                }
              >
                Draw: {match.value.draw_value}
              </p>
              <p
                className={
                  match.value.away_value > 0
                    ? "text-green-600 font-bold"
                    : "text-red-500"
                }
              >
                Away: {match.value.away_value}
              </p>
            </div>

            {/* Probabilidades (seguro) */}
            {match.probabilities && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Prob Home: {match.probabilities.home_win_prob}</p>
                <p>Prob Draw: {match.probabilities.draw_prob}</p>
                <p>Prob Away: {match.probabilities.away_win_prob}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BLOQUE FREEMIUM */}
      {!isPremium && matches.length > 3 && (
        <div className="mt-8 p-6 bg-yellow-100 rounded-xl text-center">
          <p className="font-semibold text-lg">
            🔒 Unlock all value bets with Premium
          </p>
          <button className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            Upgrade to Premium
          </button>
        </div>
      )}
    </main>
  );
}