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

type LeagueGroups = {
  [group: string]: {
    [leagueId: string]: string;
  };
};

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

export default function StandingsView() {
  const [isMobile, setIsMobile] = useState(false);

  const [leagueGroups, setLeagueGroups] = useState<LeagueGroups>({});
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  const [table, setTable] = useState<Team[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (!apiUrl) return;

    fetch(`${apiUrl}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueGroups(
          data.league_groups || {}
        );

      });

  }, []);

  useEffect(() => {
      if (!apiUrl || !selectedLeagueId) return;

      fetch(`${apiUrl}/standings/${selectedLeagueId}`)
      .then((res) => res.json())
      .then(setTable);
  }, [selectedLeagueId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">

      {/* SIDEBAR */}
      <div className="w-full md:w-52 bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
        <h2 className="mb-3 text-sm font-bold text-[var(--primary)]">
          🏆 {t.leagues}
        </h2>

        {/* 📱 SELECTOR MÓVIL */}
        <div className="md:hidden mb-4">

          <select
            value={selectedLeagueId ?? ""}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedLeagueId(
                value ? Number(value) : null
              );
            }}
            className="
              w-full
              p-3
              rounded-lg
              bg-[var(--card)]
              border
              border-[var(--border)]
              text-[var(--text)]
              text-sm
              font-medium
            "
          >

            <option value="">
              🏆 {t.selectLeague}
            </option>

            {Object.entries(
              leagueGroups
            ).map(
              ([groupName, leagues]) => (

                <optgroup
                  key={groupName}
                  label={
                    groupName === "Europe"
                      ? "🌍 Europe"
                      : groupName === "America"
                        ? "🌎 America"
                        : groupName === "International"
                          ? "🌐 International"
                          : groupName
                  }
                >

                  {Object.entries(
                    leagues
                  ).map(
                    ([id, name]) => (

                      <option
                        key={id}
                        value={id}
                      >
                        {name}
                      </option>

                    )
                  )}

                </optgroup>

              )
            )}

          </select>

        </div>

        <div className="hidden md:block space-y-4">

          {Object.entries(
            leagueGroups
          ).map(
            ([groupName, leagues]) => (

              <div key={groupName}>

                <h3 className="font-semibold text-sm mb-2 text-[var(--muted)]">

                  {groupName === "Europe" && "🌍"}
                  {groupName === "America" && "🌎"}
                  {groupName === "International" && "🌐"}

                  {" "}
                  {groupName}

                </h3>

                <div className="space-y-1">

                  {Object.entries(
                    leagues
                  ).map(
                    ([id, name]) => (

                      <div
                        key={id}
                        onClick={() =>
                          setSelectedLeagueId(
                            Number(id)
                          )
                        }
                        className={`px-3 py-2 text-sm rounded cursor-pointer ${
                          selectedLeagueId === Number(id)
                            ? "bg-[var(--primary)] text-white"
                            : "hover:bg-[var(--hover)]"
                        }`}
                      >
                        {name}
                      </div>

                    )
                  )}

                </div>

              </div>

            )
          )}

        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 w-full">

        {table.length > 0 && (
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">

            {!isMobile ? (
              // ================= DESKTOP =================
              <div className="overflow-x-auto">
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
            ) : (
              // ================= MOBILE =================
              <div className="overflow-x-auto">
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
            )}

          </div>
        )}

        {!selectedLeagueId && (
          <div className="text-center text-sm text-[var(--muted)] mt-10">
            {t.selectLeague}
          </div>
        )}
      </div>
    </div>
  );
}