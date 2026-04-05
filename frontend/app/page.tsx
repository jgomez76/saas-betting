"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TopValueModal from "@/components/TopValueModal";
import { API_URL } from "@/lib/api";

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

type MarketValues = {
  OU25?: {
    over_value: number | null;
    under_value: number | null;
  };
  BTTS?: {
    yes_value: number | null;
    no_value: number | null;
  };
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

  market_values?: MarketValues;

  home_form?: string;
  away_form?: string;
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [marketFilter, setMarketFilter] = useState("ALL");

  const [showTopModal, setShowTopModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/value-bets`);
      const data = await res.json();

      // ❗ nunca mostrar partidos sin odds
      const filtered = data.filter((m: Match) => m.markets?.["1X2"]);

      setMatches(filtered);
      setLoading(false);
    };

    load();
  }, []);

  // -----------------------
  // TEAM MODAL
  // -----------------------
  const openTeamModal = async (team: string) => {
    setSelectedTeam(team);

    const res = await fetch(`${API_URL}/team/${team}/matches`);
    const data: TeamMatch[] = await res.json();

    console.log("TEAM MATCHES RAW:", data);

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

  const formatValue = (v: number | null | undefined) => {
    if (v === null || v === undefined) return null;
    return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  const renderForm = (form: string) => (
    <div className="flex justify-center gap-1 mt-1">
      {form.split("").map((f, i) => {
        let color = "bg-gray-500";
        if (f === "W") color = "bg-green-500";
        if (f === "D") color = "bg-yellow-400";
        if (f === "L") color = "bg-red-500";

        return (
          <span key={i} className={`text-white text-xs px-1 rounded ${color}`}>
            {f}
          </span>
        );
      })}
    </div>
  );

  // -----------------------
  // LOADING
  // -----------------------
  if (loading) {
    return (
      <main className="p-6 bg-gray-100 min-h-screen">
        <p className="text-center text-lg font-semibold mb-4">
          ⏳ Cargando próximos partidos...
        </p>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-300 mb-3 rounded"></div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <main className="p-6 bg-gray-100 min-h-screen">

      <Navbar
        onOpenTop={() => setShowTopModal(true)}
        marketFilter={marketFilter}
        setMarketFilter={setMarketFilter}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match, index) => {

          const dateObj = new Date(match.date + "Z");

          const formattedTime = dateObj.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid",
          });

          return (
            <div key={index} className="bg-[#1e1e1e] text-white p-4 rounded-xl">

              {/* TEAMS */}
              <div className="grid text-center mb-3" style={{ gridTemplateColumns: "45% 10% 45%" }}>
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

              <p className="text-xs text-center mb-3 text-gray-400">
                {match.league} · {formattedTime}
              </p>

              {/* 1X2 */}
              {(marketFilter === "ALL" || marketFilter === "1X2") &&
                match.markets?.["1X2"] && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(["home","draw","away"] as const).map((k) => {
                      const odd = match.markets?.["1X2"]?.[k];
                      const value = match.value?.[`${k}_value` as keyof typeof match.value];

                      return (
                        <div key={k} className="bg-[#2a2a2a] p-2 rounded text-center">
                          <p>{k}</p>
                          <p className="font-bold">{odd?.odd ?? "-"}</p>
                          {value !== null && value !== undefined && (
                            <p className="text-xs">{formatValue(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
              )}

              {/* OU25 */}
              {(marketFilter === "ALL" || marketFilter === "OU25") &&
                match.markets?.OU25 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(["over","under"] as const).map((k) => {
                      const odd = match.markets?.OU25?.[k];
                      const value =
                        k === "over"
                          ? match.market_values?.OU25?.over_value
                          : match.market_values?.OU25?.under_value;

                      return (
                        <div key={k} className="bg-[#2a2a2a] p-2 rounded text-center">
                          <p>{k} 2.5</p>
                          <p className="font-bold">{odd?.odd ?? "-"}</p>
                          {value !== null && value !== undefined && (
                            <p className="text-xs">{formatValue(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
              )}

              {/* BTTS */}
              {(marketFilter === "ALL" || marketFilter === "BTTS") &&
                match.markets?.BTTS && (
                  <div className="grid grid-cols-2 gap-2">
                    {(["yes","no"] as const).map((k) => {
                      const odd = match.markets?.BTTS?.[k];
                      const value =
                        k === "yes"
                          ? match.market_values?.BTTS?.yes_value
                          : match.market_values?.BTTS?.no_value;

                      return (
                        <div key={k} className="bg-[#2a2a2a] p-2 rounded text-center">
                          <p>BTTS {k}</p>
                          <p className="font-bold">{odd?.odd ?? "-"}</p>
                          {value !== null && value !== undefined && (
                            <p className="text-xs">{formatValue(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
              )}

            </div>
          );
        })}
      </div>

      {/* MODALS */}
      <TopValueModal open={showTopModal} onClose={() => setShowTopModal(false)} />

      {selectedTeam && (
        // <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
        //   <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] md:w-[500px] text-white">
        //     <div className="flex justify-between mb-4">
        //       <h2>{selectedTeam}</h2>
        //       <button onClick={() => setSelectedTeam(null)}>✖</button>
        //     </div>

        //     {teamMatches.map((m, i) => (
        //       // <div key={i} className="flex justify-between mb-2">
        //       //   <span>{m.home_team}</span>
        //       //   <span className={getResultColor(m, selectedTeam)}>
        //       //     {m.home_goals} - {m.away_goals}
        //       //   </span>
        //       //   <span>{m.away_team}</span>
        //       // </div>
        //       <div
        //         key={i}
        //         className="flex justify-between items-center mb-2 bg-[#2a2a2a] p-2 rounded text-white"
        //       >
        //         <span className="w-[40%] text-left font-semibold text-white">
        //           {m.home_team}
        //         </span>

        //         <span
        //           className={`w-[20%] text-center font-bold ${getResultColor(
        //             m,
        //             selectedTeam
        //           )}`}
        //         >
        //           {m.home_goals} - {m.away_goals}
        //         </span>

        //         <span className="w-[40%] text-right font-semibold text-white">
        //           {m.away_team}
        //         </span>
        //       </div>
        //     ))}
        //   </div>
        // </div>
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] md:w-[500px]">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">
                Últimos partidos - {selectedTeam}
              </h2>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-white text-lg"
              >
                ✖
              </button>
            </div>

            {/* LIST */}
            <div className="space-y-2">
              {teamMatches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#2a2a2a] p-3 rounded"
                >
                  {/* HOME */}
                  <span
                    style={{ color: "#ffffff" }}
                    className="w-[40%] text-left font-semibold"
                  >
                    {m.home || "—"}
                  </span>

                  {/* SCORE */}
                  <span
                    className={`w-[20%] text-center font-bold ${getResultColor(
                      m,
                      selectedTeam
                    )}`}
                  >
                    {m.home_goals ?? "-"} - {m.away_goals ?? "-"}
                  </span>

                  {/* AWAY */}
                  <span
                    style={{ color: "#ffffff" }}
                    className="w-[40%] text-right font-semibold"
                  >
                    {m.away || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}