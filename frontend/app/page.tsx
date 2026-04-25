"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TopValueModal from "@/components/TopValueModal";
import BetsModal from "@/components/BetsModal";
import LoginModal from "@/components/LoginModal";
import AnalysisModal from "@/components/AnalysisModal";
import ResultsView from "@/components/ResultsView";
import StandingsView from "@/components/StandingsView";
import ProfileModal from "@/components/ProfileModal";
import SettingsView from "@/components/SettingsView";
import TopPicksCard from "@/components/TopPicksCard";
import { Pick, getTopPicks } from "@/lib/topPicks";
import { Match } from "@/types/match";
// import { API_URL } from "@/lib/api";
import { Bet } from "@/types/bet";
import { useSession } from "next-auth/react";
import { useSubscription } from "@/context/SubscriptionContext"; 
import { getStakeFromOdd, getStakeRules } from "@/lib/stake";

// ---------------- TYPES ----------------

type TeamMatch = {
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  date: string;
};

// ---------------- COMPONENT ----------------

export default function Home() {

  // ###########
  // CONSTANTES
  // ###########

  const { data: session } = useSession();
  const oauthDone = useRef(false);
  
  const { plan, setPlan, isPremium } = useSubscription();

  const [view, setView] = useState("dashboard");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [loading, setLoading] = useState(true);

  const [marketFilter, setMarketFilter] = useState("1X2");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("TODAY_TOMORROW");
  const [showTopModal, setShowTopModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  type PendingBet = Omit<Bet, "id">;
  const [pendingBet, setPendingBet] = useState<PendingBet | null>(null);
  // const [betPreview, setBetPreview] = useState<Bet | null>(null);

  const [bets, setBets] = useState<Bet[]>(() => {
  if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("bets");
    return stored ? JSON.parse(stored) : [];
  });

  const getTodayKey = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const getTodayGenerationTime = () => {
    const now = new Date();
    const gen = new Date(now);

    gen.setHours(10, 0, 0, 0);

    return gen;
  };

  const handleSelectTopPick = (pick: Pick) => {

    setPendingBet({
      match: pick.match,
      market: pick.market,
      selection: pick.selection,
      odd: pick.odd,
      bookmaker: "TOP PICK", // 👈 puedes mejorar luego
      value: pick.value,
      fixture_id: pick.fixture_id, // ⚠️ ahora lo arreglamos abajo
      status: "pending",
      date: pick.date,
      stake: pick.stake,
      stakeLevel: pick.stakeLevel,
    });
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
  // const [isPremium, setIsPremium] = useState(false);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [provider, setProvider] = useState("");

  const [showProfile, setShowProfile] = useState(false);

  const getFavLeagues = (): number[] => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem("fav_leagues");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const favLeagues = getFavLeagues();

  // const todayMatches = useMemo(() => {
  //   const now = new Date();

  //   return allMatches.filter((m) => {
  //       const matchDate = new Date(m.date + "Z");

  //       const isToday =
  //         matchDate.toDateString() === now.toDateString();

  //       const isFav =
  //         favLeagues.length === 0 ||
  //         favLeagues.includes(m.league_id);

  //       return isToday && isFav;
  //   });
  // }, [allMatches, favLeagues]);
  const todayMatches = useMemo(() => {
    // const now = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return allMatches.filter((m) => {
      const matchDate = new Date(m.date + "Z");

      const isToday =
        matchDate >= startOfDay &&
        matchDate <= endOfDay;

      const isFav =
        favLeagues.length === 0 ||
        favLeagues.includes(m.league_id);

      return isToday && isFav;
    });
  }, [allMatches, favLeagues]);
    

  const apiUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";


  const handleLogout = async () => {
    await fetch(`${apiUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });

    setIsAdmin(false);
    setEmail("");
  };

  const refreshUser = useCallback(() => {
    fetch(`${apiUrl}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.is_admin);
        setEmail(data.email || "");
        setPlan("premium");
        // 🔥 NUEVO
        setName(data.name || "");
        setAvatar(data.avatar || "");
        setProvider(data.provider ?? "email");
        console.log("PROVIDER STATE:", data.provider)
      })
      .catch(() => {
        setIsAdmin(false);
        setEmail("");
        setPlan("free");
      });
  }, [apiUrl, setPlan]);

  // ###########
  // USE EFFECTS
  // ###########

  useEffect(() => {
    if (!apiUrl) return;
    refreshUser();
  }, [apiUrl, refreshUser]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setIsMobile(window.innerWidth < 768);
    });

    return () => cancelAnimationFrame(id);
  }, []);


  // LOGIN GOOGLE/GITHUB
  useEffect(() => {
    // 1️⃣ esperar a tener apiUrl
    if (!apiUrl) return;

    // 2️⃣ evitar doble ejecución
    if (!session?.user?.email || oauthDone.current) return;

    oauthDone.current = true;

    const runOAuth = async () => {
      console.log("🔐 OAuth user:", session.user?.email);

      await fetch(`${apiUrl}/oauth-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user?.email,
          name: session.user?.name,
          avatar: session.user?.image,
          provider: session.user?.image?.includes("googleusercontent")
            ? "google"
            : "github",
        }),
        credentials: "include",
      });

      console.log("✅ OAuth login OK");

      const res = await fetch(`${apiUrl}/me`, {
        credentials: "include",
      });

      const data = await res.json();

      console.log("🔥 USER AFTER LOGIN:", data);

      setIsAdmin(data.is_admin);
      setEmail(data.email || "");
      setPlan("premium");
      setName(data.name || "");
      setAvatar(data.avatar || "");
      setProvider(data.provider ?? "email");
    };

    runOAuth();
  }, [session, apiUrl, setPlan]);
  
  // NEW LOGIN WITH JWT
  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.is_admin);
        setEmail(data.email || "");
        setPlan("premium");
      })
      .catch(() => {
        setIsAdmin(false);
        setEmail("");
        setPlan("free");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [apiUrl, setPlan]);

  // --------- SINCRO REF --------
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  // ---------------- LOAD DATA ----------------

  useEffect(() => {
    if (!apiUrl) return;
    const load = async () => {
      setLoading(true);
      setLoadingMessage("Cargando partidos...");

      await new Promise((r) => setTimeout(r, 0));

      let data = [];

      try {
        const res = await fetch(`${apiUrl}/value-bets`, {
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


      // 🔥 ABRIR TODAS LAS LIGAS

      const leagues: string[] = Array.from(
        new Set(filtered.map((m: Match) => m.league))
      );

      const initialState: Record<string, boolean> = {};

      leagues.forEach((l) => {
        initialState[l] = true;
      });

      setOpenLeagues(initialState);
      
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
  }, [apiUrl]);

  useEffect(() => {
    if (!apiUrl) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/value-bets`, {
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
  }, [apiUrl]);

  const matches = useMemo(() => {
    let filtered: Match[] = [...allMatches];

    // 🏆 LIGA (manual > favoritas)
    if (leagueFilter !== "ALL") {
      filtered = filtered.filter(
        (m) => String(m.league_id) === leagueFilter
      );
    } else if (favLeagues.length > 0) {
      filtered = filtered.filter((m) =>
        favLeagues.includes(m.league_id)
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
  }, [allMatches, leagueFilter, marketFilter, dateFilter, favLeagues]);

  // const allPicks = getTopPicks(todayMatches);
  const allPicks = useMemo(() => {
    if (typeof window === "undefined") return [];

    const key = `topPicks_${getTodayKey()}`;
    const generatedKey = `topPicks_generatedAt_${getTodayKey()}`;

    const saved = localStorage.getItem(key);
    const generatedAt = localStorage.getItem(generatedKey);

    const now = new Date();
    const generationTime = getTodayGenerationTime();

    // ⛔ antes de las 10:00 → NO generar
    if (now < generationTime) {
      return [];
    }

    // ✅ ya generados → usar cache
    // if (saved && generatedAt) {
    //   return JSON.parse(saved);
    // }
    if (saved && generatedAt) {
      const parsed = JSON.parse(saved);

      // ❗ si está vacío → regenerar
      if (parsed.length > 0) {
        return parsed;
      }
    }

    // 🔥 generar picks UNA VEZ
    const picks = getTopPicks(todayMatches);

    localStorage.setItem(key, JSON.stringify(picks));
    localStorage.setItem(generatedKey, now.toISOString());

    return picks;
  }, [todayMatches]);

  // const visiblePicks =
  //   plan === "premium"
  //     ? allPicks.slice(0, 5)
  //     : allPicks.slice(0, 1);
  // const visiblePicks = allPicks.slice(0, 4);
  // const visiblePicks = allPicks
  //   .filter((p) => new Date(p.date) > new Date()) // ❗ no empezados
  //   .slice(0, 4);

  const currentTime = new Date();

  const availablePicks = allPicks.filter(
    (p: Pick) => new Date(p.date) > currentTime
  );

  const visiblePicks = availablePicks.slice(0, 4);
  // const visiblePicks = isPremium
  //   ? availablePicks.slice(0, 4)
  //   : availablePicks.slice(0, 1);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);  

  const getCountdown = () => {
    const gen = getTodayGenerationTime();
    const diff = gen.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleDeleteBet = (id: number) => {
  // 1. eliminar de array
    const updatedBets = bets.filter((b) => b.id !== id);

    // 2. actualizar estado React
    setBets(updatedBets);

    // 3. actualizar localStorage
    localStorage.setItem("bets", JSON.stringify(updatedBets));
  };

  // ------------- AUTO RESOLVE BETS -----------

  useEffect(() => {
    if (!apiUrl) return;
    const resolveBets = async () => {
      if (!betsRef.current.length) return;

      const updated = await Promise.all(
        betsRef.current.map(async (bet) => {
          if (bet.status !== "pending" || !bet.fixture_id) return bet;

          try {
            const res = await fetch(
              `${apiUrl}/fixture/${bet.fixture_id}/result`
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
  }, [apiUrl]);

  // ---------------- BET SYSTEM ----------------
  const addBet = (bet: PendingBet) => {
    const newBet: Bet = {
      ...bet,
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

    const res = await fetch(`${apiUrl}/team/${team}/matches`);
    const data = await res.json();

    setTeamMatches(data);
  };


  // ---------------- HELPERS ----------------

  const formatValue = (v?: number | null) => {
    if (v === null || v === undefined) return null;
    return `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  // const getValueColor = (v?: number | null, odd?: number) => {
  //   if (v === null || v === undefined) return "bg-[var(--card)]";

  //   if (v >= minValue && (odd ?? 0) >= minOdd) {
  //     return "bg-[var(--accent)]";
  //   }

  //   return "bg-[var(--card)]";
  // };

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

  // const renderForm = (form: string) => (
  //   <div className="flex justify-center gap-1 mt-1">
  //     {form.split("").map((f, i) => {
  //       const color =
  //         f === "W"
  //           ? "bg-[var(--success)]"
  //           : f === "D"
  //           ? "bg-[var(--warning)]"
  //           : "bg-[var(--danger)]";

  //       return (
  //         <span key={i} className={`text-white text-xs px-1 rounded ${color}`}>
  //           {f}
  //         </span>
  //       );
  //     })}
  //   </div>
  // );

  const renderForm = (form: string) => {
    if (!form) return null;

    return (
      <div className="flex justify-center gap-1 mt-1">
        {form
          .toUpperCase()
          .split("") // aquí sí queremos char a char
          .map((raw, i) => {
            const f = raw.trim(); // 🔥 CLAVE

            let color = "bg-[var(--muted)]";

            if (f === "W") color = "bg-[var(--positive)]";
            else if (f === "D") color = "bg-[var(--warning)]";
            else if (f === "L") color = "bg-[var(--negative)]";

            return (
              <span
                key={i}
                className={`text-white text-xs px-1.5 py-0.5 rounded font-semibold ${color}`}
              >
                {f}
              </span>
            );
          })}
      </div>
    );
  };

  // SKELETON CARD
  const SkeletonCard = () => (
    <div className="bg-[var(--card)] p-4 rounded-xl animate-pulse border border-[var(--border)]">

      {/* equipos */}
      <div className="grid mb-3" style={{ gridTemplateColumns: "45% 10% 45%" }}>
        <div className="h-4 bg-[var(--border)] rounded w-3/4 mx-auto"></div>
        <div></div>
        <div className="h-4 bg-[var(--border)] rounded w-3/4 mx-auto"></div>
      </div>

      {/* fecha */}
      <div className="h-3 bg-[var(--border)] rounded w-1/2 mx-auto mb-3"></div>

      {/* cuotas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-[var(--border)] rounded"></div>
        <div className="h-12 bg-[var(--border)] rounded"></div>
        <div className="h-12 bg-[var(--border)] rounded"></div>
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

  const countdown = getCountdown();

  return (
    <>
  
    <div className="mb-4 flex gap-2">
      <button
        onClick={() => setPlan("free")}
        className={`px-3 py-1 rounded ${plan === "free" ? "bg-[var(--accent)] text-black" : "bg-[var(--card)]"}`}
      >
        FREE
      </button>

      <button
        onClick={() => setPlan("premium")}
        className={`px-3 py-1 rounded ${plan === "premium" ? "bg-[var(--accent)] text-black" : "bg-[var(--card)]"}`}
      >
        PREMIUM
      </button>
    </div>

    <div className="flex relative">
      

      {!isMobile && (
        <Sidebar view={view} setView={setView} isAdmin={isAdmin} />
      )}
      <main className="flex-1 p-6 bg-[var(--bg)] min-h-screen text-[var(--text)]">
        {isMobile && (
        <div className="flex items-center justify-between mb-4">

          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow"
          >
            ☰ <span className="text-sm">Menú</span>
          </button>

        </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
        <>
          {loading && (
            <div className="mb-6">

              {/* TEXTO */}
              <p className="text-center text-sm text-[var(--muted)] mb-2 animate-pulse">
                ⏳ {loadingMessage}
              </p>

              {/* 🔥 BARRA PROGRESO */}
              <div className="w-full max-w-md mx-auto bg-[var(--border)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* % */}
              <p className="text-center text-xs text-[var(--muted)] mt-1">
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
              onOpenAnalysis={() => setView("analysis")}
              onOpenProfile={() => setShowProfile(true)}

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
              name={name}
              avatar={avatar}
              
            />
          )}

          {countdown ? (
            <div className="mb-4 text-center text-sm text-[var(--muted)]">
              ⏳ Nuevos picks en {countdown}
            </div>
          ) : (
            <div className="mb-4 text-center text-sm text-[var(--accent)] font-semibold">
              🔥 Picks disponibles hoy
            </div>
          )}

          <TopPicksCard 
            picks={visiblePicks} 
            isPremium={isPremium} 
            onSelectPick={handleSelectTopPick}
          />

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
                className="flex justify-between items-center bg-[var(--card)] text-[var(--text)] px-4 py-3 rounded-lg cursor-pointer hover:opacity-80 transition mt-8 border border-[var(--border)]"
              >
                <div className="flex items-center gap-2">
                  <span>{openLeagues[league] ? "▼" : "▶"}</span>
                  <span className="font-semibold text-lg">{league}</span>
                </div>

                <span className="text-sm text-[var(--muted)]">
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
                        className="bg-[var(--card)] text-[var(--text)] p-4 rounded-xl relative border border-[var(--border)] shadow-[0_6px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:scale-[1.015] transition-all duration-200"
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
                          // className="flex justify-between items-center mb-3"
                          >
                          <div onClick={() => openTeamModal(match.home_team)}>
                            <p>{match.home_team}</p>
                            {renderForm(match.home_form || "")}
                          </div>

                          <div className="text-[var(--muted)] text-xs">vs</div>

                          <div onClick={() => openTeamModal(match.away_team)}>
                            <p>{match.away_team}</p>
                            {renderForm(match.away_form || "")}
                          </div>
                        </div>

                        {/* FECHA */}
                        {/* <p className="text-xs text-[var(--muted)] text-center mb-2"> */}
                        <p className="text-xs text-[var(--muted)] text-center mb-3 tracking-wide">
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

                                // 🔥 CLAVE → detectar si es VALUE
                                const isValue =
                                  value !== null &&
                                  value !== undefined &&
                                  value >= minValue &&
                                  (odd?.odd ?? 0) >= minOdd;

                                return (
                                  <div
                                    key={k}
                                    onClick={() => {
                                      const stakeRule = getStakeFromOdd(odd?.odd ?? 0);
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "1X2",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date,

                                        stake: stakeRule.amount,
                                        stakeLevel: stakeRule.level,
                                      });
                                    }}
                                    className={`
                                      p-3 rounded-lg text-center cursor-pointer
                                      border transition-all
                                      hover:scale-105 hover:shadow-md
                                      
                                      ${
                                        isValue
                                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                                          : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                                      }
                                    `}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-xs uppercase opacity-70">{k}</p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-2xl tracking-tight">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-xs uppercase tracking-wide opacity-70">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR + VALUE */}
                                    <p
                                      className={`
                                        text-xs font-medium mt-1
                                        ${
                                          value !== null &&
                                          value !== undefined &&
                                          value < 0
                                            ? "text-[var(--negative)]"
                                            : "opacity-70"
                                        }
                                      `}
                                    >
                                      {fairOdd ? Number(fairOdd.toFixed(2)) : "-"}{" "}
                                      {value !== null &&
                                        value !== undefined &&
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
                                    : null;                                // 🔥 CLAVE → detectar si es VALUE
                                
                                const isValue =
                                  value !== null &&
                                  value !== undefined &&
                                  value >= minValue &&
                                  (odd?.odd ?? 0) >= minOdd;

                                return (
                                  <div
                                    key={k}
                                    onClick={() =>
                                    {
                                      const stakeRule = getStakeFromOdd(odd?.odd ?? 0);
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "OU25",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date,
                                        stake: stakeRule.amount,
                                        stakeLevel: stakeRule.level,
                                      })
                                    }}

                                    className={`
                                      p-3 rounded-lg text-center cursor-pointer
                                      border transition-all
                                      hover:scale-105 hover:shadow-md
                                      
                                      ${
                                        isValue
                                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                                          : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                                      }
                                    `}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-xs uppercase opacity-70">
                                      {k} 2.5
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-2xl tracking-tight">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-xs uppercase tracking-wide opacity-70">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR ODDS + VALUE */}
                                    <p
                                        className={`text-xs font-medium mt-1 ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-[var(--negative)]"
                                            : "opacity-70"
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

                                // 🔥 CLAVE → detectar si es VALUE
                                const isValue =
                                  value !== null &&
                                  value !== undefined &&
                                  value >= minValue &&
                                  (odd?.odd ?? 0) >= minOdd;

                                return (
                                  <div
                                    key={k}
                                    onClick={() => {
                                      const stakeRule = getStakeFromOdd(odd?.odd ?? 0);
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "OU35",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date,
                                        stake: stakeRule.amount,
                                        stakeLevel: stakeRule.level,
                                      })
                                    }}

                                    className={`
                                      p-3 rounded-lg text-center cursor-pointer
                                      border transition-all
                                      hover:scale-105 hover:shadow-md
                                      
                                      ${
                                        isValue
                                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                                          : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                                      }
                                    `}                                    
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-xs uppercase opacity-70">
                                      {k} 3.5
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-2xl tracking-tight">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-xs uppercase tracking-wide opacity-70">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR ODDS + VALUE */}
                                    <p
                                        className={`text-xs font-medium mt-1 ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-[var(--negative)]"
                                            : "opacity-70"
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

                                // 🔥 CLAVE → detectar si es VALUE
                                const isValue =
                                  value !== null &&
                                  value !== undefined &&
                                  value >= minValue &&
                                  (odd?.odd ?? 0) >= minOdd;

                                return (
                                  <div
                                    key={k}
                                    onClick={() => {
                                      const stakeRule = getStakeFromOdd(odd?.odd ?? 0);
                                      setPendingBet({
                                        match: `${match.home_team} vs ${match.away_team}`,
                                        market: "BTTS",
                                        selection: k,
                                        odd: odd?.odd,
                                        bookmaker: odd?.bookmaker,
                                        value,
                                        fixture_id: match.fixture_id,
                                        status: "pending",
                                        date: match.date,
                                        stake: stakeRule.amount,
                                        stakeLevel: stakeRule.level,
                                      })
                                    }}

                                    className={`
                                      p-3 rounded-lg text-center cursor-pointer
                                      border transition-all
                                      hover:scale-105 hover:shadow-md
                                      
                                      ${
                                        isValue
                                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                                          : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                                      }
                                    `}
                                  >
                                    {/* 🏷️ LABEL */}
                                    <p className="text-xs uppercase opacity-70">
                                      BTTS {k}
                                    </p>

                                    {/* 💰 CUOTA REAL */}
                                    <p className="font-bold text-2xl tracking-tight">
                                      {odd?.odd ?? "-"}
                                    </p>

                                    {/* 🏦 BOOKMAKER */}
                                    <p className="text-xs uppercase tracking-wide opacity-70">
                                      {odd?.bookmaker ?? ""}
                                    </p>

                                    {/* 📊 FAIR + VALUE */}
                                    <p
                                        className={`text-xs font-medium mt-1 ${
                                          value !== null && value !== undefined && value < 0
                                            ? "text-[var(--negative)]"
                                            : "opacity-70"
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

        {/* SETTINGS */}
        {view === "settings" && (
          <SettingsView />
        )}
        

        {/* TEAM MODAL */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] w-[90%] md:w-[600px] text-[var(--text)]">
          
            {/* TITLE */}
            <h2 className="text-xl font-bold mb-4 text-center">
            {selectedTeam}
            </h2>
          
            {/* MATCHES */}
              <div className="space-y-2">
                {teamMatches.map((m, i) => {
                  const isDraw = m.home_goals === m.away_goals;

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
                            ? "text-[var(--warning)]"
                            : isWin
                            ? "text-[var(--success)]"
                            : isLoss
                            ? "text-[var(--danger)]"
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
                className="mt-4 w-full bg-[var(--card)] hover:opacity-80 p-2 rounded"
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
            open={true}
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
            <div className="bg-[var(--card)] text-[var(--text)] p-6 rounded-xl border border-[var(--border)] w-[90%] md:w-[420px] shadow-lg">

              {/* TITLE */}
              <h2 className="text-xl font-bold text-center mb-4">
                Confirmar apuesta
              </h2>

              {/* INFO */}
              <div className="bg-[var(--bg)] p-4 rounded-lg text-center space-y-2">

                <p className="text-lg font-semibold">
                  {pendingBet.match}
                </p>

                <p className="text-sm text-[var(--muted)]">
                  {pendingBet.market} — {pendingBet.selection.toUpperCase()}
                </p>

                <p className="text-3xl font-bold">
                  {pendingBet.odd ?? "-"}
                </p>

                {pendingBet.bookmaker && (
                  <p className="text-sm text-[var(--muted)]">
                    {pendingBet.bookmaker}
                  </p>
                )}

                {pendingBet.value !== null && pendingBet.value !== undefined && (
                  <p className="text-[var(--accent)] font-bold">
                    {formatValue(pendingBet.value)}
                  </p>
                )}
                <p className="text-xs text-[var(--muted)] mb-1">
                  Stake recomendado
                </p>

                <select
                  value={pendingBet.stakeLevel}
                  onChange={(e) => {
                    const level = Number(e.target.value);
                    const rule = getStakeRules().find(r => r.level === level);

                    if (!rule) return;

                    setPendingBet({
                      ...pendingBet,
                      stakeLevel: level,
                      stake: rule.amount,
                    });
                  }}
                  className="w-full p-2 mb-4 bg-[var(--bg)] border border-[var(--border)] rounded text-sm"
                >
                  {/* <option value={1}>Stake 1 — 10€</option>
                  <option value={2}>Stake 2 — 20€</option>
                  <option value={3}>Stake 3 — 30€</option> */}
                  {getStakeRules().map((r) => (
                    <option key={r.level} value={r.level}>
                      Stake {r.level} — {r.amount}€
                    </option>
                  ))}
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => setPendingBet(null)}
                  className="flex-1 bg-[var(--card)] border border-[var(--border)] py-2 rounded-lg hover:opacity-80"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    addBet(pendingBet);
                    setPendingBet(null);
                  }}
                  className="flex-1 bg-[var(--accent)] py-2 rounded-lg font-bold text-white hover:opacity-90"
                >
                  Confirmar
                </button>

              </div>
            </div>
          </div>
        )}



        {showMenu && (
          <div className="fixed inset-0 bg-black/60 z-50 flex">

            {/* PANEL */}
            <div className="w-64 bg-[var(--bg)] border-r border-[var(--border)] h-full p-4">
              <Sidebar
                view={view}
                setView={(v) => {
                  setView(v);
                  setShowMenu(false); // cerrar al clicar
                }}
                isAdmin={isAdmin}
              />
            </div>

            {/* CLICK FUERA */}
            <div
              className="flex-1"
              onClick={() => setShowMenu(false)}
            />
          </div>
        )}
      </main>
    </div>

    {showProfile && (
      <ProfileModal
        user={{
          email,
          name,
          avatar,
          subscription: isPremium ? "premium" : "free",
          provider,
        }}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
        onRefreshUser={refreshUser} // 🔥 CLAVE
      />
    )}
    </>

  );
}