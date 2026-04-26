"use client";

import { useState } from "react";
import { DEFAULT_STAKES, getStakeRules, StakeRule } from "@/lib/stake";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function StakeSettings() {
    const { t } = useLanguage();
    const [rules, setRules] = useState<StakeRule[]>(() => getStakeRules());
    const [saved, setSaved] = useState(false);

    // UPDATE RULE
    const updateRule = (index: number, field: keyof StakeRule, value: number) => {
        const updated = [...rules];
        updated[index] = {
        ...updated[index],
        [field]: value,
        };
        setRules(updated);
    };

    // SAVE
    const save = () => {
    localStorage.setItem("stake_rules", JSON.stringify(rules));
    setSaved(true);

    setTimeout(() => setSaved(false), 2000);
    };

    // RESET
    const reset = () => {
        localStorage.removeItem("stake_rules");
        setRules(DEFAULT_STAKES);
    };

    return (
        
        <div className="space-y-4">

            <h2 className="font-bold text-sm text-[var(--muted)] uppercase">💰 {t.stakeSettings}</h2>

            <p className="text-sm text-[var(--muted)]">
                {t.stakeDescription}
            </p>

            {rules.map((r, i) => (
                <div
                    key={r.level}
                    className="bg-[var(--card)] p-4 rounded border border-[var(--border)]"
                    >
                    <p className="font-semibold mb-1">
                        Stake {r.level}
                    </p>

                    <p className="text-xs text-[var(--muted)] mb-2">
                        {r.level === 1 && t.highOddsHighRisk}
                        {r.level === 2 && t.mediumOdds}
                        {r.level === 3 && t.lowOddsSafe}
                    </p>

                    <div className="space-y-3 text-sm">

                    {/* AMOUNT */}
                    <div>
                        <label className="text-xs text-[var(--muted)]">
                        {t.amount} (€)
                        </label>
                        <input
                        type="number"
                        value={r.amount}
                        onChange={(e) =>
                            updateRule(i, "amount", Number(e.target.value))
                        }
                        className="w-full p-2 rounded bg-[var(--bg)] mt-1"
                        />
                    </div>

                    {/* ODDS RANGE */}
                    <div className="grid grid-cols-2 gap-2">
                        
                        <div>
                        <label className="text-xs text-[var(--muted)]">
                            {t.minOdds}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={r.minOdd}
                            onChange={(e) =>
                            updateRule(i, "minOdd", Number(e.target.value))
                            }
                            className="w-full p-2 rounded bg-[var(--bg)] mt-1"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-[var(--muted)]">
                            {t.maxOdds}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={r.maxOdd}
                            onChange={(e) =>
                            updateRule(i, "maxOdd", Number(e.target.value))
                            }
                            className="w-full p-2 rounded bg-[var(--bg)] mt-1"
                        />
                        </div>

                    </div>
                    </div>
                </div>
            ))}
            <span className="text-xs text-[var(--muted)]">
                {t.autoApplyStake}
            </span>



            {/* ACTIONS */}
            <div className="flex gap-3">
                <button
                onClick={save}
                className="flex-1 bg-[var(--accent)] text-black py-2 rounded font-semibold"
                >
                {t.save}
                </button>

                <button
                onClick={reset}
                className="flex-1 bg-[var(--muted)] py-2 rounded"
                >
                {t.reset}
                </button>

                {saved && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
                    ✅ {t.settingsSaved}
                    </div>
                )}
            </div>
        </div>
    );
}