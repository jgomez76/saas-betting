"use client";

type Props = {
  view: string;
  setView: (v: string) => void;
  isAdmin: boolean;
};

export default function Sidebar({ view, setView, isAdmin }: Props) {
  return (
    // <div className="w-60 bg-[#111] text-white h-screen p-4 flex flex-col gap-2">
    <div className="w-60 bg-[#0f172a] text-white h-screen p-4 flex flex-col gap-2 border-r border-[#1f2937]">

      <h1 className="text-xl font-bold text-cyan-400 mb-6">
        ⚡ BetSaaS
      </h1>

      {/* DASHBOARD */}
      <button
        onClick={() => setView("dashboard")}
        className={`p-2 rounded text-left ${
          view === "dashboard" ? "bg-cyan-600" : "hover:bg-[#2a2a2a]"
        }`}
      >
        🏠 Dashboard
      </button>

      {/* APUESTAS */}
      <button
        onClick={() => setView("bets")}
        className={`p-2 rounded text-left ${
          view === "bets" ? "bg-yellow-600" : "hover:bg-[#2a2a2a]"
        }`}
      >
        💰 Mis apuestas
      </button>

      {/* ANALYSIS (ADMIN) */}
      {isAdmin && (
        <button
          onClick={() => setView("analysis")}
          className={`p-2 rounded text-left ${
            view === "analysis" ? "bg-green-600" : "hover:bg-[#2a2a2a]"
          }`}
        >
          📊 Análisis
        </button>
      )}

      {/* RESULTADOS */}
      <button
        onClick={() => setView("results")}
        className={`p-2 rounded text-left ${
          view === "results" ? "bg-purple-600" : "hover:bg-[#2a2a2a]"
        }`}
      >
        🏆 Resultados
      </button>

      {/* CLASIFICACIONES */}
      <button
        onClick={() => setView("standings")}
        className={`p-2 rounded text-left ${
          view === "standings" ? "bg-green-600" : "hover:bg-[#2a2a2a]"
        }`}
      >
        📋 Clasificaciones
      </button>

    </div>

    
  );
}