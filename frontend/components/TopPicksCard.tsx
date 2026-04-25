import { Pick } from "@/lib/topPicks";
import PremiumLock from "@/components/PremiumLock";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LOCALES } from "@/lib/i18n/config";

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
  const { t, lang } = useLanguage();
  
  if (!picks.length) return null;

  const formatTime = (date: string) => {
    const d = new Date(date + "Z");

    return d.toLocaleTimeString(LOCALES[lang] || "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: lang === "en",
    });
  };



  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">🔥 {t.topPicks}</h2>

        {!isPremium && (
          <span className="text-xs text-[var(--muted)]">
            {t.oneFreePick}
          </span>
        )}
      </div>

      {/* PICKS */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

        {Array.from({ length: 4 }).map((_, i) => {
          const p = picks[i];
          const locked = !isPremium && i > 0;

          if (!p) return null;

          const tierColor =
            p.tier === "high"
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
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:scale-[1.02] hover:shadow-md"
                  }
                `}
              >
                {/* LEFT */}
                <div>
                  {!locked ? (
                    <>
                      <p className="font-semibold text-sm">{p.match}</p>
                      <p className="text-xs text-[var(--muted)]">
                        🕒 {formatTime(p.date)}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {p.market} • {p.selection.toUpperCase()}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {p.league}
                      </p>

                      <p className={`text-xs font-semibold mt-1 ${tierColor}`}>
                        {t.tier[p.tier]}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--muted)]">
                        🔒 Premium
                      </p>
                                           <p className="text-xs text-[var(--muted)]">
                        {p.league}
                      </p>

                    </>
                  )}
                </div>

                {/* RIGHT */}
                <div className="text-right flex flex-col items-end">

                  {/* 🔥 PROBABILIDAD (SIEMPRE VISIBLE) */}
                  <div className="px-3 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                    <p className="text-3xl font-extrabold text-[var(--positive)]">
                      {(p.probability * 100).toFixed(0)}%
                    </p>
                  </div>

                  <p className="text-[12px] text-[var(--muted)] mb-2">
                    {t.probability}
                  </p>

                  {/* 💰 CUOTA (SIEMPRE VISIBLE) */}
                  <p className="text-xl font-semibold">
                    {p.odd}
                  </p>

                  {/* 📈 VALUE (SOLO PREMIUM) */}
                  {!locked && (
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      +{(p.value * 100).toFixed(1)}%
                    </p>
                  )}

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
            {t.upgrade} 🔒
          </button>
        </div>
      )}
    </div>
  );
}