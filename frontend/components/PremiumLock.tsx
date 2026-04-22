type Props = {
  locked: boolean;
  children: React.ReactNode;
};

export default function PremiumLock({ locked, children }: Props) {
  return (
    <div className="relative">
      <div className={locked ? "opacity-40 blur-[2px] pointer-events-none" : ""}>
        {children}
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 px-4 py-2 rounded-lg text-sm font-semibold">
            🔒 Premium
          </div>
        </div>
      )}
    </div>
  );
}