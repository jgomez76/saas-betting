import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { getServerLanguage } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/server";
import { BASE_METADATA } from "@/lib/branding";


// 🌍 Metadata dinámica (ESCALABLE)
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLanguage();

  const metadataByLang: Record<Lang, Metadata> = {
    en: {
      title: "Luranix",
      description:
        "Advanced sports betting analytics platform",
    },

    es: {
      title: "Luranix",
      description:
        "Plataforma avanzada de análisis de apuestas deportivas",
    },

    fr: {
      title: "Luranix",
      description:
        "Plateforme avancée d'analyse des paris sportifs",
    },

    it: {
      title: "Luranix",
      description:
        "Piattaforma avanzata di analisi delle scommesse sportive",
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
  const lang = await getServerLanguage();

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

                <main className="flex-1">
                  {children}
                </main>

                <CookieBanner />

                <Footer />

              </LanguageProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}