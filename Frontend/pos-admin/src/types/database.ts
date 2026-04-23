// Database Types sesuai dengan schema

export type Role = {
  id: number;
  name: string;
};

export type Staff = {
  id: number;
  role_id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  role?: Role;
};

export type Category = {
  id: number;
  name: string;
  created_at: Date;
};

export type Menu = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image: string | null;
  categories_id: number;
  created_at?: Date;
  category?: Category;
};

export type Table = {
  id: number;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved';
};

export type Order = {
  id: number;
  tables_id: number;
  staff_id: number;
  order_source: string;
  status: 'pending' | 'cooking' | 'served' | 'completed' | 'cancelled';
  total: number;
  created_at: Date;
  updated_at: Date;
  table?: Table;
  staff?: Staff;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  order_id: number;
  menus_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  status: 'pending' | 'cooking' | 'served' | 'cancelled';
  created_at: Date;
  menu?: Menu;
};

export type Payment = {
  id: number;
  order_id: number;
  tables_id: number;
  staff_id: number;
  total: number;
  payment_method: 'card' | 'e-wallet';
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at: Date | null;
  table?: Table;
  staff?: Staff;
};

export type Promo = {
  id: number;
  name: string;
  description: string | null;
  promo_type: 'bundle';
  buy_menu_id: number;
  free_menu_id: number;
  buy_quantity: number;
  free_quantity: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
  buy_menu?: Menu;
  free_menu?: Menu;
};

// Auth Context Type
export type AuthUser = {
  staff: Staff;
  role: Role;
};