"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

// ---------------- TYPES ----------------

type LoginResponse = {
  message: string;
};

type Props = {
  onClose: () => void;
  onLogin: () => void;
};

// ---------------- COMPONENT ----------------

export default function LoginModal({ onClose, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- LOGIN ----------------

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 CLAVE (cookies)
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // 🔥 manejar errores backend correctamente
      if (!res.ok) {
        const text = await res.text();
        console.error("Login error:", text);
        throw new Error("Credenciales incorrectas");
      }

      // 🔥 backend ya guarda cookie → no necesitamos token
      const data: LoginResponse = await res.json();

      if (data.message === "ok") {
        onLogin(); // 👈 ahora solo notificamos
        onClose();
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[320px]">

        {/* TITLE */}
        <h2 className="text-lg font-bold mb-4 text-center">
          🔐 Admin Login
        </h2>

        {/* USERNAME */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-[#2a2a2a]"
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 p-2 rounded bg-[#2a2a2a]"
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-cyan-600 py-2 rounded font-bold hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}