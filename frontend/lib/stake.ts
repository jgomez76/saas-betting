export type StakeRule = {
  level: 1 | 2 | 3;
  amount: number;
  minOdd: number;
  maxOdd: number;
};

/* =========================
   DEFAULT
========================= */

export const DEFAULT_STAKES: StakeRule[] = [
  { level: 1, amount: 10, minOdd: 2.5, maxOdd: 100 },
  { level: 2, amount: 20, minOdd: 1.7, maxOdd: 2.5 },
  { level: 3, amount: 30, minOdd: 1.01, maxOdd: 1.7 },
];

/* =========================
   GET RULES
========================= */

export const getStakeRules = (): StakeRule[] => {
  if (typeof window === "undefined") return DEFAULT_STAKES;

  try {
    const saved = localStorage.getItem("stake_rules");
    return saved ? JSON.parse(saved) : DEFAULT_STAKES;
  } catch {
    return DEFAULT_STAKES;
  }
};

/* =========================
   GET STAKE FROM ODD
========================= */

export const getStakeFromOdd = (odd: number): StakeRule => {
  const rules = getStakeRules();

  return (
    rules.find((r) => odd > r.minOdd && odd <= r.maxOdd) ||
    rules[0]
  );
};