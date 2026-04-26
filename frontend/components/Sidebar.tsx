"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Props = {
  view: string;
  setView: (v: string) => void;
  isAdmin: boolean;
};

export default function Sidebar({ view, setView, isAdmin }: Props) {
  const { t } = useLanguage();

  return (
    <div className="w-60 bg-[var(--card)] text-[var(--text)] h-screen p-4 flex flex-col gap-2 border-r border-[var(--border)]">

      <h1 className="text-xl font-bold text-[var(--primary)] mb-6">
        ⚡ BetSaaS
      </h1>

      {/* DASHBOARD */}
      <button
        onClick={() => setView("dashboard")}
        className={`p-2 rounded text-left transition-colors ${
          view === "dashboard" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        🏠 {t.dashboard}
      </button>

      {/* APUESTAS */}
      <button
        onClick={() => setView("bets")}
        className={`p-2 rounded text-left transition-colors ${
          view === "bets" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        💰 {t.myBets}
      </button>

      {/* ANALYSIS (ADMIN) */}
      {isAdmin && (
        <button
          onClick={() => setView("analysis")}
          className={`p-2 rounded text-left transition-colors ${
            view === "analysis" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
          }`}
        >
          📊 {t.analysis}
        </button>
      )}

      {/* RESULTADOS */}
      <button
        onClick={() => setView("results")}
        className={`p-2 rounded text-left transition-colors ${
          view === "results" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        🏆 {t.results}
      </button>

      {/* CLASIFICACIONES */}
      <button
        onClick={() => setView("standings")}
        className={`p-2 rounded text-left transition-colors ${
          view === "standings" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        📋 {t.standings}
      </button>

      {/* SETTINGS */}
      <button
        onClick={() => setView("settings")}
        className={`p-2 rounded text-left transition-colors ${
          view === "settings"
            ? "bg-[var(--primary)] text-white"
            : "hover:bg-[var(--hover)]"
        }`}
      >
        ⚙️ {t.settings}
      </button>
    </div>

    
  );
}