"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function VerifyPage() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "ok" | "error"
  >(token ? "loading" : "error");

  useEffect(() => {
    // const token = params.get("token");

    if (!token) return;

    const verify = async () => {
      try {
        await fetch(`${API_URL}/verify?token=${token}`);
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-xl text-center w-[350px]">

        {status === "loading" && (
          <>
            <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-lg">⏳ {t.verifyingAccount}</p>
          </>
        )}

        {status === "ok" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--success)]">
              ✅ {t.accountVerified}
            </h2>
            <p className="text-[var(--muted)] mb-4">
              {t.youCanLogin}
            </p>
            <Link
              href="/"
              className="bg-[var(--primary)] px-4 py-2 rounded hover:opacity-90 text-white"
            >
              {t.goToLogin}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--danger)]">
              ❌ {t.verificationError}
            </h2>
            <p className="text-[var(--muted)]">
              {t.invalidOrExpiredLink}
            </p>
          </>
        )}

      </div>
    </div>
  );
}