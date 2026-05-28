"use client";

import { useEffect, useState } from "react";

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

type MatchAnalysis = {

    home_team: string;
    away_team: string;

    home_analysis: {

        last_5: string;

        home: {

            matches: number;

            wins: number;

            goals_scored: number;
            goals_conceded: number;

            btts: number;

            over25: number;
        };
    };

    away_analysis: {

        last_5: string;

        away: {

            matches: number;

            wins: number;

            goals_scored: number;
            goals_conceded: number;

            btts: number;

            over25: number;
        };
    };

    combined: {
        btts: number;
        over25: number;
    };

    insights: string[];

    markets: {
        market: string;
        confidence: number;
        strength: string;
    }[];

    h2h: {
        matches: number;
        avg_goals: number;
        btts: number;
        over25: number;
    };

    value_opportunities: {
        market: string;
        edge: number;
        bookmaker: string;
        market_odds: number;
        fair_odds: number;
    }[];
};

type UpcomingFixture = {

  id: number;

  league: string;

  date: string;

  home_team: string;
  away_team: string;
};

export default function MatchAnalysisTab() {

  const [leagueTeams, setLeagueTeams] =
    useState<Record<string, string[]>>({});

  const [selectedLeague, setSelectedLeague] =
    useState("");

  const [fixtures, setFixtures] =
    useState<UpcomingFixture[]>([]);

  const [selectedFixture, setSelectedFixture] =
    useState<UpcomingFixture | null>(null);

  const [analysis, setAnalysis] =
    useState<MatchAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  // ---------------- METADATA

  useEffect(() => {

    fetch(`${apiUrl}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueTeams(
          data.league_teams || {}
        );

      });

  }, []);

  // ---------------- UPCOMING FIXTURES

  useEffect(() => {

    if (!selectedLeague) {

      setFixtures([]);

      setSelectedFixture(null);

      return;
    }

    fetch(

      `${apiUrl}/analysis/upcoming-fixtures?league=${encodeURIComponent(selectedLeague)}`

    )
      .then((res) => res.json())
      .then((data) => {

        setFixtures(data || []);

      });

  }, [selectedLeague]);

  // ---------------- MATCH ANALYSIS

  useEffect(() => {

    if (!selectedFixture) {
      return;
    }

    const load = async () => {

      setLoading(true);

      try {

        const res = await fetch(

          `${apiUrl}/analysis/match?home_team=${encodeURIComponent(selectedFixture.home_team)}&away_team=${encodeURIComponent(selectedFixture.away_team)}`

        );

        const data = await res.json();

        setAnalysis(data);

      } finally {

        setLoading(false);

      }
    };

    load();

  }, [selectedFixture]);

  // ---------------- UI

  const renderForm = (
    form: string
    ) => {

    if (!form) {
        return null;
    }

    return (

        <div className="flex gap-2">

        {form
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

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold">
          🎯 Match Analysis
        </h2>

        <p className="text-sm text-[var(--muted)] mt-1">
          Advanced pre-match betting analysis
        </p>

      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-2 gap-3">

        {/* LEAGUE */}
        <select
          value={selectedLeague}
          onChange={(e) => {

            setSelectedLeague(
              e.target.value
            );

            setSelectedFixture(null);

            setAnalysis(null);

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

        {/* FIXTURE */}
        <select
          value={selectedFixture?.id || ""}
          onChange={(e) => {

            const fixture = fixtures.find(
              (f) =>
                String(f.id) ===
                e.target.value
            );

            setSelectedFixture(
              fixture || null
            );

          }}
          disabled={!selectedLeague}
          className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] disabled:opacity-50"
        >

          <option value="">
            Select fixture
          </option>

          {fixtures.map((fixture) => (

            <option
              key={fixture.id}
              value={fixture.id}
            >

              {fixture.home_team}
              {" vs "}
              {fixture.away_team}
              {" • "}
              {new Date(fixture.date).toLocaleString(
                "es-ES",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
                )}

            </option>

          ))}

        </select>

      </div>

      {/* LOADING */}
      {loading && (

        <div className="text-center text-[var(--muted)]">
          ⏳ Loading match analysis...
        </div>

      )}

      {/* ANALYSIS */}
      {analysis && !loading && (

        <>

        {/* MATCH HEADER */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">

        <h3 className="text-3xl font-bold">

            ⚔️ {analysis.home_team}
            {" vs "}
            {analysis.away_team}

        </h3>

        <p className="text-[var(--muted)] mt-2">

            Advanced betting insights and trends

        </p>

        </div>

        {/* MAIN KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

            <div className="text-sm text-[var(--muted)] mb-2">
            BTTS
            </div>

            <div className="text-4xl font-bold">
            {analysis.combined.btts}%
            </div>

        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

            <div className="text-sm text-[var(--muted)] mb-2">
            Over 2.5
            </div>

            <div className="text-4xl font-bold">
            {analysis.combined.over25}%
            </div>

        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

            <div className="text-sm text-[var(--muted)] mb-2">
            H2H BTTS
            </div>

            <div className="text-4xl font-bold">
            {analysis.h2h?.btts || 0}%
            </div>

        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">

            <div className="text-sm text-[var(--muted)] mb-2">
            H2H Over 2.5
            </div>

            <div className="text-4xl font-bold">
            {analysis.h2h?.over25 || 0}%
            </div>

        </div>

        </div>

        {/* TEAM FORM */}
        <div className="grid md:grid-cols-2 gap-3">

        {/* HOME FORM */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-4">

            <h3 className="text-xl font-bold">
                🏠 {analysis.home_team}
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
                Recent form
            </p>

            </div>

            {renderForm(
            analysis.home_analysis.last_5
            )}

        </div>

        {/* AWAY FORM */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-4">

            <h3 className="text-xl font-bold">
                ✈️ {analysis.away_team}
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
                Recent form
            </p>

            </div>

            {renderForm(
            analysis.away_analysis.last_5
            )}

        </div>

        </div>

        {/* HOME vs AWAY SPLITS */}
        <div className="grid md:grid-cols-2 gap-3">

            {/* HOME */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

                <div className="mb-5">

                <h3 className="text-xl font-bold">
                    🏠 {analysis.home_team} Home
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                    Home performance stats
                </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Wins
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.home_analysis.home.wins}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Goals scored
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.home_analysis.home.goals_scored}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    BTTS
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.home_analysis.home.btts}%
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Over 2.5
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.home_analysis.home.over25}%
                    </div>

                </div>

                </div>

            </div>

            {/* AWAY */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

                <div className="mb-5">

                <h3 className="text-xl font-bold">
                    ✈️ {analysis.away_team} Away
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                    Away performance stats
                </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Wins
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.away_analysis.away.wins}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Goals scored
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.away_analysis.away.goals_scored}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    BTTS
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.away_analysis.away.btts}%
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    Over 2.5
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.away_analysis.away.over25}%
                    </div>

                </div>

                </div>

            </div>

        </div>

        {/* INSIGHTS */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

        <div className="mb-5">

            <h3 className="text-xl font-bold">
            🧠 Smart Insights
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
            Automatically generated betting insights
            </p>

        </div>

        <div className="space-y-3">

            {analysis.insights.map((insight, i) => (

            <div
                key={i}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4"
            >

                🔥 {insight}

            </div>

            ))}

        </div>

        </div>

        {/* MARKETS */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">

        <div className="mb-5">

            <h3 className="text-xl font-bold">
            🎯 Market Confidence
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
            Confidence engine based on historical data
            </p>

        </div>

        <div className="space-y-4">

            {analysis.markets.map((m, i) => {

            const barColor =

                m.confidence >= 80
                ? "bg-green-500"

                : m.confidence >= 65
                ? "bg-yellow-500"

                : m.confidence >= 55
                ? "bg-orange-500"

                : "bg-orange-500";

            return (

                <div
                key={i}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4"
                >

                <div className="flex items-center justify-between mb-3">

                    <div>

                    <div className="font-bold text-lg">
                        {m.market}
                    </div>

                    <div className="text-sm text-[var(--muted)]">
                        {m.strength}
                    </div>

                    </div>

                    <div className="text-2xl font-bold">

                    {m.confidence}%

                    </div>

                </div>

                {/* BAR */}
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

                    <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{
                        width: `${m.confidence}%`
                        }}
                    />

                </div>


            </div>

            );
            })}

        </div>

        </div>

        {/* VALUE OPPORTUNITIES */}
        {analysis.value_opportunities.length > 0 && (

        <div className="bg-[var(--card)] border border-green-500/40 rounded-2xl p-5">

            <div className="mb-5">

            <h3 className="text-xl font-bold text-green-400">
                🔥 Value Opportunities
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
                Real value detected using bookmaker odds
            </p>

            </div>

            <div className="space-y-4">

            {analysis.value_opportunities.map((v, i) => (

                <div
                key={i}
                className="bg-[var(--bg)] border border-green-500/20 rounded-xl p-5"
                >

                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">

                    <div>

                    <div className="text-xl font-bold">
                        🎯 {v.market}
                    </div>

                    <div className="text-sm text-[var(--muted)] mt-1">
                        {v.bookmaker}
                    </div>

                    </div>

                    <div className="text-right">

                    <div className="text-3xl font-bold text-green-400">
                        +{v.edge}%
                    </div>

                    <div className="text-xs text-[var(--muted)]">
                        VALUE EDGE
                    </div>

                    </div>

                </div>

                {/* ODDS */}
                <div className="grid grid-cols-2 gap-3">

                    <div className="bg-[var(--card)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                        Market Odds
                    </div>

                    <div className="text-2xl font-bold mt-1">
                        {v.market_odds}
                    </div>

                    </div>

                    <div className="bg-[var(--card)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                        Fair Odds
                    </div>

                    <div className="text-2xl font-bold mt-1">
                        {v.fair_odds}
                    </div>

                    </div>

                </div>

                </div>

            ))}

            </div>

        </div>

        )}

        </>

      )}

    </div>
  );
}