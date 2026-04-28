import { useEffect, useState, useCallback, useRef } from "react";
import { Bet } from "@/types/bet";

const getApiUrl = () => {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : `http://${window.location.hostname}:8000`;
};



export const useBets = (isLogged: boolean) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const apiUrl = getApiUrl();
  const hasSyncedRef = useRef(false);

  // ---------------------------------
  // 🔄 LOAD + SYNC
  // ---------------------------------
  const loadBets = useCallback(async () => {
    if (!apiUrl) return;

    const local: Bet[] = JSON.parse(localStorage.getItem("bets") || "[]");

    let backend: Bet[] = [];

    try {
      const res = await fetch(`${apiUrl}/bets`, {
        credentials: "include",
      });

      if (res.ok) {
        backend = await res.json();
      } else {
        throw new Error("Not authenticated");
      }
    } catch (err) {
      // 👤 no logueado o error → usar local
      setBets(local);
      return;
    }

    // =============================
    // 🔐 USUARIO LOGUEADO → SYNC
    // =============================
    // if (local.length > 0) {
    //   console.log("🔄 Sync local → backend:", local.length);

    //   let syncedAll = true;

    //   for (const b of local) {
    //     try {
    //       console.log("➡️ syncing bet:", b);

    //       let res = await fetch(`${apiUrl}/bets`, {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         credentials: "include",
    //         body: JSON.stringify(b),
    //       });

    //       // 🔥 retry si falla (timing cookie)
    //       if (!res.ok) {
    //         await new Promise((r) => setTimeout(r, 500));

    //         res = await fetch(`${apiUrl}/bets`, {
    //           method: "POST",
    //           headers: {
    //             "Content-Type": "application/json",
    //           },
    //           credentials: "include",
    //           body: JSON.stringify(b),
    //         });
    //       }

    //       if (!res.ok) {
    //         console.error("❌ Sync failed:", b);
    //         syncedAll = false;
    //       }

    //     } catch (err) {
    //       console.error("❌ Sync error:", err);
    //       syncedAll = false;
    //     }
    //   }

    //   // 🧹 SOLO limpiar si TODO OK
    //   if (syncedAll) {
    //     localStorage.removeItem("bets");

    //     // 🔁 recargar backend actualizado
    //     try {
    //       const res2 = await fetch(`${apiUrl}/bets`, {
    //         credentials: "include",
    //       });

    //       if (res2.ok) {
    //         backend = await res2.json();
    //       }
    //     } catch {}
    //   } else {
    //     console.warn("⚠️ Sync incompleto, se mantiene localStorage");
    //   }
    // }

    if (local.length > 0 && !hasSyncedRef.current) {
        console.log("🔄 Sync local → backend:", local.length);

        hasSyncedRef.current = true;

        let syncedAll = true;

        for (const b of local) {
            try {
            let res = await fetch(`${apiUrl}/bets`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(b),
            });

            if (!res.ok) {
                await new Promise((r) => setTimeout(r, 500));

                res = await fetch(`${apiUrl}/bets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(b),
                });
            }

            if (!res.ok) {
                syncedAll = false;
            }

            } catch {
            syncedAll = false;
            }
        }

        // if (syncedAll) {
        //     localStorage.removeItem("bets");
        // }
        if (syncedAll) {
            localStorage.removeItem("bets");

            // 🔥 CLAVE: recargar desde backend
            try {
                const res2 = await fetch(`${apiUrl}/bets`, {
                credentials: "include",
                });

                if (res2.ok) {
                backend = await res2.json();
                }
            } catch (err) {
                console.error("Error reloading bets:", err);
            }
        }
    }
    setBets(backend);

  }, [apiUrl]);

  // ---------------------------------
  // ➕ ADD BET
  // ---------------------------------
  const addBet = async (bet: Omit<Bet, "id">) => {
    try {
      const res = await fetch(`${apiUrl}/bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bet),
      });

      if (res.ok) {
        const saved = await res.json();
        setBets((prev) => [...prev, saved]);
        return;
      }

      throw new Error("Not logged");

    } catch {
      // 💾 fallback local
      const local: Bet[] = JSON.parse(localStorage.getItem("bets") || "[]");

      const newBet: Bet = {
        ...bet,
        id: Date.now(),
      };

      const updated = [...local, newBet];

      localStorage.setItem("bets", JSON.stringify(updated));
      setBets(updated);
    }
  };

  // ---------------------------------
  // ❌ DELETE BET
  // ---------------------------------
  const deleteBet = async (id: number) => {
    try {
      await fetch(`${apiUrl}/bets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}

    setBets((prev) => prev.filter((b) => b.id !== id));

    const local: Bet[] = JSON.parse(localStorage.getItem("bets") || "[]");
    const updated = local.filter((b) => b.id !== id);
    localStorage.setItem("bets", JSON.stringify(updated));
  };

  // ---------------------------------
  // 🚀 REACTIVO A LOGIN / LOGOUT
  // ---------------------------------
  useEffect(() => {
    if (isLogged === undefined) return;
    loadBets();
  }, [isLogged, loadBets]);

  return {
    bets,
    addBet,
    deleteBet,
    reload: loadBets,
  };
};