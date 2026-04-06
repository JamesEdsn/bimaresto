import { useState } from 'react';
import { Edit2, Eye } from 'lucide-react';
import { Order } from '../../types/database';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

export default function Orders() {
  const { orders, orderItems, updateOrderStatus } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');

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
      pending: 'bg-amber-100 text-amber-900',
      cooking: 'bg-info/10 text-info',
      served: 'bg-brand/10 text-brand',
      completed: 'bg-primary/10 text-primary',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  const orderItemsForOrder = (orderId: number) => {
    return orderItems.filter(item => item.order_id === orderId);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Orders Management</h1>
            <p className="text-muted-foreground text-[14px] mt-1">Monitor and manage orders</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-muted-foreground text-[12px] mb-1">Total Orders</p>
            <p className="text-foreground text-[28px] font-bold">{orders.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-muted-foreground text-[12px] mb-1">Pending</p>
            <p className="text-amber-700 text-[28px] font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-muted-foreground text-[12px] mb-1">Cooking</p>
            <p className="text-info text-[28px] font-bold">
              {orders.filter(o => o.status === 'cooking').length}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-muted-foreground text-[12px] mb-1">Served</p>
            <p className="text-brand text-[28px] font-bold">
              {orders.filter(o => o.status === 'served').length}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-muted-foreground text-[12px] mb-1">Completed</p>
            <p className="text-primary text-[28px] font-bold">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.id}
                    className={`border-b border-border hover:bg-muted transition-colors ${
                      index % 2 === 0 ? 'bg-card' : 'bg-muted/35'
                    }`}
                  >
                    <td className="px-6 py-4 text-[14px] text-foreground font-medium">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-muted-foreground">
                      Table {order.table?.table_number}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-muted-foreground">
                      {order.staff?.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[12px] rounded-full capitalize ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-foreground font-bold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-muted-foreground">
                      {order.created_at.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-info hover:text-info/80 hover:bg-muted rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View/Edit Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-2xl w-full border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-foreground text-[24px] font-bold mb-6">Order Details - #{selectedOrder.id}</h2>
            
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-[12px] mb-1">Table Number</p>
                <p className="text-foreground text-[18px] font-bold">Table {selectedOrder.table?.table_number}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-[12px] mb-1">Staff</p>
                <p className="text-foreground text-[18px] font-bold">{selectedOrder.staff?.full_name}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-[12px] mb-1">Order Source</p>
                <p className="text-foreground text-[18px] font-bold capitalize">{selectedOrder.order_source}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-[12px] mb-1">Time</p>
                <p className="text-foreground text-[18px] font-bold">{selectedOrder.created_at.toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-foreground text-[18px] font-bold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderItemsForOrder(selectedOrder.id).map((item) => (
                  <div key={item.id} className="p-4 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-foreground text-[14px] font-medium">{item.menu?.name}</p>
                      <p className="text-muted-foreground text-[12px]">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                      {item.notes && (
                        <p className="text-muted-foreground text-[12px] italic mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-[16px] font-bold">{formatCurrency(item.subtotal)}</p>
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
              <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                Order Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="cooking">Cooking</option>
                <option value="served">Served</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Total */}
            <div className="p-4 bg-muted rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <p className="text-foreground text-[18px] font-bold">Total</p>
                <p className="text-foreground text-[24px] font-bold">{formatCurrency(selectedOrder.total)}</p>
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
                className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
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