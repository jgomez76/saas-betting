import LegalPage from "@/components/legal/LegalPage";

export default function ContactPage() {
return ( <LegalPage
   title="Contact"
   updated="June 2026"
 > <section> <p>
We&apos;d love to hear from you. </p>

    <p>
      If you have questions, suggestions,
      bug reports, partnership proposals,
      or account-related issues, please
      contact us using the information below.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      Support
    </h2>

    <p>
      General support and account assistance:
    </p>

    <p className="font-medium">
      support@betsaas.com
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      Response Time
    </h2>

    <p>
      We aim to respond to all inquiries
      within 48 hours.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      Feedback
    </h2>

    <p>
      We welcome feedback and suggestions
      to improve BetSaaS and deliver a
      better experience for all users.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      Business Inquiries
    </h2>

    <p>
      For partnerships, commercial
      opportunities, or media inquiries,
      please contact:
    </p>

    <p className="font-medium">
      support@betsaas.com
    </p>
  </section>
</LegalPage>

);
}
