"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import PremiumStat from "@/components/premium/PremiumStat";
import PremiumFeature from "@/components/premium/PremiumFeature";
import { useSubscription } from "@/context/SubscriptionContext";

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

type LeagueGroups = {
  [group: string]: {
    [leagueId: string]: string;
  };
};

type UpcomingFixture = {

  id: number;

  league: string;

  date: string;

  home_team: string;
  away_team: string;
};

export default function MatchAnalysisTab() {
  const { t } = useLanguage();
  const { isPremium } = useSubscription();

  // const [leagueTeams, setLeagueTeams] =
  //   useState<Record<string, string[]>>({});

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

  const [leagueTeams, setLeagueTeams] =
    useState<
      Record<
        string,
        {
          id: number;
          name: string;
          teams: string[];
        }
      >
    >({});

    const [leagueGroups, setLeagueGroups] =
      useState<LeagueGroups>({});

  // ---------------- METADATA

  useEffect(() => {

    fetch(`${apiUrl}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueTeams(
          data.league_teams || {}
        );

        setLeagueGroups(
          data.league_groups || {}
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

      `${apiUrl}/analysis/upcoming-fixtures?league_id=${encodeURIComponent(selectedLeague)}`

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

  const hasAnalysisData =
    analysis?.combined &&
    analysis?.home_analysis &&
    analysis?.away_analysis;

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold">
          🎯 {t.matchAnalysis}
        </h2>

        <p className="text-sm text-[var(--muted)] mt-1">
          {t.advancedPreMatchAnalysis}
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
          className="p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]"
        >

          <option value="">
            {t.selectLeague}
          </option>

          {Object.entries(leagueGroups).map(

            ([groupName, leagues]) => (

              <optgroup
                key={groupName}
                label={groupName}
              >

                {Object.entries(leagues).map(

                  ([leagueId, leagueName]) => (

                    <option
                      key={leagueId}
                      value={leagueId}
                    >
                      {leagueName}
                    </option>

                  )

                )}

              </optgroup>

            )

          )}

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
          className="p-3 rounded-xl bg-[var(--input)] border border-[var(--border)] disabled:opacity-50"
        >

          <option value="">
            {t.selectFixture}
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
          ⏳ {t.loadingMatchAnalysis}
        </div>

      )}

      {/* ANALYSIS */}
      {analysis && !loading && hasAnalysisData && (

        <>

        {/* MATCH HEADER */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">

        <h3 className="text-3xl font-bold">

            ⚔️ {analysis.home_team}
            {" vs "}
            {analysis.away_team}

        </h3>

        <p className="text-[var(--muted)] mt-2">

            {t.advancedBettingInsights}

        </p>

        </div>

        {/* MAIN KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <PremiumStat title="BTTS">
            {analysis.combined.btts}%
          </PremiumStat>

          <PremiumStat title="Over 2.5">
            {analysis.combined.over25}%
          </PremiumStat>

          <PremiumStat title="H2H BTTS">
            {analysis.h2h?.btts || 0}%
          </PremiumStat>

          <PremiumStat title="H2H Over 2.5">
            {analysis.h2h?.over25 || 0}%
          </PremiumStat>

        </div>

        {/* TEAM FORM */}
        <div className="grid md:grid-cols-2 gap-3">

        {/* HOME FORM */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-4">

            <h3 className="text-xl font-bold">
                🏠 {analysis.home_team}
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
                {t.recentForm}
            </p>

            </div>

            {renderForm(
            analysis.home_analysis.last_5
            )}

        </div>

        {/* AWAY FORM */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-4">

            <h3 className="text-xl font-bold">
                ✈️ {analysis.away_team}
            </h3>

            <p className="text-sm text-[var(--muted)] mt-1">
                {t.recentForm}
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
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

                <div className="mb-5">

                <h3 className="text-xl font-bold">
                    🏠 {analysis.home_team} ({t.home})
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                    {t.homePerformanceStats}
                </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    {t.wins}
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.home_analysis.home.wins}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    {t.goalsScored}
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
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

                <div className="mb-5">

                <h3 className="text-xl font-bold">
                    ✈️ {analysis.away_team} ({t.away})
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                    {t.awayPerformanceStats}
                </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    {t.wins}
                    </div>

                    <div className="text-2xl font-bold mt-1">
                    {analysis.away_analysis.away.wins}
                    </div>

                </div>

                <div className="bg-[var(--bg)] rounded-xl p-4">

                    <div className="text-xs text-[var(--muted)]">
                    {t.goalsScored}
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

        {isPremium ? (

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-5">

              <h3 className="text-xl font-bold">
                🧠 {t.smartInsights}
              </h3>

              <p className="text-sm text-[var(--muted)] mt-1">
                {t.autoGeneratedInsights}
              </p>

            </div>

            <div className="space-y-3">

              {analysis.insights.map((insight, i) => (

                <div
                  key={i}
                  className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4"
                >
                  🔥 {insight}
                </div>

              ))}

            </div>

          </div>

        ) : (

          <PremiumFeature
            icon="🧠"
            title="Smart Insights"
            description="Automatically generated betting insights based on historical statistics and team trends."
            features={[
              "AI-generated insights",
              "Team strengths",
              "Weakness detection",
              "Key betting trends",
              "Automatic recommendations",
            ]}
            buttonText="Explore Premium"
          />

        )}

        {/* MARKETS */}

        {isPremium ? (

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">

            <div className="mb-5">

              <h3 className="text-xl font-bold">
                🎯 {t.marketConfidence}
              </h3>

              <p className="text-sm text-[var(--muted)] mt-1">
                {t.confidenceEngine}
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
                    className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4"
                  >

                    <div className="flex items-center justify-between mb-3">

                      <div>

                        <div className="font-bold text-lg">
                          {m.market}
                        </div>

                        <div className="text-sm text-[var(--muted)]">
                          {
                            m.strength === "VERY STRONG"
                              ? t.veryStrong
                              : m.strength === "STRONG"
                              ? t.strong
                              : m.strength === "MEDIUM"
                              ? t.medium
                              : t.low
                          }
                        </div>

                      </div>

                      <div className="text-2xl font-bold">
                        {m.confidence}%
                      </div>

                    </div>

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

        ) : (

          <PremiumFeature
            icon="🎯"
            title="Market Confidence"
            description="See which betting markets have the highest statistical confidence before placing a bet."
            features={[
              "Confidence score",
              "Strength classification",
              "Probability bars",
              "Recommended markets",
              "Risk evaluation",
            ]}
            buttonText="Explore Premium"
          />

        )}

        {/* VALUE OPPORTUNITIES */}

        {analysis.value_opportunities.length > 0 && (

          isPremium ? (

            <div className="bg-[var(--surface)] border border-green-500/40 rounded-2xl p-5">

              <div className="mb-5">

                <h3 className="text-xl font-bold text-green-400">
                  🔥 {t.valueOpportunities}
                </h3>

                <p className="text-sm text-[var(--muted)] mt-1">
                  {t.realValueDetected}
                </p>

              </div>

              <div className="space-y-4">

                {analysis.value_opportunities.map((v, i) => (

                  <div
                    key={i}
                    className="bg-[var(--surface-2)] border border-green-500/20 rounded-xl p-5"
                  >

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
                          {t.valueEdge}
                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <div className="bg-[var(--card)] rounded-xl p-4">

                        <div className="text-xs text-[var(--muted)]">
                          {t.marketOdds}
                        </div>

                        <div className="text-2xl font-bold mt-1">
                          {v.market_odds}
                        </div>

                      </div>

                      <div className="bg-[var(--card)] rounded-xl p-4">

                        <div className="text-xs text-[var(--muted)]">
                          {t.fairOdds}
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

          ) : (

            <PremiumFeature
              icon="💎"
              title="Value Opportunities"
              description="Discover bets where our model estimates the market odds are higher than the true probability."
              features={[
                "Value edge detection",
                "Fair odds calculation",
                "Best bookmaker",
                "Positive EV opportunities",
                "Value betting analysis",
              ]}
              buttonText="Explore Premium"
            />

          )

        )}

        </>

      )}

      {analysis && !loading && !hasAnalysisData && (

        <div className="bg-[var(--surface)] border border-yellow-500/30 rounded-2xl p-6">

          <h3 className="text-xl font-bold mb-2">
            ⚠️ {t.noDataAvailable}
          </h3>

          <p className="text-[var(--muted)]">
            {t.notEnoughHistoricalData}
          </p>

        </div>

      )}

    </div>
  );
}