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
    const isValue = value !== null && value !== undefined && value > 0;

    return (
      <div
        className={`p-2 rounded border text-center ${
          isValue
            ? "bg-green-100 border-green-400 text-green-700"
            : "bg-gray-100"
        }`}
      >
        <p className="text-xs">{label}</p>
        <p className="text-lg font-bold">{odd ?? "-"}</p>
        <p className="text-xs text-gray-500">{bookmaker ?? ""}</p>
        {value !== null && value !== undefined && (
          <p className="text-xs">
            {value > 0 ? "+" : ""}
            {value}
          </p>
        )}
      </div>
    );
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
          <option value="La Liga">La Liga</option>
          <option value="Segunda División">Segunda</option>
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
            <div key={index} className="bg-white p-4 rounded-xl shadow">
              {/* 🏟️ PARTIDO */}
              <h2 className="font-semibold">
                {match.home_team} vs {match.away_team}
              </h2>

              <p className="text-sm text-gray-500 mb-3">
                {match.league}, {formattedDate}, {formattedTime}
              </p>

              {/* 🧮 1X2 */}
              {(marketFilter === "ALL" || marketFilter === "1X2") &&
                match.markets?.["1X2"] && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
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
                    <div className="grid grid-cols-2 gap-2">
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
                    <div className="grid grid-cols-2 gap-2">
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