"use client";

import { useEffect, useState } from "react";

type H2HAnalysis = {

  team1: string;
  team2: string;

  matches: number;

  team1_wins: number;
  team2_wins: number;

  draws: number;

  btts: number;

  over25: number;

  avg_goals: number;

  recent_matches: {

    date: string;

    home_team: string;
    away_team: string;

    home_goals: number;
    away_goals: number;

  }[];
};

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

export default function H2HAnalysisTab() {

  const [leagueTeams, setLeagueTeams] =
    useState<Record<string, string[]>>({});

  const [selectedLeague, setSelectedLeague] =
    useState("");

  const [team1, setTeam1] =
    useState("");

  const [team2, setTeam2] =
    useState("");

  const [analysis, setAnalysis] =
    useState<H2HAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  // ---------------- METADATA ----------------

  useEffect(() => {

    fetch(`${apiUrl}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueTeams(
          data.league_teams || {}
        );

      });

  }, []);

  // ---------------- ANALYSIS ----------------

  useEffect(() => {

    if (!team1 || !team2) {
      return;
    }

    if (team1 === team2) {
      return;
    }

    const load = async () => {

      setLoading(true);

      try {

        const res = await fetch(

          `${apiUrl}/analysis/h2h?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`

        );

        const data = await res.json();

        setAnalysis(data);

      } finally {

        setLoading(false);

      }
    };

    load();

  }, [
    team1,
    team2,
  ]);

  // ---------------- UI ----------------

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold">
          ⚔️ H2H Analysis
        </h2>

        <p className="text-sm text-[var(--muted)] mt-1">
          Head to head statistics and trends
        </p>

      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-3 gap-3">

        {/* LEAGUE */}
        <select
          value={selectedLeague}
          onChange={(e) => {

            setSelectedLeague(
              e.target.value
            );

            setTeam1("");
            setTeam2("");

          }}
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
        >

          <option value="">
            Select league
          </option>

          {Object.keys(leagueTeams).map((league) => (

            <option
              key={league}
              value={league}
            >
              {league}
            </option>

          ))}

        </select>

        {/* TEAM 1 */}
        <select
          value={team1}
          onChange={(e) =>
            setTeam1(
              e.target.value
            )
          }
          disabled={!selectedLeague}
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] disabled:opacity-50"
        >

          <option value="">
            Team 1
          </option>

          {(leagueTeams[selectedLeague] || []).map((team) => (

            <option
              key={team}
              value={team}
            >
              {team}
            </option>

          ))}

        </select>

        {/* TEAM 2 */}
        <select
          value={team2}
          onChange={(e) =>
            setTeam2(
              e.target.value
            )
          }
          disabled={!selectedLeague}
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] disabled:opacity-50"
        >

          <option value="">
            Team 2
          </option>

          {(leagueTeams[selectedLeague] || []).map((team) => (

            <option
              key={team}
              value={team}
            >
              {team}
            </option>

          ))}

        </select>

      </div>

      {/* LOADING */}
      {loading && (

        <div className="text-center text-[var(--muted)]">
          ⏳ Loading H2H analysis...
        </div>

      )}

      {/* ANALYSIS */}
      {analysis && !loading && (

        <>

          {/* HEADER */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">

            <h3 className="text-3xl font-bold">

              ⚔️ {analysis.team1}
              {" vs "}
              {analysis.team2}

            </h3>

            <p className="text-[var(--muted)] mt-2">

              {analysis.matches} historical matches

            </p>

          </div>

          {/* KPIS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

              <div className="text-xs text-[var(--muted)]">
                {analysis.team1} wins
              </div>

              <div className="text-3xl font-bold">
                {analysis.team1_wins}
              </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

              <div className="text-xs text-[var(--muted)]">
                Draws
              </div>

              <div className="text-3xl font-bold">
                {analysis.draws}
              </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

              <div className="text-xs text-[var(--muted)]">
                {analysis.team2} wins
              </div>

              <div className="text-3xl font-bold">
                {analysis.team2_wins}
              </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

              <div className="text-xs text-[var(--muted)]">
                Avg goals
              </div>

              <div className="text-3xl font-bold">
                {analysis.avg_goals}
              </div>

            </div>

          </div>

          {/* MARKET STATS */}
          <div className="grid md:grid-cols-2 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

              <div className="text-sm text-[var(--muted)] mb-2">
                BTTS
              </div>

              <div className="text-4xl font-bold">
                {analysis.btts}%
              </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

              <div className="text-sm text-[var(--muted)] mb-2">
                Over 2.5
              </div>

              <div className="text-4xl font-bold">
                {analysis.over25}%
              </div>

            </div>

          </div>

          {/* RECENT MATCHES */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h3 className="text-xl font-bold">
                  🕒 Recent H2H
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                  Latest historical clashes
                </p>

              </div>

            </div>

            <div className="space-y-3">

              {analysis.recent_matches.map((m, i) => (

                <div
                  key={i}
                  className="flex items-center justify-between bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4"
                >

                  <div className="text-sm text-[var(--muted)]">

                    {m.date}

                  </div>

                  <div className="font-semibold text-center">

                    {m.home_team}
                    {" "}
                    {m.home_goals}
                    {" - "}
                    {m.away_goals}
                    {" "}
                    {m.away_team}

                  </div>

                </div>

              ))}

            </div>

          </div>

        </>

      )}

    </div>
  );
}