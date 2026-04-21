"use client";

import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";

/* 🔒 simulación (luego lo conectas con backend) */
// const FREE_THEMES: Theme[] = ["trader", "sportsbook", "datalab"];
const FREE_THEMES: Theme[] = ["trader", "sportsbook", "datalab", "neon", "futuristic", "classic"];
const PRO_THEMES: Theme[] = ["neon", "futuristic", "classic"];

export default function SettingsView() {
  const { theme, setTheme } = useTheme();

  const isPremium = false; // 🔥 luego lo conectas con tu estado real

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
            PRO
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-[var(--text)] space-y-8">

      {/* TITLE */}
      <h1 className="text-2xl font-bold">⚙️ Ajustes</h1>

      {/* ---------------- APARIENCIA ---------------- */}
      <section className="space-y-3">
        <h2 className="text-sm text-[var(--muted)] uppercase tracking-wide">
          Apariencia
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-6">

          {/* FREE THEMES */}
          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">Temas gratuitos</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FREE_THEMES.map((t) => renderThemeButton(t))}
            </div>
          </div>

          {/* PRO THEMES */}
          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">
              Temas premium
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
          Preferencias
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">

          <div className="flex justify-between items-center">
            <span>🌍 Idioma</span>
            <span className="text-[var(--muted)] text-sm">Próximamente</span>
          </div>

          <div className="flex justify-between items-center">
            <span>🏆 Ligas favoritas</span>
            <span className="text-[var(--muted)] text-sm">Próximamente</span>
          </div>

        </div>
      </section>

      {/* ---------------- CUENTA ---------------- */}
      <section className="space-y-3">
        <h2 className="text-sm text-[var(--muted)] uppercase tracking-wide">
          Cuenta
        </h2>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">

          <div className="flex justify-between items-center">
            <span>👤 Perfil</span>
            <span className="text-[var(--muted)] text-sm">Gestionar</span>
          </div>

        </div>
      </section>

    </div>
  );
}