"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LEAGUES } from "@/lib/config/leagues";

type Props = {
  onOpenTop: () => void;
  onOpenBets: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAnalysis: () => void;
  onOpenProfile: () => void;

  marketFilter: string;
  setMarketFilter: (value: string) => void;

  leagueFilter: string;
  setLeagueFilter: (value: string) => void;

  dateFilter: string;
  setDateFilter: (value: string) => void;

  minValue: number;
  setMinValue: (v: number) => void;
  minOdd: number;
  setMinOdd: (v: number) => void;

  isAdmin: boolean;
  email: string;
  name: string;
  avatar: string;
};


export default function Navbar({
  onOpenTop,
  // onOpenBets,
  onOpenLogin,
  onLogout,
  onOpenProfile,
  // onOpenAnalysis,
  isAdmin,
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
  email,
  name,
  avatar,
}: Props) {
  const router = useRouter();
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openLeagues, setOpenLeagues] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const marketsRef = useRef<HTMLDivElement>(null);
  const leaguesRef = useRef<HTMLDivElement>(null);
 
  const { lang, changeLang, t } = useLanguage();
  const marketLabels: Record<string, string> = {
    ALL: t.all,
    "1X2": "1X2",
    OU25: "Over 2.5",
    OU35: "Over 3.5",
    BTTS: "BTTS",
  };

  // const leagueLabels: Record<string, string> = {
  //   ALL: t.all,
  //   "140": "La Liga EA Sports",
  //   "141": "La Liga hypermotion",
  //   "39": "Premier League",
  //   "135": "Serie A",
  //   "78": "Bundesliga",
  //   "61": "Ligue 1",
  //   "2": "Champions League",
  //   "3": "Europa League",
  // };

  const currentLeague =
    leagueFilter === "ALL"
      ? t.all
      : LEAGUES.find(l => String(l.id) === leagueFilter)?.name;
  
 

  const apiUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  const avatarSrc = avatar;
  const fullAvatar =
    avatarSrc?.startsWith("http")
    ? avatarSrc
    : avatarSrc
    ? `${apiUrl}${avatarSrc}`
    : null;

  useEffect(() => {
    if (openMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [openMenu]);

  // 🔥 cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        marketsRef.current &&
        !marketsRef.current.contains(event.target as Node)
      ) {
        setOpenMarkets(false);
      }

      if (
        leaguesRef.current &&
        !leaguesRef.current.contains(event.target as Node)
      ) {
        setOpenLeagues(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClick = () => setOpenMenu(false);
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="w-full bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text)] p-4 mb-6 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* LEFT */}
      <div className="flex items-center gap-6 flex-wrap">

        <div className="flex gap-3 items-center flex-wrap">
          {/* 🔐 ADMIN / LOGIN */}
          {email ? (
            <div className="relative">

              {/* BOTÓN USUARIO */}
              <div
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 evita cierre inmediato
                  setOpenMenu(!openMenu);
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                {avatar ? (
                  <Image
                    src={fullAvatar || "/default-avatar.png"}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                    
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center text-xs">
                    {email[0]?.toUpperCase()}
                  </div>
                )}

                <span className="text-sm text-[var(--text)] hidden md:block">
                  {name || email}
                </span>

                <span className="text-[var(--muted)] text-xs">▼</span>
              </div>

              {/* DROPDOWN */}
              {openMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50">
                  <div className="p-3 border-b border-[var(--border)]">
                    <p className="text-sm text-[var(--text)]">{name || t.user}</p>
                    <p className="text-xs text-[var(--muted)]">{email}</p>
                  </div>

                  {isAdmin && (
                    <div className="px-3 py-2 text-xs text-[var(--success)]">
                      🛠 {t.admin}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setTimeout(() => {
                        onOpenProfile();
                      }, 0);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--hover)]"
                  >
                    👤 {t.profile}
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--hover)]"
                  >
                    🚪 {t.logout}
                  </button>

                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded hover:bg-[var(--hover)]"
            >
              🔐 {t.login}
            </button>
          )}

          {/* 🌍 LIGAS DROPDOWN */}
          <div className="relative" ref={leaguesRef}>
            <button
              onClick={() => setOpenLeagues(!openLeagues)}
              className="px-3 py-1 rounded text-sm bg-[var(--card)] hover:bg-[var(--hover)]"
            >
              {/* 🌍 Ligas {openLeagues ? "▲" : "▼"} */}
              🌍 {currentLeague || t.leagues} {openLeagues ? "▲" : "▼"}
            </button>

            {openLeagues && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#1e1e1e] border border-[#333] rounded shadow-lg z-50 overflow-hidden">  
                {[
                  { label: `🌍 ${t.all}`, value: "ALL" },
                  ...LEAGUES.map(l => ({
                      label: l.name,
                      value: String(l.id),
                  }))
                ].map((l) => (
                  <div
                    key={l.value}
                    onClick={() => {
                      setLeagueFilter(l.value);
                      setOpenLeagues(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-[var(--card)] ${
                      leagueFilter === l.value ? "bg-[#333]" : ""
                    }`}
                  >
                    {l.label}
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* 🎯 MERCADOS DROPDOWN */}
          <div className="relative" ref={marketsRef}>
            <button
              onClick={() => setOpenMarkets(!openMarkets)}
              className="px-3 py-1 rounded text-sm bg-[var(--card)] hover:bg-[var(--hover)]"
            >
              {/* 🎯 Mercados {openMarkets ? "▲" : "▼"} */}
              🎯 {marketLabels[marketFilter] || t.markets} {openMarkets ? "▲" : "▼"}
            </button>

            {openMarkets && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded shadow-lg z-50 overflow-hidden">
                {[
                  { label: t.all, value: "ALL" },
                  { label: "1X2", value: "1X2" },
                  // { label: "Over 1.5", value: "OU15" },
                  { label: "Over 2.5", value: "OU25" },
                  { label: "Over 3.5", value: "OU35" },
                  { label: "BTTS", value: "BTTS" },
                ].map((m) => (
                  <div
                    key={m.value}
                    onClick={() => {
                      setMarketFilter(m.value);
                      setOpenMarkets(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-[var(--card)] ${
                      marketFilter === m.value ? "bg-[var(--primary)] text-white" : ""
                    }`}
                  >
                    {m.label}
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* 📅 FILTRO FECHA */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1 rounded text-sm bg-[var(--card)] hover:bg-[var(--hover)]"
            >
              <option value="TODAY">📅 {t.today}</option>
              <option value="TODAY_TOMORROW">📅 {t.todayTomorrow}</option>
              <option value="NEXT_3_DAYS">📅 {t.next3Days}</option>
              <option value="ALL">🌍 {t.all}</option>
            </select>
          </div>

          {/* 🎯 FILTROS VALUE PRO */}
          <div className="flex items-center gap-4 flex-wrap text-xs">

            {/* 📊 VALUE SLIDER */}
            <div className="flex items-center gap-2">
              <span>{t.value}:</span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="cursor-pointer"
              />

              <span className="w-12 text-center">
                {(minValue * 100).toFixed(0)}%
              </span>
            </div>

            {/* 💰 ODD CONTROL */}
            <div className="flex items-center gap-2">
              <span>{t.odd}:</span>

              {/* ➖ */}
              <button
                onClick={() => setMinOdd(Math.max(1, +(minOdd - 0.1).toFixed(2)))}
                className="px-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--hover)] rounded"
              >
                -
              </button>

              {/* INPUT */}
              <input
                type="number"
                step="0.1"
                value={minOdd}
                onChange={(e) => setMinOdd(Number(e.target.value))}
                className="w-14 px-2 py-1 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
              />

              {/* ➕ */}
              <button
                onClick={() => setMinOdd(+(minOdd + 0.1).toFixed(2))}
                className="px-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--hover)] rounded"
              >
                +
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        <button
          onClick={() => changeLang("en")}
          className={`
            p-1 rounded-md transition-all
            ${lang === "en" 
              ? "ring-2 ring-[var(--accent)] scale-105" 
              : "opacity-40 hover:opacity-70"}
          `}
        >
          <Image
            src="/flags/gb.svg"
            alt="English"
            width={24}
            height={24}
            className="rounded-sm"
          />
        </button>

        <button
          onClick={() => changeLang("es")}
          className={`
            p-1 rounded-md transition-all
            ${lang === "es" 
              ? "ring-2 ring-[var(--accent)] scale-105" 
              : "opacity-40 hover:opacity-70"}
          `}
        >
          <Image
            src="/flags/es.svg"
            alt="Español"
            width={24}
            height={24}
            className="rounded-sm"
          />
        </button>

      </div>
      {/* <div className="flex gap-3">
        <button
          onClick={onOpenTop}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-90"
        >
          🔥 Top Value
        </button>
          {email && (
            <button onClick={() => router.push("/account")}
              className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded hover:bg-[var(--hover)]"
            >
            👤 Cuenta
          </button>
        )}
      </div> */}
    </div>
  );
}