import PremiumBenefits from "./PremiumBenefits";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  features: string[];
  buttonText?: string;
  onClick?: () => void;
  badge?: string;
  variant?: "inline" | "modal";
};

export default function PremiumPanel({
  variant = "inline",
  icon = "💎",
  title,
  description,
  features,
  buttonText = "Explore Premium →",
  onClick,
  badge = "Premium",
}: Props) {
  return (
      <div
          className={
              variant === "inline"
                  ? `
                      theme-card
                      p-8
                    `
                  : `
                      theme-card
                      p-8
                      relative
                      max-w-4xl
                      w-full
                    `
          }
      >
      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="text-3xl">
            {icon}
          </div>

          <h3 className="mt-3 text-2xl font-bold">
            {title}
          </h3>

          {description && (
            <p className="mt-3 text-[var(--muted)] max-w-xl leading-7">
              {description}
            </p>
          )}

        </div>

        <div
          className="
            shrink-0
            inline-flex
            items-center
            rounded-full
            bg-[var(--accent-soft)]
            text-[var(--accent)]
            border
            border-[var(--accent)]
            px-4
            py-2
            text-sm
            font-semibold
          "
        >
          🔒 {badge}
        </div>

      </div>

      {/* Divider */}

      <div className="my-8 border-t border-[var(--border)]" />

      {/* Features */}
      <PremiumBenefits
          features={features}
      />

      {/* CTA */}

      <div className="mt-8">

        <button
          onClick={onClick}
          className="
            rounded-[var(--button-radius)]
            bg-[var(--accent)]
            text-[var(--accent-contrast)]
            px-8
            py-3
            font-semibold
            hover:opacity-90
            transition
          "
        >
          {buttonText}
        </button>

      </div>

    </div>
  );
}