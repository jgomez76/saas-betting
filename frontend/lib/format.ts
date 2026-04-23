export const formatBetLabel = (market: string, selection: string) => {
  if (market === "1X2") {
    return selection.toUpperCase();
  }

  if (market === "OU25") {
    return selection === "over" ? "Over 2.5" : "Under 2.5";
  }

  if (market === "OU35") {
    return selection === "over" ? "Over 3.5" : "Under 3.5";
  }

  if (market === "BTTS") {
    return selection === "yes" ? "BTTS Sí" : "BTTS No";
  }

  return `${market} - ${selection}`;
};