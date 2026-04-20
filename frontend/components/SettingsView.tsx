"use client";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";



export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const themes: Theme[] = ["dark", "light", "classic", "modern", "futuristic"];
  
  return (
    <div className="w-full max-w-3xl mx-auto">

      <h1 className="text-xl font-bold mb-6">⚙️ Settings</h1>

      <div className="space-y-3">

        {/* 🎨 TEMAS */}
        <div className="bg-[#1f2937] p-4 rounded-lg cursor-pointer hover:bg-[#2a2a2a]">
          🎨 Temas
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {themes.map((t) => (
            <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-2 rounded ${
                theme === t ? "bg-cyan-600" : "bg-[#2a2a2a]"
                }`}
            >
                {t}
            </button>
            ))}
        </div>

        {/* 🌍 LENGUAJE */}
        <div className="bg-[#1f2937] p-4 rounded-lg cursor-pointer hover:bg-[#2a2a2a]">
          🌍 Lenguaje
        </div>

        {/* 🏆 LIGAS FAVORITAS */}
        <div className="bg-[#1f2937] p-4 rounded-lg cursor-pointer hover:bg-[#2a2a2a]">
          🏆 Ligas favoritas
        </div>

        {/* 👤 CUENTA */}
        <div className="bg-[#1f2937] p-4 rounded-lg cursor-pointer hover:bg-[#2a2a2a]">
          👤 Cuenta
        </div>

      </div>

    </div>
  );
}