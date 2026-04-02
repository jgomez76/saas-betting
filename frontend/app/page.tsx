"use client";

import { useEffect, useState } from "react";

type Odd = {
  odd: number;
  bookmaker: string;
};

type Match = {
  home_team: string;
  away_team: string;
  league: string;
  date: string;

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
    BTTS?: {
      yes_value: number | null;
      no_value: number | null;
    };
  };

  home_form?: string;
  away_form?: string;
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/value-bets")
      .then((res) => res.json())
      .then((data) => setMatches(data));
  }, []);

  // 🎯 RENDER CUOTA
  const renderOdd = (
    label: string,
    odd?: number,
    bookmaker?: string,
    value?: number | null
  ) => {
    // const isValue = value !== null && value !== undefined && value > 0;

    const isStrong = value && value > 0.15;
    const isGood = value && value > 0;

    return (
      // <div
      //   className={`p-2 rounded border text-center ${
      //     isValue
      //       ? "bg-green-100 border-green-400 text-green-700"
      //       : "bg-gray-100"
      //   }`}
      // >
        <div
          className={`p-3 rounded-xl border text-center ${
            isStrong
              ? "bg-green-200 border-green-500"
              : isGood
              ? "bg-green-100 border-green-400"
              : "bg-gray-100"
          }`}
        >
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-2xl font-extrabold">{odd ?? "-"}</p>
        <p className="text-xl text-gray-500">{bookmaker ?? ""}</p>
        {value !== null && value !== undefined && (
          <p className="text-sm font-bold">{formatValue(value)}</p>
        )}
      </div>
    );
  };

  const formatValue = (v: number | null) => {
    if (v === null || v === undefined) return "-";

    const percent = v * 100;

    return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
  };

  // 🎯 FILTROS
  const filteredMatches = matches
    .filter((m) => {
      if (leagueFilter === "ALL") return true;
      return m.league === leagueFilter;
    })
    .filter((m) => {
      if (!dateFilter) return true;
      const matchDate = new Date(m.date).toISOString().split("T")[0];
      return matchDate === dateFilter;
    });

  // RACHA
  const renderForm = (form: string) => {
    return (
      <div className="flex gap-1 mt-1">
        {form?.split("").map((f, i) => {
          let color = "bg-gray-300";

          if (f === "W") color = "bg-green-500";
          if (f === "D") color = "bg-yellow-400";
          if (f === "L") color = "bg-red-500";

          return (
            <span
              key={i}
              className={`text-white text-xs px-2 py-1 rounded ${color}`}
            >
              {f}
            </span>
          );
        })}
      </div>
    );
  }; 

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔥 Top Value Bets</h1>

      {/* 🎛️ FILTROS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          onChange={(e) => setLeagueFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="ALL">Todas las ligas</option>
          <option value="La Liga">La Liga EA Sports</option>
          <option value="Segunda División">La Liga Hypermotion</option>
        </select>

        <select
          onChange={(e) => setMarketFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="ALL">Todos los mercados</option>
          <option value="1X2">1X2</option>
          <option value="OU25">Over 2.5</option>
          <option value="BTTS">BTTS</option>
        </select>

        <input
          type="date"
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* 📦 GRID */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredMatches.map((match, index) => {
          const dateObj = new Date(match.date + "Z");

          const formattedDate = dateObj.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Europe/Madrid",
          });

          const formattedTime = dateObj.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid",
          });

          return (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition">  
              {/* 🏟️ PARTIDO */}

              {/* <div className="text-center mb-4">
                <h2 className="text-xl font-bold">
                  {match.home_team} vs {match.away_team}
                </h2>

                <div className="flex justify-center gap-6 mt-2">
                  <div>
                    {renderForm(match.home_form || "")}
                  </div>
                  <div>
                    {renderForm(match.away_form || "")}
                  </div>
                </div>
              </div> */}
              {/* <div className="grid grid-cols-3 items-center mb-4 text-center"> */}
              <div className="grid items-center mb-4 text-center" style={{ gridTemplateColumns: "45% 10% 45%"}}>
  
              {/* 🏠 HOME */}
              <div>
                <p className="font-semibold text-xl">{match.home_team}</p>
                <div className="flex justify-center mt-1">
                  {renderForm(match.home_form || "")}
                </div>
              </div>

              {/* ⚔️ VS */}
              <div>
                <p className="text-lg font-bold text-gray-600">vs</p>
              </div>

              {/* 🚶 AWAY */}
              <div>
                <p className="font-semibold text-xl">{match.away_team}</p>
                <div className="flex justify-center mt-1">
                  {renderForm(match.away_form || "")}
                </div>
              </div>

            </div>

              <p className="text-m text-gray-500 text-center mb-4">
                {match.league}, {formattedDate}, {formattedTime}
              </p>

              {/* 🧮 1X2 */}
              {(marketFilter === "ALL" || marketFilter === "1X2") &&
                match.markets?.["1X2"] && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {renderOdd(
                      "Home",
                      match.markets["1X2"].home?.odd,
                      match.markets["1X2"].home?.bookmaker,
                      match.value?.home_value
                    )}
                    {renderOdd(
                      "Draw",
                      match.markets["1X2"].draw?.odd,
                      match.markets["1X2"].draw?.bookmaker,
                      match.value?.draw_value
                    )}
                    {renderOdd(
                      "Away",
                      match.markets["1X2"].away?.odd,
                      match.markets["1X2"].away?.bookmaker,
                      match.value?.away_value
                    )}
                  </div>
                )}

              {/* ⚽ OU25 */}
              {(marketFilter === "ALL" || marketFilter === "OU25") &&
                match.markets?.OU25 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold mb-1">
                      ⚽ Over/Under 2.5
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {renderOdd(
                        "Over",
                        match.markets.OU25.over?.odd,
                        match.markets.OU25.over?.bookmaker,
                        match.market_values?.OU25?.over_value
                      )}
                      {renderOdd(
                        "Under",
                        match.markets.OU25.under?.odd,
                        match.markets.OU25.under?.bookmaker,
                        match.market_values?.OU25?.under_value
                      )}
                    </div>
                  </div>
                )}

              {/* 🔁 BTTS */}
              {(marketFilter === "ALL" || marketFilter === "BTTS") &&
                match.markets?.BTTS && (
                  <div>
                    <p className="text-sm font-semibold mb-1">🔁 BTTS</p>
                    <div className="grid grid-cols-2 gap-3">
                      {renderOdd(
                        "Yes",
                        match.markets.BTTS.yes?.odd,
                        match.markets.BTTS.yes?.bookmaker,
                        match.market_values?.BTTS?.yes_value
                      )}
                      {renderOdd(
                        "No",
                        match.markets.BTTS.no?.odd,
                        match.markets.BTTS.no?.bookmaker,
                        match.market_values?.BTTS?.no_value
                      )}
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </main>
  );
}