import LegalPage from "@/components/legal/LegalPage";

export default function SecurityPage() {
return ( <LegalPage
   title="Security Policy"
   updated="June 2026"
 > <section> <h2 className="text-xl font-semibold mb-2">
1. Our Commitment to Security </h2>

    <p>
      BetSaaS takes the protection of user accounts,
      personal information, and platform data seriously.
      We continuously improve our security practices
      to help protect our users.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      2. Secure Connections
    </h2>

    <p>
      All communication between users and BetSaaS is
      protected using HTTPS encryption.
    </p>

    <p>
      Data transmitted between your device and our
      servers is encrypted during transit whenever
      possible.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      3. Authentication and Passwords
    </h2>

    <p>
      User passwords are never stored in plain text.
    </p>

    <p>
      Passwords are securely hashed before being stored
      in our systems.
    </p>

    <p>
      Users are responsible for maintaining the
      confidentiality of their login credentials.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      4. Account Protection
    </h2>

    <p>
      Authentication tokens and session mechanisms are
      used to help secure access to user accounts.
    </p>

    <p>
      Unauthorized access attempts may be monitored and
      blocked when detected.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      5. Data Storage
    </h2>

    <p>
      Access to platform data is restricted to authorized
      systems and administrators when necessary for
      operational purposes.
    </p>

    <p>
      We apply reasonable technical and organizational
      measures to help safeguard stored information.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      6. Third-Party Providers
    </h2>

    <p>
      BetSaaS may use trusted third-party providers for
      authentication, hosting, infrastructure, analytics,
      and other operational services.
    </p>

    <p>
      These providers are responsible for maintaining
      their own security controls and compliance measures.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      7. Security Incidents
    </h2>

    <p>
      If a security incident affecting user data is
      identified, BetSaaS will take reasonable steps
      to investigate, mitigate, and notify affected
      users when appropriate.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">
      8. Reporting Vulnerabilities
    </h2>

    <p>
      If you discover a security vulnerability, please
      report it responsibly so that it can be investigated
      and addressed.
    </p>

    <p className="font-medium">
      support@betsaas.com
    </p>
  </section>
</LegalPage>

);
}
