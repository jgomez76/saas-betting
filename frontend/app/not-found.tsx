import Link from "next/link";
import { cookies } from "next/headers";
import { translations } from "@/lib/i18n/translations";

export default async function NotFound() {

  const cookieStore = await cookies();

  const lang =
    cookieStore.get("lang")?.value ?? "en";

  const t =
    translations[
      lang as keyof typeof translations
    ] ?? translations.en;

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
      "
    >
      <div
        className="
          max-w-lg
          text-center
        "
      >

        <div className="text-6xl mb-6">
          ⚽
        </div>

        <h1
          className="
            text-6xl
            font-bold
            mb-4
          "
        >
          404
        </h1>

        <h2
          className="
            text-2xl
            font-semibold
            mb-4
          "
        >
          {t.pageNotFound}
        </h2>

        <p
          className="
            opacity-70
            mb-8
          "
        >
          {t.pageNotFoundDescription}
        </p>

        <Link
          href="/"
          className="
            inline-flex
            items-center
            justify-center
            px-6
            py-3
            rounded-xl
            bg-[var(--primary)]
            text-white
            font-medium
            hover:opacity-90
            transition
          "
        >
          {t.goHome}
        </Link>

      </div>
    </div>
  );
}