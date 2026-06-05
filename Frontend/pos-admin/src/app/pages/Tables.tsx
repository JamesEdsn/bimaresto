import { useMemo, useState } from 'react';
import { Edit2, Eye, X, Plus, Trash2 } from 'lucide-react';
import { Menu, Order, OrderItem, Table } from '../../types/database';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

export default function Tables() {
  const { tables, orders, orderItems, menus, updateTableStatus, addTable, deleteTable, updateTable } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editStatus, setEditStatus] = useState<Table['status']>('available');
  const [editTableNumber, setEditTableNumber] = useState('');
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  const activeOrderStatuses: Order['status'][] = ['pending', 'cooking', 'served'];

  const getOrdersForTable = (tableId: number) => {
    return orders
      .filter(order => order.tables_id === tableId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  };

  const getVisibleTableOrder = (tableId: number) => {
    const tableOrders = getOrdersForTable(tableId);
    return tableOrders.find(order => activeOrderStatuses.includes(order.status)) || tableOrders[0] || null;
  };

  const getOrderItemsForOrder = (orderId: number) => {
    return orderItems.filter(item => item.order_id === orderId);
  };

  const getMenuName = (item: OrderItem) => {
    return item.menu?.name || menus.find(menu => menu.id === item.menus_id)?.name || `Menu #${item.menus_id}`;
  };

  const formatOrderTime = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);

  const selectedTableOrder = useMemo(
    () => (selectedTable ? getVisibleTableOrder(selectedTable.id) : null),
    [selectedTable, orders, orderItems, menus]
  );

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setEditStatus(table.status);
    setEditTableNumber(table.table_number);
    setIsModalOpen(true);
  };

  const handleViewOrder = (table: Table) => {
    setSelectedTable(table);
    setIsOrderModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedTable) {
      updateTable(selectedTable.id, {
        table_number: editTableNumber,
        status: editStatus,
      });
      setIsModalOpen(false);
      setSelectedTable(null);
    }
  };

  const getStatusRowColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-200 text-emerald-900';
      case 'occupied':
        return 'bg-rose-200 text-rose-900';
      case 'reserved':
        return 'bg-amber-200 text-amber-900';
      default:
        return 'bg-slate-200 text-slate-900';
    }
  };

  const getStatusTextColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'text-emerald-900';
      case 'occupied':
        return 'text-rose-900';
      case 'reserved':
        return 'text-amber-900';
      default:
        return 'text-slate-900';
    }
  };

  const getCardAccent = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'border-l-4 border-emerald-400';
      case 'occupied':
        return 'border-l-4 border-rose-400';
      case 'reserved':
        return 'border-l-4 border-amber-400';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleAddTable = () => {
    if (newTableNumber.trim()) {
      addTable({
        table_number: newTableNumber,
        status: 'available',
        capacity: newTableCapacity,
      });
      setNewTableNumber('');
      setNewTableCapacity(4);
      setIsAddTableModalOpen(false);
    }
  };

  const handleDeleteTable = () => {
    if (tableToDelete) {
      deleteTable(tableToDelete.id);
      setTableToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 text-[24px] font-bold">Table Management</h1>
            <p className="text-slate-500 text-[14px] mt-1">Manage restaurant tables</p>
          </div>
          <button
            onClick={() => setIsAddTableModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[14px] font-medium">Add Table</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Table Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white text-[20px] font-bold">
                  {tables.filter(t => t.status === 'available').length}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Available</p>
                <p className="text-slate-900 text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-white text-[20px] font-bold">
                  {tables.filter(t => t.status === 'occupied').length}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Occupied</p>
                <p className="text-slate-900 text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-white text-[20px] font-bold">
                  {tables.filter(t => t.status === 'reserved').length}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Reserved</p>
                <p className="text-slate-900 text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`bg-white rounded-2xl p-6 border border-slate-200 transition-all shadow-md hover:shadow-xl ${getCardAccent(table.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-slate-950 text-[24px] font-bold">Table {table.table_number}</h3>
                  <p className="text-slate-500 text-[14px]">{table.capacity} seats</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all"
                    onClick={() => handleEditTable(table)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                    onClick={() => {
                      setTableToDelete(table);
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className={`flex items-center justify-between gap-3 p-4 rounded-3xl ${getStatusRowColor(table.status)}`}>
                <span className={`flex-1 text-[12px] font-semibold rounded-full capitalize ${getStatusTextColor(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
                {table.status === 'occupied' && (
                  <button className="text-[12px] text-orange-600 hover:text-orange-800 font-medium" onClick={() => handleViewOrder(table)}>
                    Detail →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Table Modal */}
      {isModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">Edit Table</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus();
            }} className="space-y-5">
              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={editTableNumber}
                  onChange={(e) => setEditTableNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  placeholder="Enter table number"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Table['status'])}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-950 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-slate-200 shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">Order Details</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={selectedTable.table_number}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Order Time
                </label>
                <input
                  type="text"
                  value={selectedTableOrder ? formatOrderTime(selectedTableOrder.created_at) : 'N/A'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Order Items
                </label>
                <div className="space-y-2">
                  {selectedTableOrder ? (
                    getOrderItemsForOrder(selectedTableOrder.id).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-slate-700 text-[14px]">{getMenuName(item)} x {item.quantity}</span>
                        <span className="text-slate-700 text-[14px]">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-[14px]">No active order for this table.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={formatCurrency(selectedTableOrder?.total || 0)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-950 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">Add New Table</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTable();
            }} className="space-y-5">
              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  placeholder="e.g., Table 5"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[13px] font-medium mb-2">
                  Capacity (seats)
                </label>
                <input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-950"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTableModalOpen(false);
                    setNewTableNumber('');
                    setNewTableCapacity(4);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-950 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && tableToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-4">Delete Table?</h2>
            <p className="text-slate-600 text-[14px] mb-6">
              Are you sure you want to delete <strong>Table {tableToDelete.table_number}</strong>? This action cannot be undone and will also delete all associated orders.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setTableToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-950 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTable}
                className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}