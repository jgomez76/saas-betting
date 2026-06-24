export const formatMatchDate = (
  date: string,
  lang: string
): string => {

  if (!date) {
    return "-";
  }

  const d = new Date(date + "Z");

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const tomorrow = new Date(today);

  tomorrow.setDate(
    today.getDate() + 1
  );

  const matchDay = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );

 const localeMap: Record<string, string> = {
    en: "en-GB",
    es: "es-ES",
    fr: "fr-FR",
    it: "it-IT",
  };

  const locale =
    localeMap[lang] ?? "en-GB";

  const time =
    d.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });

  // 🇪🇸 HOY / 🇬🇧 TODAY
  if (
    matchDay.getTime() ===
    today.getTime()
  ) {

    const todayLabel: Record<string, string> = {
      en: "Today",
      es: "Hoy",
      fr: "Aujourd'hui",
      it: "Oggi",
    };

    return `${
      todayLabel[lang] ?? "Today"
    } • ${time}`;
  }

  // 🇪🇸 MAÑANA / 🇬🇧 TOMORROW
  if (
    matchDay.getTime() ===
    tomorrow.getTime()
  ) {

    const tomorrowLabel: Record<string, string> = {
      en: "Tomorrow",
      es: "Mañana",
      fr: "Demain",
      it: "Domani",
    };

    return `${
      tomorrowLabel[lang] ?? "Tomorrow"
    } • ${time}`;
  }

  const day =
    d.toLocaleDateString(locale, {
      day: "2-digit",
    });

  const month =
    d.toLocaleDateString(locale, {
      month: "short",
    })
    .replace(".", "");

  return `${day} ${month} • ${time}`;
};