type Props = {
  icon?: string;
  title: string;
  description?: string;
  features: string[];
  buttonText?: string;
  onClick?: () => void;
  badge?: string;
};

export default function PremiumFeature({
  icon = "🤖",
  title,
  description,
  features,
  buttonText = "Explore Premium →",
  onClick,
  badge = "Premium",
}: Props) {
  return (
    <div
      className="
        bg-[var(--card)]
        border
        border-[var(--border)]
        rounded-2xl
        p-8
      "
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
            bg-yellow-500/15
            text-yellow-400
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

      <div className="grid md:grid-cols-2 gap-y-4">

        {features.map((feature) => (

          <div
            key={feature}
            className="flex items-center gap-3"
          >
            <div className="text-green-400 font-bold">
              ✓
            </div>

            <div>
              {feature}
            </div>

          </div>

        ))}

      </div>

      {/* CTA */}

      <div className="mt-8">

        <button
          onClick={onClick}
          className="
            rounded-xl
            bg-[var(--primary)]
            px-8
            py-3
            font-semibold
            text-white
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