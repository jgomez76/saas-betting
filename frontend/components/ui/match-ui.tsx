type StatBoxProps = {
  label: string;
  value: number | string;
};

const getIcon = (label: string): string => {
  if (label.includes("Partidos")) return "📊";
  if (label.includes("Goles")) return "⚽";
  if (label.includes("Encajados")) return "🛡️";
  if (label.includes("Victorias")) return "🏆";
  if (label.includes("Empates")) return "🤝";
  if (label.includes("Derrotas")) return "❌";
  if (label.includes("BTTS")) return "🎯";
  if (label.includes("Over 2.5")) return "🔥";
  if (label.includes("Over 3.5")) return "🚀";

  return "📈";
};

export const StatBox = ({
  label,
  value,
}: StatBoxProps) => (
  <div className="bg-white/5 border border-white/10 p-2.5 rounded-md flex flex-col items-center justify-center">

    <span className="text-base mb-0.5">
      {getIcon(label)}
    </span>

    <p className="text-base md:text-lg font-bold leading-tight">
      {value}
    </p>

    <p className="text-xs text-[var(--muted)] leading-tight">
      {label}
    </p>

  </div>
);

export const formatValue = (
  v?: number | null
): string | null => {
  if (v === null || v === undefined) {
    return null;
  }

  const value = (v * 100).toFixed(1);

  return `${v > 0 ? "+" : ""}${value}%`;
};

export const renderForm = (
  form: string
) => {
  if (!form) return null;

  return (
    <div className="flex justify-center gap-1 mt-1">
      {form
        .toUpperCase()
        .split("")
        .map((raw, i) => {
          const f = raw.trim();

          let color = "bg-[var(--muted)]";

          if (f === "W") {
            color = "bg-[var(--positive)]";
          } else if (f === "D") {
            color = "bg-[var(--warning)]";
          } else if (f === "L") {
            color = "bg-[var(--negative)]";
          }

          return (
            <span
              key={i}
              className={`text-white text-xs px-1.5 py-0.5 rounded font-semibold ${color}`}
            >
              {f}
            </span>
          );
        })}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-[var(--card)] p-4 rounded-xl animate-pulse border border-[var(--border)]">

    <div
      className="grid mb-3"
      style={{
        gridTemplateColumns: "45% 10% 45%",
      }}
    >
      <div className="h-4 bg-[var(--border)] rounded w-3/4 mx-auto" />

      <div />

      <div className="h-4 bg-[var(--border)] rounded w-3/4 mx-auto" />
    </div>

    <div className="h-3 bg-[var(--border)] rounded w-1/2 mx-auto mb-3" />

    <div className="grid grid-cols-3 gap-2">
      <div className="h-12 bg-[var(--border)] rounded" />
      <div className="h-12 bg-[var(--border)] rounded" />
      <div className="h-12 bg-[var(--border)] rounded" />
    </div>

  </div>
);