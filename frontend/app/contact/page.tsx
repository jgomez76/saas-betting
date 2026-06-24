import LegalPage from "@/components/legal/LegalPage";
import { translations } from "@/lib/i18n/translations";
import { cookies } from "next/headers";

export default async function ContactPage() {

  const cookieStore = await cookies();

  const lang =
    cookieStore.get("lang")?.value ?? "en";

  const t =
    translations[
      lang as keyof typeof translations
    ] ?? translations.en;

  return (
    <LegalPage
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
          support@betsaas.com
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
          support@betsaas.com
        </p>

      </section>

    </LegalPage>
  );
}