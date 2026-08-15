"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import BettingAnalyticsTab from "../tabs/BettingAnalyticsTab";
import TeamAnalysisTab from "../tabs/TeamAnalysisTab";
import H2HAnalysisTab from "../tabs/H2HAnalysisTab";
import MatchAnalysisTab from "../tabs/MatchAnalysisTab";


type Props = {
  onUpgrade: () => void;
};

export default function AnalysisCenter({
  onUpgrade,
}: Props) {
  const { t } = useLanguage();

  const [tab, setTab] =
    useState("teams");

  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          📊 {t.analysisCenter}
        </h1>

        <p className="text-[var(--muted)] text-sm mt-1">
          {t.advancedAnalytics}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">

        <button
          onClick={() => setTab("teams")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "teams"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          ⚽ {t.teamAnalysis}
        </button>

        <button
          onClick={() => setTab("h2h")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "h2h"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          ⚔️ {t.h2hAnalysis}
        </button>

        <button
          onClick={() => setTab("match")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "match"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          🎯 {t.matchAnalysis}
        </button>

      </div>

      {/* CONTENT */}
      <div>

{/*         {tab === "betting" && (
          <BettingAnalyticsTab />
        )} */}

        {tab === "teams" && (
          <TeamAnalysisTab />
        )}

        {tab === "h2h" && (
          <H2HAnalysisTab
            onUpgrade={onUpgrade}
          />
        )}

        {tab === "match"&& (
          <MatchAnalysisTab
            onUpgrade={onUpgrade}
          />
        )}

      </div>

    </div>
  );
}