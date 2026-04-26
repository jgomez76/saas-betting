"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  const { t } = useLanguage();

  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/leagues-selected`)
      .then((res) => res.json())
      .then(setLeagues);
  }, []);

  useEffect(() => {
    if (!apiUrl || !selectedLeague) return;

    fetch(`${apiUrl}/standings/${selectedLeague}`)
      .then((res) => res.json())
      .then(setTable);
  }, [selectedLeague]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">

      {/* SIDEBAR */}
      <div className="w-full md:w-52 bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
        <h2 className="mb-3 text-sm font-bold text-[var(--primary)]">
          🏆 {t.leagues}
        </h2>

        <div className="flex flex-wrap md:block gap-2">
          {leagues.map((l) => (
            <div
              key={l}
              onClick={() => setSelectedLeague(l)}
              className={`px-3 py-2 text-sm rounded cursor-pointer ${
                selectedLeague === l
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-[var(--hover)]"
              }`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 w-full">

        {table.length > 0 && (
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">

            {/* ================= DESKTOP ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-[var(--hover)] text-[var(--muted)] text-xs">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">{t.team}</th>
                    <th className="text-center">{t.played}</th>
                    <th className="text-center">{t.wins}</th>
                    <th className="text-center">{t.draws}</th>
                    <th className="text-center">{t.losses}</th>
                    <th className="text-center">{t.goals}</th>
                    <th className="text-center">{t.goalDiff}</th>
                    <th className="text-center">{t.points}</th>
                  </tr>
                </thead>

                <tbody>
                  {table.map((team, i) => (
                    <tr
                      key={team.team}
                      className="border-t border-[var(--border)] hover:bg-[var(--hover)] transition"
                    >
                      <td className="px-2 py-2">{i + 1}</td>
                      <td className="px-2 py-2 font-medium truncate">
                        {team.team}
                      </td>

                      <td className="text-center">{team.played}</td>
                      <td className="text-center">{team.wins}</td>
                      <td className="text-center">{team.draws}</td>
                      <td className="text-center">{team.losses}</td>

                      <td className="text-center text-[var(--muted)]">
                        {team.gf}:{team.ga}
                      </td>

                      <td className="text-center">
                        {team.gf - team.ga}
                      </td>

                      <td className="text-center font-bold">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-[var(--hover)] text-[var(--muted)] text-xs">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">{t.team}</th>
                    <th className="text-center">{t.played}</th>
                    <th className="text-center">{t.goals}</th>
                    <th className="text-center">{t.points}</th>
                  </tr>
                </thead>

                <tbody>
                  {table.map((team, i) => (
                    <tr
                      key={team.team}
                      className="border-t border-[var(--border)] hover:bg-[var(--hover)] transition"
                    >
                      <td className="px-2 py-2">{i + 1}</td>

                      <td className="px-2 py-2 font-medium truncate max-w-[120px]">
                        {team.team}
                      </td>

                      <td className="text-center">{team.played}</td>

                      <td className="text-center text-[var(--muted)]">
                        {team.gf}:{team.ga}
                      </td>

                      <td className="text-center font-bold">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        )}

        {table.length === 0 && (
          <div className="text-center text-sm text-[var(--muted)] mt-10">
            {t.selectLeague}
          </div>
        )}
      </div>
    </div>
  );
}