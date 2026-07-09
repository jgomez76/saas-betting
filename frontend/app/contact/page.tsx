import LegalPage from "@/components/legal/LegalPage";
import { translations } from "@/lib/i18n/translations";
import { cookiesContent } from "@/lib/legal/cookies";
import { getServerLanguage } from "@/lib/i18n/server";
import { COMPANY } from "@/lib/branding";


export default async function ContactPage() {

  const lang = await getServerLanguage();

  const content =
    cookiesContent[lang].sections.length > 0
      ? cookiesContent[lang]
      : cookiesContent.en;

  const t =
    translations[
      lang as keyof typeof translations
    ] ?? translations.en;

  return (
      <LegalPage
        locale={lang}
        title={t.contactTitle}
        updated="2026-06-23"
      >

      <section>

        <p>
          {t.contactIntro}
        </p>

        <p>
          {t.contactDescription}
        </p>

      </section>

      <section>

        <h2 className="text-xl font-semibold mb-2">
          {t.support}
        </h2>

        <p>
          {t.supportDescription}
        </p>

        <p className="font-medium">
          {COMPANY.email}
        </p>

      </section>

      <section>

        <h2 className="text-xl font-semibold mb-2">
          {t.responseTime}
        </h2>

        <p>
          {t.responseTimeDescription}
        </p>

      </section>

      <section>

        <h2 className="text-xl font-semibold mb-2">
          {t.feedback}
        </h2>

        <p>
          {t.feedbackDescription}
        </p>

      </section>

      <section>

        <h2 className="text-xl font-semibold mb-2">
          {t.businessInquiries}
        </h2>

        <p>
          {t.businessDescription}
        </p>

        <p className="font-medium">
          {COMPANY.email}
        </p>

      </section>

    </LegalPage>
  );
}