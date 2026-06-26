import LegalPage from "@/components/legal/LegalPage";
import LegalContent from "@/components/legal/LegalContent";

import { securityContent } from "@/lib/legal/security";

import { cookies } from "next/headers";

const SUPPORTED_LANGS = ["en", "es", "fr", "it"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function getLang(cookieLang?: string): Lang {
  if (SUPPORTED_LANGS.includes(cookieLang as Lang)) {
    return cookieLang as Lang;
  }

  return "en";
}

export default async function SecurityPage() {

  const cookieStore = await cookies();

  const lang = getLang(
    cookieStore.get("lang")?.value
  );

  const content =
    securityContent[lang].sections.length > 0
      ? securityContent[lang]
      : securityContent.en;

  return (
    <LegalPage
      title={content.title}
      updated={content.updated}
      locale={content.locale}
      intro={content.intro}
    >
      <LegalContent
        content={content}
      />
    </LegalPage>
  );
}