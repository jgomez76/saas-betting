import LegalPage from "@/components/legal/LegalPage";

export default function PrivacyPage() {
return ( <LegalPage
   title="Privacy Policy"
   updated="2026-06-23"
 > <section> <h2 className="text-xl font-semibold mb-2">
1. Introduction </h2>

    <p>
      BetSaaS is committed to protecting your privacy.
      This Privacy Policy explains what information
      we collect, how we use it, and the rights you
      have regarding your personal data.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      2. Information We Collect
    </h2>

    <ul className="list-disc pl-6 space-y-2">
      <li>Name and email address.</li>
      <li>Authentication provider information.</li>
      <li>User preferences and settings.</li>
      <li>Betting history stored inside the platform.</li>
      <li>Technical information such as browser type and device information.</li>
    </ul>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      3. How We Use Your Data
    </h2>

    <ul className="list-disc pl-6 space-y-2">
      <li>To provide and improve the service.</li>
      <li>To authenticate users.</li>
      <li>To personalize the platform experience.</li>
      <li>To communicate important account information.</li>
      <li>To comply with legal obligations.</li>
    </ul>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      4. Authentication Providers
    </h2>

    <p>
      Users may authenticate using email/password,
      Google, GitHub, or other providers that may
      be added in the future.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      5. Data Retention
    </h2>

    <p>
      Personal information is retained only for as
      long as necessary to provide the service and
      fulfill legal obligations.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      6. Your Rights
    </h2>

    <p>
      Depending on your jurisdiction, you may have
      the right to access, modify, export, or delete
      your personal information.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      7. Contact
    </h2>

    <p>
      For privacy-related questions, contact:
    </p>

    <p className="font-medium">
      support@betsaas.com
    </p>
  </section>
</LegalPage>


);
}
