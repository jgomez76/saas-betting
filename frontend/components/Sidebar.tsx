"use client";

import { useState } from "react";

type ItemProps = {
  label: string;
  onClick?: () => void;
};

function Item({ label, onClick }: ItemProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer px-4 py-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 transition"
    >
      {label}
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (menu: string) => {
    setOpen(open === menu ? null : menu);
  };

  return (
    <div className="w-64 h-screen bg-slate-950 text-white p-4 border-r border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.2)]">

      <h1 className="text-2xl font-bold mb-6 text-cyan-400">
        ⚡ Betting AI
      </h1>

      {/* APUESTAS */}
      <div>
        <div
          onClick={() => toggle("bets")}
          className="font-semibold text-cyan-300 cursor-pointer mb-2"
        >
          🧠 Apuestas Deportivas
        </div>

        {open === "bets" && (
          <div className="ml-2 space-y-1">
            <Item label="🔥 Top Apuestas (Premium)" />

            <div>
              <div className="text-sm text-gray-400 mt-2">Ligas</div>
              <Item label="La Liga EA Sports" />
              <Item label="La Liga Hypermotion" />
            </div>

            <div>
              <div className="text-sm text-gray-400 mt-2">Mercados</div>
              <Item label="1X2" />
              <Item label="Over/Under" />
              <Item label="BTTS" />
            </div>

            <Item label="📊 Mis apuestas" />
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      <div className="mt-4">
        <div
          onClick={() => toggle("results")}
          className="font-semibold text-cyan-300 cursor-pointer mb-2"
        >
          📅 Resultados
        </div>

        {open === "results" && (
          <div className="ml-2 space-y-1">
            <Item label="La Liga EA Sports" />
            <Item label="La Liga Hypermotion" />
          </div>
        )}
      </div>

      {/* CLASIFICACIÓN */}
      <div className="mt-4">
        <div
          onClick={() => toggle("table")}
          className="font-semibold text-cyan-300 cursor-pointer mb-2"
        >
          🏆 Clasificación
        </div>

        {open === "table" && (
          <div className="ml-2 space-y-1">
            <Item label="La Liga EA Sports" />
            <Item label="La Liga Hypermotion" />
          </div>
        )}
      </div>

      {/* ESTADÍSTICAS */}
      <div className="mt-4">
        <div
          onClick={() => toggle("stats")}
          className="font-semibold text-cyan-300 cursor-pointer mb-2"
        >
          📊 Estadísticas
        </div>

        {open === "stats" && (
          <div className="ml-2 space-y-2">
            <div>
              <div className="text-sm text-gray-400">Por Liga</div>
              <Item label="La Liga EA Sports" />
              <Item label="La Liga Hypermotion" />
            </div>

            <div>
              <div className="text-sm text-gray-400">Por Equipo</div>
              <Item label="Equipos La Liga" />
              <Item label="Equipos Segunda" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}