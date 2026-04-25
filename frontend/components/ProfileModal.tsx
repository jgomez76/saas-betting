"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  onRefreshUser: () => void; // 🔥 NUEVO
};

export default function ProfileModal({
  user,
  onClose,
  onLogout,
  onRefreshUser,
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

      // alert("✅ Contraseña actualizada");
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


  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex justify-center z-[9999]">

      <div className="mt-4 w-[95%] max-w-md max-h-[90vh] overflow-y-auto bg-[var(--card)] text-[var(--text)] p-6 rounded-2xl shadow-xl border border-[var(--border)]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">👤 {t.profile}</h2>
          <button onClick={onClose} aria-label={t.close}>
            ✖
          </button>
        </div>

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-4">

          {(isEditing ? editAvatar : user.avatar) ? (
            <Image
              src={
                (isEditing ? editAvatar : user.avatar)?.startsWith("http") ||
                (isEditing ? editAvatar : user.avatar)?.startsWith("data:")
                  ? (isEditing ? editAvatar : user.avatar)!
                  : `${apiUrl}${isEditing ? editAvatar : user.avatar}`
              }
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full mb-2"
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center text-xl">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}

          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card)] text-[var(--text)] mb-2"
              placeholder={t.name}
            />
          ) : (
            <>
              <p className="text-lg font-semibold">
                {user.name || t.user}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {user.email}
              </p>
            </>
          )}

        </div>

        {isEditing && (
          <label className="cursor-pointer text-sm text-[var(--primary)] mb-2">
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
                  setEditAvatar(reader.result as string); // 🔥 base64
                };

                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
          </label>
        )}

        {/* INFO */}
        {!isEditing && (
          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-[var(--muted)]">{t.plan}</span>
              <span className="font-semibold">
                {user.subscription || t.free}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[var(--muted)]">{t.provider}</span>
              <span className="font-semibold">
                {user.provider ?? t.emailProvider}
              </span>
            </div>

          </div>
        )}

        {error && (
          <div className="bg-[var(--danger)]/20 text-[var(--danger)] p-2 rounded text-sm mb-2">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] p-3 rounded-lg text-sm mb-3">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {isPasswordMode && (
          <div className="space-y-3 mb-4">

            <input
              type="password"
              placeholder={t.currentPassword}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card)]"
            />

            <input
              type="password"
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card)]"
            />

          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 space-y-2">

          {/* 🧠 NORMAL */}
          {!isEditing && !isPasswordMode && (
            <>
              <button
                onClick={() => {
                  setIsPasswordMode(false);
                  setIsEditing(true);
                }}
                className="w-full bg-[var(--primary)] py-2 rounded hover:opacity-90"
              >
                ✏️ {t.editProfile}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsPasswordMode(true);
                }}
                className="w-full bg-[var(--card)] py-2 rounded hover:bg-[var(--hover)]"
              >
                🔑 {t.changePassword}
              </button>
            </>
          )}

          {/* ✏️ EDIT PROFILE */}
          {isEditing && !isPasswordMode && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[var(--success)] py-2 rounded"
              >
                {saving ? t.saving : `💾 ${t.save}`}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setEditAvatar(user.avatar || "");
                }}
                className="w-full bg-[var(--muted)] py-2 rounded"
              >
                {t.cancel}
              </button>
            </>
          )}

          {/* 🔑 PASSWORD MODE */}
          {isPasswordMode && !isEditing && (
            <>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full bg-[var(--success)] py-2 rounded"
              >
                {savingPassword ? t.saving : `💾 ${t.savePassword}`}
              </button>

              <button
                onClick={() => setIsPasswordMode(false)}
                className="w-full bg-[var(--muted)] py-2 rounded"
              >
                {t.cancel}
              </button>
            </>
          )}

          {/* 🚪 LOGOUT */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full bg-[var(--danger)] py-2 rounded mt-3"
          >
            🚪 {t.logout}
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}