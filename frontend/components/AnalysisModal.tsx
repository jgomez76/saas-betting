"use client";

import { useEffect, useState, useMemo } from "react";
import { API_URL } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type Analysis = {
  id: number;
  league: string;
  home_team: string;
  away_team: string;
  market: string;
  selection: string;
  odd: number;
  value: number;
  status: string;
  date: string;
};

type Props = {
  onClose: () => void;
};

type EvolutionPoint = {
  bet: number;
  bankroll: number;
  roi: number;
};

export default function AnalysisModal({ onClose }: Props) {
  const [data, setData] = useState<Analysis[]>([]);

  // 🔥 FILTROS
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [minOdd, setMinOdd] = useState<number | null>(null);
  const [maxOdd, setMaxOdd] = useState<number | null>(null);
  const [minValue, setMinValue] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API_URL}/analysis`)
      .then((res) => res.json())
      .then(setData);
  }, []);

  // 🔥 MARKET KEY CORRECTO
  const getMarketKey = (b: Analysis) => {
    const m = b.market.toUpperCase();
    const s = b.selection.toLowerCase();

    if (m === "BTTS") {
      if (s === "yes") return "btts_yes";
      if (s === "no") return "btts_no";
    }

    if (m === "OU25") {
      if (s === "over") return "over_2_5";
      if (s === "under") return "under_2_5";
    }

    if (m === "OU35") {
      if (s === "over") return "over_3_5";
      if (s === "under") return "under_3_5";
    }

    if (m === "1X2") {
      if (s === "home") return "home";
      if (s === "draw") return "draw";
      if (s === "away") return "away";
    }

    return "";
  };

  const toggleMarket = (key: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(key)
        ? prev.filter((m) => m !== key)
        : [...prev, key]
    );
  };

  // 🔥 FILTRADO
  const filtered = useMemo(() => {
    return data.filter((b) => {
      const key = getMarketKey(b);

      if (selectedMarkets.length > 0 && !selectedMarkets.includes(key))
        return false;

      if (minOdd && b.odd < minOdd) return false;
      if (maxOdd && b.odd > maxOdd) return false;

      const valuePercent = b.value * 100;

      if (minValue && valuePercent < minValue) return false;
      if (maxValue && valuePercent > maxValue) return false;

      if (statusFilter === "pending" && b.status !== "pending") return false;
      if (statusFilter === "finished" && b.status === "pending") return false;

      return true;
    });
  }, [data, selectedMarkets, minOdd, maxOdd, minValue, maxValue, statusFilter]);

  // 🔥 KPI + EVOLUCIÓN
  const stats = useMemo(() => {
    const stake = 10;
    let runningBankroll = 0;

    const evolution: EvolutionPoint[] = [];

    filtered.forEach((b, i) => {
      if (b.status === "won") {
        runningBankroll += b.odd * stake - stake;
      } else if (b.status === "lost") {
        runningBankroll -= stake;
      }

      evolution.push({
        bet: i + 1,
        bankroll: runningBankroll,
        roi: (runningBankroll / ((i + 1) * stake)) * 100,
      });
    });

    return {
      total: filtered.length,
      wins: filtered.filter((b) => b.status === "won").length,
      bankroll: runningBankroll,
      roi: filtered.length
        ? (runningBankroll / (filtered.length * stake)) * 100
        : 0,
      evolution,
    };
  }, [filtered]);

  // 🔥 ROI POR MERCADO
  const roiByMarket = useMemo(() => {
    const stake = 10;
    const map: Record<string, { profit: number; bets: number }> = {};

    filtered.forEach((b) => {
      if (!map[b.market]) {
        map[b.market] = { profit: 0, bets: 0 };
      }

      map[b.market].bets++;

      if (b.status === "won") {
        map[b.market].profit += b.odd * stake - stake;
      } else if (b.status === "lost") {
        map[b.market].profit -= stake;
      }
    });

    return Object.entries(map).map(([market, v]) => ({
      market,
      roi: (v.profit / (v.bets * stake)) * 100,
    }));
  }, [filtered]);

  // 🔥 ROI POR LIGA
  const roiByLeague = useMemo(() => {
    const stake = 10;
    const map: Record<string, { profit: number; bets: number }> = {};

    filtered.forEach((b) => {
      if (!map[b.league]) {
        map[b.league] = { profit: 0, bets: 0 };
      }

      map[b.league].bets++;

      if (b.status === "won") {
        map[b.league].profit += b.odd * stake - stake;
      } else if (b.status === "lost") {
        map[b.league].profit -= stake;
      }
    });

    return Object.entries(map).map(([league, v]) => ({
      league,
      roi: (v.profit / (v.bets * stake)) * 100,
    }));
  }, [filtered]);

  // 🔥 TOP PICKS
  const profitablePicks = useMemo(() => {
    const stake = 10;
    const map: Record<string, { profit: number; bets: number }> = {};

    data.forEach((b) => {
      const key = `${b.market}_${b.selection}`;

      if (!map[key]) map[key] = { profit: 0, bets: 0 };

      map[key].bets++;

      if (b.status === "won") {
        map[key].profit += b.odd * stake - stake;
      } else if (b.status === "lost") {
        map[key].profit -= stake;
      }
    });

    return Object.entries(map)
      .map(([key, v]) => ({
        key,
        roi: (v.profit / (v.bets * stake)) * 100,
        bets: v.bets,
      }))
      .filter((p) => p.roi > 0 && p.bets >= 5);
  }, [data]);

  const badMarkets = roiByMarket.filter((m) => m.roi < 0);

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1F3537] text-white p-6 rounded-xl w-[95%] max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">📊 Analysis</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* 🔥 TOP PICKS */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">🔥 TOP PICKS</h3>
          <div className="flex flex-wrap gap-2">
            {profitablePicks.map((p) => (
              <span key={p.key} className="bg-green-700 px-3 py-1 rounded text-sm">
                {p.key} ({p.roi.toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>

        {/* 🔥 FILTROS */}
        <div className="mb-6 space-y-4">

          <div className="grid grid-cols-3 gap-2">
            {[
              ["btts_yes", "BTTS Yes"],
              ["btts_no", "BTTS No"],
              ["over_2_5", "Over 2.5"],
              ["under_2_5", "Under 2.5"],
              ["over_3_5", "Over 3.5"],
              ["under_3_5", "Under 3.5"],
              ["home", "Home"],
              ["draw", "Draw"],
              ["away", "Away"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleMarket(key)}
                className={`p-2 rounded ${
                  selectedMarkets.includes(key)
                    ? "bg-cyan-600"
                    : "bg-[#2a2a2a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input type="number" placeholder="Odd min" onChange={(e) => setMinOdd(Number(e.target.value))} />
            <input type="number" placeholder="Odd max" onChange={(e) => setMaxOdd(Number(e.target.value))} />
          </div>

          <div className="flex gap-2">
            <input type="number" placeholder="Value min %" onChange={(e) => setMinValue(Number(e.target.value))} />
            <input type="number" placeholder="Value max %" onChange={(e) => setMaxValue(Number(e.target.value))} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="finished">Finalizados</option>
          </select>

        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div>Bets: {stats.total}</div>
          <div>Wins: {stats.wins}</div>
          <div>Profit: {stats.bankroll.toFixed(2)}</div>
          <div>ROI: {stats.roi.toFixed(1)}%</div>
        </div>

        {/* CHART */}
        <div className="w-full h-[250px] mb-8">
          <ResponsiveContainer>
            <LineChart data={stats.evolution}>
              <XAxis dataKey="bet" />
              <YAxis />
              <Tooltip />
              <Line dataKey="bankroll" stroke="#22c55e" />
              <Line dataKey="roi" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROI MERCADO */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roiByMarket}>
            <XAxis dataKey="market" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="roi" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        {/* ROI LIGA */}
        <div className="flex flex-wrap gap-2 mt-4">
          {roiByLeague.map((l) => (
            <span key={l.league}>
              {l.league} ({l.roi.toFixed(1)}%)
            </span>
          ))}
        </div>

        {/* ALERTA */}
        {badMarkets.length > 0 && (
          <div className="bg-red-900 p-4 mt-4 rounded">
            ⚠️ Mercados a eliminar:
            {badMarkets.map((m) => (
              <div key={m.market}>
                {m.market} ({m.roi.toFixed(1)}%)
              </div>
            ))}
          </div>
        )}

        {/* 🧾 TABLA DE PARTIDOS */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">Bets</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2a2a2a]">
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Match</th>
                  <th className="p-2">Pick</th>
                  <th className="p-2">Odd</th>
                  <th className="p-2">Value</th>
                  <th className="p-2">Resultado</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-[#333]">

                    {/* FECHA */}
                    <td className="p-2 text-xs text-gray-400">
                      {new Date(b.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>

                    {/* MATCH */}
                    <td className="p-2">
                      {b.home_team} vs {b.away_team}
                    </td>

                    {/* PICK */}
                    <td className="p-2 text-center">
                      {b.market} {b.selection}
                    </td>

                    {/* ODD */}
                    <td className="p-2 text-center">
                      {b.odd}
                    </td>

                    {/* VALUE */}
                    <td className="p-2 text-center">
                      {(b.value * 100).toFixed(1)}%
                    </td>

                    {/* RESULTADO */}
                    <td className="p-2 text-center">
                      <span
                        className={
                          b.status === "won"
                            ? "text-green-400 font-bold"
                            : b.status === "lost"
                            ? "text-red-400 font-bold"
                            : "text-gray-400"
                        }
                      >
                        {b.status === "won"
                          ? "✅ Win"
                          : b.status === "lost"
                          ? "❌ Lost"
                          : "⏳ Pending"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}