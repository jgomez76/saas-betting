import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="
        mt-12
        border-t
        border-[var(--border)]
        py-6
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-4
          text-sm
          text-[var(--muted)]
        "
      >
        <div>
          © {new Date().getFullYear()} BetSaaS. All rights reserved.
        </div>

        <div
          className="
            flex
            flex-wrap
            justify-center
            gap-4
          "
        >
          <Link
            href="/legal/privacy"
            className="hover:underline"
          >
            Privacy
          </Link>

          <Link
            href="/legal/cookies"
            className="hover:underline"
          >
            Cookies
          </Link>

          <Link
            href="/legal/security"
            className="hover:underline"
          >
            Security
          </Link>

          <Link
            href="/legal/terms"
            className="hover:underline"
          >
            Terms
          </Link>

          <Link
            href="/contact"
            className="hover:underline"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}