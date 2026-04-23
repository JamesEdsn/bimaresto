import { useState } from "react";
import { ChefHat, Clock } from "lucide-react";
import { initialTables, OrderItem, StationOrder, TableInfo } from "../../data/posMenuData";
import { TableGrid } from "../../components/pos/TableGrid";
import { TableDetail } from "../../components/pos/TableDetail";

export default function POSDashboard() {
  const [tables, setTables] = useState(initialTables);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);

  const now = new Date();

  const handleUpdateOrders = (tableId: number, orders: OrderItem[]) => {
    setTables((prev: TableInfo[]) =>
      prev.map((t: TableInfo) => (t.id === tableId ? { ...t, orders } : t))
    );
  };

  const handleClearTable = (tableId: number) => {
    setTables((prev: TableInfo[]) =>
      prev.map((t: TableInfo) =>
        t.id === tableId
          ? { ...t, orders: [], sentItems: {}, stationOrders: [] }
          : t
      )
    );
    setActiveTableId(null);
  };

  // ========== SEND TO STATION ==========
  const handleSendToStation = (tableId: number, stationOrders: StationOrder[]) => {
    setTables((prev: TableInfo[]) =>
      prev.map((t: TableInfo) => {
        if (t.id !== tableId) return t;
        // Update sentItems: mark sent quantities
        const newSentItems = { ...t.sentItems };
        stationOrders.forEach((so) => {
          so.items.forEach((item: { itemId: string; name: string; qty: number }) => {
            newSentItems[item.itemId] = (newSentItems[item.itemId] || 0) + item.qty;
          });
        });
        return {
          ...t,
          sentItems: newSentItems,
          stationOrders: [...t.stationOrders, ...stationOrders],
        };
      })
    );
  };

  // ========== MOVE TABLE ==========
  const handleMoveTable = (fromId: number, toId: number) => {
    setTables((prev: TableInfo[]) => {
      const fromTable = prev.find((t: TableInfo) => t.id === fromId);
      if (!fromTable) return prev;
      return prev.map((t: TableInfo) => {
        if (t.id === fromId) return { ...t, orders: [], sentItems: {}, stationOrders: [] };
        if (t.id === toId)
          return {
            ...t,
            orders: [...fromTable.orders],
            sentItems: { ...fromTable.sentItems },
            stationOrders: [...fromTable.stationOrders],
          };
        return t;
      });
    });
    setActiveTableId(null);
  };

  // ========== MERGE TABLE ==========
  const handleMergeTable = (targetId: number, sourceId: number) => {
    setTables((prev: TableInfo[]) => {
      const sourceTable = prev.find((t: TableInfo) => t.id === sourceId);
      const targetTable = prev.find((t: TableInfo) => t.id === targetId);
      if (!sourceTable || !targetTable) return prev;

      const mergedOrders = [...targetTable.orders];
      sourceTable.orders.forEach((so: OrderItem) => {
        const existing = mergedOrders.find((o) => o.id === so.id);
        if (existing) {
          existing.quantity += so.quantity;
        } else {
          mergedOrders.push({ ...so });
        }
      });

      // Merge sentItems
      const mergedSentItems = { ...targetTable.sentItems };
      Object.entries(sourceTable.sentItems).forEach(([key, val]) => {
        mergedSentItems[key] = (mergedSentItems[key] || 0) + val;
      });

      return prev.map((t: TableInfo) => {
        if (t.id === targetId)
          return {
            ...t,
            orders: mergedOrders,
            sentItems: mergedSentItems,
            stationOrders: [...targetTable.stationOrders, ...sourceTable.stationOrders],
          };
        if (t.id === sourceId) return { ...t, orders: [], sentItems: {}, stationOrders: [] };
        return t;
      });
    });
  };

  // ========== SPLIT TABLE ==========
  const handleSplitTable = (fromId: number, toId: number, items: OrderItem[]) => {
    setTables((prev: TableInfo[]) => {
      const fromTable = prev.find((t: TableInfo) => t.id === fromId);
      if (!fromTable) return prev;

      const updatedFromOrders = fromTable.orders
        .map((o: OrderItem) => {
          const splitItem = items.find((i: OrderItem) => i.id === o.id);
          if (splitItem) return { ...o, quantity: o.quantity - splitItem.quantity };
          return o;
        })
        .filter((o: OrderItem) => o.quantity > 0);

      // Split sentItems proportionally
      const newFromSentItems = { ...fromTable.sentItems };
      const newToSentItems: Record<string, number> = {};
      items.forEach((item) => {
        const sentQty = fromTable.sentItems[item.id] || 0;
        if (sentQty > 0) {
          const transferSent = Math.min(sentQty, item.quantity);
          newToSentItems[item.id] = transferSent;
          newFromSentItems[item.id] = sentQty - transferSent;
          if (newFromSentItems[item.id] <= 0) delete newFromSentItems[item.id];
        }
      });

      return prev.map((t: TableInfo) => {
        if (t.id === fromId) return { ...t, orders: updatedFromOrders, sentItems: newFromSentItems };
        if (t.id === toId) return { ...t, orders: [...items], sentItems: newToSentItems, stationOrders: [] };
        return t;
      });
    });
  };

  // ========== CANCEL ORDER ==========
  const handleCancelItems = (tableId: number, itemIds: string[], _reason: string) => {
    setTables((prev: TableInfo[]) =>
      prev.map((t: TableInfo) => {
        if (t.id !== tableId) return t;
        const filtered = t.orders.filter((o: OrderItem) => !itemIds.includes(o.id));
        const newSentItems = { ...t.sentItems };
        itemIds.forEach((id) => delete newSentItems[id]);
        return { ...t, orders: filtered, sentItems: newSentItems };
      })
    );
  };

  const handleCancelAll = (tableId: number, _reason: string) => {
    setTables((prev: TableInfo[]) =>
      prev.map((t: TableInfo) => {
        if (t.id !== tableId) return t;
        return { ...t, orders: [], sentItems: {}, stationOrders: [] };
      })
    );
  };

  const activeTable = tables.find((t: TableInfo) => t.id === activeTableId);

  // ============ TABLE DETAIL VIEW ============
  if (activeTable) {
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <TableDetail
          table={activeTable}
          allTables={tables}
          onBack={() => setActiveTableId(null)}
          onUpdateOrders={handleUpdateOrders}
          onClearTable={handleClearTable}
          onSendToStation={handleSendToStation}
          onMoveTable={handleMoveTable}
          onMergeTable={handleMergeTable}
          onSplitTable={handleSplitTable}
          onCancelItems={handleCancelItems}
          onCancelAll={handleCancelAll}
        />
      </div>
    );
  }

  // ============ MAIN TABLE VIEW ============
  const occupiedCount = tables.filter((t: TableInfo) => t.orders.length > 0).length;
  const availableCount = tables.filter((t: TableInfo) => t.orders.length === 0).length;
  const inKitchenCount = tables.filter(
    (t: TableInfo) => t.orders.length > 0 && Object.values(t.sentItems).some((v: any) => v > 0)
  ).length;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center border border-orange-600">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 text-base leading-tight">BIMA RESTO</h1>
            <p className="text-gray-400 text-xs">Sistem Kasir &bull; Dine In</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              {now.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 lg:px-6 pt-5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-700">{availableCount} Kosong</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-sm text-orange-700">{occupiedCount} Terisi</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-sm text-rose-700">{inKitchenCount} Diproses</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 lg:px-6 pt-4 pb-2 flex-shrink-0">
        <h2 className="text-gray-900">Pilih Meja</h2>
        <p className="text-gray-400 text-sm mt-0.5">Ketuk meja untuk mulai transaksi atau lihat pesanan</p>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 pt-2">
        <TableGrid tables={tables} onSelectTable={(id: number) => setActiveTableId(id)} />
      </div>
    </div>
  );
}
