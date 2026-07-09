import { cookies } from "next/headers";

export const SUPPORTED_LANGS = [
  "en",
  "es",
  "fr",
  "it",
] as const;

export type Lang =
  (typeof SUPPORTED_LANGS)[number];

export async function getServerLanguage(): Promise<Lang> {

  const cookieStore = await cookies();

  const lang =
    cookieStore.get("lang")?.value;

  if (
    SUPPORTED_LANGS.includes(lang as Lang)
  ) {
    return lang as Lang;
  }

  return "en";
}
