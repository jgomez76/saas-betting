"use client";

import { useEffect } from "react";

export default function OAuthSuccessPage() {

  useEffect(() => {

    const t = setTimeout(() => {
      window.location.href = "/";
    }, 300);

    return () => clearTimeout(t);

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="text-center">

        <p className="text-lg font-semibold mb-2">
          🔐 Iniciando sesión...
        </p>

        <p className="text-sm opacity-70">
          Redirigiendo...
        </p>

      </div>
    </div>
  );
}