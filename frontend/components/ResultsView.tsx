"use client";

import { useEffect, useState } from "react";
// import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  const { t } = useLanguage();
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
    const round = match.round || t.noRound;

    if (!acc[round]) acc[round] = [];

    acc[round].push(match);

    return acc;
  }, {} as Record<string, Match[]>);

  // ---------------- ORDENAR ----------------

  const sortedRounds = Object.keys(groupedByRound).sort((a, b) => {
    return getRoundNumber(b) - getRoundNumber(a); // 🔥 inverso
  });

  // ---------------- JORNADA ACTUAL ----------------

  // ---------------- UI ----------------

return (
  <div className="flex flex-col md:flex-row gap-4 w-full">

    {/* 🏆 LIGAS */}
    <div className="w-full md:w-52 bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">

      <h2 className="mb-3 font-bold text-[var(--primary)] text-sm">🏆 {t.leagues}</h2>

      {/* 🔥 WRAP en vez de scroll */}
      <div className="flex flex-wrap md:block gap-2">

        {leagues.map((l) => (
          <div
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`p-2 px-3 text-sm rounded cursor-pointer transition ${
              selectedLeague === l
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] hover:bg-[var(--hover)]"
            }`}
          >
            {l}
          </div>
        ))}

      </div>
    </div>

    {/* 📊 RESULTADOS */}
    <div className="flex-1 w-full">

      {!selectedLeague && (
        <div className="text-center text-[var(--muted)] text-sm mt-10">
          {t.selectLeague}
        </div>
      )}

      {selectedLeague && matches.length === 0 && (
        <div className="text-center text-[var(--muted)] text-sm mt-10">
          {t.noResults}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

        {sortedRounds.map((round) => (
          <div
            key={round}
            className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] shadow-md"
          >

            <h3 className="text-sm font-semibold text-[var(--primary)] mb-2">
              {t.round} {getRoundNumber(round)}
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
                          ? "bg-[var(--warning)]/20 border border-[var(--warning)]"
                          : "bg-[var(--hover)]"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        {/* HOME */}
                        <span
                          className={`flex-1 truncate ${
                            isHomeWin ? "font-semibold text-[var(--success)]" : ""
                          }`}
                        >
                          {m.home_team}
                        </span>

                        {/* RESULT */}
                        <span className="flex-shrink-0 px-2 font-bold text-[var(--text)]">
                          {m.home_goals}-{m.away_goals}
                        </span>

                        {isToday(m.date) && (
                          <span className="text-xs text-[var(--warning)] ml-2">
                            {t.today}
                          </span>
                        )}

                        {/* AWAY */}
                        <span
                          className={`flex-1 text-right truncate ${
                            isAwayWin ? "font-semibold text-[var(--success)]" : ""
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