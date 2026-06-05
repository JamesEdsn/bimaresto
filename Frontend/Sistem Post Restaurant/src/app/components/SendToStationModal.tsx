import { useState, useMemo } from "react";
import {
  X,
  Send,
  Printer,
  CheckCircle2,
  ChefHat,
  Coffee,
  Cookie,
  IceCreamCone,
  Clock,
  AlertCircle,
} from "lucide-react";
import { TableInfo, stations, StationOrder } from "../data/menuData";

const stationIcons: Record<string, React.ElementType> = {
  kitchen: ChefHat,
  beverage: Coffee,
  snack: Cookie,
  dessert: IceCreamCone,
};

interface SendToStationModalProps {
  table: TableInfo;
  onSendToStation: (tableId: number, stationOrders: StationOrder[]) => void;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export function SendToStationModal({ table, onSendToStation, onClose }: SendToStationModalProps) {
  const [sentStations, setSentStations] = useState<Set<string>>(new Set());
  const [allSent, setAllSent] = useState(false);
  const [printingStation, setPrintingStation] = useState<string | null>(null);

  // Group unsent items by station
  const stationGroups = useMemo(() => {
    const groups: Record<string, { stationId: string; items: typeof table.orders }> = {};
    table.orders.forEach((order) => {
      const sentQty = table.sentItems[order.id] || 0;
      const unsentQty = order.quantity - sentQty;
      if (unsentQty <= 0) return;

      const stationId = order.station;
      if (!groups[stationId]) {
        groups[stationId] = { stationId, items: [] };
      }
      groups[stationId].items.push({ ...order, quantity: unsentQty });
    });
    return Object.values(groups);
  }, [table]);

  const hasUnsent = stationGroups.length > 0;

  // Already-sent items for display
  const sentGroups = useMemo(() => {
    const groups: Record<string, typeof table.orders> = {};
    table.orders.forEach((order) => {
      const sentQty = table.sentItems[order.id] || 0;
      if (sentQty <= 0) return;
      const stationId = order.station;
      if (!groups[stationId]) groups[stationId] = [];
      groups[stationId].push({ ...order, quantity: sentQty });
    });
    return groups;
  }, [table]);

  const handleSendStation = (stationId: string) => {
    setPrintingStation(stationId);
    // Simulate printing delay
    setTimeout(() => {
      setPrintingStation(null);
      setSentStations((prev) => new Set([...prev, stationId]));
    }, 1200);
  };

  const handleSendAll = () => {
    const stationOrders: StationOrder[] = stationGroups.map((g) => {
      return {
        stationId: g.stationId,
        items: g.items.map((item) => ({ itemId: item.id, name: item.name, qty: item.quantity })),
        sentAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
    });
    onSendToStation(table.id, stationOrders);
    setAllSent(true);
  };

  const handleSendSingle = (stationId: string) => {
    const group = stationGroups.find((g) => g.stationId === stationId);
    if (!group) return;
    handleSendStation(stationId);
    setTimeout(() => {
      const stationOrder: StationOrder = {
        stationId,
        items: group.items.map((item) => ({ itemId: item.id, name: item.name, qty: item.quantity })),
        sentAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      onSendToStation(table.id, [stationOrder]);
    }, 1200);
  };

  // ========== SUCCESS VIEW ==========
  if (allSent) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-gray-900">Pesanan Terkirim!</h3>
          <p className="text-gray-500 text-sm mt-2 mb-4">
            Semua pesanan {table.name} telah dikirim ke station masing-masing
          </p>
          <div className="space-y-2 mb-6">
            {stationGroups.map((g) => {
              const station = stations.find((s) => s.id === g.stationId);
              const Icon = stationIcons[g.stationId] || ChefHat;
              if (!station) return null;
              return (
                <div key={g.stationId} className={`flex items-center gap-3 p-3 rounded-xl ${station.bgColor} ${station.borderColor} border`}>
                  <div className={`w-8 h-8 ${station.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${station.textColor}`}>{station.name}</p>
                    <p className="text-xs text-gray-400">{g.items.length} item &bull; {station.printer}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Printer className="w-3.5 h-3.5" />
                    <span className="text-xs">Printed</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition text-sm"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Kirim ke Station</h3>
              <p className="text-gray-400 text-xs">{table.name} &bull; Cetak otomatis ke printer station</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Unsent items per station */}
          {hasUnsent ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>Item baru yang belum dikirim ke station:</span>
              </div>
              {stationGroups.map((group) => {
                const station = stations.find((s) => s.id === group.stationId);
                const Icon = stationIcons[group.stationId] || ChefHat;
                if (!station) return null;
                const isSent = sentStations.has(group.stationId);
                const isPrinting = printingStation === group.stationId;

                return (
                  <div
                    key={group.stationId}
                    className={`rounded-2xl border-2 overflow-hidden transition ${
                      isSent
                        ? "border-emerald-300 bg-emerald-50/50"
                        : `${station.borderColor}`
                    }`}
                  >
                    {/* Station Header */}
                    <div className={`px-4 py-3 flex items-center justify-between ${isSent ? "bg-emerald-50" : station.bgColor}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${isSent ? "bg-emerald-500" : station.color} rounded-lg flex items-center justify-center`}>
                          {isSent ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <Icon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${isSent ? "text-emerald-700" : station.textColor}`}>
                            {station.name}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Printer className="w-2.5 h-2.5" />
                            {station.printer}
                          </p>
                        </div>
                      </div>
                      {isSent ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Terkirim
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendSingle(group.stationId)}
                          disabled={isPrinting}
                          className={`px-3 py-1.5 rounded-lg text-xs text-white transition flex items-center gap-1.5 ${
                            isPrinting
                              ? "bg-gray-400 cursor-wait"
                              : `${station.color} hover:opacity-90`
                          }`}
                        >
                          {isPrinting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Printing...
                            </>
                          ) : (
                            <>
                              <Printer className="w-3 h-3" />
                              Kirim & Print
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-2">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{formatPrice(item.price)}</p>
                          </div>
                          <span className={`text-sm px-2 py-0.5 rounded-lg ${isSent ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Semua pesanan sudah terkirim ke station</p>
            </div>
          )}

          {/* Previously sent items */}
          {Object.keys(sentGroups).length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                <Clock className="w-4 h-4" />
                <span>Sudah terkirim sebelumnya:</span>
              </div>
              {Object.entries(sentGroups).map(([stationId, items]) => {
                const station = stations.find((s) => s.id === stationId);
                const Icon = stationIcons[stationId] || ChefHat;
                if (!station) return null;
                return (
                  <div key={stationId} className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
                    <div className="px-4 py-2 flex items-center gap-2 bg-gray-50">
                      <div className={`w-6 h-6 ${station.color} rounded-md flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs text-gray-600">{station.name}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full ml-auto">Terkirim</span>
                    </div>
                    <div className="px-4 py-2 space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
            Tutup
          </button>
          {hasUnsent && (
            <button
              onClick={handleSendAll}
              disabled={stationGroups.every((g) => sentStations.has(g.stationId))}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
              Kirim Semua Station
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
