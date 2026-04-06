import { Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderFormProps {
  tableNumber: string;
  onClose?: () => void;
  onSubmit?: (items: OrderItem[], total: number) => void;
}

const mockMenuItems = [
  { id: 1, name: 'Pasta Carbonara', price: 35.00, category: 'Pasta' },
  { id: 2, name: 'French Fries', price: 8.50, category: 'Sides' },
  { id: 3, name: 'Chicken Shawarma', price: 25.00, category: 'Main Course' },
  { id: 4, name: 'Grilled Salmon', price: 45.00, category: 'Main Course' },
  { id: 5, name: 'Moroccan Tagine', price: 38.00, category: 'Main Course' },
];

export function OrderForm({ tableNumber, onClose, onSubmit }: OrderFormProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(mockMenuItems.map(item => item.category)))];

  const filteredMenuItems = selectedCategory === 'All'
    ? mockMenuItems
    : mockMenuItems.filter(item => item.category === selectedCategory);

  const addItem = (menuItem: typeof mockMenuItems[0]) => {
    const existingItem = orderItems.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        subtotal: menuItem.price,
      }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = () => {
    if (orderItems.length > 0 && onSubmit) {
      onSubmit(orderItems, total);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Menu Selection */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Select Items</h2>
          <span className="text-sm text-gray-600">Table {tableNumber}</span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addItem(item)}
              className="p-4 bg-gray-50 rounded-lg hover:bg-amber-50 hover:border-amber-400 border-2 border-transparent transition-all text-left"
            >
              <h3 className="font-medium mb-1">{item.name}</h3>
              <p className="text-amber-600 font-bold">${item.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:w-96 bg-white rounded-xl shadow-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Order Summary</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {orderItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              No items added yet
            </div>
          ) : (
            orderItems.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 bg-white rounded hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 bg-white rounded hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-2xl text-amber-600">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={orderItems.length === 0}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
