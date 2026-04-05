"use client";

import { useMemo } from "react";
import { Bet } from "@/types/bet";

// ---------------- TYPES ----------------

// type Bet = {
//   id: string;
//   match: string;
//   market: string;
//   selection: string;
//   odd?: number;
//   bookmaker?: string;
//   value?: number | null;
//   date: string;
//   status: "pending" | "won" | "lost";
//   result?: string;
// };

type Props = {
  open: boolean;
  onClose: () => void;
  bets: Bet[];
};

// ---------------- COMPONENT ----------------

export default function BetsModal({ open, onClose, bets }: Props) {
  

  const stake = 10;

  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    const totalBets = bets.length;

    const totalStake = totalBets * stake;

    const totalReturn = bets.reduce((acc, b) => {
      if (b.status === "won" && b.odd) {
        return acc + b.odd * stake;
      }
      return acc;
    }, 0);

    const wins = bets.filter((b) => b.status === "won").length;
    const losses = bets.filter((b) => b.status === "lost").length;

    const profit = totalReturn - totalStake;
    const roi = totalStake ? (profit / totalStake) * 100 : 0;
    const yieldValue = totalStake ? totalReturn / totalStake : 0;

    return {
      totalBets,
      wins,
      losses,
      totalStake,
      totalReturn,
      profit,
      roi,
      yieldValue,
    };
  }, [bets]);

  if (!open) return null;

  // ---------------- HELPERS ----------------

  const formatValue = (v?: number | null) => {
    if (v === null || v === undefined) return "-";
    return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  const getRowColor = (status: string) => {
    if (status === "won") return "bg-green-900/40";
    if (status === "lost") return "bg-red-900/40";
    return "bg-[#2a2a2a]";
  };

  const getStatusBadge = (status: string) => {
    if (status === "won")
      return "bg-green-600 text-white px-2 py-1 rounded text-xs";
    if (status === "lost")
      return "bg-red-600 text-white px-2 py-1 rounded text-xs";
    return "bg-gray-500 text-white px-2 py-1 rounded text-xs";
  };

  // ---------------- RENDER ----------------

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] text-white rounded-2xl p-6 w-[95%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">📊 Mis Apuestas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✖
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Bets</p>
            <p className="text-lg font-bold">{stats.totalBets}</p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Profit</p>
            <p
              className={`text-lg font-bold ${
                stats.profit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stats.profit.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">ROI</p>
            <p
              className={`text-lg font-bold ${
                stats.roi >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stats.roi.toFixed(1)}%
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Yield</p>
            <p className="text-lg font-bold">
              {stats.yieldValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#2a2a2a] text-gray-300">
                <th className="p-2 text-left">Match</th>
                <th className="p-2">Market</th>
                <th className="p-2">Pick</th>
                <th className="p-2">Odd</th>
                <th className="p-2">Value</th>
                <th className="p-2">Result</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {bets.map((b) => (
                <tr key={b.id} className={`${getRowColor(b.status)} border-b border-[#333]`}>
                  <td className="p-2 text-left">{b.match}</td>

                  <td className="p-2 text-center">{b.market}</td>

                  <td className="p-2 text-center font-semibold">
                    {b.selection}
                  </td>

                  <td className="p-2 text-center">{b.odd ?? "-"}</td>

                  <td className="p-2 text-center">
                    {formatValue(b.value)}
                  </td>

                  <td className="p-2 text-center">
                    {b.result ?? "-"}
                  </td>

                  <td className="p-2 text-center">
                    <span className={getStatusBadge(b.status)}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Stake fijo: {stake}€
        </div>
      </div>
    </div>
  );
}