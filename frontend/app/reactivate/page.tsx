"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ReactivatePage() {
  const { t } = useLanguage();

  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const reactivate = async () => {
      try {
        const response = await fetch(
          `${API_URL()}/reactivate-account?token=${token}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        setStatus("success");

        // Esperamos un instante para que el usuario vea el mensaje
        setTimeout(() => {
          router.push("/");
        }, 1500);

      } catch {
        setStatus("error");
      }
    };

    reactivate();

  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-xl text-center w-[350px]">

        {status === "loading" && (
          <>
            <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-lg">
              🔄 {t.activatingAccount}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--success)]">
              ✅ {t.accountReactivated}
            </h2>

            <p className="text-[var(--muted)]">
              {t.redirectingToDashboard}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--danger)]">
              ❌ {t.reactivationError}
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