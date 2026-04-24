import { Translation } from "./i18n/translations";

export const formatBetLabel = (
  market: string,
  selection: string,
  t: Translation
) => {
  // 1X2
  if (market === "1X2") {
    if (selection === "home") return t.home;
    if (selection === "draw") return t.draw;
    if (selection === "away") return t.away;
  }

  // OU25
  if (market === "OU25") {
    if (selection === "over") return t.over25;
    if (selection === "under") return t.under25;
  }

  // OU35
  if (market === "OU35") {
    if (selection === "over") return t.over35;
    if (selection === "under") return t.under35;
  }

  // BTTS
  if (market === "BTTS") {
    if (selection === "yes") return t.bttsYes;
    if (selection === "no") return t.bttsNo;
  }

  return `${market} ${selection}`;
};