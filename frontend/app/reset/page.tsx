"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function ResetPage() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleReset = async () => {
    // console.log("🔥 CLICK RESET"); // 👈 1

     if (!token) {
      setStatus("error");
      return;
    }

    if (!password) {
      // console.log("❌ NO PASSWORD"); // 👈 2
      setStatus("error");
      return;
    }

    // console.log("📦 TOKEN:", token);       // 👈 3
    // console.log("🔑 PASSWORD:", password); // 👈 4

    try {
      setStatus("loading");

      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      // console.log("📡 RESPONSE STATUS:", res.status); // 👈 5

      if (!res.ok) {
        const text = await res.text();
        console.log("❌ BACKEND ERROR:", text); // 👈 6
        setStatus("error");
        return;
      }

      // console.log("✅ RESET OK"); // 👈 7

      setStatus("success");

    } catch (err) {
        console.error("💥 NETWORK ERROR:", err); // 👈 8
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-xl w-[350px] text-center">

        <h2 className="text-xl font-bold mb-4">
          🔑 {t.newPassword}
        </h2>

        {status !== "success" ? (
          <>
            <input
              type="password"
              placeholder={t.newPassword}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
            />

            <button
              onClick={handleReset}
              className="w-full bg-[var(--primary)] py-2 rounded hover:opacity-90 text-white"
            >
              {t.changePassword}
            </button>
          </>
        ) : (
          <>
            <p className="text-[var(--success)] mb-3">
              ✅ {t.passwordUpdated}
            </p>
            <Link
              href="/"
              className="bg-[var(--primary)] px-4 py-2 rounded hover:opacity-90 text-white"
            >
              {t.goToLogin}
            </Link>
          </>
        )}

      </div>
    </div>
  );
}