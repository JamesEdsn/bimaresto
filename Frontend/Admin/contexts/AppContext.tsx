import { createContext, useContext, useState, ReactNode } from 'react';
import { Category, Menu, Table, Order, OrderItem } from '../types/database';
import { mockCategories, mockMenus, mockTables, mockOrders, mockOrderItems, mockStaff } from '../data/mockData';

interface AppContextType {
  categories: Category[];
  menus: Menu[];
  tables: Table[];
  orders: Order[];
  orderItems: OrderItem[];
  addCategory: (category: Category) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
  addMenu: (menu: Menu) => void;
  updateMenu: (menu: Menu) => void;
  deleteMenu: (id: number) => void;
  toggleMenuAvailability: (id: number) => void;
  updateTableStatus: (id: number, status: Table['status']) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: number, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [menus, setMenus] = useState<Menu[]>(mockMenus);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(mockOrderItems);

  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const updateCategory = (id: number, name: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
    // Update menus yang menggunakan kategori ini
    setMenus(menus.map(menu =>
      menu.categories_id === id
        ? { ...menu, category: { ...menu.category!, name } }
        : menu
    ));
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const addMenu = (menu: Menu) => {
    const category = categories.find(c => c.id === menu.categories_id);
    setMenus([...menus, { ...menu, category }]);
  };

  const updateMenu = (menu: Menu) => {
    const category = categories.find(c => c.id === menu.categories_id);
    setMenus(menus.map(m =>
      m.id === menu.id ? { ...menu, category } : m
    ));
  };

  const deleteMenu = (id: number) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const toggleMenuAvailability = (id: number) => {
    setMenus(menus.map(menu =>
      menu.id === id ? { ...menu, is_available: !menu.is_available } : menu
    ));
  };

  const updateTableStatus = (id: number, status: Table['status']) => {
    setTables(tables.map(t =>
      t.id === id ? { ...t, status } : t
    ));

    // Jika table diubah ke occupied, buat order baru
    if (status === 'occupied') {
      const table = tables.find(t => t.id === id);
      if (table) {
        const newOrderId = Math.max(...orders.map(o => o.id), 0) + 1;
        const newOrder: Order = {
          id: newOrderId,
          tables_id: id,
          staff_id: 1, // Default staff (Admin)
          order_source: 'dine-in',
          status: 'pending',
          total: 0,
          created_at: new Date(),
          updated_at: new Date(),
          table: table,
          staff: mockStaff[0],
        };
        setOrders([...orders, newOrder]);
      }
    }
    
    // Jika table diubah dari occupied ke available/reserved, update order status ke completed
    if (status === 'available' || status === 'reserved') {
      setOrders(orders.map(order =>
        order.tables_id === id && (order.status === 'pending' || order.status === 'cooking' || order.status === 'served')
          ? { ...order, status: 'completed', updated_at: new Date() }
          : order
      ));
    }
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrderStatus = (id: number, status: Order['status']) => {
    setOrders(orders.map(o =>
      o.id === id ? { ...o, status, updated_at: new Date() } : o
    ));
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        menus,
        tables,
        orders,
        orderItems,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenu,
        updateMenu,
        deleteMenu,
        toggleMenuAvailability,
        updateTableStatus,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}