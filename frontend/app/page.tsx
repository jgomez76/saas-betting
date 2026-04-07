"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import TopValueModal from "@/components/TopValueModal";
import BetsModal from "@/components/BetsModal";
import { API_URL } from "@/lib/api";
import { Bet } from "@/types/bet";

// ---------------- TYPES ----------------

type Odd = {
  odd: number;
  bookmaker: string;
};

type TeamMatch = {
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  date: string;
};

type Match = {
  home_team: string;
  away_team: string;
  league: string;
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
    OU15?: {
      over?: Odd;
      under?: Odd;
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
    OU15?: {
      over_value: number | null;
      under_value: number | null;
    };
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
};

// ---------------- COMPONENT ----------------

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [marketFilter, setMarketFilter] = useState("1X2");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [showTopModal, setShowTopModal] = useState(false);
  const [showBetsModal, setShowBetsModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  // const [pendingBet, setPendingBet] = useState<Omit<Bet, "id" | "date" | "status"> | null>(null);
  type PendingBet = Omit<Bet, "id">;
  const [pendingBet, setPendingBet] = useState<PendingBet | null>(null);

  const [bets, setBets] = useState<Bet[]>(() => {
  if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("bets");
    return stored ? JSON.parse(stored) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  const [openLeagues, setOpenLeagues] = useState<Record<string, boolean>>({});
  const toggleLeague = (league: string) => {
    setOpenLeagues((prev) => ({
      ...prev,
      [league]: !prev[league],
    }));
  };

  const betsRef = useRef<Bet[]>(bets);

  const mergeMatches = (oldMatches: Match[], newMatches: Match[]) => {
    const map = new Map<string, Match>();

    // 🔹 guardamos antiguos
    oldMatches.forEach((m) => {
      const key = m.home_team + m.away_team + m.date;
      map.set(key, m);
    });

    // 🔹 sobrescribimos con nuevos
    newMatches.forEach((m) => {
      const key = m.home_team + m.away_team + m.date;
      map.set(key, m);
    });

    return Array.from(map.values());
  };

  // --------- SINCRO REF --------
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  // ---------------- LOAD DATA ----------------

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await fetch(`${API_URL}/value-bets`);
      const data = await res.json();

      // 👇 solo partidos con odds
      const filtered = data.filter((m: Match) => m.markets?.["1X2"]);

      setAllMatches(filtered); // 👈 guardamos TODOS
      // setMatches(filtered);    // 👈 inicial

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/value-bets`);
        const data = await res.json();

        const filtered = data.filter((m: Match) => m.markets?.["1X2"]);

        setAllMatches((prev) => mergeMatches(prev, filtered));

      } catch (err) {
        console.error("Refresh error", err);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const matches = useMemo(() => {
    let filtered: Match[] = [...allMatches];

    // 🏆 LIGA
    if (leagueFilter !== "ALL") {
      filtered = filtered.filter((m) => m.league === leagueFilter);
    }

    // ⚽ MERCADO
    if (marketFilter !== "ALL") {
      filtered = filtered.filter((m) => {
        if (marketFilter === "1X2") return !!m.markets?.["1X2"];
        if (marketFilter === "OU15") return !!m.markets?.OU15;
        if (marketFilter === "OU25") return !!m.markets?.OU25;
        if (marketFilter === "OU35") return !!m.markets?.OU35;
        if (marketFilter === "BTTS") return !!m.markets?.BTTS;
        return true;
      });
    }

    return filtered;
  }, [allMatches, leagueFilter, marketFilter]);

  // ------------- AUTO RESOLVE BETS -----------

  useEffect(() => {
    const resolveBets = async () => {
      if (!betsRef.current.length) return;

      const updated = await Promise.all(
        betsRef.current.map(async (bet) => {
          if (bet.status !== "pending" || !bet.fixture_id) return bet;

          try {
            const res = await fetch(
              `${API_URL}/fixture/${bet.fixture_id}/result`
            );
            const data = await res.json();

            if (!data || data.status !== "FT") return bet;

            const { home_goals, away_goals } = data;

            let status: "won" | "lost" = "lost";

            // ---------------- 1X2 ----------------
            if (bet.market === "1X2") {
              if (
                (bet.selection === "home" && home_goals > away_goals) ||
                (bet.selection === "away" && away_goals > home_goals) ||
                (bet.selection === "draw" && home_goals === away_goals)
              ) {
                status = "won";
              }
            }

            // ---------------- OU25 ----------------
            if (bet.market === "OU25") {
              const total = home_goals + away_goals;

              if (
                (bet.selection === "over" && total > 2.5) ||
                (bet.selection === "under" && total < 2.5)
              ) {
                status = "won";
              }
            }

            // ---------------- BTTS ----------------
            if (bet.market === "BTTS") {
              const btts = home_goals > 0 && away_goals > 0;

              if (
                (bet.selection === "yes" && btts) ||
                (bet.selection === "no" && !btts)
              ) {
                status = "won";
              }
            }

            return {
              ...bet,
              status,
              result: `${home_goals}-${away_goals}`,
            };
          } catch {
            return bet;
          }
        })
      );

      setBets(updated);
      localStorage.setItem("bets", JSON.stringify(updated));
    };

    resolveBets();
  }, []);

  // ---------------- BET SYSTEM ----------------

  // const addBet = (bet: Omit<Bet, "id" | "date" | "status">) => {
  //   const newBet: Bet = {
  //     ...bet,
  //     id: crypto.randomUUID(),
  //     date: bet.date ?? new Date().toISOString(),
  //     status: "pending",
  //   };

  //   const updated = [...bets, newBet];
  //   setBets(updated);
  //   localStorage.setItem("bets", JSON.stringify(updated));

  //   // alert("✅ Apuesta añadida");
  // };

  const addBet = (bet: PendingBet) => {
    const newBet: Bet = {
      ...bet,
      id: crypto.randomUUID(),
    };

    const updated = [...bets, newBet];
    setBets(updated);
    localStorage.setItem("bets", JSON.stringify(updated));
  };

  // ---------------- FAVORITES ----------------

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // ---------------- TEAM MODAL ----------------

  const openTeamModal = async (team: string) => {
    setSelectedTeam(team);

    const res = await fetch(`${API_URL}/team/${team}/matches`);
    const data = await res.json();

    setTeamMatches(data);
  };

  const getResultColor = (m: TeamMatch, team: string) => {
    const isHome = m.home === team;

    const teamGoals = isHome ? m.home_goals : m.away_goals;
    const oppGoals = isHome ? m.away_goals : m.home_goals;

    if (teamGoals > oppGoals) return "text-green-400";
    if (teamGoals < oppGoals) return "text-red-400";
    return "text-yellow-400";
  };

  // ---------------- HELPERS ----------------

  const formatValue = (v?: number | null) => {
    if (v === null || v === undefined) return null;
    return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  const getValueColor = (v?: number | null) => {
    if (v === null || v === undefined) return "bg-[#2a2a2a]";
    if (v > 0.15) return "bg-green-700";
    if (v > 0) return "bg-green-600";
    return "bg-[#2a2a2a]";
  };

  const grouped = useMemo(() => {
    return matches.reduce((acc, match) => {
      if (!acc[match.league]) {
        acc[match.league] = [];
      }

      acc[match.league].push(match);

      return acc;
    }, {} as Record<string, Match[]>);
  }, [matches]);

  const renderForm = (form: string) => (
    <div className="flex justify-center gap-1 mt-1">
      {form.split("").map((f, i) => {
        const color =
          f === "W"
            ? "bg-green-500"
            : f === "D"
            ? "bg-yellow-400"
            : "bg-red-500";

        return (
          <span key={i} className={`text-white text-xs px-1 rounded ${color}`}>
            {f}
          </span>
        );
      })}
    </div>
  );

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <main className="p-6 bg-gray-100 min-h-screen">
        <p className="text-center text-lg">⏳ Cargando partidos...</p>
      </main>
    );
  }

  // ---------------- RENDER ----------------
  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <Navbar
        onOpenTop={() => setShowTopModal(true)}
        onOpenBets={() => setShowBetsModal(true)}
        marketFilter={marketFilter}
        setMarketFilter={setMarketFilter}
        leagueFilter={leagueFilter}
        setLeagueFilter={setLeagueFilter}
      />

      {Object.entries(grouped).map(([league, leagueMatches]) => (
        <div key={league}>

          {/* 🏆 NOMBRE LIGA */}
          <div
            onClick={() => toggleLeague(league)}
            className="flex justify-between items-center bg-[#2a2a2a] text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-[#3a3a3a] transition mt-6"
          >
            <div className="flex items-center gap-2">
              <span>{openLeagues[league] ? "▼" : "▶"}</span>
              <span className="font-semibold text-lg">{league}</span>
            </div>

            <span className="text-sm text-gray-400">
              {leagueMatches.length} partidos
            </span>
          </div>

          {/* 📦 GRID DE PARTIDOS */}
          <div
            className={`transition-all duration-300 ${
              openLeagues[league]
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              
              {leagueMatches.map((match, index) => {
                const id = match.home_team + match.away_team;

                // FECHA PARTIDOS
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
                  <div
                    key={index}
                    className="bg-[#1e1e1e] text-white p-4 rounded-xl relative"
                    // className="bg-[#0D0D0D] text-white p-4 rounded-xl relative"
                  >
                    {/* ⭐ FAVORITO */}
                    <button
                      onClick={() => toggleFavorite(id)}
                      className="absolute top-2 right-2"
                    >
                      {favorites.includes(id) ? "⭐" : "☆"}
                    </button>

                    {/* EQUIPOS */}
                    <div
                      className="grid text-center mb-3"
                      style={{ gridTemplateColumns: "45% 10% 45%" }}
                    >
                      <div onClick={() => openTeamModal(match.home_team)}>
                        <p>{match.home_team}</p>
                        {renderForm(match.home_form || "")}
                      </div>

                      <div className="text-gray-400 text-xs">vs</div>

                      <div onClick={() => openTeamModal(match.away_team)}>
                        <p>{match.away_team}</p>
                        {renderForm(match.away_form || "")}
                      </div>
                    </div>

                    {/* FECHA */}
                    <p className="text-xm text-gray-300 text-center mb-2">
                      {/* {match.league} • {formattedDate} • {formattedTime} */}
                      {formattedDate} • {formattedTime}
                    </p>

                    {/* 1X2 */}
                    {(marketFilter === "ALL" || marketFilter === "1X2") &&
                      match.markets?.["1X2"] && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {(["home", "draw", "away"] as const).map((k) => {
                            const odd = match.markets?.["1X2"]?.[k];
                            const value =
                              match.value?.[`${k}_value` as keyof typeof match.value];

                            const fairOdd =
                              k === "home"
                                ? match.probabilities?.home_odds
                                : k === "draw"
                                ? match.probabilities?.draw_odds
                                : match.probabilities?.away_odds;

                            return (
                              <div
                                key={k}
                                onClick={() =>
                                  setPendingBet({
                                    match: `${match.home_team} vs ${match.away_team}`,
                                    market: "1X2",
                                    selection: k,
                                    odd: odd?.odd,
                                    bookmaker: odd?.bookmaker,
                                    value,
                                    fixture_id: match.fixture_id,
                                    status: "pending",
                                    date: match.date
                                  })
                                }
                                className={`${getValueColor(
                                  value
                                )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                              >
                                {/* 🏷️ LABEL */}
                                <p className="text-sm uppercase text-gray-300">{k}</p>

                                {/* 💰 CUOTA REAL */}
                                <p className="font-bold text-3xl">{odd?.odd ?? "-"}</p>

                                {/* 🏦 BOOKMAKER */}
                                <p className="text-lg text-gray-300">
                                  {odd?.bookmaker ?? ""}
                                </p>

                                {/* 📊 FAIR ODDS + VALUE */}
                                <p
                                  className={`text-xs ${
                                    value !== null && value !== undefined && value < 0
                                      ? "text-red-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                  {value !== null && value !== undefined &&
                                    `(${formatValue(value)})`}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                    )}

                    {/* OU15 */}
                    {(marketFilter === "ALL" || marketFilter === "OU15") &&
                      match.markets?.OU15 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(["over", "under"] as const).map((k) => {
                            const odd = match.markets?.OU15?.[k];
                            const value =
                              k === "over"
                                ? match.market_values?.OU15?.over_value
                                : match.market_values?.OU15?.under_value;

                            // 👉 FAIR ODDS (IMPORTANTE)
                            const fairOdd =
                              k === "over"
                                ? match.extra_probabilities?.over15_prob
                                  ? 1 / match.extra_probabilities.over15_prob
                                  : null
                                : match.extra_probabilities?.under15_prob
                                ? 1 / match.extra_probabilities.under15_prob
                                : null;

                            return (
                              <div
                                key={k}
                                onClick={() =>
                                  setPendingBet({
                                    match: `${match.home_team} vs ${match.away_team}`,
                                    market: "OU15",
                                    selection: k,
                                    odd: odd?.odd,
                                    bookmaker: odd?.bookmaker,
                                    value,
                                    fixture_id: match.fixture_id,
                                    status: "pending",
                                    date: match.date
                                  })
                                }
                                className={`${getValueColor(
                                  value
                                )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                              >
                                {/* 🏷️ LABEL */}
                                <p className="text-sm uppercase text-gray-300">
                                  {k} 1.5
                                </p>

                                {/* 💰 CUOTA REAL */}
                                <p className="font-bold text-3xl">
                                  {odd?.odd ?? "-"}
                                </p>

                                {/* 🏦 BOOKMAKER */}
                                <p className="text-lg text-gray-300">
                                  {odd?.bookmaker ?? ""}
                                </p>

                                {/* 📊 FAIR ODDS + VALUE */}
                                <p
                                    className={`text-xs ${
                                      value !== null && value !== undefined && value < 0
                                        ? "text-red-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                    {value !== null && value !== undefined &&
                                      `(${formatValue(value)})`}
                                  </p>
                              </div>
                            );
                          })}
                        </div>
                    )}                    
                    {/* OU25 */}
                    {(marketFilter === "ALL" || marketFilter === "OU25") &&
                      match.markets?.OU25 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(["over", "under"] as const).map((k) => {
                            const odd = match.markets?.OU25?.[k];
                            const value =
                              k === "over"
                                ? match.market_values?.OU25?.over_value
                                : match.market_values?.OU25?.under_value;

                            // 👉 FAIR ODDS (IMPORTANTE)
                            const fairOdd =
                              k === "over"
                                ? match.extra_probabilities?.over25_prob
                                  ? 1 / match.extra_probabilities.over25_prob
                                  : null
                                : match.extra_probabilities?.under25_prob
                                ? 1 / match.extra_probabilities.under25_prob
                                : null;

                            return (
                              <div
                                key={k}
                                onClick={() =>
                                  setPendingBet({
                                    match: `${match.home_team} vs ${match.away_team}`,
                                    market: "OU25",
                                    selection: k,
                                    odd: odd?.odd,
                                    bookmaker: odd?.bookmaker,
                                    value,
                                    fixture_id: match.fixture_id,
                                    status: "pending",
                                    date: match.date
                                  })
                                }
                                className={`${getValueColor(
                                  value
                                )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                              >
                                {/* 🏷️ LABEL */}
                                <p className="text-sm uppercase text-gray-300">
                                  {k} 2.5
                                </p>

                                {/* 💰 CUOTA REAL */}
                                <p className="font-bold text-3xl">
                                  {odd?.odd ?? "-"}
                                </p>

                                {/* 🏦 BOOKMAKER */}
                                <p className="text-lg text-gray-300">
                                  {odd?.bookmaker ?? ""}
                                </p>

                                {/* 📊 FAIR ODDS + VALUE */}
                                <p
                                    className={`text-xs ${
                                      value !== null && value !== undefined && value < 0
                                        ? "text-red-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                    {value !== null && value !== undefined &&
                                      `(${formatValue(value)})`}
                                  </p>
                              </div>
                            );
                          })}
                        </div>
                    )}                    
                    {/* OU35 */}
                    {(marketFilter === "ALL" || marketFilter === "OU35") &&
                      match.markets?.OU35 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(["over", "under"] as const).map((k) => {
                            const odd = match.markets?.OU35?.[k];
                            const value =
                              k === "over"
                                ? match.market_values?.OU35?.over_value
                                : match.market_values?.OU35?.under_value;

                            // 👉 FAIR ODDS (IMPORTANTE)
                            const fairOdd =
                              k === "over"
                                ? match.extra_probabilities?.over35_prob
                                  ? 1 / match.extra_probabilities.over35_prob
                                  : null
                                : match.extra_probabilities?.under35_prob
                                ? 1 / match.extra_probabilities.under35_prob
                                : null;

                            return (
                              <div
                                key={k}
                                onClick={() =>
                                  setPendingBet({
                                    match: `${match.home_team} vs ${match.away_team}`,
                                    market: "OU35",
                                    selection: k,
                                    odd: odd?.odd,
                                    bookmaker: odd?.bookmaker,
                                    value,
                                    fixture_id: match.fixture_id,
                                    status: "pending",
                                    date: match.date
                                  })
                                }
                                className={`${getValueColor(
                                  value
                                )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                              >
                                {/* 🏷️ LABEL */}
                                <p className="text-sm uppercase text-gray-300">
                                  {k} 3.5
                                </p>

                                {/* 💰 CUOTA REAL */}
                                <p className="font-bold text-3xl">
                                  {odd?.odd ?? "-"}
                                </p>

                                {/* 🏦 BOOKMAKER */}
                                <p className="text-lg text-gray-300">
                                  {odd?.bookmaker ?? ""}
                                </p>

                                {/* 📊 FAIR ODDS + VALUE */}
                                <p
                                    className={`text-xs ${
                                      value !== null && value !== undefined && value < 0
                                        ? "text-red-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                    {value !== null && value !== undefined &&
                                      `(${formatValue(value)})`}
                                  </p>
                              </div>
                            );
                          })}
                        </div>
                    )}                    

                    {/* BTTS */}
                    {(marketFilter === "ALL" || marketFilter === "BTTS") &&
                      match.markets?.BTTS && (
                        <div className="grid grid-cols-2 gap-2">
                          {(["yes", "no"] as const).map((k) => {
                            const odd = match.markets?.BTTS?.[k];

                            const value =
                              k === "yes"
                                ? match.market_values?.BTTS?.yes_value
                                : match.market_values?.BTTS?.no_value;

                            // 👉 FAIR ODDS
                            const fairOdd =
                              k === "yes"
                                ? match.extra_probabilities?.btts_yes_prob
                                  ? 1 / match.extra_probabilities.btts_yes_prob
                                  : null
                                : match.extra_probabilities?.btts_no_prob
                                ? 1 / match.extra_probabilities.btts_no_prob
                                : null;

                            return (
                              <div
                                key={k}
                                onClick={() =>
                                  setPendingBet({
                                    match: `${match.home_team} vs ${match.away_team}`,
                                    market: "BTTS",
                                    selection: k,
                                    odd: odd?.odd,
                                    bookmaker: odd?.bookmaker,
                                    value,
                                    fixture_id: match.fixture_id,
                                    status: "pending",
                                    date: match.date
                                  })
                                }
                                className={`${getValueColor(
                                  value
                                )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                              >
                                {/* 🏷️ LABEL */}
                                <p className="text-sm uppercase text-gray-300">
                                  BTTS {k}
                                </p>

                                {/* 💰 CUOTA REAL */}
                                <p className="font-bold text-3xl">
                                  {odd?.odd ?? "-"}
                                </p>

                                {/* 🏦 BOOKMAKER */}
                                <p className="text-lg text-gray-300">
                                  {odd?.bookmaker ?? ""}
                                </p>

                                {/* 📊 FAIR + VALUE */}
                                <p
                                    className={`text-xs ${
                                      value !== null && value !== undefined && value < 0
                                        ? "text-red-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                    {value !== null && value !== undefined &&
                                      `(${formatValue(value)})`}
                                  </p>
                              </div>
                            );
                          })}
                        </div>
                    )}                    
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      ))}

      {/* TEAM MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] md:w-[500px] text-white">
            <div className="flex justify-between mb-4">
              <h2>{selectedTeam}</h2>
              <button onClick={() => setSelectedTeam(null)}>✖</button>
            </div>

            {teamMatches.map((m, i) => (
              <div key={i} className="bg-[#2a2a2a] p-3 rounded mb-2">
                <div className="flex justify-between">
                  <span>{m.home}</span>
                  <span className={getResultColor(m, selectedTeam)}>
                    {m.home_goals} - {m.away_goals}
                  </span>
                  <span>{m.away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TopValueModal
        open={showTopModal}
        onClose={() => setShowTopModal(false)}
      />
      <BetsModal
        open={showBetsModal}
        onClose={() => setShowBetsModal(false)}
        bets={bets}
      />

      {pendingBet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[90%] md:w-[420px] shadow-lg">

            {/* TITLE */}
            <h2 className="text-xl font-bold text-center mb-4">
              Confirmar apuesta
            </h2>

            {/* INFO */}
            <div className="bg-[#2a2a2a] p-4 rounded-lg text-center space-y-2">

              <p className="text-lg font-semibold">
                {pendingBet.match}
              </p>

              <p className="text-sm text-gray-400">
                {pendingBet.market} — {pendingBet.selection.toUpperCase()}
              </p>

              <p className="text-3xl font-bold">
                {pendingBet.odd ?? "-"}
              </p>

              {pendingBet.bookmaker && (
                <p className="text-sm text-gray-400">
                  {pendingBet.bookmaker}
                </p>
              )}

              {pendingBet.value !== null && pendingBet.value !== undefined && (
                <p className="text-green-400 font-bold">
                  {formatValue(pendingBet.value)}
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-5">

              <button
                onClick={() => setPendingBet(null)}
                className="flex-1 bg-gray-600 py-2 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  addBet(pendingBet);
                  setPendingBet(null);
                }}
                className="flex-1 bg-green-600 py-2 rounded-lg font-bold"
              >
                Confirmar
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}