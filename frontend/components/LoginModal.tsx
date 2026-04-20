"use client";

import { useState } from "react";
// import { API_URL } from "@/lib/api";
import { signIn } from "next-auth/react";

// ---------------- TYPES ----------------

type LoginResponse = {
  message: string;
};

type Props = {
  onClose: () => void;
  onLogin: () => void;
};

const apiUrl =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`
    : "";
// ---------------- COMPONENT ----------------

export default function LoginModal({ onClose, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showResend, setShowResend] = useState(false);

  // ---------------- LOGIN ----------------

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/login`, {
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
          setShowResend(true);
        } else if (res.status === 401) {
          setError("Credenciales incorrectas");
          setShowResend(false);
        } else {
          setError("Error inesperado");
          setShowResend(false);
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

      const res = await fetch(`${apiUrl}/register`, {
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
      
      const res = await fetch(`${apiUrl}/forgot-password`, {
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
  
  
  // ----------- RESEND VERIFICATION EMAIL -----------
  const handleResend = async () => {
    if (!email) {
      setError("Introduce tu email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${apiUrl}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // 🔐 comportamiento seguro (no revelar existencia)
      if (data.message === "sent") {
        setError("📧 Si el email existe, recibirás el enlace de verificación");
      } 
      else if (data.message === "already_verified") {
        setError("✅ Tu cuenta ya está verificada");
      } 
      else {
        setError("📧 Si el email existe, recibirás el enlace de verificación");
      }

    } catch (err) {
      console.error("💥 RESEND ERROR:", err);

      // 🔥 error real de red (como tu caso sin internet)
      setError("❌ Problema de conexión. Revisa tu internet e inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  };
  // ---------------- UI ----------------

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--card)] p-6 rounded-2xl w-[320px] shadow-2xl border border-[var(--border)] text-[var(--text)] animate-in fade-in zoom-in duration-200">

        {/* TITLE */}
        <h2 className="text-lg font-bold mb-4 text-center text-white">
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
          className="w-full mb-3 p-2 rounded bg-[var(--card)] text-[var(--text)] border border-[var(--border)]"
        />

        {/* PASSWORD */}
        {mode !== "forgot" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-4 p-2 rounded bg-[var(--card)] text-[var(--text)] border border-[var(--border)]"
          />
        )}

        <button
          onClick={() => signIn("google")}
          className="w-full bg-white text-black py-2 rounded mb-2"
        >
          🔵 Continuar con Google
        </button>

        <button
          onClick={() => signIn("github")}
          className="w-full bg-black text-white py-2 rounded"
        >
          ⚫ Continuar con GitHub
        </button>

        {/* OLVIDASTE TU CONTRASEÑA */}
        <button
          onClick={() => {
            setMode("forgot");
            setError("");
          }}
          className="w-full text-xs text-cyan-400 hover:underline mb-3"
        >
          ¿Olvidaste tu contraseña?
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-[var(--danger)] text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {showResend && (
        <button
            onClick={handleResend}
            className="w-full text-[var(--primary)] text-sm mb-3 hover:underline"
          >
            Reenviar email de verificación
          </button>
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
            className="w-full bg-[var(--primary)] py-2 rounded font-bold hover:opacity-90 text-white disabled:opacity-50"
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
        <div className="text-center mt-4 text-sm text-[var(--muted)]">
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