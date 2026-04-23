import { useState, useMemo } from 'react';
import { Eye, Calendar } from 'lucide-react';
import { Order } from '../../types/database';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

export default function Orders() {
  const { orders, orderItems, updateOrderStatus } = useAppContext();
  
  // State for modal and editing
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  // State for date filtering
  const [filter, setFilter] = useState('this_month'); // 'today', 'this_week', 'this_month', 'custom'
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => new Date());

  const formatDateForInput = (date: Date) => {
    const tempDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
    return tempDate.toISOString().split('T')[0];
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, editStatus as any);
      setIsModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-200 text-amber-900 border border-amber-300',
      cooking: 'bg-sky-200 text-sky-900 border border-sky-300',
      served: 'bg-emerald-200 text-emerald-900 border border-emerald-300',
      completed: 'bg-violet-200 text-violet-900 border border-violet-300',
      cancelled: 'bg-rose-200 text-rose-900 border border-rose-300',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const orderItemsForOrder = (orderId: number) => {
    return orderItems.filter(item => item.order_id === orderId);
  };

  const handleSetFilter = (preset: string) => {
    setFilter(preset);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this_week':
        const firstDayOfWeek = now.getDate() - now.getDay();
        start = new Date(now.setDate(firstDayOfWeek));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return; // For 'custom'
    }
    setStartDate(start);
    setEndDate(end);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value + 'T00:00:00'));
    setFilter('custom');
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(e.target.value + 'T00:00:00'));
    setFilter('custom');
  };

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return orders.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= start && orderDate <= end;
      });
  }, [orders, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-950 text-[24px] font-bold">Orders Management</h1>
            <p className="text-slate-500 text-[14px] mt-1">Monitor and manage orders</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          {/* Preset buttons */}
          <div className="flex items-center gap-2">
            {['today', 'this_week', 'this_month'].map(preset => (
              <button
                key={preset}
                onClick={() => handleSetFilter(preset)}
                className={`px-4 py-2 rounded-lg text-[13px] transition-all whitespace-nowrap ${
                  filter === preset
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {preset === 'today' ? 'Hari ini' : preset === 'this_week' ? 'Minggu ini' : 'Bulan ini'}
              </button>
            ))}
          </div>
          {/* Date range picker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={handleStartDateChange}
                className="bg-transparent border-none outline-none text-slate-900 text-[13px]"
              />
            </div>
            <span className="text-slate-400">to</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={handleEndDateChange}
                className="bg-transparent border-none outline-none text-slate-900 text-[13px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-[12px] mb-1">Total Orders</p>
            <p className="text-slate-950 text-[28px] font-bold">{filteredOrders.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-[12px] mb-1">Pending</p>
            <p className="text-amber-600 text-[28px] font-bold">
              {filteredOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-[12px] mb-1">Cooking</p>
            <p className="text-sky-600 text-[28px] font-bold">
              {filteredOrders.filter(o => o.status === 'cooking').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-[12px] mb-1">Served</p>
            <p className="text-emerald-600 text-[28px] font-bold">
              {filteredOrders.filter(o => o.status === 'served').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-[12px] mb-1">Completed</p>
            <p className="text-violet-600 text-[28px] font-bold">
              {filteredOrders.filter(o => o.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order.id}
                    className={`border-b border-slate-200 hover:bg-slate-100 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-4 text-[14px] text-slate-950 font-medium">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      Table {order.table?.table_number}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      {order.staff?.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[12px] rounded-full capitalize ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-950 font-bold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-500">
                      {order.created_at.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-blue-500 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <p className="text-gray-400 text-[14px]">
                        No orders found for the selected date range.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View/Edit Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">Order Details - #{selectedOrder.id}</h2>
            
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Table Number</p>
                <p className="text-slate-950 text-[18px] font-bold">Table {selectedOrder.table?.table_number}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Staff</p>
                <p className="text-slate-950 text-[18px] font-bold">{selectedOrder.staff?.full_name}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Order Source</p>
                <p className="text-slate-950 text-[18px] font-bold capitalize">{selectedOrder.order_source}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-[12px] mb-1">Date & Time</p>
                <p className="text-slate-950 text-[18px] font-bold">{selectedOrder.created_at.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-slate-950 text-[18px] font-bold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderItemsForOrder(selectedOrder.id).map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-950 text-[14px] font-medium">{item.menu?.name}</p>
                      <p className="text-slate-500 text-[12px]">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                      {item.notes && (
                        <p className="text-slate-500 text-[12px] italic mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-950 text-[16px] font-bold">{formatCurrency(item.subtotal)}</p>
                      <span className={`px-2 py-1 text-[10px] rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Status */}
            <div className="mb-6">
              <label className="block text-slate-600 text-[13px] font-medium mb-2">
                Order Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              >
                <option value="pending">Pending</option>
                <option value="cooking">Cooking</option>
                <option value="served">Served</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Total */}
            <div className="p-4 bg-slate-50 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-[18px] font-bold">Total</p>
                <p className="text-slate-950 text-[24px] font-bold">{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}