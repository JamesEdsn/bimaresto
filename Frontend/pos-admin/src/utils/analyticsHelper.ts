import { Order, OrderItem, Menu, SplitBill } from '../types/database';

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalTables: number;
  totalSplitBills: number;
  totalSplitAmount: number;
  avgSplitAmount: number;
  salesByMonth: Array<{ id: string; month: string; sales: number; orders: number }>;
  categoryData: Array<{ id: string; name: string; value: number; revenue: number; color: string }>;
  topMenus: Array<{ id: number; name: string; sold: number; revenue: number }>;
  revenueByHour: Array<{ id: string; hour: string; revenue: number }>;
  splitBillMethods: Array<{ id: string; method: string; count: number; amount: number }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Burgers': '#f97316',
  'Pizza': '#ec4899',
  'Salads': '#8b5cf6',
  'Beverages': '#06b6d4',
  'Desserts': '#f59e0b',
};

export function calculateAnalytics(
  orders: Order[],
  orderItems: OrderItem[],
  menus: Menu[],
  startDate: string,
  endDate: string,
  splitBills?: SplitBill[],
  totalTablesCount?: number
): AnalyticsMetrics {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= start && orderDate <= end;
  });

  // Filter split bills by date range
  const filteredSplitBills = splitBills?.filter(sb => {
    const sbDate = new Date(sb.created_at);
    return sbDate >= start && sbDate <= end;
  }) || [];

  // Calculate basic metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalTables = totalTablesCount ?? new Set(filteredOrders.map(o => o.tables_id)).size;

  // Split bill metrics
  const totalSplitBills = filteredSplitBills.length;
  const totalSplitAmount = filteredSplitBills.reduce((sum, sb) => sum + sb.amount, 0);
  const avgSplitAmount = totalSplitBills > 0 ? totalSplitAmount / totalSplitBills : 0;

  // Sales by month
  const monthMap = new Map<string, { sales: number; orders: number }>();
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  filteredOrders.forEach(order => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = monthOrder[date.getMonth()];

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { sales: 0, orders: 0 });
    }
    const current = monthMap.get(monthKey)!;
    current.sales += order.total;
    current.orders += 1;
  });

  const salesByMonth = Array.from(monthMap.entries()).map(([key, data], index) => ({
    id: `month-${index}`,
    month: monthOrder[parseInt(key.split('-')[1])],
    sales: data.sales,
    orders: data.orders,
  }));

  // Get order items for filtered orders
  const filteredOrderIds = new Set(filteredOrders.map(o => o.id));
  const relevantItems = orderItems.filter(item => filteredOrderIds.has(item.order_id));

  // Category distribution
  const categoryMap = new Map<string, { quantity: number; revenue: number }>();
  relevantItems.forEach(item => {
    const menu = menus.find(m => m.id === item.menus_id);
    if (menu) {
      const category = menu.category?.name || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { quantity: 0, revenue: 0 });
      }
      const current = categoryMap.get(category)!;
      current.quantity += item.quantity;
      current.revenue += item.subtotal;
    }
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, data], index) => ({
    id: `cat-${index}`,
    name,
    value: data.quantity,
    revenue: data.revenue,
    color: CATEGORY_COLORS[name] || '#6b7280',
  }));

  // Top selling menus
  const menuSalesMap = new Map<number, { name: string; sold: number; revenue: number }>();
  relevantItems.forEach(item => {
    const menu = menus.find(m => m.id === item.menus_id);
    if (menu) {
      if (!menuSalesMap.has(menu.id)) {
        menuSalesMap.set(menu.id, { name: menu.name, sold: 0, revenue: 0 });
      }
      const current = menuSalesMap.get(menu.id)!;
      current.sold += item.quantity;
      current.revenue += item.subtotal;
    }
  });

  const topMenus = Array.from(menuSalesMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Revenue by hour
  const hourMap = new Map<number, number>();
  filteredOrders.forEach(order => {
    const date = new Date(order.created_at);
    const hour = date.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + order.total);
  });

  const revenueByHour = Array.from({ length: 12 }, (_, i) => {
    const hour = 9 + i;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      id: `hour-${hour}`,
      hour: `${displayHour}${ampm}`,
      revenue: hourMap.get(hour) || 0,
    };
  });

  // Split bill payment methods breakdown
  const paymentMethodMap = new Map<string, { count: number; amount: number }>();
  filteredSplitBills.forEach(sb => {
    const method = sb.payment_method;
    if (!paymentMethodMap.has(method)) {
      paymentMethodMap.set(method, { count: 0, amount: 0 });
    }
    const current = paymentMethodMap.get(method)!;
    current.count += 1;
    current.amount += sb.amount;
  });

  const splitBillMethods = Array.from(paymentMethodMap.entries()).map(([method, data], index) => ({
    id: `method-${index}`,
    method: method === 'card' ? 'Card' : 'E-Wallet',
    count: data.count,
    amount: data.amount,
  }));

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue),
    totalTables,
    totalSplitBills,
    totalSplitAmount,
    avgSplitAmount: Math.round(avgSplitAmount),
    salesByMonth: salesByMonth.length > 0 ? salesByMonth : [
      { id: 'empty', month: 'No Data', sales: 0, orders: 0 },
    ],
    categoryData: categoryData.length > 0 ? categoryData : [
      { id: 'empty', name: 'No Data', value: 0, color: '#e5e7eb' },
    ],
    topMenus: topMenus.length > 0 ? topMenus : [
      { id: 0, name: 'No Data', sold: 0, revenue: 0 },
    ],
    revenueByHour,
    splitBillMethods: splitBillMethods.length > 0 ? splitBillMethods : [
      { id: 'empty', method: 'No Data', count: 0, amount: 0 },
    ],
  };
}
