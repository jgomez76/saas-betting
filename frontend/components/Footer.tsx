"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Footer() {

  const { t } = useLanguage();

  return (
    <footer
      className="
        mt-12
        border-t
        border-[var(--border)]
        py-6
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-4
          text-sm
          text-[var(--muted)]
        "
      >
        <div>
          © {new Date().getFullYear()} BetSaaS.{" "}
          {t.allRightsReserved}
        </div>

        <div
          className="
            flex
            flex-wrap
            justify-center
            gap-4
          "
        >
          <Link
            href="/legal/privacy"
            className="hover:underline"
          >
            {t.privacy}
          </Link>

          <Link
            href="/legal/cookies"
            className="hover:underline"
          >
            {t.cookies}
          </Link>

          <Link
            href="/legal/security"
            className="hover:underline"
          >
            {t.security}
          </Link>

          <Link
            href="/legal/terms"
            className="hover:underline"
          >
            {t.terms}
          </Link>

          <Link
            href="/contact"
            className="hover:underline"
          >
            {t.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}