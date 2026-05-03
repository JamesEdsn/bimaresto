import { useState } from 'react';
import { Search, CreditCard, Smartphone, CheckCircle, Clock3 } from 'lucide-react';
import { Payment } from '../../types/database';
import { mockPayments } from '../../data/mockData';
import { formatCurrency } from '../../utils/currency';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'e-wallet'>('card');
  const [activeFilter, setActiveFilter] = useState<'all' | 'card' | 'e-wallet'>('all');

  const filteredPayments = payments
    .filter(payment => activeFilter === 'all' || payment.payment_method === activeFilter)
    .filter(payment =>
      payment.id.toString().includes(searchQuery) ||
      payment.order_id.toString().includes(searchQuery) ||
      payment.table?.table_number.includes(searchQuery)
    );

  const handleProcessPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsProcessModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (selectedPayment) {
      setPayments(payments.map(p =>
        p.id === selectedPayment.id
          ? { ...p, payment_status: 'paid', payment_method: selectedMethod, paid_at: new Date() }
          : p
      ));
      setIsProcessModalOpen(false);
      setSelectedPayment(null);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'e-wallet':
        return <Smartphone className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-200 text-emerald-900 border border-emerald-300';
      case 'pending':
        return 'bg-amber-200 text-amber-900 border border-amber-300';
      case 'failed':
        return 'bg-rose-200 text-rose-900 border border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const totalCompleted = payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const totalPending = payments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + p.total, 0);

  // Stats per method
  const cardPayments = payments.filter(p => p.payment_method === 'card');
  const ewalletPayments = payments.filter(p => p.payment_method === 'e-wallet');
  
  const cardTotal = cardPayments.reduce((sum, p) => sum + p.total, 0);
  const ewalletTotal = ewalletPayments.reduce((sum, p) => sum + p.total, 0);
  
  const cardCompleted = cardPayments.filter(p => p.payment_status === 'paid').length;
  const ewalletCompleted = ewalletPayments.filter(p => p.payment_status === 'paid').length;

  const cardPending = cardPayments.filter(p => p.payment_status === 'pending').length;
  const ewalletPending = ewalletPayments.filter(p => p.payment_status === 'pending').length;

  const cardCompletedTotal = cardPayments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const cardPendingTotal = cardPayments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + p.total, 0);

  const ewalletCompletedTotal = ewalletPayments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const ewalletPendingTotal = ewalletPayments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 text-[24px] font-bold">Payment Management</h1>
            <p className="text-slate-500 text-[14px] mt-1">Process and track payments by method</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 w-64"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Payment Stats - Dynamic based on filter */}
        {activeFilter === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total All Payments */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Total All</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(totalCompleted + totalPending)}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-[12px]">
                {payments.length} transaksi
              </p>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Completed</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {payments.filter(p => p.payment_status === 'paid').length}
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-[12px]">
                Transaksi berhasil
              </p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Clock3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Pending</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {payments.filter(p => p.payment_status === 'pending').length}
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-[12px]">
                Menunggu bayar
              </p>
            </div>
          </div>
        )}

        {activeFilter === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card Total */}
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Total Kartu</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(cardTotal)}
                  </p>
                </div>
              </div>
              <p className="text-blue-600 text-[12px]">
                {cardPayments.length} transaksi kartu
              </p>
            </div>

            {/* Card Completed */}
            <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Completed</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(cardCompletedTotal)}
                  </p>
                </div>
              </div>
              <p className="text-green-600 text-[12px]">
                {cardCompleted} transaksi
              </p>
            </div>

            {/* Card Pending */}
            <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Clock3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Pending</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(cardPendingTotal)}
                  </p>
                </div>
              </div>
              <p className="text-yellow-600 text-[12px]">
                {cardPending} transaksi
              </p>
            </div>
          </div>
        )}

        {activeFilter === 'e-wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* E-Wallet Total */}
            <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Total E-Wallet</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(ewalletTotal)}
                  </p>
                </div>
              </div>
              <p className="text-green-600 text-[12px]">
                {ewalletPayments.length} transaksi e-wallet
              </p>
            </div>

            {/* E-Wallet Completed */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Completed</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(ewalletCompletedTotal)}
                  </p>
                </div>
              </div>
              <p className="text-emerald-600 text-[12px]">
                {ewalletCompleted} transaksi
              </p>
            </div>

            {/* E-Wallet Pending */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Clock3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-[12px]">Pending</p>
                  <p className="text-slate-950 text-[24px] font-bold">
                    {formatCurrency(ewalletPendingTotal)}
                  </p>
                </div>
              </div>
              <p className="text-amber-600 text-[12px]">
                {ewalletPending} transaksi
              </p>
            </div>
          </div>
        )}

        {/* Filter Selector - Below Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-md">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all text-[13px] font-medium ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Payments ({payments.length})
            </button>
            
            <button
              onClick={() => setActiveFilter('card')}
              className={`px-5 py-3 rounded-lg transition-all text-[13px] font-medium flex items-center gap-2 ${
                activeFilter === 'card'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card ({cardPayments.length})
            </button>
            
            <button
              onClick={() => setActiveFilter('e-wallet')}
              className={`px-5 py-3 rounded-lg transition-all text-[13px] font-medium flex items-center gap-2 ${
                activeFilter === 'e-wallet'
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              E-Wallet ({ewalletPayments.length})
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr 
                    key={payment.id} 
                    className={`border-b border-slate-200 hover:bg-slate-100 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-4 text-[14px] text-slate-900 font-medium">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">
                      #{payment.order_id}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      Table {payment.table?.table_number}
                    </td>
                    <td className="px-6 py-4 text-[16px] text-slate-950 font-bold">
                      {formatCurrency(payment.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.payment_method)}
                        <span className="text-slate-600 text-[14px] capitalize">{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[12px] rounded-full capitalize ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      {payment.staff?.full_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {payment.payment_status === 'pending' && (
                        <button
                          onClick={() => handleProcessPayment(payment)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg text-[12px] font-medium hover:shadow-lg transition-all"
                        >
                          Process
                        </button>
                      )}
                      {payment.payment_status === 'paid' && (
                        <span className="text-slate-500 text-[12px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Payment Modal */}
      {isProcessModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">Process Payment</h2>
            
            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Order ID</p>
                <p className="text-slate-950 text-[16px] font-medium">{selectedPayment.order_id}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Table Number</p>
                <p className="text-slate-950 text-[16px] font-medium">Table {selectedPayment.table?.table_number}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Total Amount</p>
                <p className="text-slate-950 text-[28px] font-bold">{formatCurrency(selectedPayment.total)}</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-slate-700 text-[13px] font-medium mb-3">
                Payment Method (Hanya Card & E-Wallet)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMethod === 'card'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-blue-500/50'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'card' ? 'text-blue-400' : 'text-blue-400'
                  }`} />
                  <p className="text-slate-900 text-[13px] font-medium">Card</p>
                  <p className="text-slate-500 text-[11px] mt-1">Debit/Credit</p>
                </button>

                <button
                  onClick={() => setSelectedMethod('e-wallet')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMethod === 'e-wallet'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-slate-200 bg-white hover:border-green-500/50'
                  }`}
                >
                  <Smartphone className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'e-wallet' ? 'text-green-400' : 'text-green-400'
                  }`} />
                  <p className="text-slate-900 text-[13px] font-medium">E-Wallet</p>
                  <p className="text-slate-500 text-[11px] mt-1">OVO/GoPay/Dana</p>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}