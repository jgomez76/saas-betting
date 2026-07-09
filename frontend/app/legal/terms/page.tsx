import LegalPage from "@/components/legal/LegalPage";
import LegalContent from "@/components/legal/LegalContent";

import { termsContent } from "@/lib/legal/terms";
import { getServerLanguage } from "@/lib/i18n/server";


export default async function TermsPage() {

  const lang = await getServerLanguage();

  const content =
    termsContent[lang].sections.length > 0
      ? termsContent[lang]
      : termsContent.en;

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