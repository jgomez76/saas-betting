"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TopValueModal from "@/components/TopValueModal";
import BetsModal from "@/components/BetsModal";
import LoginModal from "@/components/LoginModal";
import AnalysisModal from "@/components/AnalysisModal";
import ResultsView from "@/components/ResultsView";
import StandingsView from "@/components/StandingsView";
import { API_URL } from "@/lib/api";
import { Bet } from "@/types/bet";
import { useSession } from "next-auth/react";

// ---------------- TYPES ----------------

type Odd = {
  odd: number;
  bookmaker: string;
};

type TeamMatch = {
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  date: string;
};

type Match = {
  home_team: string;
  away_team: string;
  league: string;
  league_id: number;
  date: string;
  fixture_id: number;

  value?: {
    home_value: number | null;
    draw_value: number | null;
    away_value: number | null;
  };

  markets?: {
    "1X2"?: {
      home?: Odd;
      draw?: Odd;
      away?: Odd;
    };
    // OU15?: {
    //   over?: Odd;
    //   under?: Odd;
    // };
    OU25?: {
      over?: Odd;
      under?: Odd;
    };
    OU35?: {
      over?: Odd;
      under?: Odd;
    };
    BTTS?: {
      yes?: Odd;
      no?: Odd;
    };
  };

  market_values?: {
    // OU15?: {
    //   over_value: number | null;
    //   under_value: number | null;
    // };
    OU25?: {
      over_value: number | null;
      under_value: number | null;
    };
    OU35?: {
      over_value: number | null;
      under_value: number | null;
    };
    BTTS?: {
      yes_value: number | null;
      no_value: number | null;
    };
  };

  home_form?: string;
  away_form?: string;

  probabilities?: {
    home_odds?: number;
    draw_odds?: number;
    away_odds?: number;
  };

  extra_probabilities?: {
    over15_prob?: number;
    under15_prob?: number;
    over25_prob?: number;
    under25_prob?: number;
    over35_prob?: number;
    under35_prob?: number;
    btts_yes_prob?: number;
    btts_no_prob?: number;
  };
};

// ---------------- COMPONENT ----------------

