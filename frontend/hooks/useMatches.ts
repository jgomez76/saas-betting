"use client";

import {
  useCallback,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

import { Match } from "@/types/match";

type UseMatchesReturn = {
  allMatches: Match[];
  loading: boolean;
  progress: number;

  openLeagues: Record<string, boolean>;

  setOpenLeagues: Dispatch<SetStateAction<Record<string, boolean>>>;

  toggleLeague: (league: string) => void;
};

export function useMatches(apiUrl: string): UseMatchesReturn {
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);

  const [openLeagues, setOpenLeagues] = useState<
    Record<string, boolean>
  >({});

  const toggleLeague = (league: string) => {
    setOpenLeagues((prev) => ({
      ...prev,
      [league]: !prev[league],
    }));
  };

  const mergeMatches = useCallback(
    (oldMatches: Match[], newMatches: Match[]) => {
      const map = new Map<number, Match>();

      oldMatches.forEach((m) => {
        map.set(m.fixture_id, m);
      });

      newMatches.forEach((m) => {
        map.set(m.fixture_id, m);
      });

      return Array.from(map.values());
    },
    []
  );

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {
    if (!apiUrl) return;

    const load = async () => {
      setLoading(true);

      await new Promise((r) => setTimeout(r, 0));

      let data: Match[] = [];

      try {
        const res = await fetch(`${apiUrl}/value-bets`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("⚠️ value-bets unavailable");
          setLoading(false);
          return;
        }

        data = await res.json();
      } catch (err) {
        console.error("💥 ERROR loading matches:", err);

        setLoading(false);
        return;
      }

      const filtered = data.filter(
        (m: Match) => m.markets?.["1X2"]
      );

      // 🔥 ABRIR TODAS LAS LIGAS

      const leagues: string[] = Array.from(
        new Set(filtered.map((m: Match) => m.league))
      );

      const initialState: Record<string, boolean> = {};

      leagues.forEach((l) => {
        initialState[l] = true;
      });

      setOpenLeagues(initialState);

      // 🔥 GROUP BY LEAGUE

      const groupedByLeague: Record<string, Match[]> = {};

      filtered.forEach((m: Match) => {
        if (!groupedByLeague[m.league]) {
          groupedByLeague[m.league] = [];
        }

        groupedByLeague[m.league].push(m);
      });

      const leagueNames = Object.keys(groupedByLeague);

      setAllMatches([]);

      // 🔥 PROGRESSIVE LOAD

      for (let i = 0; i < leagueNames.length; i++) {
        const league = leagueNames[i];

        setProgress(
          Math.round(((i + 1) / leagueNames.length) * 100)
        );

        await new Promise((r) => setTimeout(r, 300));

        setAllMatches((prev) => [
          ...prev,
          ...groupedByLeague[league],
        ]);
      }

      setLoading(false);
    };

    load();
  }, [apiUrl]);

  // ---------------- AUTO REFRESH ----------------

  useEffect(() => {
    if (!apiUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/value-bets`, {
          credentials: "include",
        });

        if (!res.ok) return;

        const data: Match[] = await res.json();

        const filtered = data.filter(
          (m: Match) => m.markets?.["1X2"]
        );

        console.log("Refresh:", filtered.length);

        // setAllMatches((prev) =>
        //   mergeMatches(prev, filtered)
        // );
        setAllMatches(filtered);
      } catch (err) {
        console.error("Refresh error", err);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [apiUrl, mergeMatches]);

  return {
    allMatches,
    loading,
    progress,

    openLeagues,
    setOpenLeagues,

    toggleLeague,
  };
}