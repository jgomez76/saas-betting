"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LEAGUES } from "@/lib/config/leagues";

type Props = {
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;

  isAdmin: boolean;

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

  email: string;
  name: string;
  avatar: string;
};

const Navbar = memo(function Navbar({
  onOpenLogin,
  onLogout,
  onOpenProfile,
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
  const { changeLang, t } = useLanguage();

  const [openMarkets, setOpenMarkets] = useState(false);
  const [openLeagues, setOpenLeagues] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const marketsRef = useRef<HTMLDivElement>(null);
  const leaguesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const API =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  const safeAvatar =
    avatar && avatar !== "null" && avatar !== "undefined"
      ? avatar.startsWith("http")
        ? avatar
        : `${API}${avatar}`
      : null;

  const currentLeague =
    leagueFilter === "ALL"
      ? t.all
      : LEAGUES.find((l) => String(l.id) === leagueFilter)?.name;

  const marketLabels: Record<string, string> = {
    ALL: t.all,
    "1X2": "1X2",
    OU25: "Over 2.5",
    OU35: "Over 3.5",
    BTTS: "BTTS",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        marketsRef.current &&
        !marketsRef.current.contains(event.target as Node)
      ) setOpenMarkets(false);

      if (
        leaguesRef.current &&
        !leaguesRef.current.contains(event.target as Node)
      ) setOpenLeagues(false);

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text)] p-4 mb-6 rounded-xl shadow">

      <div className="flex flex-wrap items-center gap-3">

        {/* USER */}
        {email ? (
          <div className="relative" ref={menuRef}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(!openMenu);
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              {safeAvatar ? (
                <Image
                  src={safeAvatar}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-xs">
                  {email[0]?.toUpperCase() || "👤"}
                </div>
              )}

              <span className="text-sm hidden md:block">
                {name || email}
              </span>
            </div>

            {openMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50">
                <button
                  onClick={onOpenProfile}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--hover)]"
                >
                  👤 {t.profile}
                </button>

                <button
                  onClick={onLogout}
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
            className="px-3 py-1 bg-[var(--card)] border border-[var(--border)] rounded"
          >
            🔐 {t.login}
          </button>
        )}

        {/* LEAGUES */}
        <div className="hidden md:block relative" ref={leaguesRef}>
          <button
            onClick={() => setOpenLeagues(!openLeagues)}
            className="px-3 py-1 rounded text-sm bg-[var(--card)]"
          >
            🌍 {currentLeague} ▼
          </button>

          {openLeagues && (
            <div className="absolute top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded shadow-lg z-50">
              <div
                onClick={() => setLeagueFilter("ALL")}
                className="px-4 py-2 hover:bg-[var(--hover)] cursor-pointer"
              >
                {t.all}
              </div>

              {LEAGUES.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setLeagueFilter(String(l.id))}
                  className="px-4 py-2 hover:bg-[var(--hover)] cursor-pointer"
                >
                  {l.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MARKETS */}
        <div className="hidden md:block relative" ref={marketsRef}>
          <button
            onClick={() => setOpenMarkets(!openMarkets)}
            className="px-3 py-1 rounded text-sm bg-[var(--card)]"
          >
            🎯 {marketLabels[marketFilter]} ▼
          </button>

          {openMarkets && (
            <div className="absolute top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded shadow-lg z-50">
              {Object.entries(marketLabels).map(([key, label]) => (
                <div
                  key={key}
                  onClick={() => setMarketFilter(key)}
                  className="px-4 py-2 hover:bg-[var(--hover)] cursor-pointer"
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DATE */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1 rounded text-sm bg-[var(--card)] border border-[var(--border)]"
        >
          <option value="TODAY">📅 {t.today}</option>
          <option value="TODAY_TOMORROW">📅 {t.todayTomorrow}</option>
          <option value="NEXT_3_DAYS">📅 {t.next3Days}</option>
          <option value="ALL">🌍 {t.all}</option>
        </select>

        {/* VALUE */}
        <div className="flex items-center gap-2 text-xs">
          <span>{t.value}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
          />
          <span>{(minValue * 100).toFixed(0)}%</span>
        </div>

        {/* ODD */}
        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => setMinOdd(Math.max(1, minOdd - 0.1))}>
            -
          </button>
          <input
            type="number"
            value={minOdd}
            onChange={(e) => setMinOdd(Number(e.target.value))}
            className="w-12"
          />
          <button onClick={() => setMinOdd(minOdd + 0.1)}>+</button>
        </div>

        {/* FLAGS RIGHT */}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => changeLang("en")}>
            <Image src="/flags/gb.svg" alt="EN" width={24} height={24} />
          </button>
          <button onClick={() => changeLang("es")}>
            <Image src="/flags/es.svg" alt="ES" width={24} height={24} />
          </button>
        </div>

      </div>
    </div>
  );
});

export default Navbar;