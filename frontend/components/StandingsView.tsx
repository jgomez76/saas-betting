"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Team = {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
};

export default function StandingsView() {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [table, setTable] = useState<Team[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/leagues-selected`)
      .then((res) => res.json())
      .then(setLeagues);
  }, []);

  useEffect(() => {
    if (!selectedLeague) return;

    fetch(`${API_URL}/standings/${selectedLeague}`)
      .then((res) => res.json())
      .then(setTable);
  }, [selectedLeague]);

  return (
    <div className="flex gap-6">

      {/* SIDEBAR */}
      <div className="w-52 bg-[#1f2937] p-3 rounded-lg border border-[#333]">
        <h2 className="mb-3 text-sm font-bold text-cyan-400">🏆 Ligas</h2>

        {leagues.map((l) => (
          <div
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`p-2 text-sm rounded cursor-pointer ${
              selectedLeague === l
                ? "bg-cyan-600"
                : "hover:bg-[#2a2a2a]"
            }`}
          >
            {l}
          </div>
        ))}
      </div>

      {/* TABLA */}
      <div className="flex-1">

        {/* {!selectedLeague && (
          <p className="text-gray-400">Selecciona una liga</p>
        )} */}

        {table.length > 0 && (
          <div className="bg-[#1f2937] rounded-lg p-4 border border-[#333]">

            <h2 className="text-sm font-bold mb-3 text-cyan-400">
              Clasificación
            </h2>

            <table className="w-full text-xl">
              <thead className="text-gray-400">
                <tr>
                  <th>#</th>
                  <th className="text-left">Equipo</th>
                  <th>PJ</th>
                  <th>G</th>
                  <th>E</th>
                  <th>P</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>Pts</th>
                </tr>
              </thead>

              <tbody>
                {table.map((t, i) => (
                  <tr key={t.team} className="border-t border-[#333]">

                    <td className="text-center">{i + 1}</td>

                    <td className="text-left">{t.team}</td>

                    <td className="text-center">{t.played}</td>
                    <td className="text-center text-green-400">{t.wins}</td>
                    <td className="text-center text-yellow-400">{t.draws}</td>
                    <td className="text-center text-red-400">{t.losses}</td>

                    <td className="text-center">{t.gf}</td>
                    <td className="text-center">{t.ga}</td>

                    <td className="text-center font-bold">{t.points}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}