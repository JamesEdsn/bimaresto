import { useEffect, useMemo, useState } from "react";
import { ChefHat, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { initialTables, OrderItem, StationOrder, BuffetPackage } from "../../data/posMenuData";
import { TableGrid } from "../../components/pos/TableGrid";
import { TableDetail } from "../../components/pos/TableDetail";
import { useAppContext } from "../../../contexts/AppContext";
import {
  addOrderItems,
  createOrder,
  getTables,
  processPayment,
  cancelOrder,
  cancelOrderItem,
  moveOrderTable,
  mergeOrders,
  splitOrderTable,
} from "../../../services/api";

const SHARED_DATA_UPDATE_KEY = 'bimaresto:data-sync';

// ========== PARSE COURSE FROM DESCRIPTION ==========
// Format deskripsi di admin (bisa tulis satu atau semua sekaligus):
//   "appetizer: Lumpia Goreng soup: Soto Ayam main course: Rendang dessert: Es Campur"
// Keyword tidak case-sensitive. Kalau tidak ada keyword → Main Course
function parseCourseFromDescription(
  description: string,
  menuName: string
): BuffetPackage['courses'] {
  const courses: BuffetPackage['courses'] = {
    Appetizer: [],
    Soup: [],
    'Main Course': [],
    Dessert: [],
  };

  const raw = (description || '').trim();
  if (!raw) {
    courses['Main Course'] = [menuName];
    return courses;
  }

  type CourseKey = keyof BuffetPackage['courses'];
  type Hit = { index: number; matchLen: number; key: CourseKey };

  const patterns: { re: RegExp; key: CourseKey }[] = [
    { re: /appetizer\s*:/gi,     key: 'Appetizer'   },
    { re: /soup\s*:/gi,          key: 'Soup'        },
    { re: /main\s*course\s*:/gi, key: 'Main Course' },
    { re: /dessert\s*:/gi,       key: 'Dessert'     },
  ];

  const hits: Hit[] = [];
  for (const { re, key } of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      hits.push({ index: m.index, matchLen: m[0].length, key });
    }
  }

  if (hits.length === 0) {
    // Tidak ada keyword sama sekali → fallback
    courses['Main Course'] = [menuName];
    if (raw) courses.Appetizer = [raw];
    return courses;
  }

  // Urutkan berdasarkan posisi kemunculan
  hits.sort((a, b) => a.index - b.index);

  // Ekstrak konten antara keyword saat ini dan keyword berikutnya
  for (let i = 0; i < hits.length; i++) {
    const contentStart = hits[i].index + hits[i].matchLen;
    const contentEnd = i + 1 < hits.length ? hits[i + 1].index : raw.length;
    const content = raw.substring(contentStart, contentEnd).trim().replace(/[,;]+$/, '').trim();
    if (content) {
      courses[hits[i].key] = [content];
    }
  }

  return courses;
}

