"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import SubscriptionInfo from "@/components/profile/SubscriptionInfo";
import { manageSubscription } from "@/lib/stripe";

type Props = {
  user: {
    email: string;
    name?: string;
    avatar?: string;
    subscription?: string;
    provider?: string;
  };
  onClose: () => void;
  onLogout: () => void;
  onRefreshUser: () => void;
  onLogin: () => void;
};

export default function ProfileModal({
  user,
  onClose,
  onLogout,
  onRefreshUser,
  onLogin,
}: Props) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(user.name || "");
  const [editAvatar, setEditAvatar] = useState(user.avatar || "");

  const [saving, setSaving] = useState(false);

  const [isPasswordMode, setIsPasswordMode] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);


  const apiUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  const handleManageSubscription = async () => {
    await manageSubscription(apiUrl);
  };

  const handleUpgrade = () => {
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let newAvatar = user.avatar;

      // 🖼️ 1. subir avatar SOLO si hay archivo nuevo
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch(`${apiUrl}/upload-avatar`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) throw new Error(t.uploadAvatarError);

        const data = await res.json();

        newAvatar = data.avatar; // 🔥 guardamos nueva ruta
      }

      // 👤 2. actualizar perfil (nombre + avatar)
      const resProfile = await fetch(`${apiUrl}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editName?.trim() || user.name,
          avatar: newAvatar,
        }),
      });

      if (!resProfile.ok) throw new Error(t.updateProfileError);

      setSuccess(t.profileUpdated);

      // 🔥 3. refrescar usuario (CLAVE para navbar)
      onRefreshUser();
      onClose();          // opcional: cerrar modal

    } catch (err: unknown) {
      setError(t.saveError);
      console.log(err)
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!apiUrl) return;

    setSavingPassword(true);

    try {
      const res = await fetch(`${apiUrl}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || t.error);
      }

      setSuccess(t.passwordUpdated);
      setError("");

      setIsPasswordMode(false);
      setCurrentPassword("");
      setNewPassword("");

    } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : t.error
        );
        setSuccess("");
    } finally {
      setSavingPassword(false);
    }
  };


  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isLogged = !!user.email;

  if (!isLogged) {

    return createPortal(

      <div className="fixed inset-0 bg-black/80 flex justify-center z-[9999]">

        <div className="mt-4 w-[95%] max-w-md bg-[var(--card)] text-[var(--text)] p-6 rounded-2xl shadow-xl border border-[var(--border)]">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-lg font-bold">
              👋 Bienvenido a Luranix
            </h2>

            <button onClick={onClose}>
              ✖
            </button>

          </div>

          <div className="text-center space-y-6">

            <div className="text-6xl">
              👤
            </div>

            <div>

              <p className="text-lg font-semibold">
                No has iniciado sesión
              </p>

              <p className="text-[var(--muted)] mt-2">
                Inicia sesión para sincronizar tus favoritos, acceder a Premium y personalizar tu experiencia.
              </p>

            </div>

            <button
              onClick={() => {
                onClose();
                onLogin();
              }}
              className="w-full bg-[var(--primary)] py-3 rounded-lg"
            >
              🔑 Iniciar sesión
            </button>

          </div>

        </div>

      </div>,

      document.body

    );

  }


