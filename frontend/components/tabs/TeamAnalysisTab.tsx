"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type TeamAnalysis = {

  team: string;

  season: number;

  matches: number;

  wins: number;
  draws: number;
  losses: number;

  goals_scored: number;
  goals_conceded: number;

  avg_goals_scored: number;
  avg_goals_conceded: number;
  goals_timeline: {
    date: string;
    scored: number;
    conceded: number;
    }[];

  clean_sheets: number;

  btts: number;

  over25: number;

  over35: number;

  home_matches: number;
  away_matches: number;

  last_5: string;

  home: {

    matches: number;

    wins: number;

    goals_scored: number;
    goals_conceded: number;

    btts: number;

    over25: number;
  };

  away: {

    matches: number;

    wins: number;

    goals_scored: number;
    goals_conceded: number;

    btts: number;

    over25: number;
  };
};

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

export default function TeamAnalysisTab() {

  const [selectedTeam, setSelectedTeam] =
    useState("");

  const [selectedSeason, setSelectedSeason] =
    useState<number | "ALL">("ALL");

  const [analysis, setAnalysis] =
    useState<TeamAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [seasons, setSeasons] =
    useState<number[]>([]);

  const [selectedLeague, setSelectedLeague] =
    useState("");  

  const [leagueTeams, setLeagueTeams] =
    useState<Record<string, string[]>>({});

  // ---------------- FETCH FIXTURES ----------------

  useEffect(() => {

    if (!apiUrl) return;

    fetch(`${apiUrl}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueTeams(
        data.league_teams || {}
      );

        setSeasons(data.seasons || []);

      });

  }, []);
 
  // ---------------- FETCH ANALYSIS ----------------

    useEffect(() => {

    if (!selectedTeam) return;

    const loadAnalysis = async () => {

        setLoading(true);

        try {

        let url =
            `${apiUrl}/analysis/team?team=${encodeURIComponent(selectedTeam)}`;

        if (selectedSeason !== "ALL") {
            url += `&season=${selectedSeason}`;
        }

        const res = await fetch(url);

        const data = await res.json();

        setAnalysis(data);

        } finally {

        setLoading(false);

        }
    };

    loadAnalysis();

    }, [
    selectedTeam,
    selectedSeason,
    ]);
  // ---------------- LAST 5 ----------------

  const renderLast5 = () => {

    if (!analysis?.last_5) {
      return null;
    }

    return (
      <div className="flex gap-2">

        {analysis.last_5
          .split("")
          .map((r, i) => (

            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                r === "W"
                  ? "bg-[var(--success)] text-white"
                  : r === "L"
                  ? "bg-[var(--danger)] text-white"
                  : "bg-[var(--muted)] text-black"
              }`}
            >
              {r}
            </div>

          ))}

      </div>
    );
  };



  // ---------------- UI ----------------

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold">
          ⚽ Team Analysis
        </h2>

        <p className="text-sm text-[var(--muted)] mt-1">
          Historical team performance and trends
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

            setSelectedTeam("");
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

        {/* TEAM */}
        <select
          value={selectedTeam}
          onChange={(e) =>
            setSelectedTeam(
              e.target.value
            )
          }
          disabled={!selectedLeague}
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] disabled:opacity-50"
        >

          <option value="">
            Select team
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

        {/* SEASON */}
        <select
          value={selectedSeason}
          onChange={(e) =>
            setSelectedSeason(
              e.target.value === "ALL"
                ? "ALL"
                : Number(
                    e.target.value
                  )
            )
          }
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
        >

          <option value="ALL">
            All seasons
          </option>

          {seasons.map((season) => (

            <option
              key={season}
              value={season}
            >
              {season}
            </option>

          ))}

        </select>

      </div>

      {/* LOADING */}
      {loading && (

        <div className="text-center text-[var(--muted)]">
          ⏳ Loading analysis...
        </div>

      )}

      {/* ANALYSIS */}
      {analysis && !loading && (

        <>

          {/* TEAM HEADER */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">

            <div className="flex items-center justify-between flex-wrap gap-4">

                <div>

                <h3 className="text-3xl font-bold">
                    ⚽ {analysis.team}
                </h3>

                <p className="text-[var(--muted)] mt-1">
                    {analysis.matches} matches analyzed
                </p>

                </div>

                <div>

                <div className="text-sm text-[var(--muted)] mb-2">
                    Last 5
                </div>

                {renderLast5()}

                </div>

            </div>

            </div>

          {/* KPIS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

                <div className="text-xs text-[var(--muted)]">
                Wins
                </div>

                <div className="text-2xl font-bold">
                {analysis.wins}
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

                <div className="text-xs text-[var(--muted)]">
                Draws
                </div>

                <div className="text-2xl font-bold">
                {analysis.draws}
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

                <div className="text-xs text-[var(--muted)]">
                Losses
                </div>

                <div className="text-2xl font-bold">
                {analysis.losses}
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">

                <div className="text-xs text-[var(--muted)]">
                BTTS
                </div>

                <div className="text-2xl font-bold">
                {analysis.btts}%
                </div>

            </div>

            </div>

          {/* GOALS */}
            <div className="grid md:grid-cols-2 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">

                <div className="text-sm text-[var(--muted)] mb-2">
                ⚽ Goals Scored
                </div>

                <div className="text-4xl font-bold">
                {analysis.goals_scored}
                </div>

                <div className="text-sm text-[var(--muted)] mt-2">
                Avg: {analysis.avg_goals_scored}
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">

                <div className="text-sm text-[var(--muted)] mb-2">
                🥅 Goals Conceded
                </div>

                <div className="text-4xl font-bold">
                {analysis.goals_conceded}
                </div>

                <div className="text-sm text-[var(--muted)] mt-2">
                Avg: {analysis.avg_goals_conceded}
                </div>

            </div>

            </div>

          {/* MARKET STATS */}
            <div className="grid md:grid-cols-3 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

                <div className="text-sm text-[var(--muted)] mb-2">
                Over 2.5
                </div>

                <div className="text-3xl font-bold">
                {analysis.over25}%
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

                <div className="text-sm text-[var(--muted)] mb-2">
                Over 3.5
                </div>

                <div className="text-3xl font-bold">
                {analysis.over35}%
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

                <div className="text-sm text-[var(--muted)] mb-2">
                Clean Sheets
                </div>

                <div className="text-3xl font-bold">
                {analysis.clean_sheets}%
                </div>

            </div>

            </div>

          {/* GOALS CHART */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">

            <div className="flex items-center justify-between mb-4">

                <div>

                <h3 className="text-lg font-semibold">
                    📈 Goals Trend
                </h3>

                <p className="text-sm text-[var(--muted)]">
                    Goals scored vs conceded
                </p>

                </div>

            </div>

            <div className="w-full h-[320px]">

                <ResponsiveContainer>

                <LineChart
                    data={
                    analysis.goals_timeline
                    }
                >

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Line
                    type="monotone"
                    dataKey="scored"
                    stroke="#22c55e"
                    strokeWidth={3}
                    />

                    <Line
                    type="monotone"
                    dataKey="conceded"
                    stroke="#ef4444"
                    strokeWidth={3}
                    />

                </LineChart>

                </ResponsiveContainer>

            </div>

            </div>

          {/* HOME vs AWAY */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3 className="text-xl font-bold">
                    🏠 Home vs Away
                  </h3>

                  <p className="text-sm text-[var(--muted)] mt-1">
                    Performance split comparison
                  </p>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-[var(--border)]">

                      <th className="text-left py-3">
                        Stat
                      </th>

                      <th className="text-center py-3">
                        🏠 Home
                      </th>

                      <th className="text-center py-3">
                        ✈️ Away
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="border-b border-[var(--border)]">

                      <td className="py-3">
                        Matches
                      </td>

                      <td className="text-center">
                        {analysis.home.matches}
                      </td>

                      <td className="text-center">
                        {analysis.away.matches}
                      </td>

                    </tr>

                    <tr className="border-b border-[var(--border)]">

                      <td className="py-3">
                        Wins
                      </td>

                      <td className="text-center font-semibold text-[var(--success)]">
                        {analysis.home.wins}
                      </td>

                      <td className="text-center font-semibold text-[var(--success)]">
                        {analysis.away.wins}
                      </td>

                    </tr>

                    <tr className="border-b border-[var(--border)]">

                      <td className="py-3">
                        Goals scored
                      </td>

                      <td className="text-center">
                        {analysis.home.goals_scored}
                      </td>

                      <td className="text-center">
                        {analysis.away.goals_scored}
                      </td>

                    </tr>

                    <tr className="border-b border-[var(--border)]">

                      <td className="py-3">
                        Goals conceded
                      </td>

                      <td className="text-center">
                        {analysis.home.goals_conceded}
                      </td>

                      <td className="text-center">
                        {analysis.away.goals_conceded}
                      </td>

                    </tr>

                    <tr className="border-b border-[var(--border)]">

                      <td className="py-3">
                        BTTS
                      </td>

                      <td className="text-center">
                        {analysis.home.btts}%
                      </td>

                      <td className="text-center">
                        {analysis.away.btts}%
                      </td>

                    </tr>

                    <tr>

                      <td className="py-3">
                        Over 2.5
                      </td>

                      <td className="text-center">
                        {analysis.home.over25}%
                      </td>

                      <td className="text-center">
                        {analysis.away.over25}%
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          {/* INSIGHTS */}
            <div className="grid md:grid-cols-3 gap-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">

                <div className="text-lg mb-2">
                🔥
                </div>

                <div className="font-semibold">
                Strong attack
                </div>

                <div className="text-sm text-[var(--muted)] mt-1">
                Scores {analysis.avg_goals_scored} goals per match
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">

                <div className="text-lg mb-2">
                📈
                </div>

                <div className="font-semibold">
                Goal trends
                </div>

                <div className="text-sm text-[var(--muted)] mt-1">
                {analysis.over25}% Over 2.5 matches
                </div>

            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">

                <div className="text-lg mb-2">
                🧠
                </div>

                <div className="font-semibold">
                Defensive profile
                </div>

                <div className="text-sm text-[var(--muted)] mt-1">
                {analysis.clean_sheets}% clean sheets
                </div>

            </div>

            </div>

        </>

      )}

    </div>
  );
}