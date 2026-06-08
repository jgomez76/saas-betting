"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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

  maxValue: number;
  setMaxValue: (v: number) => void;

  maxOdd: number;
  setMaxOdd: (v: number) => void;

  email: string;
  name: string;
  avatar: string;
};

type LeagueGroups = {
  [group: string]: {
    [leagueId: string]: string;
  };
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
  maxValue,
  setMinValue,
  setMaxValue,
  minOdd,
  maxOdd,
  setMinOdd,
  setMaxOdd,
  email,
  name,
  avatar,
}: Props) {
  const { changeLang, t, lang } = useLanguage();

  const [openMenu, setOpenMenu] = useState(false);

  const [leagueGroups, setLeagueGroups] =
    useState<LeagueGroups>({});

  const menuRef = useRef<HTMLDivElement>(null);

  const API =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  const safeAvatar =
    avatar &&
    avatar !== "null" &&
    avatar !== "undefined"
      ? avatar.startsWith("http")
        ? avatar
        : `${API}/${avatar.replace(/^\/+/, "").replace(/\\/g, "/")}`
      : null;

  const marketLabels: Record<string, string> = {
    ALL: t.all,
    "1X2": "1X2",
    OU25: "Over 2.5",
    OU35: "Over 3.5",
    BTTS: "BTTS",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {

    fetch(`${API}/analysis/metadata`)
      .then((res) => res.json())
      .then((data) => {

        setLeagueGroups(
          data.league_groups || {}
        );

      });

  }, [API]);

  return (
    <div className="w-full bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text)] p-4 mb-6 rounded-xl shadow">

      {/* <div className="flex flex-wrap items-center gap-3"> */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">



          {/* LEAGUES */}
          <select
            value={leagueFilter}
            onChange={(e) =>
              setLeagueFilter(e.target.value)
            }
            className="px-3 py-1 rounded text-sm bg-[var(--card)] border border-[var(--border)]"
          >

            <option value="ALL">
              🌍 {t.all}
            </option>

            {Object.entries(leagueGroups).map(

              ([groupName, leagues]) => (

                <optgroup
                  key={groupName}
                  label={groupName}
                >

                  {Object.entries(leagues).map(

                    ([leagueId, leagueName]) => (

                      <option
                        key={leagueId}
                        value={leagueId}
                      >
                        {leagueName}
                      </option>

                    )

                  )}

                </optgroup>

              )

            )}

          </select>

          {/* MARKETS */}
          <select
            value={marketFilter}
            onChange={(e) =>
              setMarketFilter(
                e.target.value
              )
            }
            className="px-3 py-1 rounded text-sm bg-[var(--card)] border border-[var(--border)]"
          >

            <option value="ALL">
              🎯 {t.all}
            </option>

            <option value="1X2">
              1X2
            </option>

            <option value="OU25">
              Over 2.5
            </option>

            <option value="OU35">
              Over 3.5
            </option>

            <option value="BTTS">
              BTTS
            </option>

          </select>

          {/* DATE */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1 rounded text-sm bg-[var(--card)] border border-[var(--border)]"
          >
            <option value="TODAY">📅 {t.today}</option>
            <option value="TODAY_TOMORROW">📅 {t.todayTomorrow}</option>
            {/* <option value="NEXT_3_DAYS">📅 {t.next3Days}</option> */}
            <option value="ALL">🌍 {t.all}</option>
          </select>

          <div className="ml-auto flex items-center gap-3">
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
                      referrerPolicy="no-referrer"
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

            {/* FLAGS RIGHT */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 ml-auto">

                <button
                  onClick={() => changeLang("en")}
                  className={`
                    rounded-full p-0.5 transition-all
                    ${lang === "en"
                      ? "ring-2 ring-[var(--accent)] scale-110"
                      : "opacity-60 hover:opacity-100"}
                  `}
                >
                  <Image
                    src="/flags/gb.svg"
                    alt="EN"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </button>

                <button
                  onClick={() => changeLang("es")}
                  className={`
                    rounded-full p-0.5 transition-all
                    ${lang === "es"
                      ? "ring-2 ring-[var(--accent)] scale-110"
                      : "opacity-60 hover:opacity-100"}
                  `}
                >
                  <Image
                    src="/flags/es.svg"
                    alt="ES"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </button>

              </div>
            </div>
          </div>


        </div>

        {/* FILTERS */}
        <div className="w-full flex justify-start">

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-3 flex gap-6">

            {/* VALUE */}
            <div className="flex flex-col gap-1 border-r border-[var(--border)] pr-6">

              <div className="text-sm font-medium">
                📈 {t.value}
              </div>

              <div className="flex items-center gap-3">

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.from}
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setMinValue(
                          Math.max(
                            0.05,
                            minValue - 0.05
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      −
                    </button>

                    <span className="w-12 text-center font-medium">
                      {Math.round(minValue * 100)}%
                    </span>

                    <button
                      onClick={() =>
                        setMinValue(
                          Math.min(
                            maxValue,
                            minValue + 0.05
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.to}
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setMaxValue(
                          Math.max(
                            minValue,
                            maxValue - 0.05
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      −
                    </button>

                    <span className="w-12 text-center font-medium">
                      {Math.round(maxValue * 100)}%
                    </span>

                    <button
                      onClick={() =>
                        setMaxValue(
                          Math.min(
                            1,
                            maxValue + 0.05
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* ODD */}
            <div className="flex flex-col gap-1">

              <div className="text-sm font-medium">
                🎲 {t.odds}
              </div>

              <div className="flex items-center gap-3">

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.from}
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setMinOdd(
                          Math.max(
                            1,
                            Number((minOdd - 0.5).toFixed(1))
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      −
                    </button>

                    <span className="w-12 text-center font-medium">
                      {minOdd.toFixed(1)}
                    </span>

                    <button
                      onClick={() =>
                        setMinOdd(
                          Math.min(
                            maxOdd,
                            Number((minOdd + 0.5).toFixed(1))
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.to}
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setMaxOdd(
                          Math.max(
                            minOdd,
                            Number((maxOdd - 0.5).toFixed(1))
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      −
                    </button>

                    <span className="w-12 text-center font-medium">
                      {maxOdd.toFixed(1)}
                    </span>

                    <button
                      onClick={() =>
                        setMaxOdd(
                          Math.min(
                            20,
                            Number((maxOdd + 0.5).toFixed(1))
                          )
                        )
                      }
                      className="
                        w-7 h-7
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--bg)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
});

export default Navbar;