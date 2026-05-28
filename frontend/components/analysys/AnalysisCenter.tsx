"use client";

import { useState } from "react";

import BettingAnalyticsTab from "../tabs/BettingAnalyticsTab";
import TeamAnalysisTab from "../tabs/TeamAnalysisTab";
import H2HAnalysisTab from "../tabs/H2HAnalysisTab";
import MatchAnalysisTab from "../tabs/MatchAnalysisTab";


export default function AnalysisCenter() {

  const [tab, setTab] =
    useState("teams");

  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          📊 Analysis Center
        </h1>

        <p className="text-[var(--muted)] text-sm mt-1">
          Advanced football and betting analytics
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">

        {/* <button
          onClick={() => setTab("betting")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "betting"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          📈 Betting Analytics
        </button> */}

        <button
          onClick={() => setTab("teams")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "teams"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          ⚽ Team Analysis
        </button>

        <button
          onClick={() => setTab("h2h")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "h2h"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          ⚔️ H2H Analysis
        </button>

        <button
          onClick={() => setTab("match")}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === "match"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--card)] border border-[var(--border)]"
          }`}
        >
          🎯 Match Analysis
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
          <H2HAnalysisTab />
        )}

        {tab === "match"&& (
          <MatchAnalysisTab />
        )}

      </div>

    </div>
  );
}