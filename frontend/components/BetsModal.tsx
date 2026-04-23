"use client";

import { useMemo, useState, useEffect } from "react";
import { Bet } from "@/types/bet";
import { ReferenceLine } from "recharts";
import { formatBetLabel } from "@/lib/format";

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
  <div className="bg-[var(--card)] p-2 rounded text-center border border-[var(--border)]">
    <p className="text-xs text-[var(--muted)]">{label}</p>
    <p
      className={`font-bold ${
        color === false
          ? "text-[var(--danger)]"
          : color
          ? "text-[var(--success)]"
          : ""
      }`}
    >
      {value}
    </p>
  </div>
);

type TooltipPayloadItem = {
  value: number;
  payload: {
    day: number | string;
    profit: number;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  if (!item || typeof item.value !== "number") return null;

  return (
    <div className="bg-[var(--card)] p-2 rounded border border-[var(--border)] text-xs">
      <p className="font-semibold">
        {item.value > 0 ? "+" : ""}
        {item.value.toFixed(2)}€
      </p>

      <p className="text-[var(--muted)]">
        beneficio acumulado
      </p>

      <p className="text-[10px] text-[var(--muted)]">
        Día {item.payload.day}
      </p>
    </div>
  );
};

// ---------------- COMPONENT ----------------

export default function BetsModal({ open, onClose, bets, onDelete }: Props) {
  const [chartReady, setChartReady] = useState(false);
  const [betToDelete, setBetToDelete] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const stake = 10;

  // ---------------- SORT (NEW FIRST) ----------------
  const sortedBets = useMemo(() => {
    return [...bets].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bets]);

  // ---------------- FILTER ----------------
  const filteredBets = useMemo(() => {
    return sortedBets.filter((b) => {
      // STATUS
      if (statusFilter === "pending" && b.status !== "pending") return false;
      if (statusFilter === "finished" && b.status === "pending") return false;

      // DATE
      const betDate = new Date(b.date);
      const now = new Date();

      const isToday = betDate.toDateString() === now.toDateString();

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);

      const isYesterday =
        betDate.toDateString() === yesterday.toDateString();

      if (dateFilter === "TODAY" && !isToday) return false;
      if (dateFilter === "YESTERDAY" && !isYesterday) return false;

      return true;
    });
  }, [sortedBets, statusFilter, dateFilter]);

  // ---------------- FORMAT ----------------
  const formatDate = (date: string) => {
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

  const formatGroupDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const compare = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (compare.getTime() === today.getTime()) return "Hoy";
    if (compare.getTime() === yesterday.getTime()) return "Ayer";

    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  // ---------------- PROFIT ----------------
  const getProfit = (b: Bet) => {
    if (b.status === "won" && b.odd) return (b.odd - 1) * stake;
    if (b.status === "lost") return -stake;
    return 0;
  };

  // ---------------- GROUP BY DAY ----------------
  const groupedBets = useMemo(() => {
    const groups: Record<string, Bet[]> = {};

    filteredBets.forEach((b) => {
      const key = new Date(b.date).toDateString();

      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });

    return groups;
  }, [filteredBets]);

  // ---------------- STATS BY DAY ----------------
  const statsByDay = useMemo(() => {
    const result: Record<string, { profit: number; roi: number }> = {};

    Object.entries(groupedBets).forEach(([date, bets]) => {
      const totalStake = bets.length * stake;

      const totalReturn = bets.reduce((acc, b) => {
        if (b.status === "won" && b.odd) {
          return acc + b.odd * stake;
        }
        return acc;
      }, 0);

      const profit = totalReturn - totalStake;
      const roi = totalStake ? (profit / totalStake) * 100 : 0;

      result[date] = { profit, roi };
    });

    return result;
  }, [groupedBets]);

  // ---------------- WEEK / MONTH ----------------
  const isSameWeek = (date: Date) => {
    const now = new Date();
    const first = new Date(now);
    first.setDate(now.getDate() - now.getDay());
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    return date >= first && date <= last;
  };

  const isSameMonth = (date: Date) => {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const globalStats = useMemo(() => {
    const calc = (bets: Bet[]) => {
      const totalStake = bets.length * stake;

      const totalReturn = bets.reduce((acc, b) => {
        if (b.status === "won" && b.odd) {
          return acc + b.odd * stake;
        }
        return acc;
      }, 0);

      const profit = totalReturn - totalStake;
      const roi = totalStake ? (profit / totalStake) * 100 : 0;

      return { profit, roi };
    };

    return {
      week: calc(filteredBets.filter((b) => isSameWeek(new Date(b.date)))),
      month: calc(filteredBets.filter((b) => isSameMonth(new Date(b.date)))),
    };
  }, [filteredBets]);

  // ---------------- DAILY GRAPH ----------------
  const dailyEvolution = useMemo(() => {
    const map: Record<string, number> = {};

    filteredBets.forEach((b) => {
      if (b.status === "pending") return;

      const key = new Date(b.date).toDateString();

      if (!map[key]) map[key] = 0;

      if (b.status === "won" && b.odd) {
        map[key] += (b.odd - 1) * stake;
      } else if (b.status === "lost") {
        map[key] -= stake;
      }
    });

    const sortedDates = Object.keys(map).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

  
    return sortedDates.reduce(
      (acc: { day: number; profit: number }[], date, i) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].profit : 0;

        const next = prev + map[date];

        acc.push({
          day: i + 1,
          profit: Number(next.toFixed(2)),
        });

        return acc;
      },
      []
    );
  }, [filteredBets]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => setChartReady(true));
  }, [open]);

  if (!open) return null;

  // ---------------- UI ----------------
  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex">
        <div className="w-full h-full bg-[var(--bg)] text-[var(--text)] flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold">📊 Mis Apuestas</h2>
            <button onClick={onClose}>✖</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* FILTERS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-[var(--card)] rounded w-full"
            >
              <option value="ALL">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="finished">Finalizadas</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 bg-[var(--card)] rounded w-full"
            >
              <option value="ALL">Todas las fechas</option>
              <option value="TODAY">Hoy</option>
              <option value="YESTERDAY">Ayer</option>
            </select>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Semana €" value={globalStats.week.profit.toFixed(2)} color={globalStats.week.profit >= 0} />
              <Stat label="Semana ROI" value={`${globalStats.week.roi.toFixed(1)}%`} color={globalStats.week.roi >= 0} />
              <Stat label="Mes €" value={globalStats.month.profit.toFixed(2)} color={globalStats.month.profit >= 0} />
              <Stat label="Mes ROI" value={`${globalStats.month.roi.toFixed(1)}%`} color={globalStats.month.roi >= 0} />
            </div>

            <div className="mb-2">
              <p className="text-sm font-semibold">📈 Evolución</p>
              <p className="text-xs text-[var(--muted)]">
                Beneficio acumulado por día
              </p>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted)]">Total</span>
              <span
                className={`font-bold ${
                  globalStats.month.profit >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
                }`}
              >
                {globalStats.month.profit >= 0 ? "+" : ""}
                {globalStats.month.profit.toFixed(2)}€
              </span>
            </div>

            {/* CHART */}
            {chartReady && dailyEvolution.length > 0 && (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyEvolution}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="var(--accent)" 
                      strokeWidth={3} 
                      dot={false} 
                    />
                    <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* BETS GROUPED */}
            <div className="space-y-6">
              {Object.entries(groupedBets).map(([date, bets]) => (
                <div key={date}>

                  <div className="flex justify-between mb-2 text-xs">
                    <span>{formatGroupDate(date)}</span>
                    <span>
                      {statsByDay[date].profit >= 0 ? "+" : ""}
                      {statsByDay[date].profit.toFixed(2)}€ |{" "}
                      {statsByDay[date].roi.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {bets.map((b) => {
                      const profit = getProfit(b);

                      return (
                        <div
                          key={b.id}
                          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3"
                        >
                          <div className="flex justify-between text-xs text-[var(--muted)]">
                            <span>{b.match}</span>
                            <span>{formatDate(b.date)}</span>
                          </div>
{/* 
                          <div className="flex justify-between">
                            <span>🎯 {formatBetLabel(b.market, b.selection)}</span>
                            <span>{b.result ?? "-"}</span>
                          </div> */}

                          <div className="flex flex-col">
                             <div className="flex justify-between">
                                <span>🎯 {formatBetLabel(b.market, b.selection)}</span>
                                <span>{b.result ?? "-"}</span>
                              </div>

                            <span className="text-xs text-[var(--muted)]">
                              @ {b.odd ?? "-"} {b.bookmaker && `• ${b.bookmaker}`}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">

                            {/* STATUS */}
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                b.status === "won"
                                  ? "bg-[var(--success)]/20 text-[var(--success)]"
                                  : b.status === "lost"
                                  ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                                  : "bg-[var(--muted)]/20 text-[var(--muted)]"
                              }`}
                            >
                              {b.status === "won"
                                ? "✔ Ganada"
                                : b.status === "lost"
                                ? "✖ Perdida"
                                : "⏳ Pendiente"}
                            </span>

                            {/* PROFIT */}
                            <span
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
                            </span>

                            {/* DELETE */}
                            <button
                              onClick={() => setBetToDelete(b.id)}
                              className="text-[var(--danger)] text-sm"
                            >
                              🗑
                            </button>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>  
    
      {betToDelete !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-xl w-[90%] max-w-sm text-center">

            <h3 className="text-lg font-bold mb-4">
              Eliminar apuesta
            </h3>

            <p className="text-sm text-[var(--muted)] mb-6">
              ¿Seguro que quieres eliminar esta apuesta?
            </p>

            <div className="flex gap-4 justify-center">

              <button
                onClick={() => setBetToDelete(null)}
                className="px-4 py-2 bg-[var(--muted)] rounded"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  onDelete(betToDelete);
                  setBetToDelete(null);
                }}
                className="px-4 py-2 bg-[var(--danger)] rounded text-white"
              >
                Eliminar
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}