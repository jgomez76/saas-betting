import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { cookies } from "next/headers";

// 🌍 Idiomas soportados (ESCALABLE)
const SUPPORTED_LANGS = ["en", "es"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

// 🧠 Helper seguro
function getLang(cookieLang?: string): Lang {
  if (SUPPORTED_LANGS.includes(cookieLang as Lang)) {
    return cookieLang as Lang;
  }
  return "en"; // fallback
}

// 🌍 Metadata dinámica (ESCALABLE)
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);

  const metadataByLang: Record<Lang, Metadata> = {
    en: {
      title: "BetSaaS",
      description: "Advanced sports betting analytics platform",
    },
    es: {
      title: "BetSaaS",
      description: "Plataforma avanzada de análisis de apuestas deportivas",
    },
  };

  return metadataByLang[lang];
}

// 🔤 Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🧩 Layout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);

  return (
    <html
      lang={lang}
      dir="ltr" // preparado para futuro RTL si quieres
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <Providers>
          <ThemeProvider>
            <SubscriptionProvider>
              <LanguageProvider initialLang={lang}>
                {children}
              </LanguageProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}