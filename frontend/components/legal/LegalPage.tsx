import { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { translations } from "@/lib/i18n/translations";

type Props = {
  title: string;
  updated: string;
  locale: string;
  intro?: string;
  children: ReactNode;
};

export default async function LegalPage({
  title,
  updated,
  children,
  locale,
  intro
}: Props) {

  const cookieStore = await cookies();

  const lang =
    cookieStore.get("lang")?.value ?? "en";

  const t =
    translations[
      lang as keyof typeof translations
    ] ?? translations.en;
  
  const formattedDate = new Intl.DateTimeFormat(
    locale,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(updated));

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      <div className="max-w-4xl mx-auto px-6 py-12">

        <Link
          href="/"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            opacity-70
            hover:opacity-100
            mb-8
            transition
          "
        >
          ← {t.backToBetSaas}
        </Link>

        <div
          className="
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-2xl
            p-8
            shadow-sm
          "
        >

          <h1 className="text-3xl font-bold mb-2">
            {title}
          </h1>

          <p className="text-sm opacity-60 mb-8">
            {t.lastUpdated}: {formattedDate}
          </p>

          {intro && (
            <p
              className="
                mb-8
                text-base
                leading-7
                text-[var(--muted)]
                border-l-4
                border-[var(--accent)]
                pl-4
                italic
              "
            >
              {intro}
            </p>
          )}

          <div className="space-y-6 leading-7">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}