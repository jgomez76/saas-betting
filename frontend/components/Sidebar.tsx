"use client";

type Props = {
  view: string;
  setView: (v: string) => void;
  isAdmin: boolean;
};

export default function Sidebar({ view, setView, isAdmin }: Props) {
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
        🏠 Dashboard
      </button>

      {/* APUESTAS */}
      <button
        onClick={() => setView("bets")}
        className={`p-2 rounded text-left transition-colors ${
          view === "bets" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        💰 Mis apuestas
      </button>

      {/* ANALYSIS (ADMIN) */}
      {isAdmin && (
        <button
          onClick={() => setView("analysis")}
          className={`p-2 rounded text-left transition-colors ${
            view === "analysis" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
          }`}
        >
          📊 Análisis
        </button>
      )}

      {/* RESULTADOS */}
      <button
        onClick={() => setView("results")}
        className={`p-2 rounded text-left transition-colors ${
          view === "results" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        🏆 Resultados
      </button>

      {/* CLASIFICACIONES */}
      <button
        onClick={() => setView("standings")}
        className={`p-2 rounded text-left transition-colors ${
          view === "standings" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--hover)]"
        }`}
      >
        📋 Clasificaciones
      </button>

      {/* SETTINGS */}
      <button
        onClick={() => setView("settings")}
        className={`w-full text-left px-3 py-2 rounded transition-colors ${
          view === "settings"
            ? "bg-[var(--primary)] text-white"
            : "hover:bg-[var(--hover)]"
        }`}
      >
        ⚙️ Settings
      </button>
    </div>

    
  );
}