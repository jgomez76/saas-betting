import ThemePreview from "./ThemePreview";

type Props = {
  name: string;
  description: string;
  previewClass: string;
  premium?: boolean;
  active?: boolean;
  locked?: boolean;
  onClick: () => void;
};

export default function ThemeCard({
  name,
  description,
  previewClass,
  premium = false,
  active = false,
  locked = false,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`
        relative
        overflow-hidden
        rounded-[var(--card-radius)]
        border
        text-left
        transition-all

        ${
          active
            ? "theme-card-active"
            : "border-[var(--border)] hover:border-[var(--accent)]"
        }

        ${
          locked
            ? "opacity-75"
            : "hover:-translate-y-1"
        }
      `}
    >
      {/* =========================
          PREVIEW
      ========================= */}

      <ThemePreview previewClass={previewClass} />

      {/* =========================
          INFO
      ========================= */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <h3 className="text-lg font-semibold leading-none">
            {name}
          </h3>

          {active && (
            <span
              className="
                rounded-full
                bg-[var(--positive)]
                px-3
                py-1
                text-xs
                font-semibold
                text-white
                whitespace-nowrap
              "
            >
              ✓ Current
            </span>
          )}

        </div>

        {premium && (
          <div className="mt-3">
            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-[var(--accent)]
                bg-[var(--accent-soft)]
                px-3
                py-1
                text-xs
                font-semibold
                text-[var(--accent)]
              "
            >
              ⭐ Premium
            </span>
          </div>
        )}

        <p
          className="
            mt-4
            text-sm
            leading-7
            text-[var(--muted)]
          "
        >
          {description}
        </p>

        <div
          className="
            mt-6
            pt-4
            border-t
            border-[var(--border)]
          "
        >
          {active ? (
            <div className="text-sm font-semibold text-[var(--positive)]">
              ✓ Current Theme
            </div>
          ) : locked ? (
            <div className="text-sm text-[var(--muted)]">
              🔒 Premium required
            </div>
          ) : (
            <div className="text-sm font-medium text-[var(--accent)]">
              Apply theme →
            </div>
          )}
        </div>

      </div>
    </button>
  );
}