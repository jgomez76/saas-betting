"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "./translations";
import { ReactNode } from "react";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/api";

type Lang = "en" | "es" | "it" | "fr";

type LanguageContextType = {
  lang: Lang;
  changeLang: (l: Lang) => Promise<void>;
  t: typeof translations["en"];
};

type Props = {
  children: ReactNode;
  initialLang: Lang; // 👈 viene del servidor
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children, initialLang }: Props) => {

  // ✅ mismo valor que SSR → sin hydration mismatch
  const [lang, setLang] = useState<Lang>(initialLang);

  const changeLang = async (l: Lang) => {
    setLang(l);

    // Cookie (siempre)
    Cookies.set("lang", l, { expires: 365 });

    try {
      await fetch(`${API_URL()}/me/language`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          language: l,
        }),
      });
    } catch {
      // No hacemos nada.
      // Si el usuario no está logueado o hay un error,
      // el idioma visual ya ha cambiado y la cookie ya está guardada.
    }
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};