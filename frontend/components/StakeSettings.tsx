"use client";

import { useState } from "react";
import { DEFAULT_STAKES, getStakeRules, StakeRule } from "@/lib/stake";

export default function StakeSettings() {
//   const [rules, setRules] = useState<StakeRule[]>([]);

//   // LOAD
//   useEffect(() => {
//     setRules(getStakeRules());
//   }, []);
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

            <h2 className="font-bold text-sm text-[var(--muted)] uppercase">💰 Stake Settings</h2>

            <p className="text-sm text-[var(--muted)]">
                Define cuánto apostar según la cuota. 
                Cuotas altas → menor stake, cuotas bajas → mayor stake.
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
                        {r.level === 1 && "Cuotas altas (más riesgo)"}
                        {r.level === 2 && "Cuotas medias"}
                        {r.level === 3 && "Cuotas bajas (más seguro)"}
                    </p>

                    <div className="space-y-3 text-sm">

                    {/* AMOUNT */}
                    <div>
                        <label className="text-xs text-[var(--muted)]">
                        Cantidad (€)
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
                            Cuota mínima
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
                            Cuota máxima
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
                Se aplicará automáticamente al apostar
            </span>



            {/* ACTIONS */}
            <div className="flex gap-3">
                <button
                onClick={save}
                className="flex-1 bg-[var(--accent)] text-black py-2 rounded font-semibold"
                >
                Guardar
                </button>

                <button
                onClick={reset}
                className="flex-1 bg-[var(--muted)] py-2 rounded"
                >
                Reset
                </button>

                {saved && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
                    ✅ Configuración guardada
                    </div>
                )}
            </div>
        </div>
    );
}