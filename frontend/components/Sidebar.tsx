"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { COMPANY } from "@/lib/branding";

type Props = {
  view: string;
  setView: (v: string) => void;
};

export default function Sidebar({ view, setView }: Props) {
  const { t } = useLanguage();

  return (
    <div className="
    w-60
    bg-[var(--sidebar)] 
    text-[var(--text)] 
    h-screen 
    p-4 
    flex 
    flex-col 
    gap-1 
    border-r 
    border-[var(--border)]
    "
    style={{
        boxShadow: "var(--sidebar-shadow)"
    }}
    >

    <h1
      className="
        mb-6
        flex
        items-center
        gap-2
        text-3xl
        font-extrabold
        tracking-wide
        uppercase
      "
    >
        <span className="text-[var(--accent)]">⚡</span>

        <span className="text-[var(--text)]">
            {COMPANY.name}
        </span>
    </h1>

    <div
        className="mb-4 border-b"
        style={{
            borderColor: "rgba(255,255,255,.08)"
        }}
    />

      {/* DASHBOARD */}
      <button
        onClick={() => setView("dashboard")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "dashboard"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        🏠 {t.dashboard}
      </button>

      {/* APUESTAS */}
      <button
        onClick={() => setView("bets")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "bets"
              ? "theme-sidebar-active"
              : ""}
          `}
              >
        💰 {t.myBets}
      </button>

      {/* FAVORITOS */}
      <button
        onClick={() => setView("favorites")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "favorites"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        ⭐ {t.favoriteMatches}
      </button>

      {/* ANALYSIS */}
      <button
        onClick={() => setView("analysis")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "analysis"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        📊 {t.analysis}
      </button>
  

      {/* RESULTADOS */}
      <button
        onClick={() => setView("results")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "results"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        🏆 {t.results}
      </button>

      {/* CLASIFICACIONES */}
      <button
        onClick={() => setView("standings")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "standings"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        📋 {t.standings}
      </button>

      {/* SETTINGS */}
      <button
        onClick={() => setView("settings")}
        className={`
          theme-sidebar-button
          text-left

          ${view === "settings"
              ? "theme-sidebar-active"
              : ""}
          `}
      >
        ⚙️ {t.settings}
      </button>
    </div>

    
  );
}