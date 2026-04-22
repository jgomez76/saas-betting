"use client";

import { createContext, useContext, useState } from "react";

type Plan = "free" | "premium";

type SubscriptionContextType = {
  plan: Plan;
  setPlan: (plan: Plan) => void;
  isPremium: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>("free");

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        setPlan,
        isPremium: plan === "premium",
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used inside provider");
  return ctx;
}