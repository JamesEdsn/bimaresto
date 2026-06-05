import api from '../api/api';
import { Category, Menu, Order, OrderItem, Payment, Promo, Role, SplitBill, Staff, Table } from '../types/database';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

type BackendMenu = Omit<Menu, 'categories_id' | 'image'> & {
  category_id: number;
  image?: string | null;
};

type BackendOrderItem = Omit<OrderItem, 'menus_id' | 'created_at'> & {
  menu_id: number;
  created_at?: string;
};

type BackendOrder = Omit<Order, 'order_source' | 'created_at' | 'updated_at' | 'order_items'> & {
  source: string;
  created_at: string;
  updated_at?: string;
  order_items?: BackendOrderItem[];
};

type BackendPayment = Omit<Payment, 'paid_at' | 'created_at' | 'table' | 'staff'> & {
  paid_at?: string | null;
  created_at?: string;
  order?: BackendOrder;
};

type BackendSplitBill = Omit<SplitBill, 'created_at' | 'paid_at'> & {
  created_at: string;
  paid_at?: string | null;
};

type LoginPayload = {
  full_name: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  staff: {
    id: number;
    full_name: string;
    role_id: number;
    role: string;
  };
};

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

const normalizeMenu = (menu: BackendMenu): Menu => ({
  ...menu,
  categories_id: menu.category_id,
  image: menu.image ?? null,
  created_at: menu.created_at ? new Date(menu.created_at) : undefined,
  category: menu.category
    ? {
        ...menu.category,
        created_at: new Date(menu.category.created_at),
      }
    : undefined,
});

const normalizeStaff = (staff?: Staff): Staff | undefined => {
  if (!staff) return undefined;
  return {
    ...staff,
    phone: staff.phone ?? null,
    password_hash: staff.password_hash ?? '',
    created_at: staff.created_at ? new Date(staff.created_at) : new Date(),
    updated_at: staff.updated_at ? new Date(staff.updated_at) : new Date(),
  };
};

const normalizeCategory = (category: Category): Category => ({
  ...category,
  created_at: category.created_at ? new Date(category.created_at) : new Date(),
});

const normalizePromo = (promo: Promo): Promo => ({
  ...promo,
  description: promo.description ?? null,
  promo_type: promo.promo_type || 'bundle',
  start_date: promo.start_date ? new Date(promo.start_date) : new Date(),
  end_date: promo.end_date ? new Date(promo.end_date) : new Date(),
  created_at: promo.created_at ? new Date(promo.created_at) : new Date(),
  buy_menu: promo.buy_menu ? normalizeMenu(promo.buy_menu as unknown as BackendMenu) : undefined,
  free_menu: promo.free_menu ? normalizeMenu(promo.free_menu as unknown as BackendMenu) : undefined,
});

const normalizeOrderItem = (item: BackendOrderItem): OrderItem => ({
  ...item,
  menus_id: item.menu_id,
  notes: item.notes ?? null,
  created_at: item.created_at ? new Date(item.created_at) : new Date(),
  menu: item.menu ? normalizeMenu(item.menu as BackendMenu) : undefined,
});

export const normalizeOrder = (order: BackendOrder): Order => ({
  ...order,
  order_source: order.source || 'dine_in',
  created_at: new Date(order.created_at),
  updated_at: order.updated_at ? new Date(order.updated_at) : new Date(order.created_at),
  staff: normalizeStaff(order.staff),
  order_items: order.order_items?.map(normalizeOrderItem) ?? [],
});

const normalizePayment = (payment: BackendPayment): Payment => {
  const order = payment.order ? normalizeOrder(payment.order) : undefined;

  return {
    ...payment,
    order,
    order_id: payment.order_id || order?.id,
    tables_id: payment.tables_id || order?.tables_id || 0,
    staff_id: payment.staff_id || order?.staff_id || 0,
    paid_at: payment.paid_at ? new Date(payment.paid_at) : null,
    created_at: payment.created_at ? new Date(payment.created_at) : payment.paid_at ? new Date(payment.paid_at) : undefined,
    table: order?.table,
    staff: order?.staff,
  };
};

const normalizeSplitBill = (item: BackendSplitBill): SplitBill => ({
  ...item,
  created_at: new Date(item.created_at),
  paid_at: item.paid_at ? new Date(item.paid_at) : null,
});

