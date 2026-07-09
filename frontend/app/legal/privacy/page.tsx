import LegalPage from "@/components/legal/LegalPage";
import LegalContent from "@/components/legal/LegalContent";

import { privacyContent } from "@/lib/legal/privacy";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function PrivacyPage() {

  const lang = await getServerLanguage();

  const content = privacyContent[lang];

  return (
    <LegalPage
        title={content.title}
        updated={content.updated}
        locale={content.locale}
        intro={content.intro}
    >
      <LegalContent content={content} />
    </LegalPage>
  );
}