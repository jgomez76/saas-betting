"use client";

import { useEffect, useState } from "react";
// import { API_URL } from "@/lib/api";

type Team = {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
};

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

export default function StandingsView() {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [table, setTable] = useState<Team[]>([]);

  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/leagues-selected`)
      .then((res) => res.json())
      .then(setLeagues);
  }, []);

  useEffect(() => {
    if (!apiUrl) return;
    if (!selectedLeague) return;

    fetch(`${apiUrl}/standings/${selectedLeague}`)
      .then((res) => res.json())
      .then(setTable);
  }, [selectedLeague]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">

      {/* 🏆 SIDEBAR */}
      <div className="w-full md:w-52 bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
        <h2 className="mb-3 text-sm font-bold text-[var(--primary)]">🏆 Ligas</h2>

        <div className="flex flex-wrap md:block gap-2">
          {leagues.map((l) => (
            <div
              key={l}
              onClick={() => setSelectedLeague(l)}
              className={`px-3 py-2 text-sm rounded cursor-pointer ${
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

      {/* 📊 CLASIFICACIÓN */}
      <div className="flex-1 w-full">

        {table.length > 0 && (
          <div className="bg-[var(--card)] rounded-lg p-3 border border-[var(--border)] w-full">

            <h2 className="text-sm font-bold mb-3 text-[var(--primary)]">
              Clasificación
            </h2>

            {/* 🏷 HEADER */}
            <div className="grid grid-cols-[30px_1fr_40px_70px_40px] text-xs text-[var(--muted)] mb-2 px-2">
              <span>#</span>
              <span>Equipo</span>
              <span className="text-center">PJ</span>
              <span className="text-center">Goles</span>
              <span className="text-center">Pts</span>
            </div>

            {/* 📊 FILAS */}
            <div className="flex flex-col gap-1">

              {table.map((t, i) => (
                <div
                  key={t.team}
                  className="grid grid-cols-[30px_1fr_40px_70px_40px] items-center bg-[var(--hover)] rounded px-2 py-2 text-xs"
                >
                  {/* POS */}
                  <span
                    className={`
                      text-center
                      ${i < 4 ? "text-[var(--success)] font-semibold" : ""}
                      ${i >= table.length - 3 ? "text-[var(--danger)] font-semibold" : ""}
                    `}
                  >
                    {i + 1}
                  </span>

                  {/* EQUIPO */}
                  <span className="truncate">
                    {t.team}
                  </span>

                  {/* PJ */}
                  <span className="text-center text-[var(--muted)]">
                    {t.played}
                  </span>

                  {/* GOLES */}
                  <span className="text-center text-[var(--muted)]">
                    {t.gf}:{t.ga}
                  </span>

                  {/* PTS */}
                  <span className="text-center font-bold text-[var(--text)]">
                    {t.points}
                  </span>
                </div>
              ))}

            </div>

          </div>
        )}
      </div>
    </div>
  );
}