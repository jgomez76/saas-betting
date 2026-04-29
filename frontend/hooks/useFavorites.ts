import { useEffect, useState, useCallback, useRef } from "react";

const getApiUrl = () => {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : `http://${window.location.hostname}:8000`;
};

export const useFavorites = (isLogged: boolean) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const apiUrl = getApiUrl();
  const hasSyncedRef = useRef(false);

  // ---------------------------------
  // 🔄 LOAD + SYNC
  // ---------------------------------
  const loadFavorites = useCallback(async () => {
    if (!apiUrl) return;

    const local: number[] = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    let backend: number[] = [];

    try {
      const res = await fetch(`${apiUrl}/favorites`, {
        credentials: "include",
      });

      if (res.ok) {
        backend = await res.json();
      } else {
        throw new Error("Not authenticated");
      }
    } catch {
      // 👤 no logueado → usar local
      setFavorites(local);
      return;
    }

    // =============================
    // 🔐 USUARIO LOGUEADO → SYNC
    // =============================
    if (local.length > 0 && !hasSyncedRef.current) {
      console.log("⭐ Sync local → backend:", local.length);

      hasSyncedRef.current = true;

      let syncedAll = true;

      for (const f of local) {
        try {
          let res = await fetch(`${apiUrl}/favorites`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ fixture_id: f }),
          });

          // retry (igual que bets)
          if (!res.ok) {
            await new Promise((r) => setTimeout(r, 500));

            res = await fetch(`${apiUrl}/favorites`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ fixture_id: f }),
            });
          }

          if (!res.ok) {
            syncedAll = false;
          }

        } catch {
          syncedAll = false;
        }
      }

      // 🧹 SOLO limpiar si TODO OK
      if (syncedAll) {
        localStorage.removeItem("favorites");

        // 🔁 recargar backend actualizado
        try {
          const res2 = await fetch(`${apiUrl}/favorites`, {
            credentials: "include",
          });

          if (res2.ok) {
            backend = await res2.json();
          }
        } catch {}
      } else {
        console.warn("⚠️ Sync favoritos incompleto");
      }
    }

    setFavorites(backend);

  }, [apiUrl]);

  // ---------------------------------
  // ➕ ADD
  // ---------------------------------
  const addFavorite = async (fixture_id: number) => {
    try {
      const res = await fetch(`${apiUrl}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ fixture_id }),
      });

      if (res.ok) {
        setFavorites((prev) =>
          prev.includes(fixture_id) ? prev : [...prev, fixture_id]
        );
        return;
      }

      throw new Error("Not logged");

    } catch {
      // 💾 fallback local
      const local: number[] = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );

      const updated = local.includes(fixture_id)
        ? local
        : [...local, fixture_id];

      localStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated);
    }
  };

  // ---------------------------------
  // ❌ REMOVE
  // ---------------------------------
  const removeFavorite = async (fixture_id: number) => {
    try {
      await fetch(`${apiUrl}/favorites/${fixture_id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}

    // actualizar UI siempre
    setFavorites((prev) => prev.filter((f) => f !== fixture_id));

    const local: number[] = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    const updated = local.filter((f) => f !== fixture_id);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // ---------------------------------
  // 🔄 REACTIVO LOGIN / LOGOUT
  // ---------------------------------
  useEffect(() => {
    if (isLogged === undefined) return;

    // 🔥 reset estado (CLAVE)
    setFavorites([]);
    hasSyncedRef.current = false;

    loadFavorites();

  }, [isLogged, loadFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    reload: loadFavorites,
  };
};