"use client";

import { useEffect, useState } from "react";
// import { API_URL } from "@/lib/api";

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

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";
// ---------------- COMPONENT ----------------

export default function ResultsView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<string[]>([]);

  // ---------------- FETCH LIGAS ----------------

  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/leagues-selected`)
      .then((res) => res.json())
      .then(setLeagues);
  }, []);

  // ---------------- FETCH PARTIDOS ----------------

  useEffect(() => {
    if (!apiUrl) return;
    if (!selectedLeague) return;

    fetch(`${apiUrl}/results/${selectedLeague}`)
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);
      });
  }, [selectedLeague]);

  // ---------------- HELPERS ----------------

  const getRoundNumber = (round: string) =>
    parseInt(round.match(/\d+/)?.[0] || "0");

  const isToday = (date: string) => {
    const d = new Date(date);
    const now = new Date();

    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
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
    return getRoundNumber(b) - getRoundNumber(a); // 🔥 inverso
  });

  // ---------------- JORNADA ACTUAL ----------------

  const currentRound =
    matches.length > 0
      ? Math.max(...matches.map((m) => getRoundNumber(m.round)))
      : 0;

  // ---------------- UI ----------------

  // return (
  //   <div className="flex gap-6">

  //     {/* 🏆 SIDEBAR */}
  //     <div className="w-52 bg-[#1f2937] p-3 rounded-lg h-fit border border-[#333]">
  //       <h2 className="mb-3 font-bold text-cyan-400 text-sm">🏆 Ligas</h2>

  //       {leagues.map((l) => (
  //         <div
  //           key={l}
  //           onClick={() => setSelectedLeague(l)}
  //           className={`p-2 text-sm rounded cursor-pointer transition ${
  //             selectedLeague === l
  //               ? "bg-cyan-600"
  //               : "hover:bg-[#2a2a2a]"
  //           }`}
  //         >
  //           {l}
  //         </div>
  //       ))}
  //     </div>

  //     {/* 📊 RESULTADOS */}
  //     <div className="flex-1">

  //       {/* {!selectedLeague && (
  //         <p className="text-gray-400 text-sm">
  //           Selecciona una liga
  //         </p>
  //       )} */}

  //       {/* 🔥 GRID DE JORNADAS */}
  //       <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

  //         {sortedRounds.map((round) => (
  //           <div
  //             key={round}
  //             className={`rounded-lg p-3 border ${
  //               getRoundNumber(round) === currentRound
  //                 ? "bg-cyan-900 border-cyan-500"
  //                 : "bg-cyan-900 border-cyan-500"
  //             }`}
  //           >

  //             {/* 🏆 HEADER */}
  //             <h3 className="text-xs font-semibold text-cyan-400 mb-2">
  //               Jornada {getRoundNumber(round)}
  //             </h3>

  //             {/* 📦 PARTIDOS */}
  //             <div className="flex flex-col gap-2">

  //               {groupedByRound[round]
  //                 .sort(
  //                   (a, b) =>
  //                     new Date(a.date).getTime() -
  //                     new Date(b.date).getTime()
  //                 )
  //                 .map((m) => {
  //                   const isHomeWin = m.home_goals > m.away_goals;
  //                   const isAwayWin = m.away_goals > m.home_goals;
  //                   const isDraw = m.home_goals === m.away_goals;

  //                   return (
  //                     <div
  //                       key={m.id}
  //                       className={`px-3 py-2 rounded-md text-xs relative ${
  //                         isToday(m.date)
  //                           ? "bg-yellow-900 border border-yellow-500"
  //                           : "bg-[#2a2a2a]"
  //                       }`}
  //                     >
  //                       {/* 🔥 HOY */}
  //                       {/* {isToday(m.date) && (
  //                         <span className="absolute left-2 top-1 text-[10px] text-yellow-400">
  //                           HOY
  //                         </span>
  //                       )} */}

  //                       <div className="flex items-center w-full">

  //                         {/* HOME */}
  //                         <span
  //                           className={`w-2/5 truncate ${
  //                             isHomeWin ? "text-white-400 font-semibold" : ""
  //                           }`}
  //                         >
  //                           {m.home_team}
  //                         </span>

  //                         {/* RESULT */}
  //                         <span
  //                           className={`w-1/5 text-center font-bold ${
  //                             isDraw
  //                               ? "text-white-400"
  //                               : isHomeWin
  //                               ? "text-white-400"
  //                               : "text-white-400"
  //                           }`}
  //                         >
  //                           {m.home_goals}-{m.away_goals}
  //                         </span>

  //                         {/* AWAY */}
  //                         <span
  //                           className={`w-2/5 text-right truncate ${
  //                             isAwayWin ? "text-white-400 font-semibold" : ""
  //                           }`}
  //                         >
  //                           {m.away_team}
  //                         </span>
  //                       </div>
  //                     </div>
  //                   );
  //                 })}

  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
return (
  <div className="flex flex-col md:flex-row gap-4 w-full">

    {/* 🏆 LIGAS */}
    <div className="w-full md:w-52 bg-[#1f2937] p-3 rounded-lg border border-[#333]">

      <h2 className="mb-3 font-bold text-cyan-400 text-sm">🏆 Ligas</h2>

      {/* 🔥 WRAP en vez de scroll */}
      <div className="flex flex-wrap gap-2">

        {leagues.map((l) => (
          <div
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`p-2 px-3 text-sm rounded cursor-pointer transition ${
              selectedLeague === l
                ? "bg-cyan-600"
                : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            }`}
          >
            {l}
          </div>
        ))}

      </div>
    </div>

    {/* 📊 RESULTADOS */}
    <div className="flex-1 w-full">

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

        {sortedRounds.map((round) => (
          <div
            key={round}
            className="rounded-xl p-3 bg-[#0f172a] border border-cyan-500 shadow-md"
          >

            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
              Jornada {getRoundNumber(round)}
            </h3>

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

                  return (
                    <div
                      key={m.id}
                      className={`px-3 py-2 rounded-md text-sm ${
                        isToday(m.date)
                          ? "bg-yellow-900 border border-yellow-500"
                          : "bg-[#2a2a2a]"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        {/* HOME */}
                        <span
                          className={`flex-1 truncate ${
                            isHomeWin ? "font-semibold text-green-400" : ""
                          }`}
                        >
                          {m.home_team}
                        </span>

                        {/* RESULT */}
                        <span className="flex-shrink-0 px-2 font-bold text-white">
                          {m.home_goals}-{m.away_goals}
                        </span>

                        {/* AWAY */}
                        <span
                          className={`flex-1 text-right truncate ${
                            isAwayWin ? "font-semibold text-green-400" : ""
                          }`}
                        >
                          {m.away_team}
                        </span>

                      </div>

                    </div>
                  );
                })}

            </div>
          </div>
        ))}

      </div>
    </div>

  </div>
);
}