"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Props = {
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;

  isAdmin: boolean;

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

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [leagueGroups, setLeagueGroups] =
    useState<LeagueGroups>({});

  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const insideDesktop =
        desktopMenuRef.current?.contains(target);

      const insideMobile =
        mobileMenuRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setOpenMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
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

      <div className="flex flex-col gap-4">
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center gap-3">



          {/* LEAGUES */}
          <select
            value={leagueFilter}
            onChange={(e) =>
              setLeagueFilter(e.target.value)
            }
            className="
                theme-select
                px-3
                py-2
                text-sm
                w-full
                lg:w-auto
                lg:min-w-[220px]
            "
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

          {/* DATE */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="
                theme-select
                px-3
                py-2
                text-sm
                w-full
                lg:w-auto
                lg:min-w-[180px]
            "
          >
            <option value="TODAY">📅 {t.today}</option>
            <option value="TODAY_TOMORROW">📅 {t.todayTomorrow}</option>
            {/* <option value="NEXT_3_DAYS">📅 {t.next3Days}</option> */}
            <option value="ALL">🌍 {t.all}</option>
          </select>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              lg:justify-end
              gap-3
              w-full
              lg:w-auto
              lg:ml-auto
            "
          >
            {/* USER */}
            {email ? (
              <div className="relative" ref={desktopMenuRef}>
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
                className="
                  theme-button
                  px-5
                  py-2.5
                  font-semibold
                "
              >
                🔐 {t.login}
              </button>
            )}

            {/* FLAGS RIGHT */}
            <div className="flex items-center gap-3">
              {/* <div className="flex items-center gap-2 ml-auto"> */}

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

                <button
                  onClick={() => changeLang("fr")}
                  className={`
                    rounded-full p-0.5 transition-all
                    ${lang === "fr"
                      ? "ring-2 ring-[var(--accent)] scale-110"
                      : "opacity-60 hover:opacity-100"}
                  `}
                >
                  <Image
                    src="/flags/fr.svg"
                    alt="FR"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </button>

                <button
                  onClick={() => changeLang("it")}
                  className={`
                    rounded-full p-0.5 transition-all
                    ${lang === "it"
                      ? "ring-2 ring-[var(--accent)] scale-110"
                      : "opacity-60 hover:opacity-100"}
                  `}
                >
                  <Image
                    src="/flags/it.svg"
                    alt="IT"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </button>

              </div>
            </div>
          </div>


        </div>

        {/* MOBILE CONTROLS */}
        <div className="lg:hidden w-full flex flex-col gap-3">

          {/* LOGIN + LANGUAGES */}
          <div className="flex items-center justify-between gap-3">

            {email ? (
              <div className="relative" ref={mobileMenuRef}>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(!openMenu);
                  }}
                  className="
                    theme-button
                    flex
                    items-center
                    gap-2
                    px-4
                    py-3
                    font-semibold
                  "
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
                    <span>
                      👤
                    </span>
                  )}

                  <span className="max-w-[120px] truncate">
                    {name || email}
                  </span>

                </button>

                {openMenu && (
                  <div className="
                    absolute
                    top-full
                    left-0
                    mt-2
                    w-52
                    bg-[var(--card)]
                    border
                    border-[var(--border)]
                    rounded-xl
                    shadow-lg
                    z-50
                  ">

                    <button
                      onClick={onOpenProfile}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-sm
                        hover:bg-[var(--hover)]
                      "
                    >
                      👤 {t.profile}
                    </button>

                    <button
                      onClick={onLogout}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-sm
                        text-[var(--danger)]
                        hover:bg-[var(--hover)]
                      "
                    >
                      🚪 {t.logout}
                    </button>

                  </div>
                )}

              </div>

            ) : (

              <button
                onClick={onOpenLogin}
                className="
                  theme-button
                  px-4
                  py-3
                  font-semibold
                  whitespace-nowrap
                "
              >
                🔐 {t.login}
              </button>

            )}

            {/* LANGUAGES */}
            <div className="flex items-center gap-2">

              <button
                onClick={() => changeLang("en")}
                className={`
                  rounded-full
                  p-0.5
                  transition-all
                  ${lang === "en"
                    ? "ring-2 ring-[var(--accent)] scale-110"
                    : "opacity-60"}
                `}
              >
                <Image
                  src="/flags/gb.svg"
                  alt="EN"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </button>

              <button
                onClick={() => changeLang("es")}
                className={`
                  rounded-full
                  p-0.5
                  transition-all
                  ${lang === "es"
                    ? "ring-2 ring-[var(--accent)] scale-110"
                    : "opacity-60"}
                `}
              >
                <Image
                  src="/flags/es.svg"
                  alt="ES"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </button>

              <button
                onClick={() => changeLang("fr")}
                className={`
                  rounded-full
                  p-0.5
                  transition-all
                  ${lang === "fr"
                    ? "ring-2 ring-[var(--accent)] scale-110"
                    : "opacity-60"}
                `}
              >
                <Image
                  src="/flags/fr.svg"
                  alt="FR"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </button>

              <button
                onClick={() => changeLang("it")}
                className={`
                  rounded-full
                  p-0.5
                  transition-all
                  ${lang === "it"
                    ? "ring-2 ring-[var(--accent)] scale-110"
                    : "opacity-60"}
                `}
              >
                <Image
                  src="/flags/it.svg"
                  alt="IT"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </button>

            </div>

          </div>


          {/* FILTER BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(
                (prev) => !prev
              )
            }
            className="
              theme-button
              w-full
              flex
              items-center
              justify-between
              px-4
              py-3
              font-semibold
            "
          >

            <span>
              🔎 {t.filters}
            </span>

            <span>
              {mobileFiltersOpen
                ? "▲"
                : "▼"}
            </span>

          </button>


          {/* FILTER CONTENT */}
          {mobileFiltersOpen && (
            <div className="
              bg-[var(--card)]
              border
              border-[var(--border)]
              rounded-xl
              p-4
              flex
              flex-col
              gap-5
            ">

              {/* LEAGUE */}
              <div className="flex flex-col gap-2">

                <span className="text-sm font-medium">
                  🌍 Liga
                </span>

                <select
                  value={leagueFilter}
                  onChange={(e) =>
                    setLeagueFilter(
                      e.target.value
                    )
                  }
                  className="
                    theme-select
                    w-full
                    px-3
                    py-3
                    text-sm
                  "
                >

                  <option value="ALL">
                    🌍 {t.all}
                  </option>

                  {Object.entries(
                    leagueGroups
                  ).map(
                    ([groupName, leagues]) => (
                      <optgroup
                        key={groupName}
                        label={groupName}
                      >
                        {Object.entries(
                          leagues
                        ).map(
                          ([
                            leagueId,
                            leagueName,
                          ]) => (
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

              </div>


              {/* DATE */}
              <div className="flex flex-col gap-2">

                <span className="text-sm font-medium">
                  📅 Fecha
                </span>

                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                  className="
                    theme-select
                    w-full
                    px-3
                    py-3
                    text-sm
                  "
                >

                  <option value="TODAY">
                    📅 {t.today}
                  </option>

                  <option value="TODAY_TOMORROW">
                    📅 {t.todayTomorrow}
                  </option>

                  <option value="ALL">
                    🌍 {t.all}
                  </option>

                </select>

              </div>


              {/* VALUE */}
              <div className="flex flex-col gap-3">

                <div className="text-sm font-medium">
                  📈 {t.value}
                </div>

                <div className="grid grid-cols-2 gap-4">

                  {/* FROM */}
                  <div className="flex flex-col gap-2">

                    <span className="text-xs text-[var(--muted)]">
                      {t.from}
                    </span>

                    <div className="flex items-center justify-between gap-2">

                      <button
                        onClick={() =>
                          setMinValue(
                            Math.max(
                              0.05,
                              minValue - 0.05
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        −
                      </button>

                      <span className="font-medium text-center">
                        {Math.round(
                          minValue * 100
                        )}%
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
                        className="theme-icon-button"
                      >
                        +
                      </button>

                    </div>

                  </div>


                  {/* TO */}
                  <div className="flex flex-col gap-2">

                    <span className="text-xs text-[var(--muted)]">
                      {t.to}
                    </span>

                    <div className="flex items-center justify-between gap-2">

                      <button
                        onClick={() =>
                          setMaxValue(
                            Math.max(
                              minValue,
                              maxValue - 0.05
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        −
                      </button>

                      <span className="font-medium text-center">
                        {Math.round(
                          maxValue * 100
                        )}%
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
                        className="theme-icon-button"
                      >
                        +
                      </button>

                    </div>

                  </div>

                </div>

              </div>


              {/* ODDS */}
              <div className="flex flex-col gap-3">

                <div className="text-sm font-medium">
                  🎲 {t.odds}
                </div>

                <div className="grid grid-cols-2 gap-4">

                  {/* FROM */}
                  <div className="flex flex-col gap-2">

                    <span className="text-xs text-[var(--muted)]">
                      {t.from}
                    </span>

                    <div className="flex items-center justify-between gap-2">

                      <button
                        onClick={() =>
                          setMinOdd(
                            Math.max(
                              1,
                              Number(
                                (
                                  minOdd - 0.5
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        −
                      </button>

                      <span className="font-medium text-center">
                        {minOdd.toFixed(1)}
                      </span>

                      <button
                        onClick={() =>
                          setMinOdd(
                            Math.min(
                              maxOdd,
                              Number(
                                (
                                  minOdd + 0.5
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        +
                      </button>

                    </div>

                  </div>


                  {/* TO */}
                  <div className="flex flex-col gap-2">

                    <span className="text-xs text-[var(--muted)]">
                      {t.to}
                    </span>

                    <div className="flex items-center justify-between gap-2">

                      <button
                        onClick={() =>
                          setMaxOdd(
                            Math.max(
                              minOdd,
                              Number(
                                (
                                  maxOdd - 0.5
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        −
                      </button>

                      <span className="font-medium text-center">
                        {maxOdd.toFixed(1)}
                      </span>

                      <button
                        onClick={() =>
                          setMaxOdd(
                            Math.min(
                              20,
                              Number(
                                (
                                  maxOdd + 0.5
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="theme-icon-button"
                      >
                        +
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* FILTERS - DESKTOP */}
        <div className="hidden lg:flex w-full">

          <div className="
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-xl
            px-5
            py-3
            flex
            flex-col
            lg:flex-row
            gap-6
          ">

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

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        setMinValue(
                          Math.max(
                            0.05,
                            minValue - 0.05
                          )
                        )
                      }
                      className="theme-icon-button"
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
                      className="theme-icon-button"
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.to}
                  </span>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        setMaxValue(
                          Math.max(
                            minValue,
                            maxValue - 0.05
                          )
                        )
                      }
                      className="theme-icon-button"
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
                      className="theme-icon-button"
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

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        setMinOdd(
                          Math.max(
                            1,
                            Number((minOdd - 0.5).toFixed(1))
                          )
                        )
                      }
                      className="theme-icon-button"
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
                      className="theme-icon-button"
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="flex flex-col">

                  <span className="text-[10px] text-[var(--muted)]">
                    {t.to}
                  </span>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        setMaxOdd(
                          Math.max(
                            minOdd,
                            Number((maxOdd - 0.5).toFixed(1))
                          )
                        )
                      }
                      className="theme-icon-button"
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
                      className="theme-icon-button"
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      {/* </div> */}
    </div>
  );
});

export default Navbar;