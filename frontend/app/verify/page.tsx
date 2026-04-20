"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import Link from "next/link";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "ok" | "error"
  >(token ? "loading" : "error");

  useEffect(() => {
    const token = params.get("token");

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
  }, [params]);

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-xl text-center w-[350px]">

        {status === "loading" && (
          <>
            <p className="text-lg">⏳ Verificando cuenta...</p>
          </>
        )}

        {status === "ok" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--success)]">
              ✅ Cuenta verificada
            </h2>
            <p className="text-[var(--muted)] mb-4">
              Ya puedes iniciar sesión
            </p>
            <Link
              href="/"
              className="bg-[var(--primary)] px-4 py-2 rounded hover:opacity-90 text-white"
            >
              Ir al login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-[var(--danger)]">
              ❌ Error de verificación
            </h2>
            <p className="text-[var(--muted)]">
              El enlace no es válido o ha expirado
            </p>
          </>
        )}

      </div>
    </div>
  );
}