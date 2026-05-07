"use client";

import { useEffect, useState } from "react";

import { TeamStats } from "@/types/stats";

import {
  StatBox,
} from "@/components/ui/match-ui";

type TeamMatch = {
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
};

type Props = {
  teamId: number | null;
  teamName: string | null;
  apiUrl: string;
  onClose: () => void;
};

export default function TeamModal({
  teamId,
  teamName,
  apiUrl,
  onClose,
}: Props) {

  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [teamStats, setTeamStats] =
    useState<TeamStats | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const load = async () => {
      try {

        const resMatches = await fetch(
          `${apiUrl}/team/${teamId}/matches`
        );

        const matches =
          await resMatches.json();

        setTeamMatches(matches);

        const resStats = await fetch(
          `${apiUrl}/team-stats/${teamId}`
        );

        const stats =
          await resStats.json();

        setTeamStats(stats);

      } catch (err) {
        console.error(
          "TEAM MODAL ERROR",
          err
        );
      }
    };

    load();

  }, [teamId, apiUrl]);

  if (!teamId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] w-[95%] md:w-[600px] text-[var(--text)]">

        <div className="text-base md:text-lg">

          <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
            {teamName}
          </h2>

          <div className="space-y-1.5 mb-3">

            {[...teamMatches]
              .reverse()
              .map((m, i) => {

                const currentTeamId =
                  Number(teamId);

                const isHome =
                  Number(m.home_team_id)
                  === currentTeamId;

                const isAway =
                  Number(m.away_team_id)
                  === currentTeamId;

                const isWin =
                  (isHome &&
                    m.home_goals > m.away_goals)
                  ||
                  (isAway &&
                    m.away_goals > m.home_goals);

                const isDraw =
                  m.home_goals === m.away_goals;

                const isLost =
                  (isHome &&
                    m.home_goals < m.away_goals)
                  ||
                  (isAway &&
                    m.away_goals < m.home_goals);

                return (
                  <div
                    key={i}
                    className="grid grid-cols-3 items-center text-base md:text-lg border-b border-[var(--border)] py-1"
                  >

                    <span className="text-base md:text-lg text-right pr-2 truncate">
                      {m.home}
                    </span>

                    <span
                      className="text-center text-lg md:text-xl font-bold px-2 py-1"
                      style={{
                        color:
                          isWin
                            ? "var(--success)"
                            : isDraw
                            ? "var(--warning)"
                            : isLost
                            ? "var(--danger)"
                            : "var(--text)"
                      }}
                    >
                      {m.home_goals}
                      {" - "}
                      {m.away_goals}
                    </span>

                    <span className="text-base md:text-lg text-left pr-2 truncate">
                      {m.away}
                    </span>

                  </div>
                );
              })}
          </div>

          {teamStats && (
            <div className="border-t border-[var(--border)] pt-4">

              <div className="grid grid-cols-3 gap-4 text-center">

                <StatBox
                  label="Partidos"
                  value={teamStats.matches}
                />

                <StatBox
                  label="Goles"
                  value={teamStats.avg_goals_scored}
                />

                <StatBox
                  label="Encajados"
                  value={teamStats.avg_goals_conceded}
                />

                <StatBox
                  label="Victorias"
                  value={`${teamStats.results.win}%`}
                />

                <StatBox
                  label="Empates"
                  value={`${teamStats.results.draw}%`}
                />

                <StatBox
                  label="Derrotas"
                  value={`${teamStats.results.loss}%`}
                />

                <StatBox
                  label="BTTS"
                  value={`${teamStats.markets.btts}%`}
                />

                <StatBox
                  label="Over 2.5"
                  value={`${teamStats.markets.over_2_5}%`}
                />

                <StatBox
                  label="Over 3.5"
                  value={`${teamStats.markets.over_3_5}%`}
                />

              </div>

            </div>
          )}

          <button
            onClick={onClose}
            className="mt-5 w-full bg-[var(--card)] border border-[var(--border)] py-2 rounded hover:opacity-80"
          >
            Cerrar
          </button>

        </div>

      </div>

    </div>
  );
}