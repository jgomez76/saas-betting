import LegalPage from "@/components/legal/LegalPage";
import LegalContent from "@/components/legal/LegalContent";

import { securityContent } from "@/lib/legal/security";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function SecurityPage() {

  const lang = await getServerLanguage();

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