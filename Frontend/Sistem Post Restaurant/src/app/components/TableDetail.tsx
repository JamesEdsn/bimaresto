import { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Landmark,
  CreditCard,
  QrCode,
  Printer,
  RotateCcw,
  X,
  Users,
  ShoppingBag,
  Send,
  MoreVertical,
  ArrowRight,
  Combine,
  SplitSquareHorizontal,
  Ban,
  ChefHat,
} from "lucide-react";
import { TableInfo, OrderItem, StationOrder, BuffetPackage, buffetPackages, categories } from "../data/menuData";
import { MoveTableModal } from "./MoveTableModal";
import { MergeTableModal } from "./MergeTableModal";
import { SplitTableModal } from "./SplitTableModal";
import { CancelOrderModal } from "./CancelOrderModal";
import { SendToStationModal } from "./SendToStationModal";

type ModalType = null | "move" | "merge" | "splitTable" | "splitBill" | "cancel" | "sendStation";

interface TableDetailProps {
  table: TableInfo;
  allTables: TableInfo[];
  onBack: () => void;
  onUpdateOrders: (tableId: number, orders: OrderItem[]) => void;
  onClearTable: (tableId: number) => void;
  onSendToStation: (tableId: number, stationOrders: StationOrder[]) => void;
  onMoveTable: (fromId: number, toId: number) => void;
  onMergeTable: (targetId: number, sourceId: number) => void;
  onSplitTable: (fromId: number, toId: number, items: OrderItem[]) => void;
  onCancelItems: (tableId: number, itemIds: string[], reason: string) => void;
  onCancelAll: (tableId: number, reason: string) => void;
}

