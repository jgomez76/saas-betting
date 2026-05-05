"use client";

import { useState } from "react";

type User = {
  name?: string;
  avatar?: string;
};

type Props = {
  user: User;
  onClose: () => void;
  onSave: () => void;
};

export default function ProfileSettingsModal({ user, onClose, onSave }: Props) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSave = async () => {
    const form = new FormData();
    form.append("name", name);

    if (avatar) {
      form.append("avatar", avatar);
    }

    await fetch("http://localhost:8000/update-profile", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[var(--card)] p-6 rounded-xl w-[90%] max-w-md">

        <h2 className="text-xl font-bold mb-4">Editar perfil</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="w-full p-2 mb-3 bg-[var(--bg)] border border-[var(--border)] rounded"
        />

        <input
          type="file"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-[var(--border)] py-2 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="flex-1 bg-[var(--accent)] py-2 rounded text-white"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}