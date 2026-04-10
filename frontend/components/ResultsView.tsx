"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

// ---------------- TYPES ----------------

type Match = {
  id: number;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  league: string;
  date: string;
  round: string;
};

// ---------------- COMPONENT ----------------

export default function ResultsView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({});

  // ---------------- FETCH LIGAS ----------------

  useEffect(() => {
    fetch(`${API_URL}/leagues`)
      .then((res) => res.json())
      .then(setLeagues);
  }, []);

  // ---------------- FETCH PARTIDOS ----------------

  useEffect(() => {
    if (!selectedLeague) return;

    fetch(`${API_URL}/results/${selectedLeague}`)
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);

        // 🔥 abrir todas las jornadas por defecto
        // const rounds = Array.from(new Set(data.map((m: Match) => m.round)));
        const rounds: string[] = Array.from(
            new Set(
                data
                .map((m: Match) => m.round)
                .filter((r): r is string => Boolean(r))
            )
        );
        const initial: Record<string, boolean> = {};
        rounds.forEach((r) => (initial[r] = true));
        setOpenRounds(initial);
      });
  }, [selectedLeague]);

  // ---------------- HELPERS ----------------

  const toggleRound = (round: string) => {
    setOpenRounds((prev) => ({
      ...prev,
      [round]: !prev[round],
    }));
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  // ---------------- AGRUPAR ----------------

  const groupedByRound = matches.reduce((acc, match) => {
    const round = match.round || "Sin jornada";

    if (!acc[round]) acc[round] = [];

    acc[round].push(match);

    return acc;
  }, {} as Record<string, Match[]>);

  // ---------------- ORDENAR ----------------

  const sortedRounds = Object.keys(groupedByRound).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
    return numA - numB;
  });

  // ---------------- UI ----------------

  return (
    <div className="flex gap-6">

      {/* 🏆 SIDEBAR LIGAS */}
      <div className="w-60 bg-[#1f2937] p-4 rounded-xl h-fit">
        <h2 className="mb-4 font-bold text-cyan-400">🏆 Ligas</h2>

        {leagues.map((l) => (
          <div
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`p-2 rounded cursor-pointer ${
              selectedLeague === l
                ? "bg-cyan-600"
                : "hover:bg-[#2a2a2a]"
            }`}
          >
            {l}
          </div>
        ))}
      </div>

      {/* 📊 RESULTADOS */}
      <div className="flex-1">

        {/* {!selectedLeague && (
          <p className="text-gray-400">Selecciona una liga</p>
        )} */}

        {sortedRounds.map((round) => (
          <div
            key={round}
            className="bg-[#1f2937] rounded-xl p-4 mb-6 border border-[#333]"
          >

            {/* 🏆 HEADER */}
            <div
              onClick={() => toggleRound(round)}
              className="flex justify-between items-center cursor-pointer"
            >
              <h3 className="text-lg font-bold text-cyan-400">
                {openRounds[round] ? "▼" : "▶"} {round}
              </h3>

              <span className="text-sm text-gray-400">
                {groupedByRound[round].length} partidos
              </span>
            </div>

            {/* 📦 PARTIDOS */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openRounds[round]
                  ? "max-h-[2000px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-2">

                {groupedByRound[round]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() -
                      new Date(b.date).getTime()
                  )
                  .map((m) => {
                    const isHomeWin = m.home_goals > m.away_goals;
                    const isAwayWin = m.away_goals > m.home_goals;
                    const isDraw = m.home_goals === m.away_goals;

                    return (
                      <div
                        key={m.id}
                        className="bg-[#2a2a2a] p-3 rounded-lg flex justify-between items-center"
                      >

                        {/* HOME */}
                        <span
                          className={`w-1/3 text-left ${
                            isHomeWin ? "text-green-400 font-bold" : ""
                          }`}
                        >
                          {m.home_team}
                        </span>

                        {/* RESULT */}
                        <span
                          className={`w-1/3 text-center font-bold text-lg ${
                            isDraw
                              ? "text-yellow-400"
                              : isHomeWin
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {m.home_goals} - {m.away_goals}
                        </span>

                        {/* AWAY */}
                        <span
                          className={`w-1/3 text-right ${
                            isAwayWin ? "text-green-400 font-bold" : ""
                          }`}
                        >
                          {m.away_team}
                        </span>

                        {/* 📅 FECHA */}
                        <span className="absolute right-4 text-xs text-gray-400">
                          {formatDate(m.date)}
                        </span>

                      </div>
                    );
                  })}

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}