"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import Link from "next/link";

export default function VerifyPage() {
  const params = useSearchParams();
  // const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "ok" | "error"
  >(token ? "loading" : "error");

  // useEffect(() => {
  //   const token = params.get("token");

  //   if (!token) {
  //     setStatus("error");
  //     return;
  //   }

  //   fetch(`${API_URL}/verify?token=${token}`)
  //     .then(() => setStatus("ok"))
  //     .catch(() => setStatus("error"));
  // }, []);
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
    <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
      <div className="bg-[#1e293b] p-8 rounded-2xl shadow-xl text-center w-[350px]">

        {status === "loading" && (
          <>
            <p className="text-lg">⏳ Verificando cuenta...</p>
          </>
        )}

        {status === "ok" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-green-400">
              ✅ Cuenta verificada
            </h2>
            <p className="text-gray-300 mb-4">
              Ya puedes iniciar sesión
            </p>
            <Link
              href="/"
              className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
            >
              Ir al login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-3 text-red-400">
              ❌ Error de verificación
            </h2>
            <p className="text-gray-300">
              El enlace no es válido o ha expirado
            </p>
          </>
        )}

      </div>
    </div>
  );
}