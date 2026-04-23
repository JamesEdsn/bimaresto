import { useState } from "react";
import { Ban, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { TableInfo } from "../data/menuData";

interface CancelOrderModalProps {
  table: TableInfo;
  onCancelItems: (tableId: number, itemIds: string[], reason: string) => void;
  onCancelAll: (tableId: number, reason: string) => void;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

const reasons = [
  "Salah pesan",
  "Pelanggan berubah pikiran",
  "Item habis",
  "Waktu tunggu terlalu lama",
  "Lainnya",
];

export function CancelOrderModal({ table, onCancelItems, onCancelAll, onClose }: CancelOrderModalProps) {
  const [mode, setMode] = useState<"choose" | "select" | "confirm">("choose");
  const [cancelType, setCancelType] = useState<"all" | "partial">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const orders = table.orders;
  const effectiveReason = reason === "Lainnya" ? customReason : reason;

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const selectedTotal = orders
    .filter((o) => selectedItems.has(o.id))
    .reduce((s, o) => s + o.price * o.quantity, 0);

  const handleConfirm = () => {
    if (!effectiveReason) return;
    if (cancelType === "all") {
      onCancelAll(table.id, effectiveReason);
    } else {
      onCancelItems(table.id, Array.from(selectedItems), effectiveReason);
    }
    setConfirmed(true);
    setTimeout(() => onClose(), 1500);
  };

  if (confirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-gray-900">Pesanan Dibatalkan</h3>
          <p className="text-gray-500 text-sm mt-2">
            {cancelType === "all"
              ? `Semua pesanan ${table.name} dibatalkan`
              : `${selectedItems.size} item dibatalkan`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Alasan: {effectiveReason}</p>
        </div>
      </div>
    );
  }

  // ======== CONFIRM STEP ========
  if (mode === "confirm") {
    const cancelledItems = cancelType === "all" ? orders : orders.filter((o) => selectedItems.has(o.id));
    const cancelTotal = cancelledItems.reduce((s, o) => s + o.price * o.quantity, 0);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Konfirmasi Pembatalan</h3>
                <p className="text-gray-400 text-xs">{table.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Tindakan ini tidak dapat dibatalkan. Pastikan data sudah benar.</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-700">Item yang dibatalkan:</p>
              {cancelledItems.map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img src={o.image} alt={o.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{o.name}</p>
                    <p className="text-xs text-gray-400">{o.quantity}x {formatPrice(o.price)}</p>
                  </div>
                  <span className="text-sm text-red-600">{formatPrice(o.price * o.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-red-50 rounded-xl p-3">
              <span className="text-sm text-red-700">Total Dibatalkan</span>
              <span className="text-sm text-red-800">{formatPrice(cancelTotal)}</span>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm text-gray-700 mb-2">Alasan Pembatalan:</p>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition ${
                      reason === r
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-red-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {reason === "Lainnya" && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomReason(e.target.value)}
                  placeholder="Tulis alasan..."
                  className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 focus:border-red-400 focus:outline-none text-sm"
                />
              )}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
            <button
              onClick={() => setMode(cancelType === "all" ? "choose" : "select")}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              Kembali
            </button>
            <button
              onClick={handleConfirm}
              disabled={!effectiveReason}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Batalkan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======== SELECT ITEMS STEP ========
  if (mode === "select") {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Pilih Item</h3>
                <p className="text-gray-400 text-xs">Pilih item yang akan dibatalkan</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => toggleItem(o.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  selectedItems.has(o.id) ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-200"
                }`}
              >
                <img src={o.image} alt={o.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{o.name}</p>
                  <p className="text-xs text-gray-400">{o.quantity}x &bull; {formatPrice(o.price)}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  selectedItems.has(o.id) ? "border-red-500 bg-red-500" : "border-gray-300"
                }`}>
                  {selectedItems.has(o.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
            {selectedItems.size > 0 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <span className="text-sm text-red-700">{selectedItems.size} item dipilih</span>
                <span className="text-sm text-red-800">{formatPrice(selectedTotal)}</span>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
            <button onClick={() => setMode("choose")} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
              Kembali
            </button>
            <button
              onClick={() => setMode("confirm")}
              disabled={selectedItems.size === 0}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition text-sm"
            >
              Lanjut ({selectedItems.size})
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======== CHOOSE STEP ========
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Cancel Order</h3>
              <p className="text-gray-400 text-xs">{table.name} &bull; {orders.reduce((s, o) => s + o.quantity, 0)} item</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600">Pilih jenis pembatalan:</p>
          <button
            onClick={() => {
              setCancelType("all");
              setMode("confirm");
            }}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition text-left"
          >
            <p className="text-sm text-gray-800">Batalkan Semua Pesanan</p>
            <p className="text-xs text-gray-400 mt-0.5">Hapus semua item dari {table.name}</p>
          </button>
          <button
            onClick={() => {
              setCancelType("partial");
              setMode("select");
            }}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition text-left"
          >
            <p className="text-sm text-gray-800">Batalkan Item Tertentu</p>
            <p className="text-xs text-gray-400 mt-0.5">Pilih item tertentu yang ingin dibatalkan</p>
          </button>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
