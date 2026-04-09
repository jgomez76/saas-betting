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
  result?: string;
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

// type MarketROI = {
//   market: string;
//   roi: number;
// };

// type LeagueROI = {
//   league: string;
//   roi: number;
// };

type MarketAccumulator = {
  market: string;
  profit: number;
  bets: number;
};

type LeagueAccumulator = {
  league: string;
  profit: number;
  bets: number;
};

export default function AnalysisModal({ onClose }: Props) {
  const [data, setData] = useState<Analysis[]>([]);

  const [minValue, setMinValue] = useState(0);
  const [minOdd, setMinOdd] = useState(1.5);
  const [market, setMarket] = useState("ALL");

  useEffect(() => {
    fetch(`${API_URL}/analysis`)
      .then((res) => res.json())
      .then(setData);
  }, []);

  // ---------------- FILTRO ----------------
  const filtered = useMemo(() => {
    return data.filter((b) => {
      if (b.value < minValue) return false;
      if (b.odd < minOdd) return false;
      if (market !== "ALL" && b.market !== market) return false;
      return true;
    });
  }, [data, minValue, minOdd, market]);

  // ---------------- KPI ----------------
  const stats = useMemo(() => {
    const stake = 10;

    let bankroll = 0;
    const evolution: EvolutionPoint[] = [];

    filtered.forEach((b, i) => {
      if (b.status === "won") bankroll += b.odd * stake - stake;
      else if (b.status === "lost") bankroll -= stake;

      evolution.push({
        bet: i + 1,
        bankroll,
        roi: (bankroll / ((i + 1) * stake)) * 100,
      });
    });

    const total = filtered.length;
    const wins = filtered.filter((b) => b.status === "won").length;

    const roi = total
      ? (bankroll / (total * stake)) * 100
      : 0;

    return { total, wins, bankroll, roi, evolution };
  }, [filtered]);

  // ---------------- ROI POR MERCADO ----------------
  const roiByMarket = useMemo(() => {
    const stake = 10;
    const map: Record<string, MarketAccumulator> = {};

    filtered.forEach((b) => {
      if (!map[b.market]) {
        map[b.market] = { market: b.market, profit: 0, bets: 0 };
      }

      map[b.market].bets++;

      if (b.status === "won") {
        map[b.market].profit += b.odd * stake - stake;
      } else if (b.status === "lost") {
        map[b.market].profit -= stake;
      }
    });

    return Object.values(map).map((m) => ({
      market: m.market,
      roi: (m.profit / (m.bets * stake)) * 100,
    }));
  }, [filtered]);

  // ---------------- ROI POR LIGA ----------------
  const roiByLeague = useMemo(() => {
    const stake = 10;
    const map: Record<string, LeagueAccumulator> = {};

    filtered.forEach((b) => {
      if (!map[b.league]) {
        map[b.league] = { league: b.league, profit: 0, bets: 0 };
      }

      map[b.league].bets++;

      if (b.status === "won") {
        map[b.league].profit += b.odd * stake - stake;
      } else if (b.status === "lost") {
        map[b.league].profit -= stake;
      }
    });

    return Object.values(map).map((l) => ({
      league: l.league,
      roi: (l.profit / (l.bets * stake)) * 100,
    }));
  }, [filtered]);

  // ---------------- DETECTAR MALOS ----------------
  const badMarkets = roiByMarket.filter((m) => Number(m.roi) < 0);

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[95%] max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">📊 Analysis</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            placeholder="Min Value"
            className="p-2 bg-[#2a2a2a] rounded"
          />

          <input
            type="number"
            value={minOdd}
            onChange={(e) => setMinOdd(Number(e.target.value))}
            placeholder="Min Odd"
            className="p-2 bg-[#2a2a2a] rounded"
          />

          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="p-2 bg-[#2a2a2a] rounded"
          >
            <option value="ALL">All</option>
            <option value="1X2">1X2</option>
            <option value="OU25">OU25</option>
            <option value="OU35">OU35</option>
            <option value="BTTS">BTTS</option>
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-[#2a2a2a] p-3 rounded">
            <p>Bets</p>
            <p className="font-bold">{stats.total}</p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p>Wins</p>
            <p className="text-green-400">{stats.wins}</p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p>Profit</p>
            <p className={stats.bankroll >= 0 ? "text-green-400" : "text-red-400"}>
              {stats.bankroll.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p>ROI</p>
            <p className={stats.roi >= 0 ? "text-green-400" : "text-red-400"}>
              {stats.roi.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* ROI EVOLUCIÓN */}
        <div className="w-full h-[250px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.evolution}>
              <XAxis dataKey="bet" />
              <YAxis />
              <Tooltip />

              <Line type="monotone" dataKey="bankroll" stroke="#22c55e" />
              <Line type="monotone" dataKey="roi" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROI POR MERCADO */}
        <h3 className="mb-2 font-semibold">ROI por mercado</h3>
        <div className="w-full h-[200px] mb-6">
          <ResponsiveContainer>
            <BarChart data={roiByMarket}>
              <XAxis dataKey="market" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="roi" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROI POR LIGA */}
        <h3 className="mb-2 font-semibold">ROI por liga</h3>
        <div className="w-full h-[200px] mb-6">
          <ResponsiveContainer>
            <BarChart data={roiByLeague}>
              <XAxis dataKey="league" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="roi" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ALERTA */}
        {badMarkets.length > 0 && (
          <div className="bg-red-900 p-4 rounded">
            ⚠️ Mercados a eliminar:
            <ul>
              {badMarkets.map((m) => (
                <li key={m.market}>{m.market} ({m.roi}%)</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}