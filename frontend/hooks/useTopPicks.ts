"use client";

import { useEffect, useMemo, useState } from "react";

type TopPick = {
  fixture_id: number;
  match: string;
  market: string;
  selection: string;
  probability: number;
  odd: number;
  bookmaker: string;
  value: number;
  kickoff: string;
  is_free: boolean;
};

type TopPicksResponse = {
  free: TopPick | null;
  premium: TopPick[];
  all_finished: boolean;
};

type UseTopPicksReturn = {
  freePick: TopPick | null;
  validPicks: TopPick[];

  allFinished: boolean;

  topPicksLoading: boolean;
};

export function useTopPicks(
  apiUrl: string
): UseTopPicksReturn {
  const [topPicks, setTopPicks] =
    useState<TopPicksResponse | null>(null);

  const [topPicksLoading, setTopPicksLoading] =
    useState(true);

  const [allFinished, setAllFinished] =
    useState(false);

  useEffect(() => {
    if (!apiUrl) return;

    const loadTopPicks = async () => {
      try {
        const res = await fetch(`${apiUrl}/top-picks`, {
          credentials: "include",
        });

        const data: TopPicksResponse = await res.json();

        console.log("🔥 TOP PICKS:", data);

        setTopPicks(data);

        setAllFinished(data.all_finished || false);
      } catch (err) {
        console.error("❌ top picks error", err);
      } finally {
        setTopPicksLoading(false);
      }
    };

    loadTopPicks();
  }, [apiUrl]);

  const premiumPicks = useMemo(() => {
    return topPicks?.premium || [];
  }, [topPicks]);

  const validPicks = useMemo(() => {
    return premiumPicks.filter((p: TopPick) => {
      const kickoffUTC = new Date(
        p.kickoff.replace(" ", "T") + "Z"
      );

      return kickoffUTC.getTime() > Date.now();
    });
  }, [premiumPicks]);

  const freePick = useMemo(() => {
    if (!topPicks?.free) return null;

    const kickoffUTC = new Date(
      topPicks.free.kickoff.replace(" ", "T") + "Z"
    );

    return kickoffUTC.getTime() > Date.now()
      ? topPicks.free
      : null;
  }, [topPicks]);

  return {
    freePick,
    validPicks,

    allFinished,

    topPicksLoading,
  };
}