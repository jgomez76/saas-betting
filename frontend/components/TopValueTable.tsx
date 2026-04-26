"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Bet = {
  match: string;
  league: string;
  date: string;
  market: string;
  selection: string;
  odd: number;
  bookmaker: string;
  value: number;
};

export default function TopValueTable() {
  const { t } = useLanguage();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/top-value`)
      .then((res) => res.json())
      .then((data) => {
        setBets(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-[var(--muted)]">
      {t.loadingTopBets}
    </p>;
  }

  if (bets.length === 0) {
    return (
      <p className="text-center text-var[(--muted)]">
        {t.noResults}
      </p>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--primary)]">🔥 {t.topValueBets}</h2>

      <table className="w-full text-sm text-center text-[var(--text)]">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted)]">
            <th className="p-2">{t.match}</th>
            <th>{t.market}</th>
            <th>{t.pick}</th>
            <th>{t.odd}</th>
            <th>{t.book}</th>
            <th>{t.value}</th>
          </tr>
        </thead>

        <tbody>
          {bets.map((b, i) => {
            const isTop = b.value > 15;
            const isGood = b.value > 5;

            return (
              <tr
                key={i}
                className={`border-b border-[var(--border)] ${
                  isTop
                    ? "bg-[var(--success)]/20"
                    : isGood
                    ? "bg-[var(--success)]/10"
                    : "hover:bg-[var(--hover)]"
                }`}
              >
                <td className="p-2 font-semibold text-[var(--text)]">{b.match}</td>
                <td>{b.market}</td>
                <td className="font-bold">{b.selection}</td>
                <td className="text-lg font-bold">{b.odd}</td>
                <td className="text-[var(--muted)]">{b.bookmaker}</td>

                <td
                  className={`font-bold ${
                    isTop
                      ? "text-[var(--success)]"
                      : isGood
                      ? "text-[var(--success)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  +{b.value}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}