import { Users, UtensilsCrossed, CircleDot, ChefHat, Clock, Send } from "lucide-react";
import { TableInfo } from "../data/menuData";

interface TableGridProps {
  tables: TableInfo[];
  onSelectTable: (id: number) => void;
}

export function TableGrid({ tables, onSelectTable }: TableGridProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => {
        const totalOrderItems = table.orders.reduce((s, o) => s + o.quantity, 0);
        const totalPrice = table.orders.reduce((s, o) => s + o.price * o.quantity, 0);
        const isOccupied = table.orders.length > 0;
        const totalSent = Object.values(table.sentItems).reduce((s, v) => s + v, 0);
        const hasSent = totalSent > 0;
        const hasUnsent = table.orders.some(
          (o) => o.quantity - (table.sentItems[o.id] || 0) > 0
        );
        const allSent = isOccupied && hasSent && !hasUnsent;
        const lastSentTime = table.stationOrders.length > 0
          ? table.stationOrders[table.stationOrders.length - 1].sentAt
          : null;

        return (
          <button
            key={table.id}
            onClick={() => onSelectTable(table.id)}
            className={`relative p-5 rounded-2xl border-2 transition-all text-left group hover:shadow-xl hover:-translate-y-1 ${
              hasSent
                ? "bg-rose-50 border-rose-300 hover:border-rose-500"
                : isOccupied
                ? "bg-orange-50 border-orange-200 hover:border-orange-400"
                : "bg-white border-gray-100 hover:border-emerald-400"
            }`}
          >
            {/* Station sent badge */}
            {hasSent && (
              <div className="absolute -top-2 -right-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md animate-pulse">
                <ChefHat className="w-3 h-3" />
                {allSent ? "DIPROSES" : "SEBAGIAN"}
              </div>
            )}

            {/* Unsent new items badge */}
            {hasSent && hasUnsent && (
              <div className="absolute -top-2 left-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md">
                <Send className="w-3 h-3" />
                BARU
              </div>
            )}

            {/* Status dot */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  hasSent
                    ? "bg-rose-100 text-rose-600"
                    : isOccupied
                    ? "bg-orange-100 text-orange-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <CircleDot className="w-3 h-3" />
                {hasSent ? "Diproses" : isOccupied ? "Terisi" : "Kosong"}
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">{table.seats}</span>
              </div>
            </div>

            {/* Table icon */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                hasSent ? "bg-rose-500" : isOccupied ? "bg-orange-500" : "bg-gray-800"
              }`}
            >
              {hasSent ? (
                <ChefHat className="w-7 h-7 text-white" />
              ) : (
                <UtensilsCrossed className="w-7 h-7 text-white" />
              )}
            </div>

            {/* Table name */}
            <h3 className="text-gray-900">{table.name}</h3>

            {/* Order info */}
            {hasSent ? (
              <div className="mt-2 space-y-1">
                {lastSentTime && (
                  <p className="text-rose-600 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Terkirim {lastSentTime}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {totalSent}/{totalOrderItems} item terkirim
                </p>
                <div className="bg-rose-100 rounded-lg px-2 py-1.5 mt-1">
                  <p className="text-rose-800 text-sm">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            ) : isOccupied ? (
              <div className="mt-2 space-y-1">
                <p className="text-orange-600 text-xs">{totalOrderItems} item dipesan</p>
                <p className="text-gray-800 text-sm">{formatPrice(totalPrice)}</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-400 text-xs">Ketuk untuk mulai order</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
