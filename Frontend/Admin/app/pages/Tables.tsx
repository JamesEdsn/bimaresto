import { useState } from 'react';
import { Edit2, Eye, X } from 'lucide-react';
import { Table } from '../../types/database';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

// Mock order data for occupied tables
const mockOrders: Record<number, { items: { name: string; qty: number; price: number }[]; total: number; time: string }> = {
  2: {
    items: [
      { name: 'Grilled Chicken', qty: 2, price: 180000 },
      { name: 'Caesar Salad', qty: 1, price: 135000 },
      { name: 'Iced Coffee', qty: 2, price: 60000 }
    ],
    total: 615000,
    time: '14:23'
  },
  4: {
    items: [
      { name: 'Beef Burger', qty: 3, price: 180000 },
      { name: 'Pasta Carbonara', qty: 2, price: 210000 }
    ],
    total: 960000,
    time: '14:45'
  },
  7: {
    items: [
      { name: 'Pasta Carbonara', qty: 1, price: 210000 },
      { name: 'Chocolate Cake', qty: 2, price: 90000 }
    ],
    total: 390000,
    time: '15:12'
  }
};

export default function Tables() {
  const { tables, updateTableStatus } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editStatus, setEditStatus] = useState<Table['status']>('available');

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setEditStatus(table.status);
    setIsModalOpen(true);
  };

  const handleViewOrder = (table: Table) => {
    setSelectedTable(table);
    setIsOrderModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, editStatus);
      setIsModalOpen(false);
      setSelectedTable(null);
    }
  };

  /* Available = hijau brand, Occupied = merah, Reserved = kuning solid */
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-brand/10 text-brand border-brand/35';
      case 'occupied':
        return 'bg-red-50 text-red-950 border-red-600';
      case 'reserved':
        return 'bg-yellow-50 text-yellow-950 border-yellow-500';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusPill = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-brand text-brand-foreground border-transparent';
      case 'occupied':
        return 'bg-red-600 text-white border-transparent';
      case 'reserved':
        return 'bg-yellow-400 text-neutral-900 border-transparent';
      default:
        return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Table Management</h1>
            <p className="text-muted-foreground text-[14px] mt-1">Manage restaurant tables</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Table Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-brand flex items-center justify-center shadow-sm">
                <span className="text-brand-foreground text-[20px] font-bold">
                  {tables.filter(t => t.status === 'available').length}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Available</p>
                <p className="text-foreground text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-[20px] font-bold">
                  {tables.filter(t => t.status === 'occupied').length}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Occupied</p>
                <p className="text-foreground text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center shadow-sm ring-1 ring-yellow-600/40">
                <span className="text-neutral-900 text-[20px] font-bold">
                  {tables.filter(t => t.status === 'reserved').length}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Reserved</p>
                <p className="text-foreground text-[18px] font-bold">Tables</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`bg-card rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${getStatusColor(table.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-foreground text-[24px] font-bold">Table {table.table_number}</h3>
                  <p className="text-muted-foreground text-[14px]">{table.capacity} seats</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    onClick={() => handleEditTable(table)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className={`px-3 py-1 text-[12px] font-medium rounded-full capitalize border ${getStatusPill(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
                {table.status === 'occupied' && (
                  <button className="text-[12px] text-info hover:text-info/80 font-medium" onClick={() => handleViewOrder(table)}>
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
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
            <h2 className="text-foreground text-[24px] font-bold mb-6">Edit Table Status</h2>
            
            <form onSubmit={handleUpdateStatus} className="space-y-5">
              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={selectedTable.table_number}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Table['status'])}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-2xl w-full border border-border">
            <h2 className="text-foreground text-[24px] font-bold mb-6">Order Details</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={selectedTable.table_number}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Order Time
                </label>
                <input
                  type="text"
                  value={mockOrders[selectedTable.table_number]?.time || 'N/A'}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Order Items
                </label>
                <div className="space-y-2">
                  {mockOrders[selectedTable.table_number]?.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[14px]">{item.name} x {item.qty}</span>
                      <span className="text-muted-foreground text-[14px]">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={formatCurrency(mockOrders[selectedTable.table_number]?.total || 0)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter table number"
                  required
                  readOnly
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}