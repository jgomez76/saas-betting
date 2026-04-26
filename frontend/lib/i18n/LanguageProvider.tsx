"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "./translations";
import { ReactNode } from "react";
import Cookies from "js-cookie";

type Lang = "en" | "es";

type LanguageContextType = {
  lang: Lang;
  changeLang: (l: Lang) => void;
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

  const changeLang = (l: Lang) => {
    setLang(l);

    // ✅ guardar en cookie (persistente)
    Cookies.set("lang", l, { expires: 365 });
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