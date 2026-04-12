"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onOpenTop: () => void;
  onOpenBets: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAnalysis: () => void;

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
};

export default function Navbar({
  onOpenTop,
  // onOpenBets,
  onOpenLogin,
  onLogout,
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
}: Props) {
  const router = useRouter();
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openLeagues, setOpenLeagues] = useState(false);

  const marketsRef = useRef<HTMLDivElement>(null);
  const leaguesRef = useRef<HTMLDivElement>(null);

  const marketLabels: Record<string, string> = {
    ALL: "Todos",
    "1X2": "1X2",
    OU25: "Over 2.5",
    OU35: "Over 3.5",
    BTTS: "BTTS",
  };

  const leagueLabels: Record<string, string> = {
    ALL: "Todas",
    "140": "La Liga EA Sports",
    "141": "La Liga hypermotion",
    "39": "Premier League",
    "135": "Serie A",
    "78": "Bundesliga",
    "61": "Ligue 1",
    "2": "Champions League",
    "3": "Europa League",
  };

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

  return (
    <div className="w-full bg-[#111827] border-b border-[#1f2937] text-white p-4 mb-6 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    {/* // <div className="w-full bg-[#111827] border-b border-[#1f2937] p-4"> */}
      {/* LEFT */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* <h1 className="text-xl font-bold text-cyan-400">⚡ BetSaaS</h1> */}

        <div className="flex gap-3 items-center flex-wrap">
          {/* 🔐 ADMIN / LOGIN */}
          {/* {isAdmin ? (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-green-700 rounded text-sm hover:bg-green-600"
            >
              🛠 Admin (Logout)
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              🔐 Login
            </button>
          )} */}
          {email ? (
            <div className="flex items-center gap-3">

              {/* 👤 USUARIO */}
              <span className="text-sm text-gray-300">
                👤 {email}
              </span>

              {/* 🛠 ADMIN */}
              {isAdmin && (
                <span className="text-xs bg-green-700 px-2 py-1 rounded">
                  ADMIN
                </span>
              )}

              {/* LOGOUT */}
              <button
                onClick={onLogout}
                className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-500"
              >
                Logout
              </button>

            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              🔐 Login
            </button>
          )}
          {/* {subscription === "premium" && (
            <span className="text-xs bg-yellow-600 px-2 py-1 rounded">
              PREMIUM
            </span>
          )} */}

          {/* 🌍 LIGAS DROPDOWN */}
          <div className="relative" ref={leaguesRef}>
            <button
              onClick={() => setOpenLeagues(!openLeagues)}
              className="px-3 py-1 rounded text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            >
              {/* 🌍 Ligas {openLeagues ? "▲" : "▼"} */}
              🌍 {leagueLabels[leagueFilter] || "Ligas"} {openLeagues ? "▲" : "▼"}
            </button>

            {openLeagues && (
              <div className="absolute left-0 mt-2 w-44 bg-[#1e1e1e] border border-[#333] rounded shadow-lg z-50 overflow-hidden">
                {[
                  { label: "🌍 Todas", value: "ALL" },

                  { label: "La Liga EA Sports", value: "140" },
                  { label: "La Liga Hypermotion", value: "141" },
                  { label: "Serie A", value: "135" },
                  // { label: "Serie A", value: "71" },
                  { label: "Bundesliga", value: "78" },
                  { label: "Premier League", value: "39" },
                  { label: "Champions League", value: "2" },
                  { label: "Europa League", value: "3" },
                ].map((l) => (
                  <div
                    key={l.value}
                    onClick={() => {
                      setLeagueFilter(l.value);
                      setOpenLeagues(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#2a2a2a] ${
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
              className="px-3 py-1 rounded text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            >
              {/* 🎯 Mercados {openMarkets ? "▲" : "▼"} */}
              🎯 {marketLabels[marketFilter] || "Mercados"} {openMarkets ? "▲" : "▼"}
            </button>

            {openMarkets && (
              <div className="absolute left-0 mt-2 w-44 bg-[#1e1e1e] border border-[#333] rounded shadow-lg z-50 overflow-hidden">

                {[
                  { label: "Todos", value: "ALL" },
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
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#2a2a2a] ${
                      marketFilter === m.value ? "bg-[#333]" : ""
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
              className="px-3 py-1 rounded text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            >
              <option value="TODAY">📅 Hoy</option>
              <option value="TODAY_TOMORROW">📅 Hoy + mañana</option>
              <option value="NEXT_3_DAYS">📅 Próx. 3 días</option>
              <option value="ALL">🌍 Todas</option>
            </select>
          </div>

          {/* 🎯 FILTROS VALUE PRO */}
          <div className="flex items-center gap-4 flex-wrap text-xs">

            {/* 📊 VALUE SLIDER */}
            <div className="flex items-center gap-2">
              <span>Value:</span>

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
              <span>Odd:</span>

              {/* ➖ */}
              <button
                // onClick={() => setMinOdd((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                onClick={() => setMinOdd(Math.max(1, +(minOdd - 0.1).toFixed(2)))}
                className="px-2 bg-[#2a2a2a] rounded"
              >
                -
              </button>

              {/* INPUT */}
              <input
                type="number"
                step="0.1"
                value={minOdd}
                onChange={(e) => setMinOdd(Number(e.target.value))}
                className="w-14 px-2 py-1 rounded bg-[#2a2a2a]"
              />

              {/* ➕ */}
              <button
                // onClick={() => setMinOdd((prev) => +(prev + 0.1).toFixed(2))}
                onClick={() => setMinOdd(+(minOdd + 0.1).toFixed(2))}
                className="px-2 bg-[#2a2a2a] rounded"
              >
                +
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT */}
      <div className="flex gap-3">
        {/* <button
          onClick={onOpenBets}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500"
        >
          💰 Mis apuestas
        </button> */}

        <button
          onClick={onOpenTop}
          className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
        >
          🔥 Top Value
        </button>

        {/* {isAdmin && (
          <button
            onClick={onOpenAnalysis}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
          >
            📊 Análisis
          </button>
        )} */}
        {/* <button
          onClick={() => router.push("/account")}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          👤 Cuenta
        </button> */}
        {email && (
          <button onClick={() => router.push("/account")}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            👤 Cuenta
          </button>
        )}
      </div>
    </div>
  );
}