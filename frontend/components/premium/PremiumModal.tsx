"use client";

import PremiumPanel from "./PremiumPanel";

type Props = {
    open: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
};

const PREMIUM_FEATURES = [
    "🎨 8 Exclusive Themes",
    "🤖 AI Match Analysis",
    "⭐ Unlimited Favorites",
    "📊 Advanced Statistics",
    "🚀 Early Access Features",
    "💎 Future Premium Updates",
];

export default function PremiumModal({
    open,
    onClose,
    onUpgrade,
}: Props) {

    if (!open) return null;

    return (

        <div
            className="
                fixed
                inset-0
                z-[999]
                flex
                items-center
                justify-center
                bg-black/70
                backdrop-blur-sm
                p-4
            "
            onClick={onClose}
        >

            <div
                className="
                    w-full
                    max-w-3xl
                "
                onClick={(e) => e.stopPropagation()}
            >

                <div className="relative">

                    <button
                        onClick={onClose}
                        className="
                            absolute
                            top-4
                            right-4
                            z-10
                            w-9
                            h-9
                            rounded-full
                            theme-icon-button
                        "
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <PremiumPanel
                        variant="modal"
                        title="💎 Luranix Premium"
                        description="Unlock the complete Luranix experience and access every Premium feature."
                        buttonText="🚀 Upgrade to Premium"
                        badge="Premium"
                        onClick={onUpgrade}
                        features={PREMIUM_FEATURES}
                    />

                </div>


                <button
                    onClick={onClose}
                    className="
                        mt-4
                        w-full
                        text-sm
                        text-[var(--muted)]
                        hover:text-[var(--text)]
                        transition
                    "
                >
                    Maybe later
                </button>

            </div>

        </div>

    );

}