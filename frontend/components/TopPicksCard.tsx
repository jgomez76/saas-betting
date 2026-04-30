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
  bookmaker: string;
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

const formatPick = (p: TopPick) => {
  if (p.market === "1X2") {
    if (p.selection === "home") return "HOME WIN";
    if (p.selection === "away") return "AWAY WIN";
    if (p.selection === "draw") return "DRAW";
  }

  if (p.market === "OU25") {
    return p.selection === "over"
      ? "OVER 2.5 GOALS"
      : "UNDER 2.5 GOALS";
  }

  if (p.market === "OU35") {
    return p.selection === "over"
      ? "OVER 3.5 GOALS"
      : "UNDER 3.5 GOALS";
  }

  if (p.market === "BTTS") {
    return p.selection === "yes"
      ? "BTTS YES"
      : "BTTS NO";
  }

  return `${p.market} ${p.selection}`;
};

const getProbStyles = (prob: number) => {
  if (prob > 0.7) {
    return {
      color: "var(--positive)",
      size: "text-3xl",
    };
  }

  if (prob > 0.6) {
    return {
      color: "var(--accent)",
      size: "text-2xl",
    };
  }

  return {
    color: "var(--warning)",
    size: "text-xl",
  };
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

    // console.log("PICKS EN CARD", picks

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
          const probStyles = getProbStyles(p.probability);

return (
  <PremiumLock key={p.fixture_id} locked={locked}>
    <div
      onClick={() => {
        if (!locked) onSelectPick(p);
      }}
      className={`
        relative bg-gradient-to-br from-[var(--bg)] to-black/60 
        border border-[var(--border)] rounded-xl p-4
        transition-all
        ${
          locked
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:scale-[1.02] hover:shadow-xl"
        }
      `}
    >
      {!locked ? (
        <>
          {/* MATCH */}
          <p className="font-semibold text-sm leading-tight">
            {p.match}
          </p>

          {/* TIME */}
          <p className="text-xs text-[var(--muted)] mt-1">
            🕒 {formatTime(p.kickoff)}
          </p>

          {/* PICK */}
          <p className="text-sm font-bold text-[var(--accent)] mt-2">
            {formatPick(p)}
          </p>

          {/* PROBABILIDAD */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[var(--muted)]">
                {t.probability}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: probStyles.color }}
              >
                {(p.probability * 100).toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${p.probability * 100}%`,
                  backgroundColor: probStyles.color,
                }}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end mt-4">

            {/* VALUE */}
            <div className="text-[var(--accent)] font-semibold text-sm">
              +{(p.value * 100).toFixed(1)}%
            </div>

            {/* ODDS */}
            <div className="text-right">
              <p className="text-xl font-bold">
                {p.odd}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {p.bookmaker}
              </p>
            </div>

          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm font-semibold text-[var(--muted)]">
            🔒 Premium
          </p>
        </div>
      )}
    </div>
  </PremiumLock>
);

        })}

      </div>
    </div>
  );
}