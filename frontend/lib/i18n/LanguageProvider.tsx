"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "./translations";
import { ReactNode } from "react";

type Lang = "en" | "es";

type LanguageContextType = {
  lang: Lang;
  changeLang: (l: Lang) => void;
  t: typeof translations["en"];
};

type Props = {
    children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: Props) => {
    const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";

    const saved = localStorage.getItem("lang") as Lang;
    return saved || "en";
    });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("lang", l);
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