export const login = async (payload: LoginPayload) => {
  const response = await api.post<ApiResponse<LoginResponse>>('/login', payload);
  return unwrap(response);
};

export const getMenus = async () => {
  const response = await api.get<ApiResponse<BackendMenu[]>>('/menus', {
    params: { limit: 100 },
  });
  const menus = unwrap(response);
  return Array.isArray(menus) ? menus.map(normalizeMenu) : [];
};

export const getCategories = async () => {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  const categories = unwrap(response);
  return Array.isArray(categories) ? categories.map(normalizeCategory) : [];
};

export const getTables = async () => {
  const response = await api.get<ApiResponse<Table[]>>('/tables');
  const tables = unwrap(response);
  return Array.isArray(tables) ? tables : [];
};

export const createTable = async (table: { table_number: string; capacity: number; status?: Table['status'] }) => {
  const response = await api.post<ApiResponse<Table>>('/tables', table);
  return unwrap(response);
};

export const deleteTableById = async (id: number) => {
  await api.delete(`/tables/${id}`);
};

export const updateTableById = async (
  id: number,
  table: { table_number: string; capacity: number; status: Table['status'] }
) => {
  const response = await api.put<ApiResponse<Table>>(`/tables/${id}`, table);
  return unwrap(response);
};

export const getOrders = async () => {
  const response = await api.get<ApiResponse<BackendOrder[]>>('/orders');
  const orders = unwrap(response);
  return Array.isArray(orders) ? orders.map(normalizeOrder) : [];
};

export const getPayments = async () => {
  const response = await api.get<ApiResponse<BackendPayment[]>>('/payments');
  const payments = unwrap(response);
  return Array.isArray(payments) ? payments.map(normalizePayment) : [];
};

export const getSplitBills = async () => {
  const response = await api.get<ApiResponse<BackendSplitBill[]>>('/splitbills');
  const items = unwrap(response);
  return Array.isArray(items) ? items.map(normalizeSplitBill) : [];
};

export const deletePaymentById = async (id: number) => {
  await api.delete(`/payments/${id}`);
};

export const deleteSplitBillById = async (id: number) => {
  await api.delete(`/splitbills/${id}`);
};

export const getStaff = async () => {
  const response = await api.get<ApiResponse<Staff[]>>('/staff');
  const staff = unwrap(response);
  return Array.isArray(staff) ? staff.map((member) => normalizeStaff(member)!) : [];
};

export const getRoles = async () => {
  const response = await api.get<ApiResponse<Role[]>>('/roles');
  const roles = unwrap(response);
  return Array.isArray(roles) ? roles : [];
};

export const getPromos = async () => {
  const response = await api.get<ApiResponse<Promo[]>>('/promos');
  const promos = unwrap(response);
  return Array.isArray(promos) ? promos.map(normalizePromo) : [];
};

export const createCategory = async (name: string) => {
  const response = await api.post<ApiResponse<Category>>('/categories', { name });
  return normalizeCategory(unwrap(response));
};

export const updateCategoryById = async (id: number, name: string) => {
  const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, { name });
  return normalizeCategory(unwrap(response));
};

export const deleteCategoryById = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

export const createMenu = async (menu: Omit<Menu, 'id' | 'category' | 'created_at'>) => {
  const response = await api.post<ApiResponse<BackendMenu>>('/menus', {
    category_id: menu.categories_id,
    name: menu.name,
    description: menu.description || '',
    price: menu.price,
    is_available: menu.is_available,
    image: menu.image || '',
  });
  return normalizeMenu(unwrap(response));
};

export const updateMenuById = async (menu: Menu) => {
  const response = await api.put<ApiResponse<BackendMenu>>(`/menus/${menu.id}`, {
    category_id: menu.categories_id,
    name: menu.name,
    description: menu.description || '',
    price: menu.price,
    is_available: menu.is_available,
    image: menu.image || '',
  });
  return normalizeMenu(unwrap(response));
};

export const deleteMenuById = async (id: number) => {
  await api.delete(`/menus/${id}`);
};

export const createStaff = async (staff: {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  is_active: boolean;
}) => {
  const response = await api.post<ApiResponse<Staff>>('/staff', staff);
  return normalizeStaff(unwrap(response))!;
};

