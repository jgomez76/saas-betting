"use client";

import { useState, useEffect } from "react";
// import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSearchParams } from "next/navigation";

// ---------------- TYPES ----------------

// type LoginResponse = {
//   message: string;
// };

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
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showResend, setShowResend] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);

  useEffect(() => {

    const disabled =
      localStorage.getItem(
        "oauth_disabled"
      );

    if (disabled === "1") {

      const savedEmail =
        localStorage.getItem(
          "oauth_disabled_email"
        );

      if (savedEmail) {
        setEmail(savedEmail);
      }

      setError(
        t.accountDisabled
      );

      setShowReactivate(true);

      localStorage.removeItem(
        "oauth_disabled"
      );

      localStorage.removeItem(
        "oauth_disabled_email"
      );
    }

  }, [t.accountDisabled]);

  // ---------------- LOGIN ----------------

  const params = useSearchParams();

  const [email, setEmail] = useState(() => {

    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage.getItem(
        "reactivate_email"
      ) || ""
    );
  });

  useEffect(() => {
    const errorParam = params.get("error");

    if (errorParam === "ACCOUNT_DISABLED") {
      setError(t.accountDisabled);
      setShowReactivate(true);
    }
  }, [params, t.accountDisabled]);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError(t.fillAllFields);
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
      const data = await res.json();

      if (!res.ok) {

        // 🔥 CUENTA DESACTIVADA
        if (data.detail === "ACCOUNT_DISABLED") {
          setError(t.accountDisabled);
          setShowResend(false);
          setShowReactivate(true);
          return;
        }

        // 🔥 EMAIL NO VERIFICADO
        if (res.status === 403) {
          setError(t.verifyEmailFirst);
          setShowResend(true);
          return;
        }

        // 🔥 CREDENCIALES MAL
        if (res.status === 401) {
          setError(t.invalidCredentials);
          setShowResend(false);
          return;
        }

        // 🔥 OTROS
        setError(t.unexpectedError);
        setShowResend(false);
        return;
      }

      // const data: LoginResponse = await res.json();

      if (data.message === "ok") {
        onLogin();
        onClose();
      } else {
        setError(t.invalidCredentials);
      }

    } catch (err) {
      console.error("💥 NETWORK ERROR:", err);
      setError(t.connectionError);
    } finally {
      setLoading(false); // 🔥 SIEMPRE
    }
  };

  const handleReactivate = async () => {
    if (!email) {
      setError(t.enterEmail);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${apiUrl}/request-reactivation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // 🔥 CLAVE
      });

      if (!res.ok) {
        setError(t.unexpectedError);
        return;
      }

      setError(t.emailSentReactivation);
      setShowReactivate(false);

      // alert(t.accountReactivated);

    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REGISTER ----------------

    const handleRegister = async () => {
    // console.log("👉 START REGISTER");

    setError("");

    if (!email || !password) {
      setError(t.fillAllFields);
      return;
    }

    try {
      setLoading(true);
      // console.log("⏳ LOADING TRUE");

      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // console.log("📡 RESPONSE:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.log("❌ ERROR TEXT:", text);

        setError(t.registerError);
        return;
      }

      // console.log("✅ REGISTER OK");

      setError(t.accountCreatedCheckEmail);
      setMode("login");

    } catch (err) {
      console.error("💥 CATCH:", err);
      setError(t.connectionError);
    } finally {
      // console.log("🔄 FINALLY → LOADING FALSE");
      setLoading(false);
    }
  };

  // ------------------ FORGOT PASSWORD -----------
  const handleForgotPassword = async () => {
    setError("");
    
    if (!email) {
      setError(t.enterEmail);
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
        setError(t.sendEmailError);
        return;
      }
      
      setError(t.emailSentRecovery);
      
      setMode("login");
      
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };
  
  
  // ----------- RESEND VERIFICATION EMAIL -----------
  const handleResend = async () => {
    if (!email) {
      setError(t.enterEmail);
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
        setError(t.emailSentIfExists);
      } 
      else if (data.message === "already_verified") {
        setError(t.accountAlreadyVerified);
      } 
      else {
        setError(t.emailSentIfExists);
      }

    } catch (err) {
      console.error("💥 RESEND ERROR:", err);

      // 🔥 error real de red (como tu caso sin internet)
      setError(t.networkError);
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
            ? `🔐 ${t.login}`
            : mode === "register"
            ? `📝 ${t.register}`
            : `🔑 ${t.forgotPassword}`}
        </h2>

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.email}
          className="w-full mb-3 p-2 rounded bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"
        />

        {/* PASSWORD */}
        {mode !== "forgot" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            className="w-full mb-4 p-2 rounded bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"
          />
        )}

        <button
        onClick={() => {
          window.location.href =
            `${apiUrl}/auth/google`;
        }}
          className="w-full bg-white text-black py-2 rounded mb-2"
        >
          🔵 {t.continueWithGoogle}
        </button>

        <button
          onClick={() => {
            window.location.href =
              `${apiUrl}/auth/github`;
          }}
          className="w-full bg-black text-white py-2 rounded"
        >
          ⚫ {t.continueWithGithub}
        </button>

        {/* OLVIDASTE TU CONTRASEÑA */}
        <button
          onClick={() => {
            setMode("forgot");
            setError("");
          }}
          className="w-full text-xs text-cyan-400 hover:underline mb-3"
        >
          {t.forgotPasswordQuestion}
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
            {t.resendVerification}
          </button>
        )}

        {/* BUTTON */}

          <button
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
            ? t.loading
            : mode === "login"
            ? t.login
            : mode === "register"
            ? t.register
            : t.sendEmail}
          </button>


        {/* TOGGLE */}
        <div className="text-center mt-4 text-sm text-[var(--muted)]">
          {mode === "login" ? (
            <>
              {t.noAccount}{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-cyan-400 hover:underline"
              >
                {t.signUp}
              </button>
            </>
          ) : (
            <>
              {t.haveAccount}{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-cyan-400 hover:underline"
              >
                {t.login}
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
              ← {t.backToLogin}
            </button>
          )}
        </div>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-400"
        >
          {t.cancel}
        </button>

        {showReactivate && (
          <button
            onClick={handleReactivate}
            className="w-full text-[var(--primary)] text-sm mb-3 hover:underline"
          >
            🔁 {t.reactivateAccount}
          </button>
        )}

      </div>
    </div>
  );
}