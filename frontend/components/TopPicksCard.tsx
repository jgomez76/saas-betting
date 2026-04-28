import PremiumLock from "@/components/PremiumLock";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LOCALES } from "@/lib/i18n/config";

type TopPick = {
  fixture_id: number;
  match: string;
  market: string;
  selection: string;
  probability: number;
  odd: number;
  value: number;
  kickoff: string;
  is_free: boolean;
};

type Props = {
  picks: TopPick[];
  freePick?: TopPick | null;
  isPremium: boolean;
  onSelectPick: (pick: TopPick) => void;
};

export default function TopPicksCard({
  picks,
  freePick,
  isPremium,
  onSelectPick,
}: Props) {
  const { t, lang } = useLanguage();

  // 🔥 Unificar FREE + PREMIUM
  // const allPicks = freePick
  //   ? [freePick, ...picks.filter(p => p.fixture_id !== freePick.fixture_id)]
  //   : picks;
  // const allPicks = freePick
  //   ? [...picks, freePick]
  //   : picks;

  // allPicks.sort((a, b) => b.probability - a.probability);

  let allPicks: TopPick[] = [];

  const merged = [
    ...(picks || []),
    ...(freePick ? [freePick] : [])
  ];

  const unique = merged.filter(
    (p, index, self) =>
      index === self.findIndex(x => x.fixture_id === p.fixture_id)
  );

  if (isPremium) {
    // 👑 PREMIUM → ordenados
    allPicks = unique.sort((a, b) => b.probability - a.probability);

  } else {
    // 👤 FREE → free primero
    const free = unique.find(p => p.is_free);
    const rest = unique.filter(p => !p.is_free);

    allPicks = [
      ...(free ? [free] : []),
      ...rest
    ];
  }

  if (!allPicks.length) return null;

  const formatTime = (date: string) => {
    const d = new Date(date + "Z");

    return d.toLocaleTimeString(LOCALES[lang] || "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: lang === "en",
    });
  };

    // console.log("PICKS EN CARD", picks)
    
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

        {allPicks.slice(0, 6).map((p, i) => {
          // const locked = !isPremium && !p.is_free;
          const locked = !isPremium && i > 0;

          return (
            <PremiumLock key={p.fixture_id} locked={locked}>
              <div
                onClick={() => {
                  if (!locked) onSelectPick(p);
                }}
                className={`
                  bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 
                  flex justify-between items-center transition-all
                  ${
                    locked
                      ? "cursor-not-allowed opacity-60"
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
                        🕒 {formatTime(p.kickoff)}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {p.market} • {p.selection.toUpperCase()}
                      </p>

                      {/* FREE BADGE */}
                      {/* {p.is_free && (
                        <p className="text-xs text-[var(--accent)] font-semibold mt-1">
                          FREE
                        </p>
                      )} */}
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-[var(--muted)]">
                      🔒 Premium
                    </p>
                  )}
                </div>

                {/* RIGHT */}
                <div className="text-right flex flex-col items-end">

                  {/* PROBABILIDAD */}
                  <div className="px-3 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                    <p className="text-3xl font-extrabold text-[var(--positive)]">
                      {(p.probability * 100).toFixed(0)}%
                    </p>
                  </div>

                  <p className="text-[12px] text-[var(--muted)] mb-2">
                    {t.probability}
                  </p>

                  {/* CUOTA */}
                  <p className="text-xl font-semibold">
                    {p.odd}
                  </p>

                  {/* VALUE */}
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
    </div>
  );
}