export const updateStaffById = async (
  id: number,
  staff: {
    full_name: string;
    username: string;
    email: string;
    phone: string;
    password?: string;
    role_id: number;
    is_active: boolean;
  }
) => {
  const response = await api.put<ApiResponse<Staff>>(`/staff/${id}`, staff);
  return normalizeStaff(unwrap(response))!;
};

export const deleteStaffById = async (id: number) => {
  await api.delete(`/staff/${id}`);
};

export const createPromo = async (promo: Omit<Promo, 'id' | 'created_at' | 'buy_menu' | 'free_menu'>) => {
  const response = await api.post<ApiResponse<Promo>>('/promos', {
    ...promo,
    start_date: promo.start_date.toISOString(),
    end_date: promo.end_date.toISOString(),
  });
  return normalizePromo(unwrap(response));
};

export const updatePromoById = async (promo: Promo) => {
  const response = await api.put<ApiResponse<Promo>>(`/promos/${promo.id}`, {
    name: promo.name,
    description: promo.description || '',
    promo_type: promo.promo_type,
    buy_menu_id: promo.buy_menu_id,
    free_menu_id: promo.free_menu_id,
    buy_quantity: promo.buy_quantity,
    free_quantity: promo.free_quantity,
    start_date: promo.start_date.toISOString(),
    end_date: promo.end_date.toISOString(),
    is_active: promo.is_active,
  });
  return normalizePromo(unwrap(response));
};

export const deletePromoById = async (id: number) => {
  await api.delete(`/promos/${id}`);
};

export const updateTableStatusById = async (id: number, status: Table['status']) => {
  await api.patch(`/tables/${id}/status`, { status });
};

export const createOrder = async (orderData: {
  table_id: number;
  source: string;
  client_ref_id: string;
  items: Array<{ menu_id: number; quantity: number; notes?: string }>;
}) => {
  const response = await api.post<ApiResponse<BackendOrder>>('/orders', orderData);
  return normalizeOrder(unwrap(response));
};

export const addOrderItems = async (
  orderId: number,
  items: Array<{ menu_id: number; quantity: number; notes?: string }>
) => {
  const response = await api.post<ApiResponse<BackendOrder>>(`/orders/${orderId}/items`, { items });
  return normalizeOrder(unwrap(response));
};

export const cancelOrder = async (orderId: number) => {
  await api.delete(`/orders/${orderId}`);
};

export const cancelOrderItem = async (orderId: number, itemId: number) => {
  const response = await api.delete<ApiResponse<BackendOrder>>(`/orders/${orderId}/items/${itemId}`);
  return normalizeOrder(unwrap(response));
};

export const moveOrderTable = async (orderId: number, newTableId: number) => {
  const response = await api.put<ApiResponse<BackendOrder>>(`/orders/${orderId}/move-table`, {
    new_table_id: newTableId,
  });
  return normalizeOrder(unwrap(response));
};

export const splitOrderTable = async (
  orderId: number,
  newTableId: number,
  items: Array<{ item_id: number; qty: number }>
) => {
  const response = await api.post<ApiResponse<{ old_order: BackendOrder; new_order: BackendOrder }>>(
    `/orders/${orderId}/split-table`,
    {
      new_table_id: newTableId,
      source: 'dine_in',
      items,
    }
  );
  const data = unwrap(response);
  return {
    old_order: normalizeOrder(data.old_order),
    new_order: normalizeOrder(data.new_order),
  };
};

export const mergeOrders = async (targetOrderId: number, sourceOrderId: number) => {
  const response = await api.post<ApiResponse<BackendOrder>>(`/orders/${targetOrderId}/merge`, {
    source_order_id: sourceOrderId,
  });
  return normalizeOrder(unwrap(response));
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await api.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/status`, { status });
  return normalizeOrder(unwrap(response));
};

export const processPayment = async (payload: {
  order_id: number;
  payment_method: Payment['payment_method'];
  amount_paid: number;
}) => {
  const response = await api.post('/payments', payload);
  return response.data;
};

export const getDailyReport = async (days = 30) => {
  const response = await api.get('/reports/daily', { params: { days } });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getKitchenOrders = async () => {
  const response = await api.get('/kitchen/orders');
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const updateKitchenItemStatus = async (id: number, status: string) => {
  const response = await api.patch(`/kitchen/items/${id}/status`, { status });
  return response.data.data;
};
