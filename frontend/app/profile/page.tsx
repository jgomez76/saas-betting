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

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-xl font-bold mb-4">Perfil</h1>

      {user.avatar && (
        <Image 
        src={user.avatar} 
        alt="avatar" 
        className="rounded-full mb-4"
        width={64}
        height={64} />
      )}

      <p>Email: {user.email}</p>
      <p>Nombre: {user.name}</p>
      <p>Plan: {user.subscription}</p>
      <p>Provider: {user.provider}</p>
    </div>
  );
}