return createPortal(
  <div className="fixed inset-0 bg-black/80 flex justify-center items-start z-[9999]">

    <div className="mt-4 w-[95%] max-w-4xl max-h-[95vh] overflow-y-auto bg-[var(--card)] text-[var(--text)] p-6 rounded-2xl shadow-xl border border-[var(--border)]">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-xl font-bold">
          👤 {t.profile}
        </h2>

        <button
          onClick={onClose}
          aria-label={t.close}
        >
          ✖
        </button>

      </div>

      {/* PROFILE + PREMIUM */}

      {!isEditing && !isPasswordMode ? (

        <div className="flex flex-col md:flex-row gap-8 mb-8">

          {/* USER */}

          <div className="md:w-1/3 flex flex-col items-center text-center">

            {(isEditing ? editAvatar : user.avatar) ? (

              <Image
                src={
                  (isEditing ? editAvatar : user.avatar)?.startsWith("http") ||
                  (isEditing ? editAvatar : user.avatar)?.startsWith("data:")
                    ? (isEditing ? editAvatar : user.avatar)!
                    : `${apiUrl}${isEditing ? editAvatar : user.avatar}`
                }
                alt="avatar"
                width={96}
                height={96}
                className="rounded-full mb-4"
                unoptimized
              />

            ) : (

              <div className="w-24 h-24 rounded-full bg-[var(--muted)] flex items-center justify-center text-3xl mb-4">
                {user.email?.[0]?.toUpperCase()}
              </div>

            )}

            <p className="text-xl font-bold">
              {user.name || t.user}
            </p>

            <p className="text-sm text-[var(--muted)] break-all mt-1">
              {user.email}
            </p>

          </div>

          {/* PREMIUM */}

          <div className="hidden md:block md:w-2/3">

            <SubscriptionInfo
              user={user}
              onManageSubscription={handleManageSubscription}
              onUpgrade={handleUpgrade}
            />

          </div>

        </div>

      ) : (

        <div className="flex flex-col items-center mb-6">

          {(isEditing ? editAvatar : user.avatar) ? (

            <Image
              src={
                (isEditing ? editAvatar : user.avatar)?.startsWith("http") ||
                (isEditing ? editAvatar : user.avatar)?.startsWith("data:")
                  ? (isEditing ? editAvatar : user.avatar)!
                  : `${apiUrl}${isEditing ? editAvatar : user.avatar}`
              }
              alt="avatar"
              width={96}
              height={96}
              className="rounded-full mb-4"
              unoptimized
            />

          ) : (

            <div className="w-24 h-24 rounded-full bg-[var(--muted)] flex items-center justify-center text-3xl mb-4">
              {user.email?.[0]?.toUpperCase()}
            </div>

          )}

          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full p-2 rounded bg-[var(--card)] text-[var(--text)]"
            placeholder={t.name}
          />

        </div>

      )}

    {isEditing && (
      <label className="cursor-pointer text-sm text-[var(--primary)] mb-4 block">
        📸 {t.changeAvatar}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setSelectedFile(file);

            const reader = new FileReader();

            reader.onloadend = () => {
              setEditAvatar(reader.result as string);
            };

            reader.readAsDataURL(file);
          }}
          className="hidden"
        />
      </label>
    )}

    {error && (
      <div className="bg-[var(--danger)]/20 text-[var(--danger)] p-3 rounded-lg text-sm mb-4">
        {error}
      </div>
    )}

    {success && (
      <div className="flex items-center gap-2 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] p-3 rounded-lg text-sm mb-4">
        <span>✅</span>
        <span>{success}</span>
      </div>
    )}

    {isPasswordMode && (
      <div className="space-y-3 mb-6">

        <input
          type="password"
          placeholder={t.currentPassword}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-[var(--input)]"
        />

        <input
          type="password"
          placeholder={t.newPassword}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-[var(--input)]"
        />

      </div>
    )}

    {/* ACTIONS */}

    <div className="mt-6">

      {!isEditing && !isPasswordMode && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <button
            onClick={() => {
              setIsPasswordMode(false);
              setIsEditing(true);
            }}
            className="rounded-xl bg-[var(--primary)] py-3 font-semibold hover:opacity-90 transition"
          >
            ✏️ {t.editProfile}
          </button>

          <button
            onClick={() => {
              setIsEditing(false);
              setIsPasswordMode(true);
            }}
            className="rounded-xl bg-[var(--hover)] py-3 font-semibold transition"
          >
            🔑 {t.changePassword}
          </button>

        </div>

      )}

      {isEditing && !isPasswordMode && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[var(--success)] py-3 font-semibold"
          >
            {saving ? t.saving : `💾 ${t.save}`}
          </button>

          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedFile(null);
              setEditAvatar(user.avatar || "");
            }}
            className="rounded-xl bg-[var(--muted)] py-3 font-semibold"
          >
            {t.cancel}
          </button>

        </div>

      )}

      {isPasswordMode && !isEditing && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="rounded-xl bg-[var(--success)] py-3 font-semibold"
          >
            {savingPassword ? t.saving : `💾 ${t.savePassword}`}
          </button>

          <button
            onClick={() => setIsPasswordMode(false)}
            className="rounded-xl bg-[var(--muted)] py-3 font-semibold"
          >
            {t.cancel}
          </button>

        </div>

      )}

      {/* MOBILE PREMIUM */}

      {!isEditing && !isPasswordMode && (
        <div className="md:hidden mt-6">
          <SubscriptionInfo
            user={user}
            onManageSubscription={handleManageSubscription}
            onUpgrade={handleUpgrade}
          />
        </div>
      )}

      <div className="mt-6 border-t border-[var(--border)] pt-6">

        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full rounded-xl bg-[var(--danger)] py-3 font-semibold hover:opacity-90 transition"
        >
          🚪 {t.logout}
        </button>

      </div>

    </div>

        </div>
      </div>,
      document.body
    );
}