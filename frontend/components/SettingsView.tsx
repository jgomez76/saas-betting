"use client";

import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import FavoriteLeagues from "@/components/FavoriteLeagues";
import StakeSettings from "@/components/StakeSettings";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Image from "next/image";
import { useSubscription } from "@/context/SubscriptionContext";

/* 🔒 simulación (luego lo conectas con backend) */
const FREE_THEMES: Theme[] = ["trader", "sportsbook", "datalab"];
// const FREE_THEMES: Theme[] = ["trader", "sportsbook", "datalab", "neon", "futuristic", "classic"];
const PRO_THEMES: Theme[] = ["neon", "futuristic", "classic"];

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { lang, changeLang, t } = useLanguage();

  // const isPremium = false; // 🔥 luego lo conectas con tu estado real
  const { isPremium } = useSubscription(); // 🔥 luego lo conectas con tu estado real

  const renderThemeButton = (t: Theme, isPro: boolean = false) => {
    const isLocked = isPro && !isPremium;

    return (
      <button
        key={t}
        onClick={() => {
          if (isLocked) return;
          setTheme(t);
        }}
        className={`relative p-3 rounded-lg border transition text-sm capitalize flex items-center justify-center
          ${
            theme === t
              ? "bg-[var(--accent)] text-white border-transparent"
              : "bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--hover)]"
          }
          ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {t}

        {/* 🔒 BADGE PRO */}
        {isPro && (
          <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500 text-black font-bold">
            🔒 Premium
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-[var(--text)] space-y-8">

      {/* TITLE */}
      <h1 className="text-2xl font-bold">⚙️ {t.settings}</h1>

      {/* ---------------- APARIENCIA ---------------- */}
      <section className="space-y-3">
        <h2 className="text-sm text-[var(--muted)] uppercase tracking-wide">
          {t.appearance}
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-6">

          {/* FREE THEMES */}
          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">{t.freeThemes}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FREE_THEMES.map((t) => renderThemeButton(t))}
            </div>
          </div>

          {/* PRO THEMES */}
          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">
              {t.premiumThemes}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRO_THEMES.map((t) => renderThemeButton(t, true))}
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- PREFERENCIAS ---------------- */}
      <section className="space-y-3">
        <h2 className="text-sm text-[var(--muted)] uppercase tracking-wide">
          {t.preferences}
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="space-y-2">

            <p className="text-sm text-[var(--muted)] uppercase tracking-wide">
              🌐 {t.language}
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => changeLang("en")}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border
                  ${lang === "en"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] opacity-70"}
                `}
              >
                          <Image
                            src="/flags/gb.svg"
                            alt="English"
                            width={72}
                            height={72}
                            className="rounded-sm"
                          />
                <span>{t.english}</span>
              </button>

              <button
                onClick={() => changeLang("es")}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border
                  ${lang === "es"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] opacity-70"}
                `}
              >
                          <Image
                            src="/flags/es.svg"
                            alt="Español"
                            width={72}
                            height={72}
                            className="rounded-sm"
                          />
                <span>{t.spanish}</span>
              </button>

            </div>

          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">

          <FavoriteLeagues />
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <StakeSettings />

        </div>
      </section>

      {/* ---------------- CUENTA ---------------- */}
      <section className="space-y-3">
        <h2 className="text-sm text-[var(--muted)] uppercase tracking-wide">
          {t.account}
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">

          <div className="flex justify-between items-center">
            <span>👤 {t.profile}</span>
            <span className="text-[var(--muted)] text-sm">{t.manage}</span>
          </div>

        </div>
      </section>

    </div>
  );
}