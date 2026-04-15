"use client";

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
};

export default function ProfileModal({ user, onClose, onLogout }: Props) {
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
          {user.avatar && (
            <Image
              src={user.avatar}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full mb-2"
            />
          )}

          <p className="text-lg font-semibold">
            {user.name || "Usuario"}
          </p>

          <p className="text-sm text-gray-400">
            {user.email}
          </p>
        </div>

        {/* INFO */}
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

        {/* ACTIONS */}
        <div className="mt-6 space-y-2">

          <button className="w-full bg-cyan-600 py-2 rounded hover:bg-cyan-500">
            ✏️ Editar perfil
          </button>

          <button className="w-full bg-gray-700 py-2 rounded hover:bg-gray-600">
            🔑 Cambiar contraseña
          </button>

          <button
            onClick={() => {
              onLogout();
              onClose();
          }}
            className="w-full bg-red-600 py-2 rounded mt-3"
          >
            🚪 Cerrar sesión
          </button>

          {/* <button className="w-full bg-red-600 py-2 rounded hover:bg-red-500">
            🗑 Eliminar Cuenta
          </button> */}

        </div>

      </div>
    </div>
  );
}