"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

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
    return <p className="text-center">Loading top bets...</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">🔥 Top Value Bets</h2>

      <table className="w-full text-sm text-center">
        <thead>
          <tr className="border-b">
            <th className="p-2">Match</th>
            <th>Market</th>
            <th>Pick</th>
            <th>Odd</th>
            <th>Book</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {bets.map((b, i) => {
            const isTop = b.value > 15;
            const isGood = b.value > 5;

            return (
              <tr
                key={i}
                className={`border-b ${
                  isTop
                    ? "bg-green-100"
                    : isGood
                    ? "bg-green-50"
                    : ""
                }`}
              >
                <td className="p-2 font-semibold">{b.match}</td>
                <td>{b.market}</td>
                <td className="font-bold">{b.selection}</td>
                <td className="text-lg font-bold">{b.odd}</td>
                <td className="text-gray-500">{b.bookmaker}</td>

                <td
                  className={`font-bold ${
                    isTop
                      ? "text-green-700"
                      : isGood
                      ? "text-green-600"
                      : "text-gray-600"
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