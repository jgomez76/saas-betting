"use client";

import { useMemo, useState, useEffect } from "react";
import { Bet } from "@/types/bet";
import { ReferenceLine } from "recharts";
import { formatBetLabel } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Translation } from "@/lib/i18n/translations_old";
import { LOCALES } from "@/lib/i18n/config";

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

function getBetType(bet: Bet): string {

  if (bet.market === "BTTS") {
    return bet.selection === "yes"
      ? "BTTS Yes"
      : "BTTS No";
  }

  if (bet.market === "OU25") {
    return bet.selection === "over"
      ? "Over 2.5"
      : "Under 2.5";
  }

  if (bet.market === "OU35") {
    return bet.selection === "over"
      ? "Over 3.5"
      : "Under 3.5";
  }

  if (bet.market === "1X2") {

    if (bet.selection === "home") {
      return "Home";
    }

    if (bet.selection === "draw") {
      return "Draw";
    }

    if (bet.selection === "away") {
      return "Away";
    }
  }

  return "Unknown";
}

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
    date: string;
    label: string;
    profit: number;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  t: Translation;
};



const CustomTooltip = ({ active, payload, t }: CustomTooltipProps) => {
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
        {t.cumulativeProfit}
      </p>

      <p className="text-[10px] text-[var(--muted)]">
        {item.payload.label}
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
  const [stakeFilter, setStakeFilter] = useState("ALL");
  const [pickFilter, setPickFilter] = useState("ALL");
  const [leagueFilter, setLeagueFilter] = useState("ALL");

  const [showAnalytics, setShowAnalytics] = useState(false);

  const [expandedDays, setExpandedDays] = useState<
    Record<string, boolean>
  >({});

  const { t, lang } = useLanguage();

  // ---------------- SORT (NEW FIRST) ----------------
  const sortedBets = useMemo(() => {
    return [...bets].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bets]);

  const leagues = useMemo(() => {

    return [
      ...new Set(
        bets
          .map((b) => b.league)
          .filter(Boolean)
      )
    ].sort();

  }, [bets]);

  // ---------------- FILTER ----------------
  const filteredBets = useMemo(() => {
    return sortedBets.filter((b) => {
      // STATUS
      if (
        statusFilter !== "ALL" &&
        b.status !== statusFilter
      ) {
        return false;
      }

      // DATE
      const betDate = new Date(b.date);
      const now = new Date();

      const last7 = new Date();
      last7.setDate(now.getDate() - 7);

      const last30 = new Date();
      last30.setDate(now.getDate() - 30);

      const firstDayMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const firstDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const lastDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

      const firstDayYear = new Date(
        now.getFullYear(),
        0,
        1
      );

      const isToday = betDate.toDateString() === now.toDateString();

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);

      const isYesterday =
        betDate.toDateString() === yesterday.toDateString();

      if (dateFilter === "TODAY" && !isToday) return false;
      if (dateFilter === "YESTERDAY" && !isYesterday) return false;

      if (
        dateFilter === "LAST_7" &&
        betDate < last7
      ) {
        return false;
      }

      if (
        dateFilter === "LAST_30" &&
        betDate < last30
      ) {
        return false;
      }

      if (
        dateFilter === "THIS_MONTH" &&
        betDate < firstDayMonth
      ) {
        return false;
      }

      if (
        dateFilter === "LAST_MONTH" &&
        (
          betDate < firstDayLastMonth ||
          betDate > lastDayLastMonth
        )
      ) {
        return false;
      }

      if (
        dateFilter === "THIS_YEAR" &&
        betDate < firstDayYear
      ) {
        return false;
      }

      // STAKE

      if (
        stakeFilter !== "ALL" &&
        String(b.stake_level) !== stakeFilter
      ) {
        return false;
    }

    // BET TYPE

    if (
      pickFilter !== "ALL" &&
      getBetType(b) !== pickFilter
    ) {
        return false;
    }

    // LEAGUE

    if (
      leagueFilter !== "ALL" &&
      b.league !== leagueFilter
    ) {
      return false;
    }

      return true;
    });
  }, [sortedBets, statusFilter, dateFilter, stakeFilter, pickFilter, leagueFilter]);

  // ---------------- FORMAT ----------------
  const formatDate = (date: string, lang: string) => {
    const d = new Date(date + "Z");
    const locale = LOCALES[lang] || "en-GB";
    // const time = d.toLocaleTimeString("es-ES", {
    let time = d.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: lang === "en",
    });
    if (lang === "en") {
      time = time.replace(/\b(am|pm)\b/, (m) => m.toUpperCase());
    }

    const day = d.toLocaleDateString(locale, { day: "2-digit" });
    const month = d
      .toLocaleDateString(locale, { month: "short" })
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

    if (compare.getTime() === today.getTime()) return t.today;
    if (compare.getTime() === yesterday.getTime()) return t.yesterday;

    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const getProfit = (b: Bet) => {
    const stake = b.stake ?? 10; // fallback por seguridad

    if (b.status === "won" && b.odd) {
      return (b.odd - 1) * stake;
    }

    if (b.status === "lost") {
      return -stake;
    }

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
      const totalStake = bets.reduce(
        (acc, b) => acc + (b.stake ?? 10),
        0
      );

      const totalReturn = bets.reduce((acc, b) => {
        if (b.status === "won" && b.odd) {
          const stake = b.stake ?? 10;
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

    const finishedBets = filteredBets.filter(
      (b) => b.status !== "pending"
    );

    const totalStake = finishedBets.reduce(
      (acc, b) => acc + (b.stake ?? 10),
      0
    );

    const totalReturn = finishedBets.reduce(
      (acc, b) => {
        if (b.status === "won" && b.odd) {
          return acc + (b.odd * (b.stake ?? 10));
        }

        return acc;
      },
      0
    );

    const profit = totalReturn - totalStake;

    const roi =
      totalStake > 0
        ? (profit / totalStake) * 100
        : 0;

    const wonBets = finishedBets.filter(
      (b) => b.status === "won"
    ).length;

    const totalFinished = finishedBets.length;

    const winRate =
      totalFinished > 0
        ? (wonBets / totalFinished) * 100
        : 0;

    return {
      profit,
      roi,
      totalBets: totalFinished,
      winRate,
    };

  }, [filteredBets]);

  const pickStats = useMemo(() => {

    const stats: Record<
      string,
      {
        stake: number;
        returns: number;
        bets: number;
        wins: number;
      }
    > = {};

    filteredBets
      .filter((b) => b.status !== "pending")
      .forEach((bet) => {

        const pick = getBetType(bet);

        if (!stats[pick]) {

          stats[pick] = {
            stake: 0,
            returns: 0,
            bets: 0,
            wins: 0,
          };
        }

        const stake = bet.stake ?? 10;

        stats[pick].stake += stake;

        stats[pick].bets += 1;

        if (
          bet.status === "won" &&
          bet.odd
        ) {

          stats[pick].wins += 1;

          stats[pick].returns +=
            bet.odd * stake;
        }

      });

    return Object.entries(stats)
      .map(([pick, data]) => {

        const profit =
          data.returns - data.stake;

        const roi =
          data.stake > 0
            ? (profit / data.stake) * 100
            : 0;

        const winRate =
          data.bets > 0
            ? (data.wins / data.bets) * 100
            : 0;

        return {

          pick,

          bets: data.bets,

          profit,

          roi,

          winRate,

        };

      })
      .sort(
        (a, b) =>
          b.profit - a.profit
      );

  }, [filteredBets]);

  const leagueStats = useMemo(() => {

    const stats: Record<
      string,
      {
        stake: number;
        returns: number;
        bets: number;
        wins: number;
      }
    > = {};

    filteredBets
      .filter((b) => b.status !== "pending")
      .forEach((bet) => {

        const league =
          bet.league || "Sin liga";

        if (!stats[league]) {

          stats[league] = {
            stake: 0,
            returns: 0,
            bets: 0,
            wins: 0,
          };
        }

        const stake = bet.stake ?? 10;

        stats[league].stake += stake;

        stats[league].bets += 1;

        if (
          bet.status === "won" &&
          bet.odd
        ) {

          stats[league].wins += 1;

          stats[league].returns +=
            bet.odd * stake;
        }

      });

    return Object.entries(stats)
      .map(([league, data]) => {

        const profit =
          data.returns - data.stake;

        const roi =
          data.stake > 0
            ? (profit / data.stake) * 100
            : 0;

        const winRate =
          data.bets > 0
            ? (data.wins / data.bets) * 100
            : 0;

        return {

          league,

          bets: data.bets,

          profit,

          roi,

          winRate,

        };

      })
      .sort(
        (a, b) => b.roi - a.roi
      );

  }, [filteredBets]);


  // ---------------- DAILY GRAPH ----------------
  const dailyEvolution = useMemo(() => {

    const map: Record<string, number> = {};

    filteredBets.forEach((b) => {

      if (b.status === "pending") return;

      const key = new Date(b.date).toISOString().split("T")[0];

      if (!map[key]) {
        map[key] = 0;
      }

      const stake = b.stake ?? 10;

      if (b.status === "won" && b.odd) {
        map[key] += (b.odd - 1) * stake;
      } else if (b.status === "lost") {
        map[key] -= stake;
      }
    });

    const sortedDates = Object.keys(map).sort();

    return sortedDates.reduce(
      (
        acc: {
          date: string;
          label: string;
          profit: number;
        }[],
        date
      ) => {

        const previousProfit =
          acc.length > 0
            ? acc[acc.length - 1].profit
            : 0;

        const cumulative =
          previousProfit + map[date];

        const d = new Date(date);

        acc.push({
          date,
          label: d.toLocaleDateString(
            "es-ES",
            {
              day: "2-digit",
              month: "short",
            }
          ),
          profit: Number(
            cumulative.toFixed(2)
          ),
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
            <h2 className="text-lg font-bold">📊 {t.myBets}</h2>
            <button onClick={onClose}>✖</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* FILTERS */}

            <div
              className="
                bg-[var(--card)]
                border
                border-[var(--border)]
                rounded-xl
                p-4
              "
            >

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-semibold">
                  {t.filters}
                </h3>

                <button
                  onClick={() => {

                    setStatusFilter("ALL");
                    setDateFilter("ALL");
                    setLeagueFilter("ALL");
                    setStakeFilter("ALL");
                    setPickFilter("ALL");

                  }}
                  className="
                    px-3
                    py-1
                    text-xs
                    rounded
                    bg-white/10
                    hover:bg-white/20
                  "
                >
                  {t.clearFilters}
                </button>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-5
                  gap-3
                "
              >

                {/* ESTADO */}

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 bg-[var(--bg)] rounded w-full"
                >
                  <option value="ALL">{t.allStatuses}</option>
                  <option value="pending">{t.pendingBets}</option>
                  <option value="won">{t.wonBets}</option>
                  <option value="lost">{t.lostBets}</option>
                </select>

                {/* FECHA */}

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="p-2 bg-[var(--bg)] rounded w-full"
                >
                  <option value="ALL">{t.allDates}</option>

                  <option value="TODAY">{t.today}</option>
                  <option value="YESTERDAY">{t.yesterday}</option>

                  <option value="LAST_7">{t.last7Days}</option>
                  <option value="LAST_30">{t.last30Days}</option>

                  <option value="THIS_MONTH">{t.thisMonth}</option>
                  <option value="LAST_MONTH">{t.lastMonth}</option>

                  <option value="THIS_YEAR">{t.thisYear}</option>
                </select>

                {/* LIGA */}

                <select
                  value={leagueFilter}
                  onChange={(e) =>
                    setLeagueFilter(e.target.value)
                  }
                  className="p-2 bg-[var(--bg)] rounded w-full"
                >
                  <option value="ALL">{t.allLeagues}</option>

                  {leagues.map((league) => (
                    <option
                      key={league}
                      value={league}
                    >
                      {league}
                    </option>
                  ))}
                </select>

                {/* STAKE */}

                <select
                  value={stakeFilter}
                  onChange={(e) => setStakeFilter(e.target.value)}
                  className="p-2 bg-[var(--bg)] rounded w-full"
                >
                  <option value="ALL">{t.allStakes}</option>

                  <option value="1">Stake 1</option>
                  <option value="2">Stake 2</option>
                  <option value="3">Stake 3</option>
                </select>

                {/* PICK */}

                <select
                  value={pickFilter}
                  onChange={(e) => setPickFilter(e.target.value)}
                  className="p-2 bg-[var(--bg)] rounded w-full"
                >
                  <option value="ALL">{t.allPicks}</option>

                  <option value="BTTS Yes">BTTS Yes</option>
                  <option value="BTTS No">BTTS No</option>

                  <option value="Over 2.5">Over 2.5</option>
                  <option value="Under 2.5">Under 2.5</option>

                  <option value="Over 3.5">Over 3.5</option>
                  <option value="Under 3.5">Under 3.5</option>

                  <option value="Home">Home</option>
                  <option value="Draw">Draw</option>
                  <option value="Away">Away</option>
                </select>

              </div>

            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-2">

              <Stat
                label={t.profit}
                value={`${globalStats.profit.toFixed(2)}€`}
                color={globalStats.profit >= 0}
              />

              <Stat
                label="ROI"
                value={`${globalStats.roi.toFixed(1)}%`}
                color={globalStats.roi >= 0}
              />

              <Stat
                label={t.bets}
                value={globalStats.totalBets}
              />

              <Stat
                label={t.winRate}
                value={`${globalStats.winRate.toFixed(1)}%`}
                color={globalStats.winRate >= 50}
              />

            </div>

            <div className="mb-2">
              <p className="text-sm font-semibold">📈 {t.evolution}</p>
              <p className="text-xs text-[var(--muted)]">
                {t.cumulativeProfit}
              </p>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted)]">{t.total}</span>
              <span
                className={`font-bold ${
                  globalStats.profit >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
                }`}
              >
                {globalStats.profit >= 0 ? "+" : ""}
                {globalStats.profit.toFixed(2)}€
              </span>
            </div>

            {/* CHART */}
            {chartReady && dailyEvolution.length > 0 && (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyEvolution}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip t={t} />} />
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

            <div className="mt-8">

              <button
                onClick={() =>
                  setShowAnalytics(!showAnalytics)
                }
                className="
                  w-full
                  flex
                  justify-between
                  items-center
                  mb-4
                  p-3
                  rounded-xl
                  bg-[var(--card)]
                  border
                  border-[var(--border)]
                  hover:bg-white/5
                  transition
                "
              >

                <span className="font-semibold">
                  📊 {t.advancedAnalyticsTitle}
                </span>

                <span>
                  {showAnalytics ? "▲" : "▼"}
                </span>

              </button>


              {showAnalytics && (

                <div className="w-full space-y-8">

                  {/* ===================================== */}
                  {/* DESCRIPCIÓN */}
                  {/* ===================================== */}

                  <div className="text-sm opacity-70">
                    {t.analyticsDescription}
                  </div>

                  {/* ===================================== */}
                  {/* RESUMEN RÁPIDO */}
                  {/* ===================================== */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      lg:grid-cols-4
                      gap-3
                    "
                  >

                    {pickStats.length > 0 && (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs opacity-60 mb-1">
                          🏆 {t.bestPick}
                        </div>

                        <div className="font-semibold">
                          {pickStats
                            .filter(p => p.bets >= 5)
                            .sort((a, b) => b.roi - a.roi)[0]?.pick}
                        </div>

                        <div className="text-green-500 font-medium">
                          ROI {
                            pickStats
                              .filter(p => p.bets >= 5)
                              .sort((a, b) => b.roi - a.roi)[0]
                              ?.roi.toFixed(1)
                          }%
                        </div>
                      </div>
                    )}

                    {pickStats.length > 0 && (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs opacity-60 mb-1">
                          📉 {t.worstPick}
                        </div>

                        <div className="font-semibold">
                          {pickStats
                            .filter(p => p.bets >= 5)
                            .sort((a, b) => a.roi - b.roi)[0]?.pick}
                        </div>

                        <div className="text-red-500 font-medium">
                          ROI {
                            pickStats
                              .filter(p => p.bets >= 5)
                              .sort((a, b) => a.roi - b.roi)[0]
                              ?.roi.toFixed(1)
                          }%
                        </div>
                      </div>
                    )}

                    {leagueStats.length > 0 && (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs opacity-60 mb-1">
                          🏆 {t.bestLeague}
                        </div>

                        <div className="font-semibold">
                          {leagueStats
                            .filter(l => l.bets >= 5)
                            .sort((a, b) => b.roi - a.roi)[0]?.league}
                        </div>

                        <div className="text-green-500 font-medium">
                          ROI {
                            leagueStats
                              .filter(l => l.bets >= 5)
                              .sort((a, b) => b.roi - a.roi)[0]
                              ?.roi.toFixed(1)
                          }%
                        </div>
                      </div>
                    )}

                    {leagueStats.length > 0 && (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-xs opacity-60 mb-1">
                          📉 {t.worstLeague}
                        </div>

                        <div className="font-semibold">
                          {leagueStats
                            .filter(l => l.bets >= 5)
                            .sort((a, b) => a.roi - b.roi)[0]?.league}
                        </div>

                        <div className="text-red-500 font-medium">
                          ROI {
                            leagueStats
                              .filter(l => l.bets >= 5)
                              .sort((a, b) => a.roi - b.roi)[0]
                              ?.roi.toFixed(1)
                          }%
                        </div>
                      </div>
                    )}

                  </div>

                  {/* ===================================== */}
                  {/* PICKS */}
                  {/* ===================================== */}

                  <div
                    className="
                      bg-[var(--card)]
                      border
                      border-[var(--border)]
                      rounded-xl
                      p-4
                    "
                  >

                    <h4 className="font-semibold mb-4">
                      📈 {t.performanceByPick}
                    </h4>

                    <div className="overflow-x-auto">

                      <table className="w-full table-fixed text-sm">

                        <thead className="border-b border-[var(--border)]">

                          <tr>

                            <th className="w-[40%] text-left py-3">
                              {t.pick}
                            </th>

                            <th className="w-[10%] text-center py-3">
                              {t.betsShort}
                            </th>

                            <th className="w-[15%] text-center py-3">
                              WR
                            </th>

                            <th className="w-[15%] text-center py-3">
                              ROI
                            </th>

                            <th className="w-[20%] text-right py-3">
                              {t.profit}
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {[
                            ...pickStats.filter(p => p.bets >= 5)
                              .sort((a, b) => b.roi - a.roi),

                            ...pickStats.filter(p => p.bets < 5)
                              .sort((a, b) => b.roi - a.roi)

                          ].map((row) => (

                            <tr
                              key={row.pick}
                              className="border-b border-[var(--border)]"
                            >

                              <td className="py-3 font-medium">

                                {row.pick}

                                {row.bets < 5 && (
                                  <span className="ml-2 opacity-50">
                                    ⚠
                                  </span>
                                )}

                              </td>

                              <td className="text-center">
                                {row.bets}
                              </td>

                              <td className="text-center">
                                {row.winRate.toFixed(1)}%
                              </td>

                              <td
                                className={`text-center font-medium ${
                                  row.roi >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {row.roi.toFixed(1)}%
                              </td>

                              <td
                                className={`text-right font-bold ${
                                  row.profit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {row.profit >= 0 ? "+" : ""}
                                {row.profit.toFixed(2)}€
                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>

                  </div>

                  {/* ===================================== */}
                  {/* LIGAS */}
                  {/* ===================================== */}

                  <div
                    className="
                      bg-[var(--card)]
                      border
                      border-[var(--border)]
                      rounded-xl
                      p-4
                    "
                  >

                    <h4 className="font-semibold mb-4">
                      🏆 {t.performanceByLeague}
                    </h4>

                    <div className="overflow-x-auto">

                      <table className="w-full table-fixed text-sm">

                        <thead className="border-b border-[var(--border)]">

                          <tr>

                            <th className="w-[40%] text-left py-3">
                              {t.league}
                            </th>

                            <th className="w-[10%] text-center py-3">
                              {t.betsShort}
                            </th>

                            <th className="w-[15%] text-center py-3">
                              WR
                            </th>

                            <th className="w-[15%] text-center py-3">
                              ROI
                            </th>

                            <th className="w-[20%] text-right py-3">
                              {t.profit}
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {[
                            ...leagueStats.filter(l => l.bets >= 5)
                              .sort((a, b) => b.roi - a.roi),

                            ...leagueStats.filter(l => l.bets < 5)
                              .sort((a, b) => b.roi - a.roi)

                          ].map((row) => (

                            <tr
                              key={row.league}
                              className="border-b border-[var(--border)]"
                            >

                              <td className="py-3 font-medium">

                                {row.league}

                                {row.bets < 5 && (
                                  <span className="ml-2 opacity-50">
                                    ⚠
                                  </span>
                                )}

                              </td>

                              <td className="text-center">
                                {row.bets}
                              </td>

                              <td className="text-center">
                                {row.winRate.toFixed(1)}%
                              </td>

                              <td
                                className={`text-center font-medium ${
                                  row.roi >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {row.roi.toFixed(1)}%
                              </td>

                              <td
                                className={`text-right font-bold ${
                                  row.profit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {row.profit >= 0 ? "+" : ""}
                                {row.profit.toFixed(2)}€
                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>

                  </div>

                </div>

              )}


            </div>


            {/* BETS GROUPED */}
            <div className="flex items-center justify-between mt-8 mb-4">

              <div className="flex items-center gap-2">

                <span>📚</span>

                <h3 className="font-semibold text-lg">
                  {t.betHistory}
                </h3>

              </div>

              <span className="text-sm opacity-60">

                {filteredBets.length} {t.bets}

              </span>

            </div>

            <div className="space-y-6">

              {Object.entries(groupedBets).map(
                ([date, bets], index) => {

                  const isExpanded =
                    expandedDays[date] ?? (index === 0);

                  return (

                    <div key={date}>

                      <button
                        onClick={() =>
                          setExpandedDays(prev => ({
                            ...prev,
                            [date]: !prev[date],
                          }))
                        }
                        className="
                          w-full
                          flex
                          justify-between
                          items-center
                          px-4
                          py-2
                          rounded-lg
                          bg-[var(--card)]
                          border
                          border-[var(--border)]
                          hover:bg-white/5
                          transition
                        "
                      >

                        <div className="flex items-center gap-2">

                          <span>
                            {isExpanded ? "▼" : "▶"}
                          </span>

                          <span className="font-medium text-sm">

                            {formatGroupDate(date)}

                          </span>

                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-4
                            text-xs
                          "
                        >

                          <span className="opacity-60">

                            {bets.length}

                            {" "}

                            {bets.length === 1
                              ? t.betShort
                              : t.betsShortPlural}

                          </span>

                          <span
                            className={
                              statsByDay[date].profit >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >

                            {statsByDay[date].profit >= 0 ? "+" : ""}
                            {statsByDay[date].profit.toFixed(2)}€

                          </span>

                          <span
                            className={
                              statsByDay[date].roi >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >

                            ROI {statsByDay[date].roi.toFixed(1)}%

                          </span>

                        </div>

                      </button>

                      {isExpanded && (

                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                          {bets.map((b) => {

                            const profit = getProfit(b);

                            return (

                              <div
                                key={b.id}
                                className="
                                  bg-[var(--card)]
                                  border
                                  border-[var(--border)]
                                  rounded-xl
                                  p-4
                                  flex
                                  flex-col
                                  gap-3
                                "
                              >

                                <div className="flex justify-between text-xs text-[var(--muted)]">

                                  <span>{b.match}</span>

                                  <span>
                                    {formatDate(b.date, lang)}
                                  </span>

                                </div>

                                <div className="flex flex-col">

                                  <div className="flex justify-between">

                                    <span>
                                      🎯 {formatBetLabel(
                                        b.market,
                                        b.selection,
                                        t
                                      )}
                                    </span>

                                    <span>
                                      {b.result ?? "-"}
                                    </span>

                                  </div>

                                  <span className="text-xs text-[var(--muted)]">

                                    {t.stake}{" "}
                                    {b.stake_level ?? "-"} •{" "}
                                    {b.stake ?? "-"}€

                                  </span>

                                  <span className="text-xs text-[var(--muted)]">

                                    @ {b.odd ?? "-"}

                                    {b.bookmaker &&
                                      ` • ${b.bookmaker}`}

                                  </span>

                                </div>

                                <div className="flex justify-between items-center">

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
                                      ? <>✔ {t.won}</>
                                      : b.status === "lost"
                                      ? <>✖ {t.lost}</>
                                      : <>⏳ {t.pending}</>}

                                  </span>

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

                                  <button
                                    onClick={() =>
                                      setBetToDelete(b.id)
                                    }
                                    className="
                                      text-[var(--danger)]
                                      text-sm
                                    "
                                  >
                                    🗑
                                  </button>

                                </div>

                              </div>

                            );

                          })}

                        </div>

                      )}

                    </div>

                  );

                }
              )}

            </div>

          </div>
        </div>
      </div>  
    
      {betToDelete !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-xl w-[90%] max-w-sm text-center">

            <h3 className="text-lg font-bold mb-4">
              {t.deleteBet}
            </h3>

            <p className="text-sm text-[var(--muted)] mb-6">
              {t.confirmDelete}
            </p>

            <div className="flex gap-4 justify-center">

              <button
                onClick={() => setBetToDelete(null)}
                className="px-4 py-2 bg-[var(--muted)] rounded"
              >
                {t.cancel}
              </button>

              <button
                onClick={() => {
                  onDelete(betToDelete);
                  setBetToDelete(null);
                }}
                className="px-4 py-2 bg-[var(--danger)] rounded text-white"
              >
                {t.delete}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}