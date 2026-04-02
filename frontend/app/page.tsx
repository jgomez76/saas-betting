async function getData() {
  const res = await fetch("http://127.0.0.1:8000/match/value?home=Arsenal&away=Chelsea");
  return res.json();
}

export default async function Home() {
  const data = await getData();

  const { home_team, away_team, probabilities, bookmaker_odds, value } = data;

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">⚽ Value Bets Dashboard</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl">
        <h2 className="text-xl font-semibold mb-4">
          {home_team} vs {away_team}
        </h2>

        <div className="space-y-2">
          <p>🏠 Home Odds: {bookmaker_odds.home_odds_book}</p>
          <p>🤝 Draw Odds: {bookmaker_odds.draw_odds_book}</p>
          <p>🚶 Away Odds: {bookmaker_odds.away_odds_book}</p>
        </div>

        <div className="mt-4 space-y-2">
          <p className={value.home_value > 0 ? "text-green-600 font-bold" : "text-red-500"}>
            Home Value: {value.home_value}
          </p>
          <p className={value.draw_value > 0 ? "text-green-600 font-bold" : "text-red-500"}>
            Draw Value: {value.draw_value}
          </p>
          <p className={value.away_value > 0 ? "text-green-600 font-bold" : "text-red-500"}>
            Away Value: {value.away_value}
          </p>
        </div>
      </div>
    </main>
  );
}