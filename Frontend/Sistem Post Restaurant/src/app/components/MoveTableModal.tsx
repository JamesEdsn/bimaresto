import { useState } from "react";
import { ArrowRight, X, Users, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { TableInfo } from "../data/menuData";

interface MoveTableModalProps {
  currentTable: TableInfo;
  allTables: TableInfo[];
  onMove: (fromId: number, toId: number) => void;
  onClose: () => void;
}

export function MoveTableModal({ currentTable, allTables, onMove, onClose }: MoveTableModalProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const emptyTables = allTables.filter((t) => t.id !== currentTable.id && t.orders.length === 0);

  const handleConfirm = () => {
    if (!selectedTable) return;
    onMove(currentTable.id, selectedTable);
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
          <h3 className="text-gray-900">Pindah Meja Berhasil!</h3>
          <p className="text-gray-500 text-sm mt-2">
            Pesanan dari <span className="text-orange-600">{currentTable.name}</span> dipindahkan ke{" "}
            <span className="text-orange-600">{dest?.name}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Pindah Meja</h3>
              <p className="text-gray-400 text-xs">Pindahkan semua pesanan {currentTable.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">Pilih meja tujuan (hanya meja kosong):</p>
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
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-600 hover:border-purple-200"
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

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Pindahkan
          </button>
        </div>
      </div>
    </div>
  );
}
