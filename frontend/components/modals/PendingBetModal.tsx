"use client";

import { Bet } from "@/types/bet";

import {
  getStakeRules,
} from "@/lib/stake";

type PendingBet = Omit<Bet, "id">;

type Props = {
  pendingBet: PendingBet | null;

  setPendingBet: React.Dispatch<
    React.SetStateAction<PendingBet | null>
  >;

  addBet: (
    bet: PendingBet
  ) => void;

  formatValue: (
    v?: number | null
  ) => string | null;

  t: {
    confirmBet: string;
    recommendedStake: string;
    cancel: string;
    confirm: string;
  };
};

export default function PendingBetModal({
  pendingBet,
  setPendingBet,
  addBet,
  formatValue,
  t,
}: Props) {

  if (!pendingBet) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-[var(--card)] text-[var(--text)] p-6 rounded-xl border border-[var(--border)] w-[90%] md:w-[420px] shadow-lg">

        {/* TITLE */}
        <h2 className="text-xl font-bold text-center mb-4">
          {t.confirmBet}
        </h2>

        {/* INFO */}
        <div className="bg-[var(--bg)] p-4 rounded-lg text-center space-y-2">

          <p className="text-lg font-semibold">
            {pendingBet.match}
          </p>

          <p className="text-sm text-[var(--muted)]">
            {pendingBet.market}
            {" — "}
            {pendingBet.selection.toUpperCase()}
          </p>

          <p className="text-3xl font-bold">
            {pendingBet.odd ?? "-"}
          </p>

          {pendingBet.bookmaker && (
            <p className="text-sm text-[var(--muted)]">
              {pendingBet.bookmaker}
            </p>
          )}

          {pendingBet.value !== null &&
            pendingBet.value !== undefined && (
              <p className="text-[var(--accent)] font-bold">
                {formatValue(
                  pendingBet.value
                )}
              </p>
          )}

          <p className="text-xs text-[var(--muted)] mb-1">
            {t.recommendedStake}
          </p>

          <select
            value={pendingBet.stake_level}

            onChange={(e) => {

              const level =
                Number(e.target.value);

              const rule =
                getStakeRules()
                  .find(
                    (r) =>
                      r.level === level
                  );

              if (!rule) return;

              setPendingBet({
                ...pendingBet,

                stake_level: level,

                stake: rule.amount,
              });
            }}

            className="w-full p-2 mb-4 bg-[var(--bg)] border border-[var(--border)] rounded text-sm"
          >

            {getStakeRules()
              .map((r) => (
                <option
                  key={r.level}
                  value={r.level}
                >
                  Stake {r.level}
                  {" — "}
                  {r.amount}€
                </option>
            ))}

          </select>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-5">

          <button
            onClick={() =>
              setPendingBet(null)
            }

            className="flex-1 bg-[var(--card)] border border-[var(--border)] py-2 rounded-lg hover:opacity-80"
          >
            {t.cancel}
          </button>

          <button
            onClick={() => {

              addBet(pendingBet);

              setPendingBet(null);
            }}

            className="flex-1 bg-[var(--accent)] py-2 rounded-lg font-bold text-white hover:opacity-90"
          >
            {t.confirm}
          </button>

        </div>

      </div>

    </div>
  );
}