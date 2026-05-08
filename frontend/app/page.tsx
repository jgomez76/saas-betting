"use client";

import { useEffect, useState, useMemo } from "react";
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

import {
  formatValue,
  SkeletonCard,
} from "@/components/ui/match-ui";

import TeamModal from "@/components/modals/TeamModal";
import PendingBetModal from "@/components/modals/PendingBetModal";

import MatchCard from "@/components/cards/MatchCard";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LeagueSection from "@/components/dashboard/LeagueSection";

import { Match } from "@/types/match";
import { Bet } from "@/types/bet";

// import { signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { useSubscription } from "@/context/SubscriptionContext"; 

import { getStakeFromOdd } from "@/lib/stake";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { useBets } from "@/hooks/useBets";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { useTopPicks } from "@/hooks/useTopPicks";


// ---------------- TYPES ----------------

type TopPick = {
  fixture_id: number;
  match: string;
  market: string;
  selection: string;
  probability: number;
  odd: number;
  bookmaker: string;
  value: number;
  kickoff: string;
  is_free: boolean;
};

// ---------------- COMPONENT ----------------

export default function Home() {

  // ###########
  // CONSTANTES
  // ###########
  const { t, lang } = useLanguage();

  // const { data: session } = useSession();
  // const oauthDone = useRef(false);
  
  const { plan, setPlan, isPremium } = useSubscription();

  const [view, setView] = useState("dashboard");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [showTopModal, setShowTopModal] = useState(false);

  const [teamModal, setTeamModal] = useState<{
    id: number;
    name: string;
  } | null>(null);

  type PendingBet = Omit<Bet, "id">;
  const [pendingBet, setPendingBet] = useState<PendingBet | null>(null);

  const getTodayGenerationTime = () => {
    const now = new Date();
    const gen = new Date(now);

    gen.setHours(10, 0, 0, 0);

    return gen;
  };

  const params = useSearchParams();

  useEffect(() => {

    const disabled =
      localStorage.getItem(
        "oauth_disabled"
      );

    if (disabled === "1") {

      queueMicrotask(() => {
        setShowLoginModal(true);
      });
    }

  }, []);

  const handleSelectTopPick = (pick: TopPick) => {
    const stakeRule = getStakeFromOdd(pick.odd);

    setPendingBet({
      match: pick.match,
      market: pick.market,
      selection: pick.selection,
      odd: pick.odd,
      bookmaker: "TOP PICK", // 👈 puedes mejorar luego
      value: pick.value,
      fixture_id: pick.fixture_id, // ⚠️ ahora lo arreglamos abajo
      status: "pending",
      date: pick.kickoff,
      stake: stakeRule.amount,
      stake_level: stakeRule.level,
    });
  };

  const {
    marketFilter,
    setMarketFilter,
    leagueFilter,
    setLeagueFilter,
    dateFilter,
    setDateFilter,
    minValue,
    setMinValue,
    minOdd,
    setMinOdd,
  } = useFilters();

  // FUNCION PARA FECHA PARTIDOS

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const apiUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  const {
    isAdmin,
    email,
    authLoading,
    name,
    avatar,
    provider,
    refreshUser,
    handleLogout,
  } = useAuth(apiUrl);

  const disableDataLoading =
    params.get("oauth_error") === "ACCOUNT_DISABLED";

  const {
    allMatches,
    loading,
    progress,
    openLeagues,
    setOpenLeagues,
    toggleLeague,
  } = useMatches(
    disableDataLoading
      ? ""
      : apiUrl
  );
  
  const {
    freePick,
    validPicks,
    allFinished,
    topPicksLoading,
  } = useTopPicks(
    disableDataLoading
      ? ""
      : apiUrl
  );

  const isLogged = !!email && !authLoading;
  const { bets, addBet, deleteBet } = useBets(isLogged);
  const { favorites, addFavorite, removeFavorite } = useFavorites(isLogged);

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

  // ---------------- LOAD DATA ----------------
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);  


  const matches = useMemo(() => {
    let filtered: Match[] = [...allMatches];

    // const now = new Date();

    filtered = filtered.filter((m) => {
      const matchDate = new Date(m.date + "Z");

      return matchDate.getTime() > now.getTime();
    });

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

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);

      const next3Days = new Date(today);
      next3Days.setDate(today.getDate() + 3);

      filtered = filtered.filter((m) => {

        const matchDate =
          new Date(m.date + "Z");

        matchDate.setHours(0, 0, 0, 0);

        if (dateFilter === "TODAY") {

          return (
            matchDate.getTime() ===
            today.getTime()
          );
        }

        if (dateFilter === "TODAY_TOMORROW") {

          return (
            matchDate.getTime() === today.getTime() ||
            matchDate.getTime() === tomorrow.getTime()
          );
        }

        if (dateFilter === "NEXT_3_DAYS") {

          return (
            matchDate >= today &&
            matchDate < next3Days
          );
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
  }, [allMatches, leagueFilter, marketFilter, dateFilter, favLeagues, now]);

  const favoriteMatches = useMemo(() => {
    return allMatches.filter((m) =>
      favorites.includes(m.fixture_id)
    );
  }, [allMatches, favorites]);




  const getCountdown = (now: Date) => {
    const target = getTodayGenerationTime();

    // 👉 CLAVE: mantener esto
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // 🧠 UX inteligente (igual que antes pero mejor)
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    }

    return `${seconds}s`;
  };

  
  // ---------------- FAVORITES ----------------

  const toggleFavorite = (fixtureId: number) => {
    if (favorites.includes(fixtureId)) {
      removeFavorite(fixtureId);
    } else {
      addFavorite(fixtureId);
    }
  };

  // ---------------- TEAM MODAL ----------------

  const openTeamModal = (
    teamId: number,
    teamName: string
  ) => {
    setTeamModal({
      id: teamId,
      name: teamName,
    });
  };
  // ---------------- HELPERS ----------------

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

  const countdown = mounted ? getCountdown(now) : null;

  return (
    <>
  
    <div className="mb-4 flex gap-2">
      <button
        onClick={() => setPlan("free")}
        className={`px-3 py-1 rounded ${plan === "free" ? "bg-[var(--accent)] text-black" : "bg-[var(--card)]"}`}
      >
        {t.free}
      </button>

      <button
        onClick={() => setPlan("premium")}
        className={`px-3 py-1 rounded ${plan === "premium" ? "bg-[var(--accent)] text-black" : "bg-[var(--card)]"}`}
      >
        {t.premium}
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
            ☰ <span className="text-sm">{t.menu}</span>
          </button>

        </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
        <>

          {mounted && (
            <Navbar
              // onOpenTop={() => setShowTopModal(true)}
              // onOpenBets={() => setView("bets")}
              onOpenLogin={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              // onOpenAnalysis={() => setView("analysis")}
              onOpenProfile={() => setShowProfile(true)}

              marketFilter={marketFilter}
              setMarketFilter={setMarketFilter}
              leagueFilter={leagueFilter}
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

          <DashboardHeader
            loading={loading}
            progress={progress}

            countdown={countdown}

            allFinished={allFinished}

            validPicks={validPicks}

            topPicksLoading={topPicksLoading}

            freePick={freePick}

            isPremium={isPremium}

            onSelectPick={handleSelectTopPick}

            t={{
              loadingMatches: t.loadingMatches,
              nextPicksIn: t.nextPicksIn,
              picksFinished: t.picksFinished,
              noPicksToday: t.noPicksToday,
              picksAvailable: t.picksAvailable,
              picksLoading: t.picksLoading,
            }}
          />


          {loading && Object.keys(grouped).length === 0 && (
            <div className="grid mt-6 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {Object.entries(grouped).map(
            ([league, leagueMatches]) => (

              <LeagueSection
                key={league}

                league={league}

                leagueMatches={leagueMatches}

                isOpen={
                  openLeagues[league]
                }

                toggleLeague={
                  toggleLeague
                }

                loading={loading}

                favorites={favorites}

                toggleFavorite={
                  toggleFavorite
                }

                openTeamModal={
                  openTeamModal
                }

                marketFilter={
                  marketFilter
                }

                minValue={minValue}

                minOdd={minOdd}

                setPendingBet={
                  setPendingBet
                }

                t={{
                  matches: t.matches,
                  vs: t.vs,
                  lang,
                }}
              />
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

        {/* FAVORITES */}

        {view === "favorites" && (
          <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">⭐ Favoritos</h2>

              <span className="text-sm text-[var(--muted)]">
                {favoriteMatches.length} partidos
              </span>
            </div>

            <div className="grid mt-4 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {favoriteMatches.map((match) => (
                <MatchCard
                  key={match.fixture_id}
                  match={match}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  openTeamModal={openTeamModal}
                  marketFilter={marketFilter}
                  minValue={minValue}
                  minOdd={minOdd}
                  setPendingBet={setPendingBet}
                  t={{
                    vs: t.vs,
                    lang,
                  }}
                />
              ))}
            </div>

          </div>
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <SettingsView
            user={{
              email,
              name,
              avatar,
              subscription: isPremium ? "premium" : "free",
              provider,
            }}
            onLogout={handleLogout}
            onRefreshUser={refreshUser}
          />
        )}
        
        {/* TEAM MODAL */}
        {teamModal && (
          <TeamModal
            teamId={teamModal.id}
            teamName={teamModal.name}
            apiUrl={apiUrl}
            onClose={() => setTeamModal(null)}
          />
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
            onDelete={deleteBet}
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


        <PendingBetModal
          pendingBet={pendingBet}
          setPendingBet={setPendingBet}
          addBet={addBet}
          formatValue={formatValue}
          t={{
            confirmBet: t.confirmBet,
            recommendedStake: t.recommendedStake,
            cancel: t.cancel,
            confirm: t.confirm,
          }}
        />



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