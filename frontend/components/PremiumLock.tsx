import { useLanguage } from "@/lib/i18n/LanguageProvider";
type Props = {
  locked: boolean;
  children: React.ReactNode;
};



export default function PremiumLock({ locked, children }: Props) {
  const { t } = useLanguage();
  return (
    <div className="relative">
      <div className={locked ? "opacity-40 blur-[2px] pointer-events-none" : ""}>
        {children}
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 px-4 py-2 rounded-lg text-sm font-semibold">
            🔒 {t.unlockPremium}
          </div>
        </div>
      )}
    </div>
  );
}