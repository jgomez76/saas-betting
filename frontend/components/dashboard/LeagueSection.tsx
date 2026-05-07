"use client";

import MatchCard from "@/components/cards/MatchCard";

import { Match } from "@/types/match";
import { Bet } from "@/types/bet";

type PendingBet = Omit<Bet, "id">;

type Props = {
  league: string;

  leagueMatches: Match[];

  isOpen: boolean;

  toggleLeague: (
    league: string
  ) => void;

  loading: boolean;

  favorites: number[];

  toggleFavorite: (
    fixtureId: number
  ) => void;

  openTeamModal: (
    teamId: number,
    teamName: string
  ) => void;

  marketFilter: string;

  minValue: number;

  minOdd: number;

  setPendingBet: React.Dispatch<
    React.SetStateAction<
      PendingBet | null
    >
  >;

  t: {
    matches: string;
    vs: string;
  };
};

export default function LeagueSection({
  league,
  leagueMatches,
  isOpen,
  toggleLeague,
  loading,
  favorites,
  toggleFavorite,
  openTeamModal,
  marketFilter,
  minValue,
  minOdd,
  setPendingBet,
  t,
}: Props) {

  return (
    <div className="animate-fadeIn">

      {/* 🏆 HEADER */}
      <div
        onClick={() =>
          toggleLeague(league)
        }

        className="flex justify-between items-center bg-[var(--card)] text-[var(--text)] px-4 py-3 rounded-lg cursor-pointer hover:opacity-80 transition mt-8 border border-[var(--border)]"
      >

        <div className="flex items-center gap-2">

          <span>
            {isOpen ? "▼" : "▶️"}
          </span>

          <span className="font-semibold text-lg">
            {league}
          </span>

        </div>

        <span className="text-sm text-[var(--muted)]">
          {leagueMatches.length}
          {" "}
          {t.matches}
        </span>

      </div>

      {/* 📦 CONTENT */}
      <div
        className={`transition-all duration-500 ease-out transform ${
          isOpen
            ? "max-h-[2000px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 overflow-hidden"
        }`}
      >

        <div className="grid mt-4 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

          {!loading &&
            leagueMatches.map((match) => (
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
                }}
              />
          ))}

        </div>

      </div>

    </div>
  );
}