"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import FavoriteLeagues from "@/components/FavoriteLeagues";
import StakeSettings from "@/components/StakeSettings";
import ProfileModal from "@/components/ProfileModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { User } from "@/types/user";
import Image from "next/image";
import { useSubscription } from "@/context/SubscriptionContext";

/* THEMES */
const FREE_THEMES: Theme[] = ["trader", "sportsbook", "datalab"];
const PRO_THEMES: Theme[] = ["neon", "futuristic", "classic"];

/* 🔥 COMPONENTE FUERA (CLAVE) */
function Section({
  title,
  open,
  toggle,
  children,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl">
      <div
        onClick={toggle}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-[var(--hover)]"
      >
        <span className="font-semibold">{title}</span>
        <span>{open ? "▼" : "▶️"}</span>
      </div>

      {open && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

export default function SettingsView({
  user,
  onLogout,
  onRefreshUser,
}: {
  user: User;
  onLogout: () => void;
  onRefreshUser: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { lang, changeLang, t } = useLanguage();
  const { isPremium } = useSubscription();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [openAppearance, setOpenAppearance] = useState(true);
  const [openPreferences, setOpenPreferences] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const [openLang, setOpenLang] = useState(true);
  const [openFav, setOpenFav] = useState(false);
  const [openStake, setOpenStake] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  // // 🔓 LOGOUT (usa el que ya tienes)
  // const handleLogout = async () => {
  //   await fetch(`${API}/logout`, {
  //     method: "POST",
  //     credentials: "include",
  //   });
  //   window.location.reload();
  // };

 


  // ⭐ PREMIUM (placeholder limpio)
  const handleUpgrade = () => {
    alert(t.premiumComingSoon);
  };

   // ❌ DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API}/deactivate-account`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      setSuccessMsg(t.accountDeleted);

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch {
      setErrorMsg(t.errorDeletingAccount);
    }
  };

  const renderThemeButton = (tt: Theme, isPro: boolean = false) => {
    const isLocked = isPro && !isPremium;

    return (
      <button
        key={tt}
        onClick={() => {
          if (isLocked) return;
          setTheme(tt);
        }}
        className={`relative p-3 rounded-lg border transition text-sm capitalize flex items-center justify-center
          ${
            theme === tt
              ? "bg-[var(--accent)] text-white border-transparent"
              : "bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--hover)]"
          }
          ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {tt}

        {isPro && !isPremium && (
          <span className="absolute top-1 right-1 text-[9px] px-1 py-0.5 rounded bg-yellow-500 text-black">
            PRO
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-[var(--text)] space-y-4">

      <h1 className="text-2xl font-bold">⚙️ {t.settings}</h1>

      {/* APPEARANCE */}
      <Section
        title={`🎨 ${t.appearance}`}
        open={openAppearance}
        toggle={() => setOpenAppearance(!openAppearance)}
      >
        <div className="space-y-4">

          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">
              {t.freeThemes}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FREE_THEMES.map((tt) => renderThemeButton(tt))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-2 text-[var(--muted)]">
              {t.premiumThemes}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRO_THEMES.map((tt) => renderThemeButton(tt, true))}
            </div>
          </div>

        </div>
      </Section>

      {/* PREFERENCES */}
      <Section
        title={`⚙️ ${t.preferences}`}
        open={openPreferences}
        toggle={() => setOpenPreferences(!openPreferences)}
      >

        <Section
          title={`🌐 ${t.language}`}
          open={openLang}
          toggle={() => setOpenLang(!openLang)}
        >
          <div className="flex gap-3">

            <button
              onClick={() => changeLang("en")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                ${lang === "en"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] opacity-70"}
              `}
            >
              <Image src="/flags/gb.svg" alt="EN" width={28} height={28} />
              {t.english}
            </button>

            <button
              onClick={() => changeLang("es")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                ${lang === "es"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] opacity-70"}
              `}
            >
              <Image src="/flags/es.svg" alt="ES" width={28} height={28} />
              {t.spanish}
            </button>
            
            <button
              onClick={() => changeLang("fr")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                ${lang === "fr"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] opacity-70"}
              `}
            >
              <Image src="/flags/fr.svg" alt="FR" width={28} height={28} />
              {t.french}
            </button>

            <button
              onClick={() => changeLang("it")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                ${lang === "it"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] opacity-70"}
              `}
            >
              <Image src="/flags/it.svg" alt="IT" width={28} height={28} />
              {t.italian}
            </button>

          </div>
        </Section>

        <Section
          title={`⭐ ${t.favoriteLeagues}`}
          open={openFav}
          toggle={() => setOpenFav(!openFav)}
        >
          <FavoriteLeagues />
        </Section>

        <Section
          title={`💰 ${t.stakeSettings}`}
          open={openStake}
          toggle={() => setOpenStake(!openStake)}
        >
          <StakeSettings />
        </Section>

      </Section>

      {/* ACCOUNT */}
      <Section
        title={`👤 ${t.myAccount}`}
        open={openAccount}
        toggle={() => setOpenAccount(!openAccount)}
      >
        <div className="space-y-3">

          {/* PROFILE */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full text-left p-2 hover:bg-[var(--hover)] rounded"
          >
            👤 {t.profile}
          </button>

          {/* PREMIUM */}
          <button
            onClick={handleUpgrade}
            className="w-full text-left p-2 hover:bg-[var(--hover)] rounded"
          >
            ⭐ {isPremium ? t.premiumActive : t.upgradeToPremium}
          </button>

          {/* DELETE ACCOUNT */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-left p-2 hover:bg-[var(--hover)] rounded text-red-500"
          >
            ❌ {t.deleteAccount}
          </button>

        </div>
      </Section>

      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={onLogout}
          onRefreshUser={onRefreshUser}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDeleteAccount();
          }}
        />
      )}

      {errorMsg && (
        <div className="text-red-500 text-sm mt-2 text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="text-green-500 text-sm mt-2 text-center">
          {successMsg}
        </div>
      )}

    </div>
  );
}