export function TableDetail({
  table,
  allTables,
  onBack,
  onUpdateOrders,
  onClearTable,
  onSendToStation,
  onMoveTable,
  onMergeTable,
  onSplitTable,
  onCancelItems,
  onCancelAll,
}: TableDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card" | "qris">("transfer");
  const [cashAmount, setCashAmount] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [paidCount, setPaidCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [lastPaidPerson, setLastPaidPerson] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showActions, setShowActions] = useState(false);
  const [selectedBuffetPackage, setSelectedBuffetPackage] = useState<BuffetPackage | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const orders = table.orders;

 
  const totalSent = Object.values(table.sentItems).reduce((s, v) => s + v, 0);
  const hasSentItems = totalSent > 0;
  const hasUnsentItems = orders.some((o) => o.quantity - (table.sentItems[o.id] || 0) > 0);
  const unsentCount = orders.reduce((s, o) => s + Math.max(0, o.quantity - (table.sentItems[o.id] || 0)), 0);
  const lastSentTime = table.stationOrders.length > 0
    ? table.stationOrders[table.stationOrders.length - 1].sentAt
    : null;


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const filteredMenu = useMemo(() => {
    return buffetPackages.filter((item) => {
      const matchCat = selectedCategory === "all" || item.type === selectedCategory;
      const matchSearch = searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const subtotal = orders.reduce((s, o) => s + o.price * o.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal; 
  const effectiveAmount = numPeople > 1 ? Math.ceil(total / numPeople) : total;
  const change = Number(cashAmount) - effectiveAmount;

  
  useEffect(() => {
    setCashAmount(String(effectiveAmount));
  }, [effectiveAmount, paymentMethod]);

  const handleSelect = (item: BuffetPackage) => {
  
    const quantity = table.seats;
  
    onUpdateOrders(table.id, [{ ...item, quantity }]);
    setSelectedBuffetPackage(null);
  };


  const removeItem = (id: string) => {
    const sentQty = table.sentItems[id] || 0;
    if (sentQty > 0) return; 
    onUpdateOrders(
      table.id,
      orders.filter((o) => o.id !== id)
    );
  };


  const handlePay = () => {
    
    const nextPaidCount = paidCount + 1;
    
    if (nextPaidCount < numPeople) {
      
      setPaidCount(nextPaidCount);
      setLastPaidPerson(nextPaidCount);
    } else {
      
      setIsPaid(true);
    }
  };

  const handleNewOrder = () => {
    onClearTable(table.id);
    setShowPayment(false);
    setIsPaid(false);
    setCashAmount("");
    setPaymentMethod("transfer");
    setPaidCount(0);
    setLastPaidPerson(0);
    setNumPeople(1);
  };

  const now = new Date();
  const orderNo = `BR-${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  
  const actionItems = [
    {
      id: "move" as const,
      label: "Pindah Meja",
      desc: "Pindahkan pesanan ke meja lain",
      icon: ArrowRight,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      id: "merge" as const,
      label: "Gabung Meja",
      desc: "Gabungkan pesanan meja lain ke sini",
      icon: Combine,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      id: "splitTable" as const,
      label: "Pisah Meja",
      desc: "Pindahkan sebagian item ke meja lain",
      icon: SplitSquareHorizontal,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
    {
      id: "cancel" as const,
      label: "Cancel Order",
      desc: "Batalkan pesanan dengan alasan",
      icon: Ban,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  
  const renderModal = () => {
    switch (activeModal) {
      case "move":
        return (
          <MoveTableModal
            currentTable={table}
            allTables={allTables}
            onMove={onMoveTable}
            onClose={() => setActiveModal(null)}
          />
        );
      case "merge":
        return (
          <MergeTableModal
            currentTable={table}
            allTables={allTables}
            onMerge={onMergeTable}
            onClose={() => setActiveModal(null)}
          />
        );
      case "splitTable":
        return (
          <SplitTableModal
            currentTable={table}
            allTables={allTables}
            onSplitTable={onSplitTable}
            onClose={() => setActiveModal(null)}
          />
        );
      case "cancel":
        return (
          <CancelOrderModal
            table={table}
            onCancelItems={onCancelItems}
            onCancelAll={onCancelAll}
            onClose={() => setActiveModal(null)}
          />
        );
      case "sendStation":
        return (
          <SendToStationModal
            table={table}
            onSendToStation={onSendToStation}
            onClose={() => setActiveModal(null)}
          />
        );
      default:
        return null;
    }
  };

  
  if (showPayment) {
    if (isPaid) {
      return (
        <div className="h-full flex flex-col bg-gray-50">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-gray-900">Transaksi Berhasil!</h2>
                <p className="text-gray-400 text-sm mt-1">#{orderNo}</p>
              </div>

              <div className="mx-6 p-4 bg-gray-50 rounded-xl text-sm">
                <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                  <p className="text-gray-900">BIMA RESTO</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} -{" "}
                    {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-orange-600 text-xs mt-1">{table.name}</p>
                </div>
                <div className="space-y-1 border-b border-dashed border-gray-300 pb-3 mb-3">
                  {orders.map((o) => (
                    <div key={o.id} className="flex justify-between">
                      <span className="text-gray-600">{o.quantity}x {o.name}</span>
                      <span className="text-gray-700">{formatPrice(o.price * o.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Pajak 10%</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 pt-1">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {paymentMethod === "transfer" && (
                    <>
                      <div className="flex justify-between text-gray-500">
                        <span>Transfer</span>
                        <span>{formatPrice(Number(cashAmount))}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Kembalian</span>
                        <span>{formatPrice(change)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Struk
                </button>
                <button
                  onClick={handleNewOrder}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowPayment(false)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h2 className="text-gray-900">Pembayaran - {table.name}</h2>
            <p className="text-gray-400 text-xs">{orders.reduce((s, o) => s + o.quantity, 0)} item</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-lg mx-auto space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-gray-900 mb-3">Ringkasan Pesanan</h3>
              {orders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{o.quantity}x {o.name}</span>
                  <span className="text-gray-800">{formatPrice(o.price * o.quantity)}</span>
                </div>
              ))}

              <div className="mt-3 p-4 bg-orange-50 border border-orange-100 rounded-3xl">
                <p className="text-sm font-semibold text-orange-700">Opsi Split Bill</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                    className="w-8 h-8 rounded-lg border border-orange-200 bg-white text-orange-600 hover:bg-orange-100 transition"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-gray-900">{numPeople} orang</span>
                  <button
                    onClick={() => setNumPeople(numPeople + 1)}
                    className="w-8 h-8 rounded-lg border border-orange-200 bg-white text-orange-600 hover:bg-orange-100 transition"
                  >
                    +
                  </button>
                </div>
                {numPeople > 1 && (
                  <div className="mt-2 p-2 rounded-xl bg-white border border-orange-100">
                    <p className="text-sm text-orange-600 font-bold">Tagihan per Orang</p>
                    <p className="text-2xl font-black text-orange-700">{formatPrice(effectiveAmount)}</p>
                  </div>
                )}
                
                {/* Progress pembayaran untuk split bill */}
                {numPeople > 1 && (
                  <div className="mt-3 pt-3 border-t border-orange-200 space-y-2">
                    <div className="flex justify-between text-xs text-orange-600">
                      <span className="font-semibold">Progress Pembayaran</span>
                      <span>{paidCount} dari {numPeople}</span>
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(paidCount / numPeople) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-600">
                <span>Pajak (10%)</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-600">
                <span>Service (11%)</span>
                <span>{formatPrice(0)}</span>
              </div>
              <p className="text-[10px] text-orange-500">Total Pajak 21%</p>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between">
                <span className="text-gray-900">Total Bayar</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-3">Metode Pembayaran</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "transfer" as const, icon: Landmark, label: "Transfer" },
                  { id: "card" as const, icon: CreditCard, label: "Kartu" },
                  { id: "qris" as const, icon: QrCode, label: "QRIS" },
                ]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                      paymentMethod === m.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <m.icon className="w-6 h-6" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "transfer" && (
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-semibold">✓ Siap untuk Pembayaran</p>
                    <p className="text-xs text-green-600 mt-1">Total: {formatPrice(effectiveAmount)}</p>
                  </div>
                  
                  {/* Notifikasi pembayaran berhasil untuk split bill */}
                  {numPeople > 1 && paidCount > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-700 font-semibold">✓ Pembayaran Orang ke-{lastPaidPerson} Berhasil!</p>
                      {paidCount < numPeople && (
                        <p className="text-xs text-blue-600 mt-1">Sekarang Bayar untuk Orang ke-{paidCount + 1}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Status menunggu pembayaran */}
                  {numPeople > 1 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700 font-semibold text-center">
                        Menunggu Pembayaran: Orang ke-{paidCount + 1} dari {numPeople}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              <CheckCircle2 className="w-5 h-5" />
              {numPeople === 1 ? (
                `Konfirmasi Pembayaran ${formatPrice(total)}`
              ) : paidCount + 1 < numPeople ? (
                `Bayar Orang ke-${paidCount + 1} ${formatPrice(effectiveAmount)}`
              ) : (
                `Bayar Orang ke-${paidCount + 1} ${formatPrice(effectiveAmount)} - TERAKHIR`
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h2 className="text-gray-900">{table.name}</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Users className="w-3 h-3" />
                {table.seats} kursi
              </span>
              {hasSentItems && (
                <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  <ChefHat className="w-3 h-3" />
                  {totalSent} item terkirim
                  {lastSentTime && ` (${lastSentTime})`}
                </span>
              )}
              {hasUnsentItems && hasSentItems && (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Send className="w-3 h-3" />
                  {unsentCount} belum dikirim
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Actions Menu */}
          {orders.length > 0 && (
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  showActions ? "bg-orange-100 text-orange-600" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-40">
                  {actionItems.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        setActiveModal(action.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800">{action.label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      {orders.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-2 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-2">
            {actionItems.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveModal(action.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-xs whitespace-nowrap hover:shadow-sm ${
                  action.id === "cancel"
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Menu */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 lg:px-6 pb-0 space-y-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:px-6">
            <div className="grid grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const isSelected = selectedBuffetPackage?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBuffetPackage(item)}
                    className={`border-2 rounded-3xl overflow-hidden cursor-pointer transition shadow-sm hover:shadow-md ${
                      isSelected ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white"
                    }`}
                  >
                    <div className="relative w-full aspect-video">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-gray-900 text-lg font-bold mb-1">{item.name}</h4>
                      <p className="text-orange-600 text-xl font-extrabold mb-3">{formatPrice(item.price)}</p>

                      <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span><strong>Appetizer:</strong> {item.courses.Appetizer.join(", ")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span><strong>Soup:</strong> {item.courses.Soup.join(", ")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span><strong>Main Course:</strong> {item.courses["Main Course"].join(", ")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span><strong>Dessert:</strong> {item.courses.Dessert.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedBuffetPackage && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h4 className="text-gray-800 font-semibold mb-2">Paket Terpilih: {selectedBuffetPackage.name}</h4>
                <p className="text-sm text-gray-600 mb-2">Untuk {table.seats} orang - Total: {formatPrice(selectedBuffetPackage.price * table.seats)}</p>
                <button
                  onClick={() => handleSelect(selectedBuffetPackage)}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  {orders.length > 0 ? "Ganti Paket Buffet" : "Pilih Paket Buffet"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white flex flex-col flex-shrink-0 max-h-[40vh] lg:max-h-full">
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
                        <button onClick={() => removeItem(o.id)} className="text-gray-300 hover:text-red-500 transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {orders.length > 0 && (
            <div className="p-4 border-t border-gray-100 space-y-3 flex-shrink-0">
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

              <div className="space-y-2">
                {/* Kirim ke Station button */}
                {hasUnsentItems && (
                  <button
                    onClick={() => setActiveModal("sendStation")}
                    className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                  >
                    <Send className="w-4 h-4" />
                    Kirim ke Station ({unsentCount} item)
                  </button>
                )}

                {/* Station status indicator */}
                {hasSentItems && !hasUnsentItems && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-sm text-rose-700">
                    <ChefHat className="w-4 h-4 flex-shrink-0" />
                    Semua item sudah dikirim ke station
                  </div>
                )}

                {/* Bayar button */}
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                >
                  <Landmark className="w-4 h-4" />
                  Bayar {formatPrice(total)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
}
