"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

type LoginResponse = {
  token: string;
  is_admin: boolean;
};

type Props = {
  onClose: () => void;
  onLogin: (data: LoginResponse) => void;
};

export default function LoginModal({ onClose, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  console.log("API_URL:",API_URL)
  
  const handleLogin = async () => {
    try {
      
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

    //   const data = await res.json();
      const data: LoginResponse = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("is_admin", String(data.is_admin));

        onLogin(data);
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      alert("Error login");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-[320px]">

        <h2 className="text-lg font-bold mb-4 text-center">
          Admin Login
        </h2>

        <input
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-[#2a2a2a]"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 rounded bg-[#2a2a2a]"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-cyan-600 py-2 rounded font-bold"
        >
          Entrar
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}