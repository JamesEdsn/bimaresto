import { useState } from "react";
import { Combine, X, Users, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { TableInfo, OrderItem } from "../../data/posMenuData";

interface MergeTableModalProps {
  currentTable: TableInfo;
  allTables: TableInfo[];
  onMerge: (targetId: number, sourceId: number) => void;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export function MergeTableModal({ currentTable, allTables, onMerge, onClose }: MergeTableModalProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const occupiedTables = allTables.filter((t) => t.id !== currentTable.id && t.orders.length > 0);

  const selectedInfo = allTables.find((t) => t.id === selectedTable);

  const handleConfirm = () => {
    if (!selectedTable) return;
    onMerge(currentTable.id, selectedTable);
    setConfirmed(true);
    setTimeout(() => onClose(), 1200);
  };

  if (confirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-gray-900">Meja Berhasil Digabung!</h3>
          <p className="text-gray-500 text-sm mt-2">
            Pesanan <span className="text-orange-600">{selectedInfo?.name}</span> digabung ke{" "}
            <span className="text-orange-600">{currentTable.name}</span>
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
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Combine className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Gabung Meja</h3>
              <p className="text-gray-400 text-xs">Gabungkan pesanan meja lain ke {currentTable.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">Pilih meja yang akan digabung (meja yang memiliki pesanan):</p>
          {occupiedTables.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tidak ada meja lain yang memiliki pesanan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {occupiedTables.map((t) => {
                const tTotal = t.orders.reduce((s: number, o: OrderItem) => s + o.price * o.quantity, 0);
                const tItems = t.orders.reduce((s: number, o: OrderItem) => s + o.quantity, 0);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                      selectedTable === t.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTable === t.id ? "bg-indigo-500" : "bg-orange-500"}`}>
                      <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{tItems} item</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-800">{formatPrice(tTotal)}</p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-end gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {t.seats} kursi
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedInfo && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <p className="text-xs text-indigo-600 mb-2">Preview gabungan:</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>{currentTable.name}</span>
                <span className="text-indigo-400">+</span>
                <span>{selectedInfo.name}</span>
                <span className="text-indigo-400">=</span>
                <span className="text-indigo-700">
                  {currentTable.orders.reduce((s: number, o: OrderItem) => s + o.quantity, 0) + selectedInfo.orders.reduce((s: number, o: OrderItem) => s + o.quantity, 0)} item
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm flex items-center justify-center gap-2"
          >
            <Combine className="w-4 h-4" />
            Gabung
          </button>
        </div>
      </div>
    </div>
  );
}