export default function Home() {

  // ###########
  // CONSTANTES
  // ###########

  const { data: session } = useSession();
  const oauthDone = useRef(false);

  // const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("dashboard");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [marketFilter, setMarketFilter] = useState("1X2");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("TODAY_TOMORROW");
  const [showTopModal, setShowTopModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  type PendingBet = Omit<Bet, "id">;
  const [pendingBet, setPendingBet] = useState<PendingBet | null>(null);

  const [bets, setBets] = useState<Bet[]>(() => {
  if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("bets");
    return stored ? JSON.parse(stored) : [];
  });

  const handleDeleteBet = (id: number) => {
  // 1. eliminar de array
    const updatedBets = bets.filter((b) => b.id !== id);

    // 2. actualizar estado React
    setBets(updatedBets);

    // 3. actualizar localStorage
    localStorage.setItem("bets", JSON.stringify(updatedBets));
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  const [openLeagues, setOpenLeagues] = useState<Record<string, boolean>>({});
  const toggleLeague = (league: string) => {
    setOpenLeagues((prev) => ({
      ...prev,
      [league]: !prev[league],
    }));
  };

  const [minValue, setMinValue] = useState(0.1); // 🔥 10% por defecto
  const [minOdd, setMinOdd] = useState(1.5);     // 🔥 cuota mínima

  const betsRef = useRef<Bet[]>(bets);

  const mergeMatches = (oldMatches: Match[], newMatches: Match[]) => {
    const map = new Map<number, Match>();

    // 🔹 antiguos
    oldMatches.forEach((m) => {
      map.set(m.fixture_id, m);
    });



    // 🔹 nuevos (sobrescriben siempre)
    newMatches.forEach((m) => {
      map.set(m.fixture_id, m);
    });

    return Array.from(map.values());
  };

  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // FUNCION PARA FECHA PARTIDOS
  const formatMatchDate = (date: string) => {
    if (!date) return "-";

    const d = new Date(date + "Z");
    const now = new Date();

    // 🔥 NORMALIZAR DÍAS
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matchDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const time = d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });

    // HOY
    if (matchDay.getTime() === today.getTime()) {
      return `Hoy • ${time}`;
    }

    // MAÑANA
    if (matchDay.getTime() === tomorrow.getTime()) {
      return `Mañana • ${time}`;
    }

    // FORMATO NORMAL
    const day = d.toLocaleDateString("es-ES", {
      day: "2-digit",
    });

    const month = d
      .toLocaleDateString("es-ES", { month: "short" })
      .replace(".", "");

    return `${day} ${month} • ${time}`;
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  
  const handleLogout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    setIsAdmin(false);
    setEmail("");
  };

  const refreshUser = () => {
    fetch(`${API_URL}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.is_admin);
        setEmail(data.email || "");
        setIsPremium(data.subscription === "premium");
      })
      .catch(() => {
        setIsAdmin(false);
        setEmail("");
        setIsPremium(false);
      });
  };


  // ###########
  // USE EFFECTS
  // ###########

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);


  // LOGIN GOOGLE/GITHUB
  useEffect(() => {
    if (session?.user?.email && !oauthDone.current) {
      console.log("🔐 OAuth user:", session.user.email);

      oauthDone.current = true;

      fetch(`${API_URL}/oauth-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then(() => {
          console.log("✅ OAuth login OK");

          // 🔥 recargar para sincronizar con tu backend
          // window.location.reload();
           refreshUser();
        })
        .catch((err) => {
          console.error("💥 OAuth backend error:", err);
        });
    }
  }, [session, oauthDone]);
 
  // NEW LOGIN WITH JWT
  useEffect(() => {
    fetch(`${API_URL}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.is_admin);
        setEmail(data.email || "");
        setIsPremium(data.subscription === "premium");
      })
      .catch(() => {
        setIsAdmin(false);
        setEmail("");
        setIsPremium(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // --------- SINCRO REF --------
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  // ---------------- LOAD DATA ----------------

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadingMessage("Cargando partidos...");

      await new Promise((r) => setTimeout(r, 0));

      // const res = await fetch(`${API_URL}/value-bets`);
      // const data = await res.json();

      let data = [];

      try {
        const res = await fetch(`${API_URL}/value-bets`, {
          credentials: "include",
        });

        // 🔐 si no está logueado o backend no responde bien
        if (!res.ok) {
          console.warn("⚠️ value-bets no disponible (modo público)");
          setLoading(false);
          return;
        }

        data = await res.json();

      } catch (err) {
        console.error("💥 ERROR cargando value-bets:", err);
        setLoading(false);
        return;
      }

      // 👇 solo partidos con odds
      const filtered = data.filter((m: Match) => m.markets?.["1X2"]);

      // setAllMatches(filtered); // 👈 guardamos TODOS

      // 🔥 ABRIR TODAS LAS LIGAS
      // const leagues = Array.from(new Set(filtered.map((m: Match) => m.league)));

      const leagues: string[] = Array.from(
        new Set(filtered.map((m: Match) => m.league))
      );

      const initialState: Record<string, boolean> = {};

      leagues.forEach((l) => {
        initialState[l] = true;
      });

      setOpenLeagues(initialState);
      
      // setLoading(false);
      
      // NUEVO LOADING
      // 🔥 AGRUPAR POR LIGA
      const groupedByLeague: Record<string, Match[]> = {};

      filtered.forEach((m: Match) => {
        if (!groupedByLeague[m.league]) {
          groupedByLeague[m.league] = [];
        }
        groupedByLeague[m.league].push(m);
      });

      const leagueNames = Object.keys(groupedByLeague);

      // 🔥 RESET INICIAL
      setAllMatches([]);

      // 🔥 CARGA PROGRESIVA
      // for (const league of Object.keys(groupedByLeague)) {
      for (let i = 0; i < leagueNames.length; i++) {
        const league = leagueNames[i];
        setLoadingMessage(`Cargando partidos de: ${league}...`);

        setProgress(Math.round(((i + 1) / leagueNames.length) * 100));

        // 👇 pequeña pausa visual (UX)
        await new Promise((r) => setTimeout(r, 300));

        setAllMatches((prev) => [
          ...prev,
          ...groupedByLeague[league],
        ]);
      }

      // 🔥 FIN
      setLoading(false);
      setLoadingMessage("");

    };

    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      // try {
        // const res = await fetch(`${API_URL}/value-bets`);
        // const data = await res.json();
      try {
        const res = await fetch(`${API_URL}/value-bets`, {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        const filtered = data.filter((m: Match) => m.markets?.["1X2"]);

        console.log("Refresh: ", filtered.length);

        setAllMatches((prev) => mergeMatches(prev, filtered));

      } catch (err) {
        console.error("Refresh error", err);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const matches = useMemo(() => {
    let filtered: Match[] = [...allMatches];

    // 🏆 LIGA
    if (leagueFilter !== "ALL") {
      // filtered = filtered.filter((m) => m.league === leagueFilter);
      filtered = filtered.filter(
        (m) => String(m.league_id) === leagueFilter
      );
    }

    // ⚽ MERCADO
    if (marketFilter !== "ALL") {
      filtered = filtered.filter((m) => {
        if (marketFilter === "1X2") return !!m.markets?.["1X2"];
        // if (marketFilter === "OU15") return !!m.markets?.OU15;
        if (marketFilter === "OU25") return !!m.markets?.OU25;
        if (marketFilter === "OU35") return !!m.markets?.OU35;
        if (marketFilter === "BTTS") return !!m.markets?.BTTS;
        return true;
      });
    }

    // 📅 FECHA
    if (dateFilter !== "ALL") {
      const now = new Date();

      filtered = filtered.filter((m) => {
        const matchDate = new Date(m.date + "Z");

        const diffTime = matchDate.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (dateFilter === "TODAY") {
          return matchDate.toDateString() === now.toDateString();
        }

        if (dateFilter === "TODAY_TOMORROW") {
          return diffDays >= 0 && diffDays <= 1;
        }

        if (dateFilter === "NEXT_3_DAYS") {
          return diffDays >= 0 && diffDays <= 3;
        }

        return true;
      });
    }

    // 🔥 FILTRO VALUE + ODDS (CLAVE)
    filtered = filtered.filter((m) => {
      const markets = m.markets;

      if (!markets) return false;

      // 1X2
      if (markets["1X2"]) {
        const vals = m.value;
        if (
          (vals?.home_value ?? 0) > 0.1 ||
          (vals?.draw_value ?? 0) > 0.1 ||
          (vals?.away_value ?? 0) > 0.1
        ) {
          const odds = markets["1X2"];
          return (
            (odds.home?.odd ?? 0) >= 1.5 ||
            (odds.draw?.odd ?? 0) >= 1.5 ||
            (odds.away?.odd ?? 0) >= 1.5
          );
        }
      }

      // OU25 / OU35 / BTTS
      const checkMarket = (value?: number | null, odd?: number) => {
        return (value ?? 0) > 0.1 && (odd ?? 0) >= 1.5;
      };

      return (
        checkMarket(m.market_values?.OU25?.over_value, markets.OU25?.over?.odd) ||
        checkMarket(m.market_values?.OU25?.under_value, markets.OU25?.under?.odd) ||
        checkMarket(m.market_values?.OU35?.over_value, markets.OU35?.over?.odd) ||
        checkMarket(m.market_values?.OU35?.under_value, markets.OU35?.under?.odd) ||
        checkMarket(m.market_values?.BTTS?.yes_value, markets.BTTS?.yes?.odd) ||
        checkMarket(m.market_values?.BTTS?.no_value, markets.BTTS?.no?.odd)
      );
    });

    // 🔥 EVITAR DUPLICADOS POR PARTIDO
    const seen = new Set<number>();

    filtered = filtered.filter((m) => {
      if (seen.has(m.fixture_id)) return false;

      seen.add(m.fixture_id);
      return true;
    });

    return filtered;
  }, [allMatches, leagueFilter, marketFilter, dateFilter]);

  // ------------- AUTO RESOLVE BETS -----------

  useEffect(() => {
    const resolveBets = async () => {
      if (!betsRef.current.length) return;

      const updated = await Promise.all(
        betsRef.current.map(async (bet) => {
          if (bet.status !== "pending" || !bet.fixture_id) return bet;

          try {
            const res = await fetch(
              `${API_URL}/fixture/${bet.fixture_id}/result`
            );
            const data = await res.json();

            if (!data || data.status !== "FT") return bet;

            const { home_goals, away_goals } = data;

            let status: "won" | "lost" = "lost";

            // ---------------- 1X2 ----------------
            if (bet.market === "1X2") {
              if (
                (bet.selection === "home" && home_goals > away_goals) ||
                (bet.selection === "away" && away_goals > home_goals) ||
                (bet.selection === "draw" && home_goals === away_goals)
              ) {
                status = "won";
              }
            }

            // ---------------- OU25 ----------------
            if (bet.market === "OU25") {
              const total = home_goals + away_goals;

              if (
                (bet.selection === "over" && total > 2.5) ||
                (bet.selection === "under" && total < 2.5)
              ) {
                status = "won";
              }
            }

            // ---------------- OU35 ----------------
            if (bet.market === "OU35") {
              const total = home_goals + away_goals;

              if (
                (bet.selection === "over" && total > 3.5) ||
                (bet.selection === "under" && total < 3.5)
              ) {
                status = "won";
              }
            }

            // ---------------- BTTS ----------------
            if (bet.market === "BTTS") {
              const btts = home_goals > 0 && away_goals > 0;

              if (
                (bet.selection === "yes" && btts) ||
                (bet.selection === "no" && !btts)
              ) {
                status = "won";
              }
            }

            return {
              ...bet,
              status,
              result: `${home_goals}-${away_goals}`,
            };
          } catch {
            return bet;
          }
        })
      );

      setBets(updated);
      localStorage.setItem("bets", JSON.stringify(updated));
    };

    resolveBets();
  }, []);

  // ---------------- BET SYSTEM ----------------
  const addBet = (bet: PendingBet) => {
    const newBet: Bet = {
      ...bet,
      // id: crypto.randomUUID(),
      id: Date.now(),
    };

    const updated = [...bets, newBet];
    setBets(updated);
    localStorage.setItem("bets", JSON.stringify(updated));
  };

  // ---------------- FAVORITES ----------------

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // ---------------- TEAM MODAL ----------------

  const openTeamModal = async (team: string) => {
    setSelectedTeam(team);

    const res = await fetch(`${API_URL}/team/${team}/matches`);
    const data = await res.json();

    setTeamMatches(data);
  };


  // ---------------- HELPERS ----------------

  const formatValue = (v?: number | null) => {
    if (v === null || v === undefined) return null;
    return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  const getValueColor = (v?: number | null, odd?: number) => {
    if (v === null || v === undefined) return "bg-[#2a2a2a]";

    if (v >= minValue && (odd ?? 0) >= minOdd) {
      return "bg-green-700";
    }

    return "bg-[#2a2a2a]";
  };

  const grouped = useMemo(() => {
    return matches.reduce((acc, match) => {
      if (!acc[match.league]) {
        acc[match.league] = [];
      }

      acc[match.league].push(match);

      return acc;
    }, {} as Record<string, Match[]>);
  }, [matches]);

  const leagueIdToName = useMemo(() => {
    const map: Record<string, string> = {};

    allMatches.forEach((m) => {
      map[String(m.league_id)] = m.league;
    });

    return map;
  }, [allMatches]);

  const renderForm = (form: string) => (
    <div className="flex justify-center gap-1 mt-1">
      {form.split("").map((f, i) => {
        const color =
          f === "W"
            ? "bg-green-500"
            : f === "D"
            ? "bg-yellow-400"
            : "bg-red-500";

        return (
          <span key={i} className={`text-white text-xs px-1 rounded ${color}`}>
            {f}
          </span>
        );
      })}
    </div>
  );

  // SKELETON CARD
  const SkeletonCard = () => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl animate-pulse">

      {/* equipos */}
      <div className="grid mb-3" style={{ gridTemplateColumns: "45% 10% 45%" }}>
        <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
        <div></div>
        <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
      </div>

      {/* fecha */}
      <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-3"></div>

      {/* cuotas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>

    </div>
  );

  // ---------------- RENDER ----------------

  const handleLeagueChange = (value: string) => {
    setLeagueFilter(value);

    // 🌍 TODAS
    if (value === "ALL") {
      const leagues = Array.from(
        new Set(allMatches.map((m) => m.league))
      );

      const state: Record<string, boolean> = {};
      leagues.forEach((l) => (state[l] = true));

      setOpenLeagues(state);
      return;
    }

    // 🎯 UNA LIGA → convertir ID a nombre
    const leagueName = leagueIdToName[value];

    if (!leagueName) return;

    setOpenLeagues({ [leagueName]: true });
  };

  return (
    // <main className="p-6 bg-gray-100 min-h-screen">
    <div className="flex">

      {/* {!authLoading && (
        <Sidebar view={view} setView={setView} isAdmin={isAdmin} />
      )} */}
      <Sidebar view={view} setView={setView} isAdmin={isAdmin} />
      {/* <Sidebar view={view} setView={setView} /> */}

      {/* <main className="flex-1 p-6 bg-gray-100 min-h-screen"> */}
      {/* <main className="flex-1 p-6 bg-[#18181b] min-h-screen text-white"> */}
      <main className="flex-1 p-6 bg-[#F0B071] min-h-screen text-white">

        {/* DASHBOARD */}
        {view === "dashboard" && (
        <>
          {loading && (
            <div className="mb-6">

              {/* TEXTO */}
              <p className="text-center text-sm text-gray-400 mb-2 animate-pulse">
                ⏳ {loadingMessage}
              </p>

              {/* 🔥 BARRA PROGRESO */}
              <div className="w-full max-w-md mx-auto bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* % */}
              <p className="text-center text-xs text-gray-500 mt-1">
                {progress}%
              </p>

            </div>
          )}

          {mounted && (
            <Navbar
              onOpenTop={() => setShowTopModal(true)}
              // onOpenBets={() => setShowBetsModal(true)}
              onOpenBets={() => setView("bets")}
              onOpenLogin={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              onOpenAnalysis={() => setShowAnalysisModal(true)}

              marketFilter={marketFilter}
              setMarketFilter={setMarketFilter}
              leagueFilter={leagueFilter}
              // setLeagueFilter={setLeagueFilter}
              setLeagueFilter={handleLeagueChange}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}

                // 🔥 NUEVO
              minValue={minValue}
              setMinValue={setMinValue}
              minOdd={minOdd}
              setMinOdd={setMinOdd}
              isAdmin={isAdmin}
              email={email}
            />
          )}

          {loading && Object.keys(grouped).length === 0 && (
            <div className="grid mt-6 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* {Object.entries(grouped).map(([league, leagueMatches]) => ( */}
          {Object.entries(grouped).map(([league, leagueMatches], i) => (
            // <div 
            //   key={league}
            //   className="animate-fadeIn"
            // >
            <div
              key={league}
              className="animate-fadeIn"
              style={{ animationDelay: `${i * 0.08}s` }}
            >

              {/* 🏆 NOMBRE LIGA */}
              <div
                onClick={() => toggleLeague(league)}
                // className="flex justify-between items-center bg-[#2a2a2a] text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-[#3a3a3a] transition mt-6"
                className="flex justify-between items-center bg-[#2a2a2a] text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-[#3a3a3a] transition mt-8 border border-[#333]"
              >
                <div className="flex items-center gap-2">
                  <span>{openLeagues[league] ? "▼" : "▶"}</span>
                  <span className="font-semibold text-lg">{league}</span>
                </div>

                <span className="text-sm text-gray-400">
                  {leagueMatches.length} partidos
                </span>
              </div>

              {/* 📦 GRID DE PARTIDOS */}
              <div
                className={`transition-all duration-500 ease-out transform ${
                  openLeagues[league]
                    ? "max-h-[2000px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2 overflow-hidden"
                }`}
              >
                {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"> */}
                <div className="grid mt-4 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                  {/* LOADING SKELETON CARD */}
                  {loading && leagueMatches.length === 0 && (
                    <div className="grid mt-4 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  )}

                  {!loading &&
                    leagueMatches.map((match, index) => {
                    const id = match.home_team + match.away_team;

                    // FECHA PARTIDOS
                    return (
                      <div
                        key={index}
                        // className="bg-[#1e1e1e] text-white p-4 rounded-xl relative"
                        className="bg-[#1f2937] text-white p-4 rounded-xl relative"
                        // className="bg-[#0D0D0D] text-white p-4 rounded-xl relative"
                      >
                        {/* ⭐ FAVORITO */}
                        <button
                          onClick={() => toggleFavorite(id)}
                          className="absolute top-2 right-2"
                        >
                          {favorites.includes(id) ? "⭐" : "☆"}
                        </button>

                        {/* EQUIPOS */}
                        <div
                          className="grid text-center mb-3"
                          style={{ gridTemplateColumns: "45% 10% 45%" }}
                        >
                          <div onClick={() => openTeamModal(match.home_team)}>
                            <p>{match.home_team}</p>
                            {renderForm(match.home_form || "")}
                          </div>

                          <div className="text-gray-400 text-xs">vs</div>

                          <div onClick={() => openTeamModal(match.away_team)}>
                            <p>{match.away_team}</p>
                            {renderForm(match.away_form || "")}
                          </div>
                        </div>

                        {/* FECHA */}
                        <p className="text-xm text-gray-300 text-center mb-2">
                          {/* {match.league} • {formattedDate} • {formattedTime} */}
                          {/* {formattedDate} • {formattedTime} */}
                          {formatMatchDate(match.date)}
                        </p>

                        {/* 1X2 */}
                        {(marketFilter === "ALL" || marketFilter === "1X2") &&
                          match.markets?.["1X2"] && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {(["home", "draw", "away"] as const).map((k) => {
                                const odd = match.markets?.["1X2"]?.[k];
                                const value =
                                  match.value?.[`${k}_value` as keyof typeof match.value];

                                const fairOdd =
                                  k === "home"
                                    ? match.probabilities?.home_odds
                                    : k === "draw"
                                    ? match.probabilities?.draw_odds
                                    : match.probabilities?.away_odds;

                                return (
                                  <div
                                    key={k}
                                    onClick={() =>
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "1X2",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date
                                      })
                                    }
                                    className={`${getValueColor(
                                      value,
                                      odd?.odd
                                    )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-sm uppercase text-gray-300">{k}</p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-3xl">{odd?.odd ?? "-"}</p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-lg text-gray-300">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR ODDS + VALUE */}
                                    <p
                                      className={`text-xs ${
                                        value !== null && value !== undefined && value < 0
                                          ? "text-red-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                      {value !== null && value !== undefined &&
                                        `(${formatValue(value)})`}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                        )}

                      
                        {/* OU25 */}
                        {(marketFilter === "ALL" || marketFilter === "OU25") &&
                          match.markets?.OU25 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {(["over", "under"] as const).map((k) => {
                                const odd = match.markets?.OU25?.[k];
                                const value =
                                  k === "over"
                                    ? match.market_values?.OU25?.over_value
                                    : match.market_values?.OU25?.under_value;

                                // 👉 FAIR ODDS (IMPORTANTE)
                                const fairOdd =
                                  k === "over"
                                    ? match.extra_probabilities?.over25_prob
                                      ? 1 / match.extra_probabilities.over25_prob
                                      : null
                                    : match.extra_probabilities?.under25_prob
                                    ? 1 / match.extra_probabilities.under25_prob
                                    : null;

                                return (
                                  <div
                                    key={k}
                                    onClick={() =>
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "OU25",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date
                                      })
                                    }
                                    className={`${getValueColor(
                                      value,
                                      odd?.odd
                                    )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-sm uppercase text-gray-300">
                                      {k} 2.5
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-3xl">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-lg text-gray-300">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR ODDS + VALUE */}
                                    <p
                                        className={`text-xs ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-red-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                        {value !== null && value !== undefined &&
                                          `(${formatValue(value)})`}
                                      </p>
                                  </div>
                                );
                              })}
                            </div>
                        )}                    
                        {/* OU35 */}
                        {(marketFilter === "ALL" || marketFilter === "OU35") &&
                          match.markets?.OU35 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {(["over", "under"] as const).map((k) => {
                                const odd = match.markets?.OU35?.[k];
                                const value =
                                  k === "over"
                                    ? match.market_values?.OU35?.over_value
                                    : match.market_values?.OU35?.under_value;

                                // 👉 FAIR ODDS (IMPORTANTE)
                                const fairOdd =
                                  k === "over"
                                    ? match.extra_probabilities?.over35_prob
                                      ? 1 / match.extra_probabilities.over35_prob
                                      : null
                                    : match.extra_probabilities?.under35_prob
                                    ? 1 / match.extra_probabilities.under35_prob
                                    : null;

                                return (
                                  <div
                                    key={k}
                                    onClick={() =>
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "OU35",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date
                                      })
                                    }
                                    className={`${getValueColor(
                                      value,
                                      odd?.odd
                                    )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-sm uppercase text-gray-300">
                                      {k} 3.5
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-3xl">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-lg text-gray-300">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR ODDS + VALUE */}
                                    <p
                                        className={`text-xs ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-red-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                        {value !== null && value !== undefined &&
                                          `(${formatValue(value)})`}
                                      </p>
                                  </div>
                                );
                              })}
                            </div>
                        )}                    

                        {/* BTTS */}
                        {(marketFilter === "ALL" || marketFilter === "BTTS") &&
                          match.markets?.BTTS && (
                            <div className="grid grid-cols-2 gap-2">
                              {(["yes", "no"] as const).map((k) => {
                                const odd = match.markets?.BTTS?.[k];

                                const value =
                                  k === "yes"
                                    ? match.market_values?.BTTS?.yes_value
                                    : match.market_values?.BTTS?.no_value;

                                // 👉 FAIR ODDS
                                const fairOdd =
                                  k === "yes"
                                    ? match.extra_probabilities?.btts_yes_prob
                                      ? 1 / match.extra_probabilities.btts_yes_prob
                                      : null
                                    : match.extra_probabilities?.btts_no_prob
                                    ? 1 / match.extra_probabilities.btts_no_prob
                                    : null;

                                return (
                                  <div
                                    key={k}
                                    onClick={() =>
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "BTTS",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date
                                      })
                                    }
                                    className={`${getValueColor(
                                      value,
                                      odd?.odd
                                    )} p-2 rounded text-center cursor-pointer hover:scale-105 transition`}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-sm uppercase text-gray-300">
                                      BTTS {k}
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-3xl">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-lg text-gray-300">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR + VALUE */}
                                    <p
                                        className={`text-xs ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-red-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                        {value !== null && value !== undefined &&
                                          `(${formatValue(value)})`}
                                      </p>
                                  </div>
                                );
                              })}
                            </div>
                        )}                    
                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          ))}
          </>
        )}

        {/* RESULTS */}
        {view === "results" && (
          <ResultsView />
        )}
        
        {/* STANDINGS */}
        {view === "standings" && (
          <StandingsView />
        )}
        

        {/* TEAM MODAL */}
        {selectedTeam && (
          // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            {/* <div className="bg-white p-6 rounded-2xl w-[400px] shadow-xl"> */}
            {/* <div className="bg-[#1e1e1e] p-6 rounded-xl w-[90%] md:w-[600px] text-white"> */}
            <div className="bg-[#1f2937] p-6 rounded-xl w-[90%] md:w-[600px] text-white">
          
            {/* TITLE */}
            <h2 className="text-xl font-bold mb-4 text-center">
            {selectedTeam}
            </h2>
          
            {/* MATCHES */}
              <div className="space-y-2">
                {teamMatches.map((m, i) => {
                  const isDraw = m.home_goals === m.away_goals;
                  // const isHomeWin = m.home_goals > m.away_goals;

                  const isWin =
                    (m.home === selectedTeam && m.home_goals > m.away_goals) ||
                    (m.away === selectedTeam && m.away_goals > m.home_goals);

                  const isLoss =
                    (m.home === selectedTeam && m.home_goals < m.away_goals) ||
                    (m.away === selectedTeam && m.away_goals < m.home_goals);

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 items-center text-lg border-b pb-2"
                    >
                      {/* HOME */}
                      <span className="text-center pr-2">{m.home}</span>

                      {/* RESULT */}
                      <span
                        className={`text-center font-bold text-2xl ${
                          isDraw
                            ? "text-yellow-500"
                            : isWin
                            ? "text-green-600"
                            : isLoss
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {m.home_goals} - {m.away_goals}
                      </span>

                      {/* AWAY */}
                      <span className="text-center pl-2">{m.away}</span>
                    </div>
                  );
                })}
              </div>

              {/* CLOSE */}
              <button
                onClick={() => setSelectedTeam(null)}
                className="mt-4 w-full bg-gray-600 hover:bg-gray-300 p-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <TopValueModal
          open={showTopModal}
          onClose={() => setShowTopModal(false)}
        />

        {/* BETS */}
        {view === "bets" && (
          <BetsModal
            // open={showBetsModal}
            open={true}
            // onClose={() => setShowBetsModal(false)}
            onClose={() => setView("dashboard")}
            bets={bets}
            onDelete={handleDeleteBet}
          />
        )}

        {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            refreshUser(); // 🔥 CLAVE
            setShowLoginModal(false);
          }}
        />
        )}

        {/* ANALISIS */}
        {view === "analysis" && !authLoading && isAdmin && (
          <AnalysisModal
            onClose={() => setView("dashboard")}
          />
        )}


        {pendingBet && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[90%] md:w-[420px] shadow-lg">

              {/* TITLE */}
              <h2 className="text-xl font-bold text-center mb-4">
                Confirmar apuesta
              </h2>

              {/* INFO */}
              <div className="bg-[#2a2a2a] p-4 rounded-lg text-center space-y-2">

                <p className="text-lg font-semibold">
                  {pendingBet.match}
                </p>

                <p className="text-sm text-gray-400">
                  {pendingBet.market} — {pendingBet.selection.toUpperCase()}
                </p>

                <p className="text-3xl font-bold">
                  {pendingBet.odd ?? "-"}
                </p>

                {pendingBet.bookmaker && (
                  <p className="text-sm text-gray-400">
                    {pendingBet.bookmaker}
                  </p>
                )}

                {pendingBet.value !== null && pendingBet.value !== undefined && (
                  <p className="text-green-400 font-bold">
                    {formatValue(pendingBet.value)}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => setPendingBet(null)}
                  className="flex-1 bg-gray-600 py-2 rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    addBet(pendingBet);
                    setPendingBet(null);
                  }}
                  className="flex-1 bg-green-600 py-2 rounded-lg font-bold"
                >
                  Confirmar
                </button>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>

  );
}