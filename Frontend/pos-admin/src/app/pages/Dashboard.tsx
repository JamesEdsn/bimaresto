import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Grid3x3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';
import { calculateAnalytics } from '../../utils/analyticsHelper';

export default function Dashboard() {
  const { orders, tables, orderItems, menus } = useAppContext();
  const [username, setUsername] = useState('Admin');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    // Check both localStorage (stay signed in) and sessionStorage (session only)
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || 'Admin');
      setRole(userData.role || 'admin');
    }
  }, []);

  const analytics = useMemo(
    () => calculateAnalytics(orders, orderItems, menus, '2000-01-01', '2099-12-31'),
    [orders, orderItems, menus]
  );

  // Calculate stats from context data
  const totalRevenue = analytics.totalRevenue;
  const activeTables = tables.filter(t => t.status === 'occupied').length;
  const topMenus = analytics.topMenus;
  
  // Get recent orders (last 4)
  const recentOrders = [...orders]
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
      color: 'from-green-400 to-green-600'
    },
    { 
      value: orders.length.toString(), 
      change: '+8', 
      label: 'Total Orders',
      icon: ShoppingCart,
      isPositive: true,
      color: 'from-blue-400 to-blue-600'
    },
    { 
      value: activeTables.toString(), 
      change: '+5', 
      label: 'Active Tables',
      icon: Grid3x3,
      isPositive: true,
      color: 'from-purple-400 to-purple-600'
    },
    { 
      value: '8', 
      change: '0', 
      label: 'Staff Online',
      icon: Users,
      isPositive: true,
      color: 'from-orange-400 to-orange-600'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="mx-8 mt-8 rounded-[32px] border border-orange-100 bg-orange-50/80 p-8 shadow-lg shadow-orange-200/60 overflow-hidden relative">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-orange-200/70 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-orange-300/50 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700">
              Dashboard • BimaResto
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">Welcome back, {username}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Jaga fokus pada pesanan dan omzet dengan tampilan yang bersih dan modern, tetap mempertahankan warna logo di bagian sidebar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm shadow-green-100/70 border border-green-200">Aman</span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-100 border border-slate-200">{role}</span>
            </div>
          </div>

          <div className="relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white/80 p-4 shadow-lg">
            <div className="h-80 rounded-[28px] bg-gradient-to-br from-slate-950/10 via-orange-100 to-orange-50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="h-12 w-12 rounded-3xl bg-slate-950/10" />
                <div className="h-10 w-10 rounded-3xl bg-orange-300/80" />
              </div>
              <div className="flex h-full items-end justify-between">
                <div className="space-y-3">
                  <div className="h-5 w-24 rounded-full bg-slate-950/15" />
                  <div className="h-5 w-32 rounded-full bg-slate-950/15" />
                  <div className="h-12 w-24 rounded-full bg-orange-200/90" />
                </div>
                <div className="h-40 w-40 rounded-[28px] bg-slate-950/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-8 mt-6 rounded-[28px] bg-white border border-slate-200 p-6 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-700">
              <span>🍽️</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">Lihat ringkasan restoran</p>
              <p className="text-sm text-slate-500">Data pesanan dan operasional diperbarui secara real time.</p>
            </div>
          </div>
          <span className="rounded-full border border-green-200 bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">Aman</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-8 mt-8 p-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-slate-300/30`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[14px] font-medium flex items-center gap-1 ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </span>
              </div>
              <p className="text-slate-950 text-[28px] font-bold mb-1">{stat.value}</p>
              <p className="text-slate-600 text-[14px]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-950 text-[18px] font-bold">Recent Orders</h3>
              <a href="/dashboard/orders" className="text-[#d96b10] text-[12px] hover:text-[#b44e0a]">
                View All →
              </a>
            </div>
            
            <div className="space-y-4 divide-y divide-slate-200">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg hover:bg-slate-50 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-slate-900 text-[14px] font-medium">{order.id}</p>
                      <span className={`px-2 py-1 text-[10px] rounded-full ${
                        order.status === 'Completed' ? 'bg-green-200 text-green-900 border border-green-300' :
                        order.status === 'Cooking' ? 'bg-yellow-200 text-yellow-900 border border-yellow-300' :
                        order.status === 'Served' ? 'bg-sky-200 text-sky-900 border border-sky-300' :
                        'bg-slate-200 text-slate-900 border border-slate-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[#5c6f40] text-[12px]">{order.table} • {order.items} items • {order.time}</p>
                  </div>
                  <p className="text-slate-900 text-[16px] font-bold">{order.total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Menus */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-950 text-[18px] font-bold">Top Selling Items</h3>
              <p className="text-slate-500 text-[12px]">Live</p>
            </div>
            
            <div className="space-y-4 divide-y divide-slate-200">
              {topMenus.map((menu, index) => (
                <div key={menu.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                    index === 0
                      ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-white'
                      : index === 1
                        ? 'bg-gradient-to-br from-sky-300 to-blue-500 text-white'
                        : index === 2
                          ? 'bg-gradient-to-br from-emerald-300 to-green-500 text-white'
                          : index === 3
                            ? 'bg-gradient-to-br from-violet-300 to-purple-500 text-white'
                            : index === 4
                              ? 'bg-gradient-to-br from-rose-300 to-pink-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 text-[14px] font-medium mb-1">{menu.name}</p>
                    <p className="text-slate-500 text-[12px]">{menu.sold} orders</p>
                  </div>
                  <p className="text-slate-900 text-[16px] font-bold">{formatCurrency(menu.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Chart Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900 text-[18px] font-bold">Sales Overview</h3>
              <p className="text-slate-500 text-[12px] mt-1">Weekly revenue comparison</p>
            </div>
            <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-400">
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
                    className="w-full bg-gradient-to-t from-orange-400 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${heights[index]}%` }}
                  />
                  <p className="text-gray-400 text-[12px] mt-2">{day}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}