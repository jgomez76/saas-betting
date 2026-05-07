"use client";

import React from "react";
import { Match } from "@/types/match";
import { Bet } from "@/types/bet";

import {
  formatValue,
  renderForm,
} from "@/components/ui/match-ui";

import {
  getStakeFromOdd,
} from "@/lib/stake";

type PendingBet = Omit<Bet, "id">;

type Props = {
  match: Match;

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
    React.SetStateAction<PendingBet | null>
    >;

  t: {
    vs: string;
  };
};

export default function MatchCard({
  match,
  favorites,
  toggleFavorite,
  openTeamModal,
  marketFilter,
  minValue,
  minOdd,
  setPendingBet,
  t,
}: Props) {

  const id = match.fixture_id;

  return (
    <div
      className="bg-[var(--card)] text-[var(--text)] p-4 rounded-xl relative border border-[var(--border)] shadow-[0_6px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:scale-[1.015] transition-all duration-200"
    >

      {/* ⭐ FAVORITO */}
      <button
        onClick={() => toggleFavorite(id)}
        className="absolute top-2 right-2"
      >
        {favorites.includes(id)
          ? "⭐"
          : "☆"}
      </button>

      {/* EQUIPOS */}
      <div
        className="grid text-center mb-3 min-w-0"
        style={{
          gridTemplateColumns:
            "45% 10% 45%",
        }}
      >

        <div
          onClick={() =>
            openTeamModal(
              match.home_team_id,
              match.home_team
            )
          }
        >
          <p className="text-sm font-medium truncate">
            {match.home_team}
          </p>

          {renderForm(
            match.home_form || ""
          )}
        </div>

        <div className="text-[var(--muted)] text-xs">
          {t.vs}
        </div>

        <div
          onClick={() =>
            openTeamModal(
              match.away_team_id,
              match.away_team
            )
          }
        >
          <p className="text-sm font-medium truncate">
            {match.away_team}
          </p>

          {renderForm(
            match.away_form || ""
          )}
        </div>

      </div>

        {/* FECHA */}
        <p className="text-xs text-[var(--muted)] text-center mb-3 tracking-wide">
        {match.date}
        </p>

        {/* 1X2 */}
        {(marketFilter === "ALL" ||
        marketFilter === "1X2") &&
        match.markets?.["1X2"] && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">

            {(["home", "draw", "away"] as const).map((k) => {

                const odd = match.markets?.["1X2"]?.[k];

                const value =
                    match.value?.[
                    `${k}_value` as keyof typeof match.value
                    ];

                const isValue =
                    value !== null &&
                    value !== undefined &&
                    value >= minValue &&
                    (odd?.odd ?? 0) >= minOdd;

                return (
                    <div
                    key={k}
                    onClick={() => {

                        const stakeRule = getStakeFromOdd(
                            odd?.odd ?? 0
                        );

                        setPendingBet({
                            match:
                                `${match.home_team} vs ${match.away_team}`,

                            market: "1X2",
                            selection: k,
                            odd: odd?.odd,
                            bookmaker:
                                odd?.bookmaker,
                            value,
                            fixture_id:
                                match.fixture_id,
                            status: "pending",
                            date: match.date,
                            stake:
                                stakeRule.amount,
                            stake_level:
                                stakeRule.level,
                        });
                    }}

                    className={`
                        min-w-0 p-2 md:p-3 rounded-lg text-center cursor-pointer
                        border transition-all
                        hover:scale-105 hover:shadow-md

                        ${
                        isValue
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                            : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                        }
                    `}
                    >

                    <p className="text-[10px] uppercase opacity-70">
                        {k}
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[10px] opacity-70 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-2 text-center">

                            <span
                            className={`text-xs font-semibold ${
                                isValue
                                ? "text-[var(--accent-contrast)]"
                                : "text-[var(--text)]"
                            }`}
                            >
                            {formatValue(value)}
                            </span>

                        </div>
                    )}

                    </div>
                );
            })}

            </div>
        )}

        {/* OU25 */}    
        {(marketFilter === "ALL" ||
        marketFilter === "OU25") &&
        match.markets?.OU25 && (
            <div className="grid grid-cols-2 gap-2 mb-3">

            {(["over", "under"] as const)
                .map((k) => {

                const odd =
                    match.markets?.OU25?.[k];

                const value =
                    k === "over"
                    ? match.market_values?.OU25?.over_value
                    : match.market_values?.OU25?.under_value;

                const isValue =
                    value !== null &&
                    value !== undefined &&
                    value >= minValue &&
                    (odd?.odd ?? 0) >= minOdd;

                return (
                    <div
                    key={k}

                    onClick={() => {

                        const stakeRule = getStakeFromOdd(
                            odd?.odd ?? 0
                        );

                        setPendingBet({
                            match:
                                `${match.home_team} vs ${match.away_team}`,
                            market: "OU25",
                            selection: k,
                            odd: odd?.odd,
                            bookmaker:
                                odd?.bookmaker,
                            value,
                            fixture_id:
                                match.fixture_id,
                            status: "pending",
                            date: match.date,
                            stake:
                                stakeRule.amount,
                            stake_level:
                                stakeRule.level,
                            });
                    }}

                    className={`
                        min-w-0 p-2 md:p-3 rounded-lg text-center cursor-pointer
                        border transition-all
                        hover:scale-105 hover:shadow-md

                        ${
                        isValue
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                            : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                        }
                    `}
                    >

                    <p className="text-[10px] uppercase opacity-70">
                        {k} 2.5
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[10px] opacity-70 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-2 text-center">

                            <span
                            className={`text-xs font-semibold ${
                                isValue
                                ? "text-[var(--accent-contrast)]"
                                : "text-[var(--text)]"
                            }`}
                            >
                            {formatValue(value)}
                            </span>

                        </div>
                    )}

                    </div>
                );
            })}
            </div>
        )}

        {/* OU35 */}
        {(marketFilter === "ALL" ||
        marketFilter === "OU35") &&
        match.markets?.OU35 && (
            <div className="grid grid-cols-2 gap-2 mb-3">

            {(["over", "under"] as const)
                .map((k) => {

                const odd =
                    match.markets?.OU35?.[k];

                const value =
                    k === "over"
                    ? match.market_values?.OU35?.over_value
                    : match.market_values?.OU35?.under_value;

                const isValue =
                    value !== null &&
                    value !== undefined &&
                    value >= minValue &&
                    (odd?.odd ?? 0) >= minOdd;

                return (
                    <div
                    key={k}

                    onClick={() => {

                        const stakeRule = getStakeFromOdd(
                            odd?.odd ?? 0
                        );

                        setPendingBet({
                            match:
                                `${match.home_team} vs ${match.away_team}`,
                            market: "OU35",
                            selection: k,
                            odd: odd?.odd,
                            bookmaker:
                                odd?.bookmaker,
                            value,
                            fixture_id:
                                match.fixture_id,
                            status: "pending",
                            date: match.date,
                            stake:
                                stakeRule.amount,
                            stake_level:
                                stakeRule.level,
                        });
                    }}

                    className={`
                        min-w-0 p-2 md:p-3 rounded-lg text-center cursor-pointer
                        border transition-all
                        hover:scale-105 hover:shadow-md

                        ${
                        isValue
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                            : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                        }
                    `}
                    >

                    <p className="text-[10px] uppercase opacity-70">
                        {k} 3.5
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[10px] opacity-70 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-2 text-center">

                            <span
                            className={`text-xs font-semibold ${
                                isValue
                                ? "text-[var(--accent-contrast)]"
                                : "text-[var(--text)]"
                            }`}
                            >
                            {formatValue(value)}
                            </span>

                        </div>
                    )}

                    </div>
                );
            })}
            </div>
        )}

        {/* BTTS */}
        {(marketFilter === "ALL" ||
        marketFilter === "BTTS") &&
        match.markets?.BTTS && (
            <div className="grid grid-cols-2 gap-2">

            {(["yes", "no"] as const)
                .map((k) => {

                const odd =
                    match.markets?.BTTS?.[k];

                const value =
                    k === "yes"
                    ? match.market_values?.BTTS?.yes_value
                    : match.market_values?.BTTS?.no_value;

                const isValue =
                    value !== null &&
                    value !== undefined &&
                    value >= minValue &&
                    (odd?.odd ?? 0) >= minOdd;

                return (
                    <div
                    key={k}

                    onClick={() => {

                        const stakeRule = getStakeFromOdd(
                            odd?.odd ?? 0
                        );

                        setPendingBet({
                            match:
                                `${match.home_team} vs ${match.away_team}`,
                            market: "BTTS",
                            selection: k,
                            odd: odd?.odd,
                            bookmaker:
                                odd?.bookmaker,
                            value,
                            fixture_id:
                                match.fixture_id,
                            status: "pending",
                            date: match.date,
                            stake:
                                stakeRule.amount,
                            stake_level:
                                stakeRule.level,
                        });
                    }}

                    className={`
                        min-w-0 p-2 md:p-3 rounded-lg text-center cursor-pointer
                        border transition-all
                        hover:scale-105 hover:shadow-md

                        ${
                        isValue
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent"
                            : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"
                        }
                    `}
                    >

                    <p className="text-[10px] uppercase opacity-70">
                        BTTS {k}
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[10px] opacity-70 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-2 text-center">

                            <span
                            className={`text-xs font-semibold ${
                                isValue
                                ? "text-[var(--accent-contrast)]"
                                : "text-[var(--text)]"
                            }`}
                            >
                            {formatValue(value)}
                            </span>

                        </div>
                    )}

                    </div>
                );
            })}
            </div>
        )}



    </div>
  );
}