export default function POSDashboard() {
  const { menus, categories, tables: backendTables, orders: backendOrders, promos, isLoading, manualRefresh } = useAppContext();
  const [tables, setTables] = useState(initialTables);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/');
  };

  const now = new Date();

  // Map backend menus into the BuffetPackage structure
  const menuPackages = useMemo<BuffetPackage[]>(() => {
    return menus
      .filter((menu) => menu.is_available)
      .map((menu) => ({
        id: String(menu.id),
        name: menu.name,
        type: menu.category?.name || "Menu",
        price: menu.price,
        category: menu.category?.name || "Menu",
        station: "kitchen",
        image: menu.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80",
        courses: parseCourseFromDescription(menu.description || '', menu.name),
      }));
  }, [menus]);

  const menuCategories = useMemo(
    () => [
      { id: "all", name: "Semua Menu" },
      ...categories.map((category) => ({ id: category.name, name: category.name })),
    ],
    [categories]
  );

  // Filter backend active orders (not completed, not cancelled)
  const liveOrders = useMemo(() => {
    return backendOrders.filter(
      (order) =>
        order.status === "pending" ||
        order.status === "cooking" ||
        order.status === "served"
    );
  }, [backendOrders]);

  // Synchronize backend tables and active orders with local state
  useEffect(() => {
    if (backendTables.length === 0) return;

    setTables((currentTables) =>
      backendTables.map((table) => {
        const existing = currentTables.find((item) => item.id === table.id);
        const activeOrder = liveOrders.find((o) => o.tables_id === table.id);

        // Keep local unsent items that haven't been pushed to the backend yet
        const unsentItems: OrderItem[] = [];
        if (existing) {
          existing.orders.forEach((item) => {
            const sentQty = existing.sentItems[item.id] || 0;
            const unsentQty = item.quantity - sentQty;
            if (unsentQty > 0) {
              unsentItems.push({
                ...item,
                quantity: unsentQty,
              });
            }
          });
        }

        if (activeOrder) {
          // Map backend active order items to the POS UI structure
          const dbOrders: OrderItem[] = (activeOrder.order_items || []).map((item) => {
            const isPromo = item.unit_price === 0;
            return {
              id: isPromo ? `promo-${item.menus_id}` : String(item.menus_id),
              name: item.menu?.name || "Menu",
              price: item.unit_price,
              quantity: item.quantity,
              category: item.menu?.category?.name || "Menu",
              station: "kitchen",
              image: item.menu?.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80",
              isPromo,
              promoNotes: isPromo ? "Promo" : undefined,
            } as any;
          });

          const sentItems: Record<string, number> = {};
          (activeOrder.order_items || []).forEach((item) => {
            const localId = item.unit_price === 0 ? `promo-${item.menus_id}` : String(item.menus_id);
            if (item.status === "cooking" || item.status === "served") {
              sentItems[localId] = (sentItems[localId] || 0) + item.quantity;
            }
          });

          // Merge with local sentItems: keep the higher value so that locally-tracked
          // sent quantities aren't lost when backend still shows 'pending' status.
          if (existing?.sentItems) {
            Object.entries(existing.sentItems).forEach(([key, localQty]) => {
              sentItems[key] = Math.max(sentItems[key] || 0, localQty);
            });
          }

          const backendItemIds = (activeOrder.order_items || []).reduce<Record<string, number>>((acc, item) => {
            const localId = item.unit_price === 0 ? `promo-${item.menus_id}` : String(item.menus_id);
            acc[localId] = item.id;
            return acc;
          }, {});

          const stationOrders = existing?.stationOrders?.length
            ? existing.stationOrders
            : (activeOrder.order_items || [])
                .filter((item) => item.status === "cooking" || item.status === "served")
                .map((item) => ({
                  stationId: "kitchen",
                  items: [{ itemId: String(item.menus_id), name: item.menu?.name || "Menu", qty: item.quantity }],
                  sentAt: item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Terkirim",
                }));

          // Merge local unsent items with active DB order items
          const mergedOrders = [...dbOrders];
          unsentItems.forEach((unsent) => {
            const match = mergedOrders.find((db) => db.id === unsent.id);
            if (match) {
              match.quantity += unsent.quantity;
            } else {
              mergedOrders.push(unsent);
            }
          });

          return {
            id: table.id,
            name: `Meja ${table.table_number}`,
            seats: table.capacity || 4,
            status: "occupied",
            backendOrderId: activeOrder.id,
            backendItemIds,
            orders: mergedOrders,
            sentItems,
            stationOrders,
            splitCount: existing?.splitCount || 1,
          };
        }

        // Table is empty in DB
        const mergedOrders = [...unsentItems];
        return {
          id: table.id,
          name: `Meja ${table.table_number}`,
          seats: table.capacity || 4,
          status: mergedOrders.length > 0 ? "occupied" : (table.status === "occupied" ? "occupied" : "available"),
          backendOrderId: undefined,
          backendItemIds: {},
          orders: mergedOrders,
          sentItems: {},
          stationOrders: [],
          splitCount: existing?.splitCount || 1,
        };
      })
    );
  }, [backendTables, liveOrders]);

  const calculatePromos = (orders: OrderItem[]): OrderItem[] => {
    const nonPromoOrders = orders.filter(o => !o.isPromo);
    const activePromos = promos.filter(p => p.is_active && new Date() >= new Date(p.start_date) && new Date() <= new Date(p.end_date));

    let newOrders = [...nonPromoOrders];
    
    activePromos.forEach(promo => {
      if (promo.promo_type === 'bundle') {
        const buyQty = nonPromoOrders.filter(o => o.id === String(promo.buy_menu_id)).reduce((sum, o) => sum + o.quantity, 0);
        const entitledFreeQty = Math.floor(buyQty / promo.buy_quantity) * promo.free_quantity;
        
        if (entitledFreeQty > 0) {
          const freeMenu = menus.find(m => m.id === promo.free_menu_id);
          if (freeMenu) {
             const promoId = `promo-${freeMenu.id}`;
             const existingPromoItem = newOrders.find(o => o.id === promoId && o.isPromo);
             
             if (existingPromoItem) {
                existingPromoItem.quantity = entitledFreeQty;
             } else {
                newOrders.push({
                  id: promoId,
                  name: freeMenu.name,
                  price: 0,
                  quantity: entitledFreeQty,
                  category: freeMenu.category?.name || "Promo",
                  station: "kitchen",
                  image: freeMenu.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80",
                  isPromo: true,
                  promoNotes: "Promo",
                } as any);
             }
          }
        }
      }
    });

    return newOrders;
  };

  const handleUpdateOrders = (tableId: number, orders: OrderItem[]) => {
    const ordersWithPromos = calculatePromos(orders);
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, orders: ordersWithPromos } : t))
    );
  };

  const handleClearTable = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, backendOrderId: undefined, backendItemIds: {}, orders: [], sentItems: {}, stationOrders: [] }
          : t
      )
    );
    setActiveTableId(null);
  };

  // ========== SEND TO STATION ==========
  const handleSendToStation = async (tableId: number, stationOrders: StationOrder[]) => {
    const sourceTable = tables.find((table) => table.id === tableId);
    if (!sourceTable) return;

    const items = stationOrders.flatMap((stationOrder) =>
      stationOrder.items.map((item) => ({
        menu_id: Number(item.itemId.replace('promo-', '')),
        quantity: item.qty,
        notes: "",
        is_promo: item.itemId.startsWith('promo-'),
      }))
    );

    let backendOrderId = sourceTable.backendOrderId;
    let backendItemIds = { ...(sourceTable.backendItemIds || {}) };

    if (items.length > 0 && items.every((item) => Number.isFinite(item.menu_id))) {
      const savedOrder = backendOrderId
        ? await addOrderItems(backendOrderId, items)
        : await createOrder({
            table_id: tableId,
            source: "dine_in",
            client_ref_id: `pos-${tableId}-${Date.now()}`,
            items,
          });

      backendOrderId = savedOrder.id;
      backendItemIds = {
        ...backendItemIds,
        ...(savedOrder.order_items || []).reduce<Record<string, number>>((acc, item) => {
          const localId = item.unit_price === 0 ? `promo-${item.menus_id}` : String(item.menus_id);
          acc[localId] = item.id;
          return acc;
        }, {}),
      };

      // Update local tables immediately
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t;
          
          // Update sentItems: mark sent quantities
          const newSentItems = { ...t.sentItems };
          stationOrders.forEach((so) => {
            so.items.forEach((item) => {
              newSentItems[item.itemId] = (newSentItems[item.itemId] || 0) + item.qty;
            });
          });

          return {
            ...t,
            backendOrderId,
            backendItemIds,
            sentItems: newSentItems,
            stationOrders: [...t.stationOrders, ...stationOrders],
          };
        })
      );

      // Pastikan data admin/analytics juga terupdate setelah order POS tersimpan
      await manualRefresh();
      try {
        localStorage.setItem(SHARED_DATA_UPDATE_KEY, Date.now().toString());
      } catch (error) {
        console.warn('Unable to broadcast shared data update:', error);
      }
    }
  };

  // ========== MOVE TABLE ==========
  const handleMoveTable = async (fromId: number, toId: number) => {
    const fromTable = tables.find((t) => t.id === fromId);
    if (fromTable && fromTable.backendOrderId) {
      try {
        await moveOrderTable(fromTable.backendOrderId, toId);
        await manualRefresh();
      } catch (e) {
        console.error("Gagal pindah meja:", e);
      }
    } else {
      setTables((prev) => {
        if (!fromTable) return prev;
        return prev.map((t) => {
          if (t.id === fromId) return { ...t, backendOrderId: undefined, backendItemIds: {}, orders: [], sentItems: {}, stationOrders: [] };
          if (t.id === toId)
            return {
              ...t,
              backendOrderId: fromTable.backendOrderId,
              backendItemIds: { ...(fromTable.backendItemIds || {}) },
              orders: [...fromTable.orders],
              sentItems: { ...fromTable.sentItems },
              stationOrders: [...fromTable.stationOrders],
            };
          return t;
        });
      });
    }
    setActiveTableId(null);
  };

  // ========== MERGE TABLE ==========
  const handleMergeTable = async (targetId: number, sourceId: number) => {
    const sourceTable = tables.find((t) => t.id === sourceId);
    const targetTable = tables.find((t) => t.id === targetId);
    if (sourceTable && sourceTable.backendOrderId && targetTable && targetTable.backendOrderId) {
      try {
        await mergeOrders(targetTable.backendOrderId, sourceTable.backendOrderId);
        await manualRefresh();
      } catch (e) {
        console.error("Gagal gabung meja:", e);
      }
    } else {
      setTables((prev) => {
        if (!sourceTable || !targetTable) return prev;

        const mergedOrders = [...targetTable.orders];
        sourceTable.orders.forEach((so) => {
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

        return prev.map((t) => {
          if (t.id === targetId)
            return {
              ...t,
              orders: mergedOrders,
              sentItems: mergedSentItems,
              stationOrders: [...targetTable.stationOrders, ...sourceTable.stationOrders],
            };
          if (t.id === sourceId) return { ...t, backendOrderId: undefined, backendItemIds: {}, orders: [], sentItems: {}, stationOrders: [] };
          return t;
        });
      });
    }
  };

  // ========== SPLIT TABLE ==========
  const handleSplitTable = async (fromId: number, toId: number, items: OrderItem[]) => {
    const fromTable = tables.find((t) => t.id === fromId);
    if (fromTable && fromTable.backendOrderId) {
      // Map local items to backend item IDs
      const backendItems = items.map((item) => {
        const dbItemId = fromTable.backendItemIds?.[item.id];
        return {
          item_id: dbItemId || 0,
          qty: item.quantity,
        };
      }).filter((item) => item.item_id > 0);

      try {
        await splitOrderTable(fromTable.backendOrderId, toId, backendItems);
        await manualRefresh();
      } catch (e) {
        console.error("Gagal pisah meja:", e);
      }
    } else {
      setTables((prev) => {
        if (!fromTable) return prev;

        const updatedFromOrders = fromTable.orders
          .map((o) => {
            const splitItem = items.find((i) => i.id === o.id);
            if (splitItem) return { ...o, quantity: o.quantity - splitItem.quantity };
            return o;
          })
          .filter((o) => o.quantity > 0);

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

        return prev.map((t) => {
          if (t.id === fromId) return { ...t, orders: updatedFromOrders, sentItems: newFromSentItems };
          if (t.id === toId) return { ...t, orders: [...items], sentItems: newToSentItems, stationOrders: [] };
          return t;
        });
      });
    }
  };

  // ========== CANCEL ORDER ==========
  const handleCancelItems = async (tableId: number, itemIds: string[], _reason: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table && table.backendOrderId) {
      for (const id of itemIds) {
        const backendItemId = table.backendItemIds?.[id];
        if (backendItemId) {
          try {
            await cancelOrderItem(table.backendOrderId, backendItemId);
          } catch (e) {
            console.error("Gagal batalkan item:", e);
          }
        }
      }
      await manualRefresh();
    } else {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t;
          const filtered = t.orders.filter((o) => !itemIds.includes(o.id));
          const newSentItems = { ...t.sentItems };
          itemIds.forEach((id) => delete newSentItems[id]);
          return { ...t, orders: filtered, sentItems: newSentItems };
        })
      );
    }
  };

  const handleCancelAll = async (tableId: number, _reason: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table && table.backendOrderId) {
      try {
        await cancelOrder(table.backendOrderId);
      } catch (e) {
        console.error("Gagal batalkan order:", e);
      }
      await manualRefresh();
    } else {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t;
          return { ...t, backendOrderId: undefined, backendItemIds: {}, orders: [], sentItems: {}, stationOrders: [] };
        })
      );
    }
  };

  const handleProcessPayment = async (tableId: number, amount: number, method: "transfer" | "card" | "e-wallet") => {
    const table = tables.find((item) => item.id === tableId);
    if (!table?.backendOrderId) return;

    await processPayment({
      order_id: table.backendOrderId,
      payment_method: method,
      amount_paid: amount,
    });

    const refreshedTables = await getTables();
    setTables((currentTables) =>
      currentTables.map((item) => {
        const refreshed = refreshedTables.find((nextTable) => nextTable.id === item.id);
        if (item.id === tableId) {
          if (refreshed && refreshed.status === "occupied") {
            return { ...item, status: "occupied" };
          }
          return { ...item, backendOrderId: undefined, backendItemIds: {}, orders: [], sentItems: {}, stationOrders: [] };
        }
        return refreshed ? { ...item, status: refreshed.status === "occupied" ? "occupied" : "available" } : item;
      })
    );
  };

  const activeTable = tables.find((t) => t.id === activeTableId);

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
          onProcessPayment={handleProcessPayment}
          menuPackages={menuPackages.length > 0 ? menuPackages : undefined}
          categoryOptions={menuCategories.length > 1 ? menuCategories : undefined}
        />
      </div>
    );
  }

  // ============ MAIN TABLE VIEW ============
  const occupiedCount = tables.filter((t) => t.orders.length > 0).length;
  const availableCount = tables.filter((t) => t.orders.length === 0).length;
  const inKitchenCount = tables.filter(
    (t) => t.orders.length > 0 && Object.values(t.sentItems).some((v) => v > 0)
  ).length;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => manualRefresh()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md text-sm text-red-600 border border-red-100 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
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
        <TableGrid tables={tables} onSelectTable={(id) => setActiveTableId(id)} />
      </div>
    </div>
  );
}
