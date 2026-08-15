"use client";

import TopPicksCard from "@/components/TopPicksCard";

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
  loading: boolean;
  progress: number;

  countdown: string | null;

  allFinished: boolean;

  validPicks: TopPick[];

  topPicksLoading: boolean;

  freePick: TopPick | null;

  isPremium: boolean;

  isLogged: boolean;
  onLogin: () => void;

  onSelectPick: (
    pick: TopPick
  ) => void;

  t: {
    loadingMatches: string;
    nextPicksIn: string;
    picksFinished: string;
    noPicksToday: string;
    picksAvailable: string;
    picksLoading: string;
  };
};

export default function DashboardHeader({
  loading,
  progress,
  countdown,
  allFinished,
  validPicks,
  topPicksLoading,
  freePick,
  isPremium,
  isLogged,
  onLogin,
  onSelectPick,
  t,
}: Props) {

  const now = new Date();
  const generationTime = new Date();

  generationTime.setHours(10, 0, 0, 0);

  const generationFinished =
    now >= generationTime;

  return (
    <>
      {loading && (
        <div className="mb-6">

          <p className="text-center text-sm text-[var(--muted)] mb-2 animate-pulse">
            ⏳ {t.loadingMatches}
          </p>

          <div className="w-full max-w-md mx-auto bg-[var(--border)] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[var(--accent)] h-2 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="text-center text-xs text-[var(--muted)] mt-1">
            {progress}%
          </p>

        </div>
      )}

{allFinished ? (

  <div className="mb-4 flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-4 text-sm">

    <span>🏁</span>

    <span className="text-[var(--muted)]">
      {t.picksFinished}
    </span>

  </div>
  

) : generationFinished && !freePick ? (

  <div className="mb-4 flex flex-col items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-4 text-sm">

    <div className="flex items-center gap-2">

      <span>📭</span>

      <span className="text-[var(--muted)]">
        {t.noPicksToday}
      </span>

    </div>

    <div className="flex items-center gap-2">

      <span>⏳</span>

      <span className="text-[var(--muted)]">
        {t.nextPicksIn}
      </span>

      <span className="font-semibold text-[var(--text)]">
        {countdown}
      </span>

    </div>

  </div>

) : !generationFinished ? (

  <div className="mb-4 flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-4 text-sm">

    <span>⏳</span>

    <span className="text-[var(--muted)]">
      {t.nextPicksIn}
    </span>

    <span className="font-semibold text-[var(--text)]">
      {countdown}
    </span>

  </div>

) : (

  <div className="mb-4 flex items-center justify-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg py-2 px-4 text-sm">

    <span>🔥</span>

    <span className="font-semibold text-[var(--accent)]">
      {t.picksAvailable}
    </span>

  </div>

)}


      {topPicksLoading ? (

        <div className="text-center text-[var(--muted)] mb-4">
          ⏳ {t.picksLoading}
        </div>

      ) : (

        <TopPicksCard
          picks={validPicks}
          freePick={freePick}
          isPremium={isPremium}
          isLogged={isLogged}
          onLogin={onLogin}
          onSelectPick={onSelectPick}
        />
      )}

{/*       {countdown && (

        <div className="mb-4 flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-4 text-sm">

          <span className="text-[var(--warning)]">
            ⏳
          </span>

          <span className="text-[var(--muted)]">
            {t.nextPicksIn}
          </span>

          <span className="font-semibold text-[var(--text)]">
            {countdown}
          </span>

        </div>

      )} */}

    </>
  );
}