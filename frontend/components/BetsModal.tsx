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

// ---------------- COMPONENT ----------------

export default function BetsModal({ open, onClose, bets, onDelete }: Props) {
  
  const [chartReady, setChartReady] = useState(false);
  const stake = 10;

  const [betToDelete, setBetToDelete] = useState<number | null>(null);

  // const sortedBets = [...bets].sort(
  //   (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  // );
  const sortedBets = useMemo(() => {
    return [...bets].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [bets]);

  const [statusFilter, setStatusFilter] = useState("ALL");

  // const filteredBets = sortedBets.filter((b) => {
  //   if (statusFilter === "pending") return b.status === "pending";
  //   if (statusFilter === "finished") return b.status !== "pending";
  //   return true;
  // });
  const filteredBets = useMemo(() => {
    return sortedBets.filter((b) => {
      if (statusFilter === "pending") return b.status === "pending";
      if (statusFilter === "finished") return b.status !== "pending";
      return true;
    });
  }, [sortedBets, statusFilter]);

  const formatDate = (date: string) => {
    if (!date) return "-";

    const d = new Date(date + "Z");
    const now = new Date();

    // 👉 NORMALIZAR (quitar horas para comparar días)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matchDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const time = d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 🔥 HOY
    if (matchDay.getTime() === today.getTime()) {
      return `Hoy ${time}`;
    }

    // 🔥 MAÑANA
    if (matchDay.getTime() === tomorrow.getTime()) {
      return `Mañana ${time}`;
    }

    // 🔥 FORMATO NORMAL
    const day = d.toLocaleDateString("es-ES", {
      day: "2-digit",
    });

    const month = d
      .toLocaleDateString("es-ES", { month: "short" })
      .replace(".", "");

    return `${day} ${month} ${time}`;
  };


  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    // const totalBets = bets.length;
    const totalBets = filteredBets.length;

    const totalStake = totalBets * stake;

    // const totalReturn = bets.reduce((acc, b) => {
    const totalReturn = filteredBets.reduce((acc, b) => {
      if (b.status === "won" && b.odd) {
        return acc + b.odd * stake;
      }
      return acc;
    }, 0);

    // const wins = bets.filter((b) => b.status === "won").length;
    const wins = filteredBets.filter((b) => b.status === "won").length;
    // const losses = bets.filter((b) => b.status === "lost").length;
    const losses = filteredBets.filter((b) => b.status === "lost").length;

    const profit = totalReturn - totalStake;
    const roi = totalStake ? (profit / totalStake) * 100 : 0;
    const yieldValue = totalStake ? totalReturn / totalStake : 0;

    const settled = wins + losses;
    const winrate = settled ? (wins / settled) * 100 : 0;

    // 🔥 STREAK (racha actual y mejor)
    let currentStreak = 0;
    let bestStreak = 0;

    // GRAFICO
    let bankroll = 0;
    // const evolution = bets
    const evolution = filteredBets
      .filter((b) => b.status !== "pending")
      .map((b, i) => {
        if (b.status === "won" && b.odd) {
          bankroll += b.odd * stake - stake;
        } else if (b.status === "lost") {
          bankroll -= stake;
        }

        return {
          bet: i + 1,
          bankroll: Number(bankroll.toFixed(2)),
          result: b.status,
        };
      });

    // bets.forEach((b) => {
    filteredBets.forEach((b) => {
      if (b.status === "won") {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else if (b.status === "lost") {
        currentStreak = 0;
      }
    });


    return {
      totalBets,
      wins,
      losses,
      totalStake,
      totalReturn,
      profit,
      roi,
      yieldValue,
      winrate,
      currentStreak,
      bestStreak,
      evolution,
    };
  // }, [bets]);
  }, [filteredBets]);

  useEffect(() => {
    if (!open) {
      setChartReady(false);
      return;
    }

    const id = requestAnimationFrame(() => {
      setChartReady(true);
    });

    return () => cancelAnimationFrame(id);
  }, [open]);

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
      <div className="bg-[#1e1e1e] text-white rounded-2xl p-6 w-[95%] md:w-[80%] lg:w-[60%] max-h-[100vh] overflow-y-auto flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">📊 Mis Apuestas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✖
          </button>
        </div>

        {/* FILTRO STATUS */}
        <div className="mb-4 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-[#2a2a2a] rounded"
          >
            <option value="ALL">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="finished">Finalizadas</option>
          </select>
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

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Winrate</p>
            <p className="text-lg font-bold">
              {stats.winrate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Racha actual</p>
            <p className="text-lg font-bold text-green-400">
              {stats.currentStreak}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-3 rounded">
            <p className="text-xs text-gray-400">Mejor racha</p>
            <p className="text-lg font-bold">
              {stats.bestStreak}
            </p>
          </div>
        </div>

        {/* 📈 BANKROLL CHART */}
        {/* <div className="w-full h-[250px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.evolution}>
              <XAxis dataKey="bet" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="bankroll"
                strokeWidth={2}
                stroke="#22c55e"
                // dot={(props: any) => {
                dot={(props: {
                  cx?: number;
                  cy?: number;
                  payload?: ChartPoint;
                }) => {
                  // const { cx, cy, payload } = props;
                  if (!props.cx || !props.cy || !props.payload) return null;
                  const color =
                    props.payload.result === "won" ? "#22c55e" : "#ef4444";

                  return <circle cx={props.cx} cy={props.cy} r={4} fill={color} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> */}

        {stats.evolution.length === 0 && (
          <p className="text-center text-gray-400 mb-4">
            No hay apuestas resueltas aún
          </p>
        )}
        {chartReady && stats.evolution.length > 0 && (
          <div className="w-full h-[250px] min-h-[200px] flex">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.evolution}>
                <XAxis dataKey="bet" />
                <YAxis />
                <Tooltip />

                {/* 💰 BANKROLL */}
                <Line
                  type="monotone"
                  dataKey="bankroll"
                  stroke="#22c55e"
                  strokeWidth={2}
                />

                {/* 📊 ROI */}
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#2a2a2a] text-gray-300">
                <th className="p-2 text-left">Match</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2">Market</th>
                <th className="p-2">Pick</th>
                <th className="p-2">Odd</th>
                <th className="p-2">Value</th>
                <th className="p-2">Result</th>
                <th className="p-2">Status</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {/* {bets.map((b) => ( */}
              {filteredBets.map((b) => (
                <tr key={b.id} className={`${getRowColor(b.status)} border-b border-[#333]`}>
                  <td className="p-2 text-left">{b.match}</td>

                  <td className="p-2 text-center text-xs text-gray-400">
                    {formatDate(b.date)}
                  </td>

                  <td className="p-2 text-center">{b.market}</td>

                  <td className="p-2 text-center font-semibold">
                    {b.selection}
                  </td>

                  <td className="p-2 text-center">{b.odd ?? "-"}</td>

                  {/* <td className="p-2 text-center">
                    {formatValue(b.value)}
                  </td> */}
                  <td
                    className={`p-2 text-center ${
                      b.value && b.value >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
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

                  <td className="p-2 text-center">
                    <button
                      // onClick={() => {
                      //   if (confirm("¿Eliminar apuesta?")) {
                      //     onDelete(b.id);
                      //   }
                      // }}
                      onClick={() => setBetToDelete(b.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑
                    </button>
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

      {betToDelete !== null && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] max-w-sm text-center">

          <h3 className="text-lg font-bold mb-4 text-gray-400">
            🗑 Eliminar apuesta
          </h3>

          <p className="text-gray-400 mb-6">
            ¿Estás seguro de que quieres eliminar esta apuesta?
          </p>

          <div className="flex justify-center gap-4">

            {/* CANCELAR */}
            <button
              onClick={() => setBetToDelete(null)}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>

            {/* CONFIRMAR */}
            <button
              onClick={() => {
                onDelete(betToDelete);
                setBetToDelete(null);
              }}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
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