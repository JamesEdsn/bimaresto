import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Grid3x3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

const topMenus = [
  { name: 'Classic Burger', orders: 24, revenue: formatCurrency(5400000), icon: '🍔' },
  { name: 'Margherita Pizza', orders: 18, revenue: formatCurrency(4860000), icon: '🍕' },
  { name: 'Caesar Salad', orders: 15, revenue: formatCurrency(2700000), icon: '🥗' },
];

export default function Dashboard() {
  const { orders, tables } = useAppContext();
  const [username, setUsername] = useState('Admin');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || 'Admin');
      setRole(userData.role || 'admin');
    }
  }, []);

  // Calculate stats from context data
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeTables = tables.filter(t => t.status === 'occupied').length;
  
  // Get recent orders (last 4)
  const recentOrders = orders
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 4)
    .map(order => ({
      id: `#${order.id}`,
      table: `Table ${order.table?.table_number}`,
      items: 3, // Placeholder - can be calculated from orderItems
      total: formatCurrency(order.total),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      time: getTimeAgo(order.created_at)
    }));

  function getTimeAgo(date: Date): string {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  }

  const stats = [
    { 
      value: formatCurrency(totalRevenue), 
      change: '+12.5%', 
      label: 'Total Revenue',
      icon: DollarSign,
      isPositive: true,
      accent: 'brand' as const,
    },
    { 
      value: orders.length.toString(), 
      change: '+8', 
      label: 'Total Orders',
      icon: ShoppingCart,
      isPositive: true,
      accent: 'info' as const,
    },
    { 
      value: activeTables.toString(), 
      change: '+5', 
      label: 'Active Tables',
      icon: Grid3x3,
      isPositive: true,
      accent: 'primary' as const,
    },
    { 
      value: '8', 
      change: '0', 
      label: 'Staff Online',
      icon: Users,
      isPositive: true,
      accent: 'violet' as const,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-[14px] mt-1">Welcome back, {username}!</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[12px]">Today's Date</p>
            <p className="text-foreground text-[14px] font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const accentIcon =
              stat.accent === 'brand'
                ? 'bg-brand text-brand-foreground'
                : stat.accent === 'info'
                  ? 'bg-info text-info-foreground'
                  : stat.accent === 'primary'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-violet-600 text-white';
            const accentTrend =
              stat.accent === 'brand'
                ? 'text-brand'
                : stat.accent === 'info'
                  ? 'text-info'
                  : stat.accent === 'primary'
                    ? 'text-primary'
                    : 'text-violet-600';
            return (
            <div key={index} className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${accentIcon}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-[14px] font-medium flex items-center gap-1 ${stat.isPositive ? accentTrend : 'text-destructive'}`}>
                  {stat.change}
                  {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </span>
              </div>
              <p className="text-foreground text-[28px] font-bold mb-1">{stat.value}</p>
              <p className="text-muted-foreground text-[14px]">{stat.label}</p>
            </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-[18px] font-bold">Recent Orders</h3>
              <a href="/dashboard/orders" className="text-info text-[12px] hover:text-info/80">
                View All →
              </a>
            </div>
            
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-foreground text-[14px] font-medium">{order.id}</p>
                      <span className={`px-2 py-1 text-[10px] rounded-full ${
                        order.status === 'Completed' ? 'bg-brand/15 text-brand' :
                        order.status === 'Cooking' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Served' ? 'bg-info/15 text-info' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[12px]">{order.table} • {order.items} items • {order.time}</p>
                  </div>
                  <p className="text-foreground text-[16px] font-bold">{order.total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Menus */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-[18px] font-bold">Top Selling Items</h3>
              <p className="text-muted-foreground text-[12px]">Today</p>
            </div>
            
            <div className="space-y-4">
              {topMenus.map((menu, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-2xl">
                    {menu.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-[14px] font-medium mb-1">{menu.name}</p>
                    <p className="text-muted-foreground text-[12px]">{menu.orders} orders</p>
                  </div>
                  <p className="text-foreground text-[16px] font-bold">{menu.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Chart Section */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground text-[18px] font-bold">Sales Overview</h3>
              <p className="text-muted-foreground text-[12px] mt-1">Weekly revenue comparison</p>
            </div>
            <select className="px-4 py-2 bg-card border border-border rounded-lg text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-primary">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          
          {/* Simple Bar Chart Representation */}
          <div className="flex items-end justify-between gap-4 h-48">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const heights = [60, 80, 45, 90, 70, 85, 65];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div 
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/90"
                    style={{ height: `${heights[index]}%` }}
                  />
                  <p className="text-muted-foreground text-[12px] mt-2">{day}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}