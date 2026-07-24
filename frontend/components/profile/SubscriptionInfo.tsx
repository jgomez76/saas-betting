import type { User } from "@/types/user";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Props = {
    user: User;
    onManageSubscription: () => void;
    onUpgrade: () => void;
};

export default function SubscriptionInfo({
    user,
    onManageSubscription,
    onUpgrade,
}: Props) {
    const { t } = useLanguage();
    const isPremium = user.subscription === "premium";

    const endDate = user.subscription_end
        ? new Date(user.subscription_end).toLocaleDateString("es-ES")
        : "";

    return (

        <div
            className="
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--hover)]
                p-5
                my-5
            "
        >

            {/* TITLE */}

            <h3 className="text-2xl font-bold text-center mb-5">

                {isPremium
                    ? "💎 Luranix Premium"
                    : `⭐ ${t.freePlan}`}

            </h3>

            {isPremium ? (

                <>

                    {/* STATUS */}

                    <div className="flex justify-center mb-4">

                        <span
                            className={
                                user.subscription_status === "cancelled"

                                    ? `
                                        inline-flex
                                        items-center
                                        rounded-full
                                        px-4
                                        py-2
                                        bg-orange-500/20
                                        text-orange-300
                                        font-semibold
                                      `

                                    : `
                                        inline-flex
                                        items-center
                                        rounded-full
                                        px-4
                                        py-2
                                        bg-green-500/20
                                        text-green-300
                                        font-semibold
                                      `
                            }
                        >

                            {user.subscription_status === "cancelled"
                                ? `🟠 ${t.subscriptionCancelled}`
                                : `🟢 ${t.premiumActive}`}

                        </span>

                    </div>

                    {/* DATE */}

                    {user.subscription_end && (

                        <div className="text-center mb-5">

                            <div className="text-sm text-gray-400">

                                {t.premiumAccessUntil}

                            </div>

                            <div className="text-4xl font-bold mt-2">

                                {endDate}

                            </div>

                        </div>

                    )}

                    {/* DESCRIPTION */}

                    <p className="text-sm text-center text-gray-400 leading-6">

                        {user.subscription_status === "cancelled"

                            ? t.premiumEndsDescription.replace("{date}", endDate)

                            : t.premiumRenewDescription}

                    </p>

                    {/* BUTTON */}

                    <button
                        onClick={onManageSubscription}
                        className="
                            w-full
                            mt-6
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            active:scale-[0.98]
                            transition-all
                            duration-200
                            py-3
                            text-white
                            font-bold
                            shadow-lg
                            shadow-blue-900/40
                        "
                    >
                        💳 {t.manageSubscription}
                    </button>

                </>

            ) : (

                <>

                    <p className="text-sm text-center text-gray-400 leading-6">

                        {t.freePlanDescription}

                        <br /><br />

                        {t.upgradeDescription}

                    </p>

                    <button
                        onClick={onUpgrade}
                        className="
                            w-full
                            mt-6
                            rounded-xl
                            bg-yellow-500
                            hover:bg-yellow-400
                            active:scale-[0.98]
                            transition-all
                            duration-200
                            py-3
                            text-black
                            font-bold
                            shadow-lg
                            shadow-yellow-700/30
                        "
                    >
                        ⭐ {t.upgradeToPremium}
                    </button>

                </>

            )}

        </div>

    );

}