"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePremium } from "@/context/PremiumContext";

type Props = {
    locked: boolean;
    children: React.ReactNode;
    onLockedClick?: () => void;
};

export default function PremiumLock({
    locked,
    children,
    onLockedClick,
}: Props) {

    const { t } = useLanguage();
    const { showPremium } = usePremium();

    return (
        <div className="relative">

            <div className={locked ? "opacity-40 blur-[2px] pointer-events-none" : ""}>
                {children}
            </div>

            {locked && (
              <button
                    onClick={() => {

                        if (onLockedClick) {
                            onLockedClick();
                            return;
                        }

                        showPremium();

                    }}
                    className="
                    absolute inset-0
                    flex items-center justify-center
                    cursor-pointer
                    group
                  "
              >
                <div
                    className="
                        bg-black/80
                        text-white
                        border border-transparent
                        px-4 py-2
                        rounded-lg
                        text-sm font-semibold
                        transition-all duration-200
                        group-hover:border-yellow-400
                        group-hover:shadow-[0_0_20px_rgba(250,204,21,0.45)]
                        group-hover:scale-105
                    "
                >
                    🔒 {t.unlockPremium}
                </div>
              </button>
            )}

        </div>
    );
}