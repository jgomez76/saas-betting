"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔥 cargar usuario
  useEffect(() => {
    fetch(`${API_URL}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setEmail(data.email);
      })
      .catch(() => {
        setEmail(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔥 logout
  const handleLogout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  };

  // 🔥 deactivate
  const handleDeactivate = async () => {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar tu cuenta?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/deactivate-account`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      alert("Cuenta desactivada");
      window.location.href = "/";
    } else {
      alert("Error al eliminar la cuenta");
    }
  };

  if (loading) {
    return (
      <div className="text-[var(--muted)] text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-[var(--muted)] text-center mt-10">
        No estás logueado
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl w-[350px] text-center">
        <button
            onClick={() => router.push("/")}
            className="text-sm text-[var(--muted)] mb-4 hover:underline"
            >
            ← Volver
        </button>

        <h2 className="text-xl font-bold mb-4">
          👤 Mi cuenta
        </h2>

        <p className="mb-6 text-[var(--text)]">
          {email}
        </p>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full bg-[var(--card)] border border-[var(--border)] py-2 rounded mb-3 hover:bg-[var(--hover)]"
        >
          Cerrar sesión
        </button>

        {/* DELETE */}
        <button
          onClick={handleDeactivate}
          className="w-full bg-[var(--danger)] py-2 rounded hover:opacity-90 text-white"
        >
          ❌ Darse de baja
        </button>

      </div>
    </div>
  );
}