import LegalPage from "@/components/legal/LegalPage";
import LegalContent from "@/components/legal/LegalContent";

import { cookiesContent } from "@/lib/legal/cookies";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function CookiesPage() {

  const lang = await getServerLanguage();

  const content =
    cookiesContent[lang].sections.length > 0
      ? cookiesContent[lang]
      : cookiesContent.en;

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