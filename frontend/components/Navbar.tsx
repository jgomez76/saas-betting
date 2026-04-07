"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  onOpenTop: () => void;
  onOpenBets: () => void;
  marketFilter: string;
  setMarketFilter: (value: string) => void;

  leagueFilter: string;
  setLeagueFilter: (value: string) => void;
};

export default function Navbar({
  onOpenTop,
  onOpenBets,
  marketFilter,
  setMarketFilter,
  leagueFilter,
  setLeagueFilter,
}: Props) {
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openLeagues, setOpenLeagues] = useState(false);

  const marketsRef = useRef<HTMLDivElement>(null);
  const leaguesRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full bg-[#111] text-white p-4 mb-6 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      {/* LEFT */}
      <div className="flex items-center gap-6 flex-wrap">
        <h1 className="text-xl font-bold text-cyan-400">⚡ BetSaaS</h1>

        <div className="flex gap-3 items-center flex-wrap">

          {/* 🌍 LIGAS DROPDOWN */}
          <div className="relative" ref={leaguesRef}>
            <button
              onClick={() => setOpenLeagues(!openLeagues)}
              className="px-3 py-1 rounded text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            >
              🌍 Ligas {openLeagues ? "▲" : "▼"}
            </button>

            {openLeagues && (
              <div className="absolute left-0 mt-2 w-44 bg-[#1e1e1e] border border-[#333] rounded shadow-lg z-50 overflow-hidden">

                {[
                  { label: "Todas", value: "ALL" },
                  { label: "La Liga EA Sports", value: "La Liga" },
                  { label: "La Liga Hypermotion", value: "Segunda División" },
                  { label: "Serie A", value: "Serie A" },
                  { label: "Bundesliga", value: "Bundesliga" },
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
              🎯 Mercados {openMarkets ? "▲" : "▼"}
            </button>

            {openMarkets && (
              <div className="absolute left-0 mt-2 w-44 bg-[#1e1e1e] border border-[#333] rounded shadow-lg z-50 overflow-hidden">

                {[
                  { label: "Todos", value: "ALL" },
                  { label: "1X2", value: "1X2" },
                  { label: "Over 1.5", value: "OU15" },
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

        </div>
      </div>

      {/* RIGHT */}
      <div className="flex gap-3">
        <button
          onClick={onOpenBets}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500"
        >
          💰 Mis apuestas
        </button>

        <button
          onClick={onOpenTop}
          className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
        >
          🔥 Top Value
        </button>
      </div>
    </div>
  );
}