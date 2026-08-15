import { useSubscription } from "@/context/SubscriptionContext";
import { canUseAdvancedStats } from "@/lib/premium";
import { usePremium } from "@/context/PremiumContext";

type Props = {
    title: string;
    children: React.ReactNode;
    onClick?: () => void;
};

export default function PremiumStat({
  title,
  children,
  onClick,
}: Props) {
    const { isPremium } = useSubscription();    
    const { showPremium } = usePremium();
    
  return (
    <div
        onClick={() => {
            if (!canUseAdvancedStats(isPremium)) {

                if (onClick) {
                    onClick();
                } else {
                    showPremium();
                }

            }
        }}
        className={`
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-xl
            p-5
            text-center
            ${
                !canUseAdvancedStats(isPremium)
                    ? "cursor-pointer hover:border-blue-500 transition"
                    : ""
            }
        `}
    >
    <div className="text-xs sm:text-sm text-[var(--muted)] mb-2 whitespace-nowrap">
        {title}
    </div>

    {canUseAdvancedStats(isPremium) ? (
        <div className="text-4xl font-bold">
        {children}
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-[58px]">
        <div className="text-2xl">
            🔒
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Premium
        </div>
        </div>
    )}
    </div>
  );
}