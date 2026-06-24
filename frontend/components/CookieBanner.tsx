"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CookieBanner() {
  const { t } = useLanguage();

  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");

    queueMicrotask(() => {
      setLoaded(true);

      if (!consent) {
        setVisible(true);
      }
    });
  }, []);

  const acceptCookies = () => {
    Cookies.set(
      "cookie_consent",
      "accepted",
      { expires: 365 }
    );

    setVisible(false);
  };

  const rejectCookies = () => {
    Cookies.set(
      "cookie_consent",
      "rejected",
      { expires: 365 }
    );

    setVisible(false);
  };

  if (!loaded || !visible) {
    return null;
  }

  return (
    <div
        className="
        fixed
        z-[99999]
        w-[420px]
        max-w-[calc(100vw-32px)]
        "
        style={{
        bottom: "16px",
        right: "16px",
        }}
    >
      <div
        className="
          bg-[var(--card)]
          border-2
          border-amber-500/40
          rounded-2xl
          p-5
          shadow-[0_0_40px_rgba(245,158,11,0.15)]
        "
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">
            🍪
          </span>

          <h3 className="font-semibold text-base text-amber-400">
            {t.cookieTitle}
          </h3>
        </div>

        <p
          className="
            text-sm
            opacity-80
            mb-4
          "
        >
          {t.cookieDescription}
        </p>

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            onClick={acceptCookies}
            className="
            px-4
            py-2
            rounded-lg
            cursor-pointer
            border
            border-transparent
            bg-[var(--accent)]
            text-[var(--accent-contrast)]
            font-medium
            transition-all
            hover:opacity-90
            "
          >
            {t.accept}
          </button>

          <button
            onClick={rejectCookies}
          className="
            px-4
            py-2
            rounded-lg
            cursor-pointer
            border
            border-[var(--border)]
            bg-[var(--card)]
            text-[var(--text)]
            font-medium
            transition-all
            hover:bg-[var(--hover)]
            "
          >
            {t.reject}
          </button>

          <Link
            href="/legal/cookies"
            className="
            px-4
            py-2
            rounded-lg
            border
            border-[var(--border)]
            text-[var(--text)]
            hover:bg-[var(--hover)]
            transition-all
            "
          >
            {t.learnMore}
          </Link>
        </div>
      </div>
    </div>
  );
}