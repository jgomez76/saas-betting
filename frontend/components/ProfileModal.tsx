"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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


  const apiUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : `http://${window.location.hostname}:8000`
      : "";

  // const handleSave = async () => {
  //   if (!apiUrl) return;

  //   setSaving(true);

  //   try {
  //     const res = await fetch(`${apiUrl}/update-profile`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         name: editName,
  //         avatar: editAvatar,
  //       }),
  //     });

  //     if (!res.ok) throw new Error();

  //     onRefreshUser(); // 🔥 refresca datos
  //     setIsEditing(false);

  //   } catch (err) {
  //     alert("❌ Error al guardar perfil");
  //     console.log(err);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

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

        if (!res.ok) throw new Error("Error subiendo avatar");

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

      if (!resProfile.ok) throw new Error("Error actualizando perfil");

      setSuccess("Perfil actualizado correctamente");

      // 🔥 3. refrescar usuario (CLAVE para navbar)
      onRefreshUser();
      onClose();          // opcional: cerrar modal
      // window.location.reload(); // 🔥 solución simple (luego mejoramos)

    } catch (err: unknown) {
      setError("Error al guardar cambios");
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
        throw new Error(data.detail || "Error");
      }

      // alert("✅ Contraseña actualizada");
      setSuccess("Contraseña actualizada correctamente");
      setError("");

      setIsPasswordMode(false);
      setCurrentPassword("");
      setNewPassword("");

    } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error"
        );
        setSuccess("");
    } finally {
      setSavingPassword(false);
    }
  };

  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!apiUrl) return;

  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await fetch(`${apiUrl}/upload-avatar`, {
  //       method: "POST",
  //       credentials: "include",
  //       body: formData,
  //     });

  //     const data = await res.json();

  //     setEditAvatar(data.avatar); // 🔥 actualiza preview
  //     onRefreshUser(); // 🔥 sync global

  //   } catch {
  //     setError("Error subiendo imagen");
  //   }
  // ;}

  const avatarSrc = isEditing ? editAvatar : user.avatar;

  const fullAvatar =
    avatarSrc?.startsWith("http")
    ? avatarSrc
    : avatarSrc
    ? `${apiUrl}${avatarSrc}`
    : null;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  
  // console.log("USER AVATAR:", user.avatar);
  // console.log("EDIT AVATAR:", editAvatar);
  // console.log("API URL:", apiUrl); 

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-[#0f172a] text-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl border border-[#334155]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">👤 Perfil</h2>
          <button onClick={onClose}>✖</button>
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
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-xl">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}

          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 rounded bg-[#1e293b] text-white mb-2"
              placeholder="Nombre"
            />
          ) : (
            <>
              <p className="text-lg font-semibold">
                {user.name || "Usuario"}
              </p>
              <p className="text-sm text-gray-400">
                {user.email}
              </p>
            </>
          )}

        </div>

        {isEditing && (
          <label className="cursor-pointer text-sm text-cyan-400 mb-2">
            📸 Cambiar avatar
            <input
              type="file"
              accept="image/*"
              // onChange={(e) => {
              //   const file = e.target.files?.[0];
              //   if (!file) return;

              //   setSelectedFile(file);
              //   setEditAvatar(URL.createObjectURL(file));
              // }}
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
              <span className="text-gray-400">Plan</span>
              <span className="font-semibold">
                {user.subscription || "free"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Provider</span>
              <span className="font-semibold">
                {user.provider ?? "email"}
              </span>
            </div>

          </div>
        )}

        {error && (
          <div className="bg-red-500/20 text-red-400 p-2 rounded text-sm mb-2">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm mb-3">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {isPasswordMode && (
          <div className="space-y-3 mb-4">

            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#1e293b]"
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#1e293b]"
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
                className="w-full bg-cyan-600 py-2 rounded hover:bg-cyan-500"
              >
                ✏️ Editar perfil
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsPasswordMode(true);
                }}
                className="w-full bg-gray-700 py-2 rounded hover:bg-gray-600"
              >
                🔑 Cambiar contraseña
              </button>
            </>
          )}

          {/* ✏️ EDIT PROFILE */}
          {isEditing && !isPasswordMode && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 py-2 rounded"
              >
                {saving ? "Guardando..." : "💾 Guardar"}
              </button>

              <button
                // onClick={() => setIsEditing(false)}
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setEditAvatar(user.avatar || "");
                }}
                className="w-full bg-gray-600 py-2 rounded"
              >
                Cancelar
              </button>
            </>
          )}

          {/* 🔑 PASSWORD MODE */}
          {isPasswordMode && !isEditing && (
            <>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full bg-green-600 py-2 rounded"
              >
                {savingPassword ? "Guardando..." : "💾 Guardar contraseña"}
              </button>

              <button
                onClick={() => setIsPasswordMode(false)}
                className="w-full bg-gray-600 py-2 rounded"
              >
                Cancelar
              </button>
            </>
          )}

          {/* 🚪 LOGOUT */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full bg-red-600 py-2 rounded mt-3"
          >
            🚪 Cerrar sesión
          </button>

        </div>

      </div>
    </div>
  );
}