import { useState } from "react";
import { SplitSquareHorizontal, X, Users, UtensilsCrossed, CheckCircle2, Minus, Plus } from "lucide-react";
import { TableInfo, OrderItem } from "../data/menuData";

interface SplitTableModalProps {
  currentTable: TableInfo;
  allTables: TableInfo[];
  onSplitTable: (fromId: number, toId: number, items: OrderItem[]) => void;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export function SplitTableModal({ currentTable, allTables, onSplitTable, onClose }: SplitTableModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [splitItems, setSplitItems] = useState<Record<string, number>>({});
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const emptyTables = allTables.filter((t) => t.id !== currentTable.id && t.orders.length === 0);

  const toggleItem = (id: string, delta: number) => {
    const current = splitItems[id] || 0;
    const maxQty = currentTable.orders.find((o) => o.id === id)?.quantity || 0;
    const newQty = Math.max(0, Math.min(maxQty, current + delta));
    if (newQty === 0) {
      const next = { ...splitItems };
      delete next[id];
      setSplitItems(next);
    } else {
      setSplitItems({ ...splitItems, [id]: newQty });
    }
  };

  const selectedCount = Object.values(splitItems).reduce((s, v) => s + v, 0);
  const selectedTotal = Object.entries(splitItems).reduce((s, [id, qty]) => {
    const item = currentTable.orders.find((o) => o.id === id);
    return s + (item ? item.price * qty : 0);
  }, 0);

  const handleConfirm = () => {
    if (!selectedTable || selectedCount === 0) return;
    const items: OrderItem[] = Object.entries(splitItems)
      .map(([id, qty]) => {
        const item = currentTable.orders.find((o) => o.id === id);
        return item ? { ...item, quantity: qty } : null;
      })
      .filter(Boolean) as OrderItem[];
    onSplitTable(currentTable.id, selectedTable, items);
    setConfirmed(true);
    setTimeout(() => onClose(), 1200);
  };

  if (confirmed) {
    const dest = allTables.find((t) => t.id === selectedTable);
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-gray-900">Meja Berhasil Dipisah!</h3>
          <p className="text-gray-500 text-sm mt-2">
            {selectedCount} item dipindah ke <span className="text-orange-600">{dest?.name}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <SplitSquareHorizontal className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Pisah Meja</h3>
              <p className="text-gray-400 text-xs">
                {step === 1 ? "Langkah 1: Pilih item yang akan dipindah" : "Langkah 2: Pilih meja tujuan"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-4 flex gap-2 flex-shrink-0">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-teal-500" : "bg-gray-200"}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-teal-500" : "bg-gray-200"}`} />
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Pilih item & jumlah yang akan dipindah ke meja lain:</p>
              {currentTable.orders.map((o) => {
                const splitQty = splitItems[o.id] || 0;
                return (
                  <div
                    key={o.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                      splitQty > 0 ? "border-teal-300 bg-teal-50/50" : "border-gray-200"
                    }`}
                  >
                    <img src={o.image} alt={o.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{o.name}</p>
                      <p className="text-xs text-gray-400">Stok: {o.quantity} &bull; {formatPrice(o.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleItem(o.id, -1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-red-300 transition"
                      >
                        <Minus className="w-3 h-3 text-gray-500" />
                      </button>
                      <span className={`w-6 text-center text-sm ${splitQty > 0 ? "text-teal-700" : "text-gray-400"}`}>
                        {splitQty}
                      </span>
                      <button
                        onClick={() => toggleItem(o.id, 1)}
                        disabled={splitQty >= o.quantity}
                        className="w-7 h-7 rounded-lg bg-teal-500 disabled:bg-gray-200 flex items-center justify-center hover:bg-teal-600 transition"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedCount > 0 && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-teal-700">{selectedCount} item dipilih</span>
                  <span className="text-sm text-teal-800">{formatPrice(selectedTotal)}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">Pilih meja tujuan:</p>
              {emptyTables.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Tidak ada meja kosong tersedia</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {emptyTables.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTable(t.id)}
                      className={`p-3 rounded-xl border-2 transition text-center ${
                        selectedTable === t.id
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 text-gray-600 hover:border-teal-200"
                      }`}
                    >
                      <UtensilsCrossed className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs">{t.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {t.seats}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(1))}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            {step === 1 ? "Batal" : "Kembali"}
          </button>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={selectedCount === 0}
              className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm"
            >
              Lanjut ({selectedCount} item)
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!selectedTable}
              className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm flex items-center justify-center gap-2"
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Pisahkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
