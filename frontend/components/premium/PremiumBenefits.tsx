type Props = {
    compact?: boolean;
};

const BENEFITS = [
    "🎨 8 Exclusive Themes",
    "🤖 AI Match Analysis",
    "⭐ Unlimited Favorites",
    "📊 Advanced Statistics",
    "🚀 Early Access Features",
    "💎 Future Premium Updates",
];

export default function PremiumBenefits({
    compact = false,
}: Props) {

    return (

        <div
            className={
                compact
                    ? "space-y-2"
                    : "grid md:grid-cols-2 gap-3"
            }
        >

            {BENEFITS.map((benefit) => (

                <div
                    key={benefit}
                    className="flex items-center gap-3"
                >

                    <span className="text-[var(--positive)] font-bold">
                        ✓
                    </span>

                    <span>
                        {benefit}
                    </span>

                </div>

            ))}

        </div>

    );

}