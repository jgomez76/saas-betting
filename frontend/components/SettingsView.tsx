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
import ThemeCard from "@/components/settings/ThemeCard";
import {
    // upgradeToPremium,
    manageSubscription,
} from "@/lib/stripe";

import { usePremium } from "@/context/PremiumContext";



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
    <div className="theme-card">
      <div
        onClick={toggle}
        className="
          flex
          justify-between
          items-center
          px-5
          py-4
          cursor-pointer
          transition-all
          hover:bg-[var(--hover)]
          "
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
  onLogin,
}: {
  user: User;
  onLogout: () => void;
  onRefreshUser: () => void;
  onLogin: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { lang, changeLang, t } = useLanguage();
  const { isPremium } = useSubscription();
  const { showPremium } = usePremium();
  const isLogged = !!user.email;

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

  const THEMES = [

    {
      id: "midnight",
      name: "🌙 Midnight",
      description: t.themeMidnightDescription,
      premium: false,
      previewClass: "preview-midnight",
    },

    {
      id: "stadium",
      name: "⚽ Stadium",
      description: t.themeStadiumDescription,
      premium: false,
      previewClass: "preview-stadium",
    },

    {
      id: "light",
      name: "☀️ Light",
      description: t.themeLightDescription,
      premium: false,
      previewClass: "preview-light",
    },

    {
      id: "carbon",
      name: "⚫ Carbon",
      description: t.themeCarbonDescription,
      premium: true,
      previewClass: "preview-carbon",
    },

    {
      id: "sapphire",
      name: "💙 Sapphire",
      description: t.themeSapphireDescription,
      premium: true,
      previewClass: "preview-sapphire",
    },

    {
      id: "aurora",
      name: "💜 Aurora",
      description: t.themeAuroraDescription,
      premium: true,
      previewClass: "preview-aurora",
    },

    {
      id: "crimson",
      name: "🔥 Crimson",
      description: t.themeCrimsonDescription,
      premium: true,
      previewClass: "preview-crimson",
    },

    {
      id: "heritage",
      name: "📜 Heritage",
      description: t.themeHeritageDescription,
      premium: true,
      previewClass: "preview-heritage",
    },

  ];

  const API =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";
 
  const handleUpgrade = async () => {

      if (isPremium) {
          await manageSubscription(
              typeof window !== "undefined"
                  ? window.location.hostname === "localhost"
                      ? "http://localhost:8000"
                      : `http://${window.location.hostname}:8000`
                  : ""
          );
          return;
      }

      showPremium();

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

            <p className="text-sm mb-3 font-semibold text-[var(--muted)]">
              🌟 {t.freeCollection}
            </p>

            <div className="grid md:grid-cols-3 gap-4">

              {THEMES
                .filter(theme => !theme.premium)
                .map((themeItem) => (

                  <ThemeCard
                    key={themeItem.id}
                    name={themeItem.name}
                    description={themeItem.description}
                    previewClass={themeItem.previewClass}
                    premium={false}
                    active={theme === themeItem.id}
                    locked={false}
                    onClick={() => setTheme(themeItem.id as Theme)}
                  />

                ))}

            </div>

          </div>

          <div>

            <p className="text-sm mb-3 font-semibold text-[var(--muted)]">
              ⭐ {t.premiumCollection}
            </p>

            <div className="grid md:grid-cols-3 gap-4">

              {THEMES
                .filter(theme => theme.premium)
                .map((themeItem) => (

                  <ThemeCard
                    key={themeItem.id}
                    name={themeItem.name}
                    description={themeItem.description}
                    previewClass={themeItem.previewClass}
                    premium
                    active={theme === themeItem.id}
                    locked={!isPremium}
                    onClick={() => {

                        if (!isPremium) {

                            if (!isLogged) {
                                onLogin();
                                return;
                            }

                            showPremium();
                            return;
                        }

                        setTheme(themeItem.id as Theme);

                    }}
                  />

                ))}

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
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">

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
        <div className="overflow-hidden rounded-md">

          {/* PROFILE */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="
              w-full
              flex
              items-center
              gap-3
              text-left
              px-5
              py-4
              transition-all
              border-b
              border-[var(--border)]
              hover:bg-[var(--hover)]
            "
          >
            <span className="text-xl">👤</span>
            <span>{t.profile}</span>
          </button>

          {/* DELETE ACCOUNT */}
          {isLogged && !isPremium && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="
                w-full
                flex
                items-center
                gap-3
                text-left
                px-5
                py-4
                transition-all
                border-b-0
                border-[var(--border)]
                hover:bg-[var(--hover)]
              "
            >
              <span className="text-xl">❌</span>
              <span>{t.deleteAccount}</span>
            </button>
          )}

          {/* PREMIUM ACCOUNT */}
          {isLogged && isPremium && (
            <button
              onClick={handleUpgrade}
              className="
                w-full
                flex
                items-center
                gap-3
                text-left
                px-5
                py-4
                transition-all
                border-b-0
                border-[var(--border)]
                hover:bg-[var(--hover)]
              "
            >
              <span className="text-xl">💳</span>
              <span>{t.manageSubscription}</span>
            </button>
          )}

        </div>
      </Section>

      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={onLogout}
          onRefreshUser={onRefreshUser}
          onLogin={onLogin}
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