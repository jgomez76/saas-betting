// type Pick = {
//   match: string;
//   market: string;
//   selection: string;
//   odd: number;
//   value: number;
//   probability: number;
//   league: string;
// };

import { Pick } from "@/lib/topPicks";

type Props = {
  picks: Pick[];
  isPremium: boolean;
  onSelectPick: (pick: Pick) => void;
};

export default function TopPicksCard({ picks, isPremium, onSelectPick }: Props) {
  if (!picks.length) return null;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">🔥 Top Picks</h2>

        {!isPremium && (
          <span className="text-xs text-[var(--muted)]">
            1 pick gratis
          </span>
        )}
      </div>

      {/* PICKS */}
      <div className="space-y-3">
        {picks.map((p, i) => (
          <div
              key={i}
              onClick={() => onSelectPick(p)} // 👈 CLAVE
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 flex justify-between items-center cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all"
            >
            {/* LEFT */}
            <div>
              <p className="font-semibold text-sm">{p.match}</p>

              <p className="text-xs text-[var(--muted)]">
                {p.market} • {p.selection.toUpperCase()}
              </p>

              <p className="text-xs text-[var(--muted)]">
                {p.league}
              </p>
            </div>

            {/* RIGHT */}
            <div className="text-right">
              <p className="text-xl font-bold">{p.odd}</p>

              <p className="text-xs text-[var(--muted)]">
                {(p.probability * 100).toFixed(0)}%
              </p>

              <p className="text-sm font-semibold text-[var(--accent)]">
                +{(p.value * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* PAYWALL */}
      {!isPremium && (
        <div className="mt-4 text-center">
          <button className="text-sm bg-[var(--accent)] text-black px-4 py-2 rounded-lg font-semibold">
            Ver más picks 🔒
          </button>
        </div>
      )}
    </div>
  );
}