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
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  // ---------------- LOGIN ----------------

  // const handleLogin = async () => {
  //   setError("");

  //   if (!email || !password) {
  //     setError("Completa todos los campos");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const res = await fetch(`${API_URL}/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         email,
  //         password,
  //       }),
  //     });

  //     if (!res.ok) {
  //       const text = await res.text();
  //       console.error("Login error:", text);

  //       if (text.includes("Email not verified")) {
  //         setError("Debes verificar tu email antes de iniciar sesión");
  //       } else {
  //         setError("Credenciales incorrectas");
  //       }

  //       return;
  //     }

  //     const data: LoginResponse = await res.json();

  //     if (data.message === "ok") {
  //       onLogin();
  //       onClose();
  //     } else {
  //       setError("Credenciales incorrectas");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     if (!error) {
  //       setError("Error de conexión con el servidor");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // 🔥 MANEJO POR STATUS CODE (PRO)
      if (!res.ok) {
        if (res.status === 403) {
          setError("Debes verificar tu email antes de iniciar sesión");
        } else if (res.status === 401) {
          setError("Credenciales incorrectas");
        } else {
          setError("Error inesperado");
        }

        return;
      }

      const data: LoginResponse = await res.json();

      if (data.message === "ok") {
        onLogin();
        onClose();
      } else {
        setError("Credenciales incorrectas");
      }

    } catch (err) {
      console.error("💥 NETWORK ERROR:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false); // 🔥 SIEMPRE
    }
  };

  // ---------------- REGISTER ----------------

    const handleRegister = async () => {
    console.log("👉 START REGISTER");

    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      console.log("⏳ LOADING TRUE");

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 RESPONSE:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.log("❌ ERROR TEXT:", text);

        setError("No se pudo crear la cuenta");
        return;
      }

      console.log("✅ REGISTER OK");

      setError("📧 Revisa tu email para verificar la cuenta");
      setMode("login");

    } catch (err) {
      console.error("💥 CATCH:", err);
      setError("Error de conexión con el servidor");
    } finally {
      console.log("🔄 FINALLY → LOADING FALSE");
      setLoading(false);
    }
  };

  // ------------------ FORGOT PASSWORD -----------
  const handleForgotPassword = async () => {
    setError("");

    if (!email) {
      setError("Introduce tu email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Error enviando email");
        return;
      }

      setError("📧 Te hemos enviado un email para recuperar tu contraseña");

      setMode("login");

    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    // <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
      {/* <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[320px]"> */}
      {/* <div className="bg-[#1e293b] text-white p-6 rounded-2xl w-[320px] shadow-xl border border-[#334155]"> */}
      <div className="bg-[#0f172a] text-white p-6 rounded-2xl w-[320px] shadow-2xl border border-[#334155] animate-in fade-in zoom-in duration-200">

        {/* TITLE */}
        <h2 className="text-lg font-bold mb-4 text-center">
          {/* {mode === "login" ? "🔐 Iniciar sesión" : "📝 Crear cuenta"} */}
          {mode === "login"
            ? "🔐 Iniciar sesión"
            : mode === "register"
            ? "📝 Crear cuenta"
            : "🔑 Recuperar contraseña"}
        </h2>

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-[#2a2a2a]"
        />

        {/* PASSWORD */}
        {mode !== "forgot" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-4 p-2 rounded bg-[#334155]"
          />
        )}

        {/* OLVIDASTE TU CONTRASEÑA */}
        <button
          onClick={() => {
            setMode("forgot");
            setError("");
          }}
          className="text-xs text-cyan-400 hover:underline mb-3"
        >
          ¿Olvidaste tu contraseña?
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          // onClick={mode === "login" ? handleLogin : handleRegister}
          onClick={
            mode === "login"
              ? handleLogin
              : mode === "register"
              ? handleRegister
              : handleForgotPassword
          }
          disabled={loading}
          className="w-full bg-cyan-600 py-2 rounded font-bold hover:bg-cyan-500 disabled:opacity-50"
        >
        {loading
          ? "Cargando..."
          : mode === "login"
          ? "Entrar"
          : mode === "register"
          ? "Crear cuenta"
          : "Enviar email"}
        </button>

        {/* TOGGLE */}
        <div className="text-center mt-4 text-sm text-gray-400">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-cyan-400 hover:underline"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-cyan-400 hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-sm text-gray-400 mt-2"
            >
              ← Volver al login
            </button>
          )}
        </div>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-400"
        >
          Cancelar
        </button>

      </div>
    </div>
  );
}