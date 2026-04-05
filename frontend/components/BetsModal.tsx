"use client";

type Bet = {
  id: string;
  match: string;
  market: string;
  selection: string;
  odd?: number;
  bookmaker?: string;
  value?: number | null;
  date: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  bets: Bet[];
};

export default function BetsModal({ open, onClose, bets }: Props) {
  if (!open) return null;

  const totalBets = bets.length;
  const stake = totalBets * 10; // simulamos 10€ por apuesta

  const potentialReturn = bets.reduce((acc, b) => {
    if (!b.odd) return acc;
    return acc + b.odd * 10;
  }, 0);

  const profit = potentialReturn - stake;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-[90%] md:w-[600px] p-6 rounded-xl text-white">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">💰 Mis apuestas</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-[#2a2a2a] p-2 rounded">
            <p className="text-xs">Apuestas</p>
            <p className="font-bold">{totalBets}</p>
          </div>

          <div className="bg-[#2a2a2a] p-2 rounded">
            <p className="text-xs">Stake</p>
            <p className="font-bold">{stake}€</p>
          </div>

          <div className="bg-[#2a2a2a] p-2 rounded">
            <p className="text-xs">Profit</p>
            <p
              className={`font-bold ${
                profit > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {profit.toFixed(2)}€
            </p>
          </div>
        </div>

        {/* LISTADO */}
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {bets.map((b) => (
            <div key={b.id} className="bg-[#2a2a2a] p-3 rounded">
              <p className="font-semibold">{b.match}</p>
              <p className="text-sm text-gray-400">
                {b.market} - {b.selection}
              </p>
              <p className="text-sm">
                Cuota: <span className="font-bold">{b.odd}</span>
              </p>
              {b.value !== null && b.value !== undefined && (
                <p className="text-xs text-green-400">
                  {((b.value ?? 0) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}