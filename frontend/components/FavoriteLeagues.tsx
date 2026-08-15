"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { API_URL } from "@/lib/api";

type LeagueGroups = {
  [group: string]: {
    [leagueId: string]: string;
  };
};

const GROUP_ICONS: Record<string, string> = {
  Europe: "🌍",
  America: "🌎",
  International: "🌐",
};

export default function FavoriteLeagues() {
  const { t } = useLanguage();

  const [selected, setSelected] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];

    const saved =
      localStorage.getItem("fav_leagues");

    return saved
      ? JSON.parse(saved)
      : [];
  });

  const [leagueGroups, setLeagueGroups] =
    useState<LeagueGroups>({});

  const apiUrl = API_URL();

  // -------------------------
  // SAVE FAVORITES
  // -------------------------

  useEffect(() => {
    localStorage.setItem(
      "fav_leagues",
      JSON.stringify(selected)
    );
  }, [selected]);

  // -------------------------
  // LOAD LEAGUES
  // -------------------------

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/analysis/metadata`
        );

        if (!res.ok) {
          console.error(
            "Error loading metadata"
          );
          return;
        }

        const data = await res.json();

        setLeagueGroups(
          data.league_groups || {}
        );
      } catch (err) {
        console.error(
          "Error loading league groups",
          err
        );
      }
    };

    loadMetadata();
  }, [apiUrl]);

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
        🏆 {t.favoriteLeagues}
      </h2>

      <div className="space-y-6">

        {Object.entries(
          leagueGroups
        ).map(
          ([groupName, leagues]) => (

            <div
              key={groupName}
              className="space-y-3"
            >

              <h3 className="font-semibold text-lg">
                {
                  GROUP_ICONS[
                    groupName
                  ] || "🏆"
                }{" "}
                {groupName}
              </h3>

              <div className="grid grid-cols-2 gap-2">

                {Object.entries(
                  leagues
                ).map(
                  ([
                    leagueId,
                    leagueName,
                  ]) => {

                    const id =
                      Number(
                        leagueId
                      );

                    const active =
                      selected.includes(
                        id
                      );

                    return (

                      <button
                        key={
                          leagueId
                        }
                        onClick={() =>
                          toggleLeague(
                            id
                          )
                        }
                        className={`
                          p-3 rounded-lg border text-sm transition
                          ${
                            active
                              ? "bg-[var(--accent)] text-white border-transparent"
                              : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--hover)]"
                          }
                        `}
                      >
                        {leagueName}
                      </button>

                    );
                  }
                )}

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}