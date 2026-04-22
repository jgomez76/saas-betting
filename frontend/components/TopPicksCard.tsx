import { Pick } from "@/lib/topPicks";
import PremiumLock from "@/components/PremiumLock";

type Props = {
  picks: Pick[];
  isPremium: boolean;
  onSelectPick: (pick: Pick) => void;
  onUpgrade?: () => void;
};

export default function TopPicksCard({
  picks,
  isPremium,
  onSelectPick,
  onUpgrade,
}: Props) {
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
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {picks.map((p, i) => {
          const locked = !isPremium && i > 0;

          const tierColor =
            p.tier === "safe"
              ? "text-[var(--positive)]"
              : p.tier === "medium"
              ? "text-[var(--warning)]"
              : "text-[var(--danger)]";

          return (
            <PremiumLock key={i} locked={locked}>
              <div
                onClick={() => {
                  if (!locked) onSelectPick(p);
                }}
                className={`
                  bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 
                  flex justify-between items-center transition-all
                  ${
                    locked
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:scale-[1.02] hover:shadow-md"
                  }
                `}
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

                  {/* TIER */}
                  <p className={`text-xs font-semibold mt-1 ${tierColor}`}>
                    {p.tier.toUpperCase()}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right flex flex-col items-end">

                  {/* 🔥 PROBABILIDAD (PROTAGONISTA) */}
                  {/* <p className="text-3xl font-extrabold leading-none text-[var(--danger)] border border-[var(--border)] bg-[var(--text)]">
                    {(p.probability * 100).toFixed(0)}%
                  </p> */}
                  <div className="px-3 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                    <p className="text-3xl font-extrabold leading-none text-[var(--positive)]">
                      {(p.probability * 100).toFixed(0)}%
                    </p>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mb-2">
                    probabilidad
                  </p>

                  {/* 💰 CUOTA */}
                  <p className="text-lg font-semibold">
                    {p.odd}
                  </p>

                  {/* 📈 VALUE */}
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    +{(p.value * 100).toFixed(1)}%
                  </p>

                </div>
              </div>
            </PremiumLock>
          );
        })}
      </div>

      {/* PAYWALL */}
      {!isPremium && picks.length > 1 && (
        <div className="mt-5 text-center">
          <button
            onClick={onUpgrade}
            className="text-sm bg-[var(--accent)] text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Ver más picks 🔒
          </button>
        </div>
      )}
    </div>
  );
}