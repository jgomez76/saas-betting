"use client";

import { useEffect, useState, useMemo } from "react";
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

// ---------------- TYPES ----------------

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

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";

// ---------------- COMPONENT ----------------

export default function AnalysisModal({ onClose }: Props) {
  const [data, setData] = useState<Analysis[]>([]);

  // 🔥 FILTROS
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [leagueFilter, setLeagueFilter] = useState("ALL");

  const [minOdd, setMinOdd] = useState<number | null>(null);
  const [maxOdd, setMaxOdd] = useState<number | null>(null);
  const [minValue, setMinValue] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const stake = 10;

  // ---------------- FETCH ----------------

  useEffect(() => {
    if (!apiUrl) return;

    fetch(`${apiUrl}/analysis`)
      .then((res) => res.json())
      .then(setData);
  }, []);

  // ---------------- HELPERS ----------------

  const getMarketKey = (b: Analysis) => {
    const m = b.market.toUpperCase();
    const s = b.selection.toLowerCase();

    if (m === "BTTS") return s === "yes" ? "btts_yes" : "btts_no";
    if (m === "OU25") return s === "over" ? "over_2_5" : "under_2_5";
    if (m === "OU35") return s === "over" ? "over_3_5" : "under_3_5";
    if (m === "1X2") return s;

    return "";
  };

  const getBetLabel = (b: Analysis) => {
    if (b.market === "OU25")
      return b.selection === "over" ? "Over 2.5" : "Under 2.5";

    if (b.market === "OU35")
      return b.selection === "over" ? "Over 3.5" : "Under 3.5";

    if (b.market === "BTTS")
      return b.selection === "yes" ? "BTTS Sí" : "BTTS No";

    if (b.market === "1X2") return b.selection.toUpperCase();

    return `${b.market} ${b.selection}`;
  };

  const toggleMarket = (key: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(key)
        ? prev.filter((m) => m !== key)
        : [...prev, key]
    );
  };

  // ---------------- LIGAS ----------------

  const leagues = useMemo(() => {
    const set = new Set(data.map((b) => b.league));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  // ---------------- FILTRADO ----------------

  const filtered = useMemo(() => {
    return data.filter((b) => {
      const key = getMarketKey(b);

      // 🔥 LIGA
      if (leagueFilter !== "ALL" && b.league !== leagueFilter) return false;

      // 🔥 MARKET
      if (selectedMarkets.length > 0 && !selectedMarkets.includes(key))
        return false;

      // 🔥 ODDS
      if (minOdd !== null && b.odd < minOdd) return false;
      if (maxOdd !== null && b.odd > maxOdd) return false;

      // 🔥 VALUE
      const valuePercent = b.value * 100;

      if (minValue !== null && valuePercent < minValue) return false;
      if (maxValue !== null && valuePercent > maxValue) return false;

      // 🔥 STATUS
      if (statusFilter === "pending" && b.status !== "pending") return false;
      if (statusFilter === "finished" && b.status === "pending") return false;

      return true;
    });
  }, [
    data,
    selectedMarkets,
    minOdd,
    maxOdd,
    minValue,
    maxValue,
    statusFilter,
    leagueFilter,
  ]);
  // ---------------- STATS ----------------

  const stats = useMemo(() => {
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

    return {
      total: filtered.length,
      wins: filtered.filter((b) => b.status === "won").length,
      bankroll,
      roi: filtered.length
        ? (bankroll / (filtered.length * stake)) * 100
        : 0,
      evolution,
    };
  }, [filtered]);

  // ---------------- ROI MARKET ----------------

  const roiByMarket = useMemo(() => {
    const map: Record<string, { profit: number; bets: number }> = {};

    filtered.forEach((b) => {
      if (!map[b.market]) map[b.market] = { profit: 0, bets: 0 };

      map[b.market].bets++;

      if (b.status === "won") map[b.market].profit += b.odd * stake - stake;
      else if (b.status === "lost") map[b.market].profit -= stake;
    });

    return Object.entries(map).map(([market, v]) => ({
      market,
      roi: (v.profit / (v.bets * stake)) * 100,
      bets: v.bets,
    }));
  }, [filtered]);

  // ---------------- ROI LEAGUE ----------------

  const roiByLeague = useMemo(() => {
    const map: Record<string, { profit: number; bets: number }> = {};

    filtered.forEach((b) => {
      if (!map[b.league]) map[b.league] = { profit: 0, bets: 0 };

      map[b.league].bets++;

      if (b.status === "won") map[b.league].profit += b.odd * stake - stake;
      else if (b.status === "lost") map[b.league].profit -= stake;
    });

    return Object.entries(map).map(([league, v]) => ({
      league,
      roi: (v.profit / (v.bets * stake)) * 100,
      bets: v.bets,
    }));
  }, [filtered]);

  // ---------------- INTELIGENCIA ----------------

  const bestMarket = [...roiByMarket].sort((a, b) => b.roi - a.roi)[0];
  const worstLeague = [...roiByLeague].sort((a, b) => a.roi - b.roi)[0];

  const getProfit = (b: Analysis) => {
    if (b.status === "won" && b.odd) {
      return (b.odd - 1) * stake;
    }
    if (b.status === "lost") {
      return -stake;
    }
    return 0;
  };

  // ---------------- UI ----------------

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
      <div className="w-full h-full bg-[var(--bg)] text-[var(--text)] flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-lg">📊 Analysis</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* 🔥 LIGAS */}
          <div className="flex gap-2 overflow-x-auto">
            {leagues.map((l) => (
              <button
                key={l}
                onClick={() => setLeagueFilter(l)}
                className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                  leagueFilter === l
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--hover)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 🔥 FILTROS */}
          <div className="space-y-3">

            {/* MARKETS */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                ["btts_yes", "BTTS Sí"],
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
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--hover)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ODDS */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Odd min"
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                onChange={(e) =>
                  setMinOdd(e.target.value ? Number(e.target.value) : null)
                }
              />
              <input
                type="number"
                placeholder="Odd max"
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                onChange={(e) =>
                  setMaxOdd(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>

            {/* VALUE */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Value min %"
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                onChange={(e) =>
                  setMinValue(e.target.value ? Number(e.target.value) : null)
                }
              />
              <input
                type="number"
                placeholder="Value max %"
                className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                onChange={(e) =>
                  setMaxValue(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card)] border border-[var(--border)]"
            >
              <option value="ALL">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="finished">Finalizados</option>
            </select>

          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2 text-sm">            
            <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded text-center">
              <p className="text-xs text-[var(--muted)]">Bets</p>
              <p className="font-bold">{stats.total}</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded text-center">
              <p className="text-xs text-[var(--muted)]">Wins</p>
              <p className="font-bold">{stats.wins}</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded text-center">
              <p className="text-xs text-[var(--muted)]">Profit</p>
              <p className="font-bold">{stats.bankroll.toFixed(2)}€</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded text-center">
              <p className="text-xs text-[var(--muted)]">ROI</p>
              <p className="font-bold">{stats.roi.toFixed(1)}%</p>
            </div>
          </div>

          {/* 🔥 RECOMENDACIONES */}
          {bestMarket && (
            <div className="bg-[var(--success)] border border-[var(--success)] p-3 rounded">
              ✅ Mejor mercado: {bestMarket.market} ({bestMarket.roi.toFixed(1)}%)
            </div>
          )}

          {worstLeague && (
            <div className="bg-[var(--success)] border border-[var(--danger)] p-3 rounded">
              ⚠️ Evita {worstLeague.league} ({worstLeague.roi.toFixed(1)}%)
            </div>
          )}

          {/* CHART */}
          <div className="w-full h-[200px]">
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
              <Bar dataKey="roi" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          {/* ROI LIGA */}
          <div className="flex flex-col gap-2">
            {roiByLeague.map((l) => (
              <div key={l.league} className="flex justify-between bg-[var(--card)] border border-[var(--border)] p-2 rounded">
                <span>{l.league}</span>
                <span className={l.roi >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {l.roi.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* 🔥 BETS PRO */}
          <div className="flex flex-col gap-3">

            {filtered.map((b, index) => {
              const profit = getProfit(b);

              const bankroll =
                stats.evolution[index]?.bankroll ?? 0;

              return (
                <div
                  key={b.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-sm"
                >

                  {/* MATCH */}
                  <div className="font-semibold truncate">
                    {b.home_team} vs {b.away_team}
                  </div>

                  {/* INFO */}
                  <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                    <span>{b.league}</span>
                    <span>
                      {new Date(b.date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* MAIN ROW */}
                  <div className="flex justify-between items-center mt-2">

                    {/* IZQ */}
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text)]">
                        {getBetLabel(b)}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        Cuota: {b.odd ?? "-"}
                      </span>
                    </div>

                    {/* STATUS */}
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          b.status === "won"
                            ? "bg-[var(--success)] text-white"
                            : b.status === "lost"
                            ? "bg-[var(--danger)] text-white"
                            : "bg-[var(--muted)] text-black"
                        }`}
                      >
                        {b.status === "won"
                          ? "WIN"
                          : b.status === "lost"
                          ? "LOSS"
                          : "PENDING"}
                      </span>
                    </div>

                    {/* DERECHA */}
                    <div className="text-right">

                      {/* PROFIT */}
                      <div
                        className={`font-bold ${
                          profit > 0
                            ? "text-[var(--success)]"
                            : profit < 0
                            ? "text-[var(--danger)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {profit > 0 ? "+" : ""}
                        {profit.toFixed(2)}€
                      </div>

                      {/* VALUE */}
                      <div
                        className={`text-xs ${
                          b.value >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {(b.value * 100).toFixed(1)}%
                      </div>

                    </div>

                  </div>

                  {/* 🔥 BANKROLL */}
                  {b.status !== "pending" && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      Bankroll: {bankroll.toFixed(2)}€
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>
      </div>
    </div>
  );
}