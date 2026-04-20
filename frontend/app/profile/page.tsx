"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import Image from "next/image";

type User = {
  email: string;
  name?: string;
  avatar?: string;
  subscription?: string;
  provider?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setUser);
  }, []);

  if (!user) return (
    <div className="p-6 text-[var(--muted)]">Cargando...</div>
  );

  return (
    <div className="p-6 bg-[var(--bg)] text-[var(--text)] min-h-screen">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-w-md">
        <h1 className="text-xl font-bold mb-4 text-[var(--text)]">Perfil</h1>

        {user.avatar && (
          <Image 
          src={user.avatar} 
          alt="avatar" 
          className="rounded-full mb-4"
          width={64}
          height={64} />
        )}
        <div className="space-y-2 text-sm">
          <p className="text-[var(--muted)]">Email: <span className="text-[var(--text)]">{user.email}</span></p>
          <p className="text-[var(--muted)]">Nombre: <span className="text-[var(--text)]">{user.name}</span></p>
          <p className="text-[var(--muted)]">Plan: <span className="text-[var(--text)]">{user.subscription}</span></p>
          <p className="text-[var(--muted)]">Provider: <span className="text-[var(--text)]">{user.provider}</span></p>
        </div>

      </div>
    </div>
  );
}