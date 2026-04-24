"use client";

import { useEffect, useState } from "react";
import { LEAGUES } from "@/lib/config/leagues";

export type League = {
  id: number;
  name: string;
};

// const ALL_LEAGUES: League[] = [
//   { id: 39, name: "Premier League" },
//   { id: 140, name: "La Liga" },
//   { id: 135, name: "Serie A" },
//   { id: 78, name: "Bundesliga" },
//   { id: 61, name: "Ligue 1" },
// ];

export default function FavoriteLeagues() {
    const [selected, setSelected] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("fav_leagues");
    return saved ? JSON.parse(saved) : [];
    });

    // SAVE
    useEffect(() => {
        localStorage.setItem("fav_leagues", JSON.stringify(selected));
    }, [selected]);

    const toggleLeague = (id: number) => {
        setSelected((prev) =>
        prev.includes(id)
            ? prev.filter((l) => l !== id)
            : [...prev, id]
        );
    };

    return (
        <div className="space-y-4">

        <h2 className="font-bold text-sm text-[var(--muted)] uppercase">
            🏆 Ligas favoritas
        </h2>

        <div className="grid grid-cols-2 gap-2">
            {LEAGUES.map((league) => {
            const active = selected.includes(league.id);

            return (
                <button
                key={league.id}
                onClick={() => toggleLeague(league.id)}
                className={`
                    p-3 rounded-lg border text-sm transition
                    ${
                    active
                        ? "bg-[var(--accent)] text-white border-transparent"
                        : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--hover)]"
                    }
                `}
                >
                {league.name}
                </button>
            );
            })}
        </div>

        </div>
    );
}