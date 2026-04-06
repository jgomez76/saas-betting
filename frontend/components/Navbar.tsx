"use client";

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
  return (
    <div className="w-full bg-[#111] text-white p-4 mb-6 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      {/* LEFT */}
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-cyan-400">⚡ BetSaaS</h1>

        {/* MERCADOS */}
        <div className="flex gap-3 items-center flex-wrap">

          {/* 🏆 LIGA */}
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="px-3 py-1 rounded text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a]"
          >
            <option value="ALL">🌍 Todas</option>
            <option value="La Liga">La Liga EA Sports</option>
            <option value="Segunda División">La Liga Hypermotion</option>
            <option value="Serie A">Serie A</option>
            <option value="Bundesliga">Bundesliga</option>
          </select>

          {/* ⚽ MERCADOS */}
          {[
            { label: "1X2", value: "1X2" },
            { label: "Over 2.5", value: "OU25" },
            { label: "BTTS", value: "BTTS" },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setMarketFilter(m.value)}
              className={`px-3 py-1 rounded text-sm ${
                marketFilter === m.value
                  ? "bg-cyan-600"
                  : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
              }`}
            >
              {m.label}
            </button>
          ))}

          {/* ALL */}
          <button
            onClick={() => setMarketFilter("ALL")}
            className={`px-3 py-1 rounded text-sm ${
              marketFilter === "ALL"
                ? "bg-green-600"
                : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            }`}
          >
            ALL
          </button>

        </div>
        
    

      </div>

      {/* RIGHT */}
      {/* <div>
        <button
          onClick={onOpenTop}
          className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
        >
          🔥 Top Value
        </button>
      </div> */}
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