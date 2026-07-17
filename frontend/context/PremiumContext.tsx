"use client";

import {
    createContext,
    useContext,
    useState,
} from "react";

import PremiumModal from "@/components/premium/PremiumModal";
import { upgradeToPremium } from "@/lib/stripe";

type PremiumContextType = {
    open: boolean;
    showPremium: () => void;
    hidePremium: () => void;
};

const PremiumContext =
    createContext<PremiumContextType | null>(null);

export function PremiumProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [open, setOpen] = useState(false);

    return (

        <PremiumContext.Provider
            value={{
                open,
                showPremium: () => setOpen(true),
                hidePremium: () => setOpen(false),
            }}
        >

            {children}

            <PremiumModal
                open={open}
                onClose={() => setOpen(false)}
                onUpgrade={() => upgradeToPremium(
                    typeof window !== "undefined"
                        ? window.location.hostname === "localhost"
                            ? "http://localhost:8000"
                            : `http://${window.location.hostname}:8000`
                        : ""
                )}
            />

        </PremiumContext.Provider>

    );

}

export function usePremium() {

    const ctx = useContext(PremiumContext);

    if (!ctx)
        throw new Error(
            "usePremium must be used inside PremiumProvider"
        );

    return ctx;

}