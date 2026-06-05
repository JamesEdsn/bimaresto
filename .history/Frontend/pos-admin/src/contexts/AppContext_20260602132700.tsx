import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Menu, Table, Order, OrderItem, SplitBill } from '../types/database';
import {
  createCategory,
  createMenu,
  createTable,
  deleteCategoryById,
  deleteMenuById,
  deleteTableById,
  getCategories,
  getMenus,
  getOrders,
  getSplitBills,
  getTables,
  updateOrderStatus as updateOrderStatusById,
  updateCategoryById,
  updateMenuById,
  updateTableById,
  updateTableStatusById,
} from '../services/api';

interface AppContextType {
  categories: Category[];
  menus: Menu[];
  tables: Table[];
  orders: Order[];
  orderItems: OrderItem[];
  splitBills: SplitBill[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addMenu: (menu: Partial<Menu>) => Promise<void>;
  updateMenu: (menu: Menu) => Promise<void>;
  deleteMenu: (id: number) => Promise<void>;
  addTable: (table: { table_number: string; capacity: number; status?: Table['status'] }) => Promise<void>;
  updateTable: (id: number, table: { table_number: string; status: Table['status']; capacity?: number }) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  toggleMenuAvailability: (id: number, currentStatus: boolean) => Promise<void>;
  updateTableStatus: (id: number, status: Table['status']) => Promise<void>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getStoredToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(() => getStoredToken());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Menarik data secara paralel dari backend bruno-based
      const [catsData, menusData, tablesData, ordersData, splitBillsData] = await Promise.all([
        getCategories(),
        getMenus(),
        getTables(),
        getOrders(),
        getSplitBills(),
      ]);

      setCategories(catsData || []);
      setMenus(menusData || []);
      setTables(tablesData || []);
      setOrders(ordersData || []);
      setSplitBills(splitBillsData || []);
      setOrderItems(
        (ordersData || []).flatMap(order => order.order_items || [])
      );
    } catch (error) {
      console.error("Gagal mengambil data dari API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const syncAuthState = () => setAuthToken(getStoredToken());

    const handleAuthChanged = () => {
      syncAuthState();
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', syncAuthState);

    syncAuthState();

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      refreshData();

      const handleWindowFocus = () => {
        refreshData();
      };

      const handleOnline = () => {
        refreshData();
      };

      // Hentikan auto-polling berkala; hanya refresh saat fokus jendela atau kembali online
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('online', handleOnline);

      return () => {
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('online', handleOnline);
      };
    } else {
      setCategories([]);
      setMenus([]);
      setTables([]);
      setOrders([]);
      setOrderItems([]);
      setSplitBills([]);
      setIsLoading(false);
    }
  }, [authToken]);

  const addCategory = async (name: string) => {
    try {
      await createCategory(name);
      await refreshData();
    } catch (error) {
      console.error("Gagal tambah kategori:", error);
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      await updateCategoryById(id, name);
      await refreshData();
    } catch (error) {
      console.error("Gagal update kategori:", error);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryById(id);
      await refreshData();
    } catch (error) {
      console.error("Gagal hapus kategori:", error);
    }
  };

  const addMenu = async (menuData: Partial<Menu>) => {
    try {
      if (!menuData.name || menuData.categories_id == null || menuData.price == null) {
        throw new Error('Data menu tidak lengkap');
      }

      await createMenu({
        categories_id: menuData.categories_id,
        name: menuData.name,
        description: menuData.description || '',
        price: menuData.price,
        is_available: menuData.is_available ?? true,
        image: menuData.image || null,
      });
      await refreshData();
    } catch (error) {
      console.error("Gagal tambah menu:", error);
    }
  };

  const updateMenu = async (menu: Menu) => {
    try {
      await updateMenuById(menu);
      await refreshData();
    } catch (error) {
      console.error("Gagal update menu:", error);
    }
  };

  const deleteMenu = async (id: number) => {
    try {
      await deleteMenuById(id);
      await refreshData();
    } catch (error) {
      console.error("Gagal hapus menu:", error);
    }
  };

  const addTable = async (tableData: { table_number: string; capacity: number; status?: Table['status'] }) => {
    try {
      await createTable(tableData);
      await refreshData();
    } catch (error) {
      console.error("Gagal tambah meja:", error);
    }
  };

  const updateTable = async (
    id: number,
    tableData: { table_number: string; status: Table['status']; capacity?: number }
  ) => {
    try {
      const currentTable = tables.find((table) => table.id === id);
      await updateTableById(id, {
        table_number: tableData.table_number,
        capacity: tableData.capacity ?? currentTable?.capacity ?? 4,
        status: tableData.status,
      });
      await refreshData();
    } catch (error) {
      console.error("Gagal update meja:", error);
    }
  };

  const deleteTable = async (id: number) => {
    try {
      await deleteTableById(id);
      await refreshData();
    } catch (error) {
      console.error("Gagal hapus meja:", error);
    }
  };

  const toggleMenuAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const menu = menus.find((item) => item.id === id);
      if (!menu) return;

      await updateMenuById({ ...menu, is_available: !currentStatus });
      await refreshData();
    } catch (error) {
      console.error("Gagal update status menu:", error);
    }
  };

  const updateTableStatus = async (id: number, status: Table['status']) => {
    try {
      await updateTableStatusById(id, status);
      setTables(tables.map(t => t.id === id ? { ...t, status } : t));
    } catch (error) {
      console.error("Gagal update status meja:", error);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await updateOrderStatusById(id, status);
      await refreshData();
    } catch (error) {
      console.error("Gagal update status order:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        menus,
        tables,
        orders,
        orderItems,
        splitBills,
        isLoading,
        refreshData,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenu,
        updateMenu,
        deleteMenu,
        addTable,
        updateTable,
        deleteTable,
        toggleMenuAvailability,
        updateTableStatus,
        updateOrderStatus,
      }}
    >
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-600 animate-pulse">
              Loading data dari Server...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
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