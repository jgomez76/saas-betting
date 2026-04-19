"use client";

import { useMemo, useState, useEffect } from "react";
import { Bet } from "@/types/bet";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------- TYPES ----------------

type Props = {
  open: boolean;
  onClose: () => void;
  bets: Bet[];
  onDelete: (id: number) => void;
};

type StatProps = {
  label: string;
  value: string | number;
  color?: boolean;
};

  const Stat = ({ label, value, color }: StatProps) => (
    <div className="bg-[#2a2a2a] p-2 rounded text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p
        className={`font-bold ${
          color === false
            ? "text-red-400"
            : color
            ? "text-green-400"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );


// ---------------- COMPONENT ----------------

export default function BetsModal({ open, onClose, bets, onDelete }: Props) {
  const [chartReady, setChartReady] = useState(false);
  const [betToDelete, setBetToDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const stake = 10;

  // ---------------- SORT ----------------
  const sortedBets = useMemo(() => {
    return [...bets].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [bets]);

  const filteredBets = useMemo(() => {
    return sortedBets.filter((b) => {
      if (statusFilter === "pending") return b.status === "pending";
      if (statusFilter === "finished") return b.status !== "pending";
      return true;
    });
  }, [sortedBets, statusFilter]);

  // ---------------- FORMAT ----------------
  const formatDate = (date: string) => {
    if (!date) return "-";

    const d = new Date(date + "Z");
    const time = d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const day = d.toLocaleDateString("es-ES", { day: "2-digit" });
    const month = d
      .toLocaleDateString("es-ES", { month: "short" })
      .replace(".", "");

    return `${day} ${month} ${time}`;
  };

  // const formatValue = (v?: number | null) => {
  //   if (v === null || v === undefined) return "-";
  //   return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  // };

  // 🔥 LABEL BONITO
  const getBetLabel = (b: Bet) => {
    if (b.market === "OU25") {
      return b.selection === "over" ? "Over 2.5" : "Under 2.5";
    }

    if (b.market === "OU35") {
      return b.selection === "over" ? "Over 3.5" : "Under 3.5";
    }

    if (b.market === "BTTS") {
      return b.selection === "yes" ? "BTTS Sí" : "BTTS No";
    }

    if (b.market === "1X2") {
      return b.selection.toUpperCase();
    }

    return b.selection;
  };

  // 💰 PROFIT POR APUESTA
  const getProfit = (b: Bet) => {
    if (b.status === "won" && b.odd) {
      return (b.odd - 1) * stake;
    }
    if (b.status === "lost") {
      return -stake;
    }
    return 0;
  };

  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    const totalBets = filteredBets.length;
    const totalStake = totalBets * stake;

    const totalReturn = filteredBets.reduce((acc, b) => {
      if (b.status === "won" && b.odd) {
        return acc + b.odd * stake;
      }
      return acc;
    }, 0);

    const profit = totalReturn - totalStake;
    const roi = totalStake ? (profit / totalStake) * 100 : 0;

    const evolution = filteredBets
      .filter((b) => b.status !== "pending")
      .reduce((acc: { bet: number; bankroll: number }[], b, i) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].bankroll : 0;

        let next = prev;

        if (b.status === "won" && b.odd) {
          next = prev + (b.odd - 1) * stake;
        } else if (b.status === "lost") {
          next = prev - stake;
        }

        acc.push({
          bet: i + 1,
          bankroll: Number(next.toFixed(2)),
        });

        return acc;
      }, []);

    return {
      totalBets,
      profit,
      roi,
      evolution,
    };
  }, [filteredBets]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => setChartReady(true));
  }, [open]);

  if (!open) return null;

  // ---------------- STAT ----------------

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex">
      <div className="w-full h-full bg-[#1F3537] text-white flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-[#333]">
          <h2 className="text-lg font-bold">📊 Mis Apuestas</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* FILTRO */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-[#2a2a2a] rounded w-full"
          >
            <option value="ALL">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="finished">Finalizadas</option>
          </select>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Bets" value={stats.totalBets} />
            <Stat label="Profit" value={stats.profit.toFixed(2)} color={stats.profit >= 0} />
            <Stat label="ROI" value={`${stats.roi.toFixed(1)}%`} color={stats.roi >= 0} />
          </div>

          {/* CHART */}
          {chartReady && stats.evolution.length > 0 && (
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.evolution}>
                  <XAxis dataKey="bet" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="bankroll"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* BETS */}
          <div className="flex flex-col gap-3">

            {filteredBets.map((b) => {
              const profit = getProfit(b);

              return (
                <div
                  key={b.id}
                  className="bg-[#2a2a2a] rounded-xl p-3 flex flex-col gap-2"
                >
                  {/* HEADER */}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="truncate">{b.match}</span>
                    <span>{formatDate(b.date)}</span>
                  </div>

                  {/* APUESTA */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        🎯 {getBetLabel(b)}
                      </span>
                      <span className="text-xs text-gray-400">
                        @ {b.odd ?? "-"}
                      </span>
                    </div>

                    <span className="text-sm text-gray-300">
                      {b.result ?? "-"}
                    </span>
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center">

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        b.status === "won"
                          ? "bg-green-600"
                          : b.status === "lost"
                          ? "bg-red-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {b.status}
                    </span>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${
                          profit > 0
                            ? "text-green-400"
                            : profit < 0
                            ? "text-red-400"
                            : ""
                        }`}
                      >
                        {profit > 0 ? "+" : ""}
                        {profit.toFixed(2)}€
                      </span>

                      <button
                        onClick={() => setBetToDelete(b.id)}
                        className="text-red-400"
                      >
                        🗑
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-gray-400">
            Stake fijo: {stake}€
          </div>

        </div>
      </div>

      {/* DELETE MODAL */}
      {betToDelete !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-bold mb-4">Eliminar apuesta</h3>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setBetToDelete(null)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  onDelete(betToDelete);
                  setBetToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}