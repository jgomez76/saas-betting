"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Bet = {
  match: string;
  market: string;
  selection: string;
  odd: number;
  bookmaker: string;
  value: number;
};

export default function TopValueModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setInitialLoading(true);

      const res = await fetch(`${API_URL}/top-value`);
      const data = await res.json();

      setBets(data);
      setSelected([]);
      setSelectAll(false);

      setInitialLoading(false);
    };

    loadData();
  }, [open]);

  if (!open) return null;

  // -----------------------
  // SELECT
  // -----------------------
  const toggleSelect = (index: number) => {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll((prev) => {
      if (prev) setSelected([]);
      else setSelected(bets.map((_, i) => i));
      return !prev;
    });
  };

  // -----------------------
  // ACTION
  // -----------------------
  const handleAction = async (action: string) => {
    if (selected.length === 0) {
      alert("Selecciona al menos una apuesta");
      return;
    }

    setMessage("Procesando...");

    const ids = selected.join(",");

    const res = await fetch(
      `${API_URL}/top-value?action=${action}&ids=${ids}`
    );

    if (action === "csv" || action === "excel") {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = action === "csv" ? "top_bets.csv" : "top_bets.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);
      setMessage("✅ Descargado");
    } else {
      setMessage("✅ Enviado");
    }

    setTimeout(() => setMessage(null), 2000);
  };

  const btnClass =
    "bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold";

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="w-[60%] h-[70%] bg-slate-900 text-white rounded-2xl p-6 overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">
            🔥 Top Value Bets
          </h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* LOADING */}
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center h-[70%]">
            <p className="mb-4 text-lg">Cargando apuestas top...</p>
            <div className="w-64 h-2 bg-gray-700 rounded">
              <div className="h-2 bg-cyan-400 animate-pulse w-full rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* MENSAJE */}
            {message && (
              <div className="mb-4 text-center text-lg">{message}</div>
            )}

            {/* BOTONES */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <button onClick={() => handleAction("csv")} className={btnClass}>CSV</button>
              <button onClick={() => handleAction("excel")} className={btnClass}>Excel</button>
              <button onClick={() => handleAction("telegram")} className={btnClass}>Telegram</button>
              <button onClick={() => handleAction("email")} className={btnClass}>Email</button>
              <button onClick={() => handleAction("whatsapp")} className={btnClass}>WhatsApp</button>
            </div>

            {/* SELECT */}
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
              >
                {selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
              </button>

              <span className="text-gray-400">
                {selected.length} seleccionadas
              </span>
            </div>

            {/* TABLA */}
            <div className="hidden lg:block">
              <table className="w-full border border-gray-700 text-base">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="p-3 border">✔</th>
                    <th className="p-3 border">Match</th>
                    <th className="p-3 border">Market</th>
                    <th className="p-3 border">Pick</th>
                    <th className="p-3 border">Odd</th>
                    <th className="p-3 border">Book</th>
                    <th className="p-3 border">Value</th>
                  </tr>
                </thead>

                <tbody>
                  {bets.map((b, i) => {
                    const [home, away] = b.match.split(" vs ");

                    return (
                      <tr
                        key={i}
                        className="text-center border hover:bg-slate-800"
                      >
                        <td className="border">
                          <input
                            type="checkbox"
                            checked={selected.includes(i)}
                            onChange={() => toggleSelect(i)}
                          />
                        </td>

                        {/* MATCH CENTRADO */}
                        <td className="border p-3">
                          <div
                            className="grid"
                            style={{ gridTemplateColumns: "45% 10% 45%" }}
                          >
                            <span className="text-center pr-2">{home}</span>
                            <span className="text-center font-bold">vs</span>
                            <span className="text-center pl-2">{away}</span>
                          </div>
                        </td>

                        <td className="border">{b.market}</td>
                        <td className="border font-semibold">{b.selection}</td>
                        <td className="border text-lg font-bold">{b.odd}</td>
                        <td className="border text-gray-400">{b.bookmaker}</td>
                        <td className="border text-green-400 font-bold">
                          +{b.value}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* CARDS MOVIL */}
            {/* <div className="lg:hidden flex flex-col gap-3"> */}
            <div className="lg:hidden grid sm:grid-cols-2 gap-3">
              {bets.map((b, i) => {
                const [home, away] = b.match.split(" vs ");

                return (
                  <div
                    key={i}
                    className="bg-slate-800 p-4 rounded-xl border border-gray-700"
                  >
                    {/* SELECT + VALUE */}
                    <div className="flex justify-between items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleSelect(i)}
                      />
                      <span className="text-green-400 font-bold text-lg">
                        +{b.value}%
                      </span>
                    </div>

                    {/* MATCH */}
                    <div
                      className="grid text-sm mb-2"
                      style={{ gridTemplateColumns: "45% 10% 45%" }}
                    >
                      <span className="text-right font-semibold">{home}</span>
                      <span className="text-center font-bold">vs</span>
                      <span className="text-left font-semibold">{away}</span>
                    </div>

                    {/* INFO */}
                    <div className="text-sm text-gray-300 space-y-1">
                      <p><strong>Market:</strong> {b.market}</p>
                      <p><strong>Pick:</strong> {b.selection}</p>
                      <p><strong>Odd:</strong> {b.odd}</p>
                      <p><strong>Book:</strong> {b.bookmaker}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}