import LegalPage from "@/components/legal/LegalPage";

export default function CookiesPage() {
return ( <LegalPage
   title="Cookies Policy"
   updated="2026-06-23"
 > <section> <h2 className="text-xl font-semibold mb-2">
1. What Are Cookies? </h2>

    <p>
      Cookies are small text files stored on your
      device that help websites function correctly
      and improve user experience.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      2. How BetSaaS Uses Cookies
    </h2>

    <p>
      BetSaaS uses cookies to maintain user sessions,
      remember preferences, and improve platform
      functionality.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      3. Essential Cookies
    </h2>

    <ul className="list-disc pl-6 space-y-2">
      <li>User authentication.</li>
      <li>Session management.</li>
      <li>Security protection.</li>
      <li>Language preferences.</li>
    </ul>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      4. Analytics Cookies
    </h2>

    <p>
      BetSaaS may use analytics services in the future
      to better understand platform usage and improve
      user experience.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      5. Managing Cookies
    </h2>

    <p>
      Most browsers allow users to control, block,
      or delete cookies through browser settings.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      6. Contact
    </h2>

    <p>
      For questions regarding cookies, contact:
    </p>

    <p className="font-medium">
      support@betsaas.com
    </p>
  </section>
</LegalPage>


);
}
