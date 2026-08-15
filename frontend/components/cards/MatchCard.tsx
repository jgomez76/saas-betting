"use client";

import React, { useState } from "react";
import { Match } from "@/types/match";
import { Bet } from "@/types/bet";

import { formatMatchDate } from "@/components/ui/format-match-date";

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

  maxValue: number;

  maxOdd: number;

  setPendingBet: React.Dispatch<
    React.SetStateAction<PendingBet | null>
    >;

  t: {
    vs: string;
    lang: string;
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
  maxValue,
  maxOdd,
  setPendingBet,
  t,
}: Props) {

  const id = match.fixture_id;
  const [activeMarket, setActiveMarket] = useState<"1X2" | "OU" | "BTTS">("1X2");

  return (
    <div
        className="
            theme-card
            w-full
            min-w-0
            max-w-full
            box-border
            overflow-hidden
            bg-[var(--card)]
            text-[var(--text)]
            p-4
            relative
            transition-all
            duration-200
            hover:scale-[1.015]
        "
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
            {formatMatchDate(
                match.date,
                t.lang
            )}
        </p>

        {/* MARKET TABS */}
        <div className="mb-2">

            <div className="flex justify-center">

                <button
                    onClick={() => setActiveMarket("1X2")}
                    className={`
                        px-5
                        py-2
                        text-sm
                        font-medium
                        border-b-2
                        border-transparent
                        transition-all
                        ${
                            activeMarket === "1X2"
                                ? "text-[var(--accent)] border-[var(--accent)]"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }
                    `}
                >
                    1X2
                </button>

                <button
                    onClick={() => setActiveMarket("OU")}
                    className={`
                        px-5
                        py-2
                        text-sm
                        font-medium
                        border-b-2
                        border-transparent
                        transition-all
                        ${
                            activeMarket === "OU"
                                ? "text-[var(--accent)] border-[var(--accent)]"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }
                    `}
                >
                    Goals
                </button>

                <button
                    onClick={() => setActiveMarket("BTTS")}
                    className={`
                        px-5
                        py-2
                        text-sm
                        font-medium
                        border-b-2
                        border-transparent
                        transition-all
                        ${
                            activeMarket === "BTTS"
                                ? "text-[var(--accent)] border-[var(--accent)]"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }
                    `}
                >
                    BTTS
                </button>

            </div>

        </div>

        {/* 1X2 */}
        {activeMarket === "1X2" &&
        match.markets?.["1X2"] && (
        <div 
        className="grid grid-cols-3 gap-1.5 mb-3">

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
                    value <= maxValue &&
                    (odd?.odd ?? 0) >= minOdd &&
                    (odd?.odd ?? 0) <= maxOdd;

                // console.log("IS VALUE =", isValue);

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
                    theme-button
                    min-w-0
                    px-2
                    py-1.5
                    text-center
                    cursor-pointer
                    transition-all
                    hover:scale-105

                    ${
                        isValue
                            ? "theme-bet-value"
                            : "theme-bet"
                    }
                    `}
                    >

                    <p className="text-[9px] uppercase opacity-60">
                        {k}
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[9px] opacity-55 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-1 text-center">

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
        {activeMarket === "OU" &&
        match.markets?.OU25 && (
            <div className="grid grid-cols-2 gap-2 mb-2">

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
                    value <= maxValue &&
                    (odd?.odd ?? 0) >= minOdd &&
                    (odd?.odd ?? 0) <= maxOdd;

                return (
                    <div
                        key={k}
                        onClick={() => {

                            const stakeRule = getStakeFromOdd(
                                odd?.odd ?? 0
                            );

                            setPendingBet({
                                match: `${match.home_team} vs ${match.away_team}`,
                                market: "1X2",
                                selection: k,
                                odd: odd?.odd,
                                bookmaker: odd?.bookmaker,
                                value,
                                fixture_id: match.fixture_id,
                                status: "pending",
                                date: match.date,
                                stake: stakeRule.amount,
                                stake_level: stakeRule.level,
                            });
                        }}


                        className={`
                        theme-button
                        min-w-0
                        px-2
                        py-1.5
                        text-center
                        cursor-pointer
                        transition-all
                        hover:scale-105

                        ${
                            isValue
                                ? "theme-bet-value"
                                : "theme-bet"
                        }
                        `}
  
                    >

                    <p className="text-[9px] uppercase opacity-60">
                        {k} 2.5
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[9px] opacity-55 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-1 text-center">

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
        {activeMarket === "OU" &&
        match.markets?.OU35 && (
            <div className="grid grid-cols-2 gap-2 mb-2">

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
                    value <= maxValue &&
                    (odd?.odd ?? 0) >= minOdd &&
                    (odd?.odd ?? 0) <= maxOdd;

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
                        theme-button
                        min-w-0
                        px-2
                        py-1.5
                        text-center
                        cursor-pointer
                        transition-all
                        hover:scale-105

                        ${
                            isValue
                                ? "theme-bet-value"
                                : "theme-bet"
                        }
                        `}

                    >

                    <p className="text-[9px] uppercase opacity-60">
                        {k} 3.5
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[9px] opacity-55 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-1 text-center">

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
        {activeMarket === "BTTS" &&
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

                console.log("MATCHCARD", {
                    minValue,
                    maxValue,
                    minOdd,
                    maxOdd,
                    });

                const isValue =
                    value !== null &&
                    value !== undefined &&
                    value >= minValue &&
                    value <= maxValue &&
                    (odd?.odd ?? 0) >= minOdd &&
                    (odd?.odd ?? 0) <= maxOdd;

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
                        theme-button
                        min-w-0
                        px-2
                        py-1.5
                        text-center
                        cursor-pointer
                        transition-all
                        hover:scale-105

                        ${
                            isValue
                                ? "theme-bet-value"
                                : "theme-bet"
                        }
                        `}

                    >

                    <p className="text-[9px] uppercase opacity-60">
                        BTTS {k}
                    </p>

                    <p className="font-bold text-xl md:text-2xl tracking-tight">
                        {odd?.odd ?? "-"}
                    </p>

                    <p className="text-[9px] opacity-55 truncate max-w-[90px] mx-auto">
                        {odd?.bookmaker ?? ""}
                    </p>

                    {value !== null &&
                        value !== undefined && (
                        <div className="mt-1 text-center">

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