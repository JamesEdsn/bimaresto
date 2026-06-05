import { ShoppingBag, Send, ChefHat, X, Landmark } from "lucide-react";
import { OrderItem, TableInfo } from "../data/menuData";

interface OrderSidebarProps {
  table: TableInfo;
  orders: OrderItem[];
  subtotal: number;
  total: number;
  formatPrice: (price: number) => string;
  hasSentItems: boolean;
  hasUnsentItems: boolean;
  unsentCount: number;
  onRemoveItem: (id: string) => void;
  onSendToStation: () => void;
  onStartPayment: () => void;
}

export function OrderSidebar({
  table,
  orders,
  subtotal,
  total,
  formatPrice,
  hasSentItems,
  hasUnsentItems,
  unsentCount,
  onRemoveItem,
  onSendToStation,
  onStartPayment,
}: OrderSidebarProps) {
  return (
    <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white flex flex-col flex-shrink-0 max-h-[40vh] lg:max-h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          <h3 className="text-gray-900 text-sm">Pesanan {table.name}</h3>
        </div>
        {orders.length > 0 && (
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            {orders.reduce((s, o) => s + o.quantity, 0)} item
          </span>
        )}
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 py-8">
            <ShoppingBag className="w-10 h-10 mb-2" />
            <p className="text-sm">Belum ada pesanan</p>
            <p className="text-xs mt-1">Pilih menu di samping</p>
          </div>
        ) : (
          orders.map((o) => {
            const sentQty = table.sentItems[o.id] || 0;
            const unsentQtyItem = o.quantity - sentQty;
            return (
              <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img src={o.image} alt={o.name} className="w-10 h-10 rounded-lg object-cover" />
                    {sentQty > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                        <ChefHat className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{o.name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-gray-500">{o.quantity} x {formatPrice(o.price)}</p>
                      {sentQty > 0 && unsentQtyItem > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">
                          +{unsentQtyItem} baru
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-gray-800">{formatPrice(o.price * o.quantity)}</span>
                  {sentQty === 0 && (
                    <button onClick={() => onRemoveItem(o.id)} className="text-gray-300 hover:text-red-500 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary & Actions */}
      {orders.length > 0 && (
        <div className="p-4 border-t border-gray-100 space-y-3 flex-shrink-0">
          {/* Cost Breakdown */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>Pajak 10%</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>Service Charge 11%</span>
              <span>{formatPrice(0)}</span>
            </div>
            <p className="text-[10px] text-orange-500">Total Pajak 21%</p>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="text-gray-900">Total Bayar</span>
              <span className="text-orange-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Send to Station Button */}
            {hasUnsentItems && (
              <button
                onClick={onSendToStation}
                className="w-full bg-rose-500 text-white py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim ke Station ({unsentCount} item)
              </button>
            )}

            {/* Station Status Indicator */}
            {hasSentItems && !hasUnsentItems && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-sm text-rose-700">
                <ChefHat className="w-4 h-4 flex-shrink-0" />
                Semua item sudah dikirim ke station
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={onStartPayment}
              className="w-full bg-orange-500 text-white py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Landmark className="w-4 h-4" />
              Bayar {formatPrice(total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
