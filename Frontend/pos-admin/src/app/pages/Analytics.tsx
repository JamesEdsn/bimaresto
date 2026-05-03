import { useState, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Calendar, Download, FileText, Image as ImageIcon, ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';
import { calculateAnalytics } from '../../utils/analyticsHelper';
import { mockOrders, mockOrderItems, mockMenus, mockSplitBills } from '../../data/mockData';

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
        <p className="text-slate-950 text-[13px] font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-slate-600 text-[12px]">
            {entry.name}: {typeof entry.value === 'number' && entry.dataKey !== 'orders' 
              ? formatCurrency(entry.value) 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { tables } = useAppContext();
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  // Calculate analytics from real data
  const metrics = useMemo(() => 
    calculateAnalytics(mockOrders, mockOrderItems, mockMenus, startDate, endDate, mockSplitBills, tables.length),
    [startDate, endDate, tables.length]
  );

  const handleExportCSV = () => {
    // Prepare data for export
    const reportData = {
      period: `${startDate} to ${endDate}`,
      generated: new Date().toLocaleString('id-ID'),
      restaurant: 'Bima Resto',
      summary: {
        totalRevenue: metrics.totalRevenue,
        totalOrders: metrics.totalOrders,
        avgOrderValue: metrics.avgOrderValue,
        totalTables: metrics.totalTables,
        totalSplitBills: metrics.totalSplitBills,
        totalSplitAmount: metrics.totalSplitAmount,
        avgSplitAmount: metrics.avgSplitAmount,
      },
      salesByMonth: metrics.salesByMonth,
      topSellingItems: metrics.topMenus,
      categoryDistribution: metrics.categoryData,
      revenueByHour: metrics.revenueByHour,
      splitBillMethods: metrics.splitBillMethods,
    };

    // Convert to CSV format
    let csv = 'BIMA RESTO - Analytics Report\n';
    csv += `Generated: ${reportData.generated}\n`;
    csv += `Period: ${reportData.period}\n\n`;
    
    csv += 'SUMMARY\n';
    csv += `Total Revenue,${formatCurrency(reportData.summary.totalRevenue)}\n`;
    csv += `Total Orders,${reportData.summary.totalOrders}\n`;
    csv += `Average Order Value,${formatCurrency(reportData.summary.avgOrderValue)}\n`;
    csv += `Total Tables,${reportData.summary.totalTables}\n`;
    csv += `Total Split Bills,${reportData.summary.totalSplitBills}\n`;
    csv += `Total Split Amount,${formatCurrency(reportData.summary.totalSplitAmount)}\n`;
    csv += `Average Split Amount,${formatCurrency(reportData.summary.avgSplitAmount)}\n\n`;
    
    csv += 'SALES BY MONTH\n';
    csv += 'Month,Sales (Rp),Orders\n';
    metrics.salesByMonth.forEach(item => {
      csv += `${item.month},${item.sales},${item.orders}\n`;
    });
    
    csv += '\nTOP SELLING ITEMS\n';
    csv += 'Item,Sold,Revenue (Rp)\n';
    metrics.topMenus.forEach(item => {
      csv += `${item.name},${item.sold},${item.revenue}\n`;
    });

    csv += '\nSALES BY CATEGORY\n';
    csv += 'Category,Items Sold,Revenue (Rp)\n';
    metrics.categoryData.forEach(item => {
      csv += `${item.name},${item.value},${item.revenue}\n`;
    });

    csv += '\nSPLIT BILL PAYMENT METHODS\n';
    csv += 'Method,Count,Amount (Rp)\n';
    metrics.splitBillMethods.forEach(item => {
      csv += `${item.method},${item.count},${item.amount}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bima-resto-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportImage = async () => {
    if (!chartsRef.current) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(chartsRef.current, {
        cacheBust: true,
        backgroundColor: '#141422',
        pixelRatio: 2,
        filter: (node) => {
          return !node.classList?.contains('no-export');
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `bima-resto-analytics-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Gagal export charts sebagai gambar. Silakan coba lagi.');
    }
  };

  type MetricCardProps = {
    title: string;
    value: string;
    note: string;
    icon: React.ReactNode;
    accent: string;
    statusLabel?: string;
  };

  const MetricCard = ({ title, value, note, icon, accent, statusLabel = 'Live' }: MetricCardProps) => (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl min-h-[182px]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/70 blur-2xl transition-opacity duration-300 group-hover:bg-slate-200/70" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} shadow-lg shadow-slate-200`}>
            {icon}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{statusLabel}</span>
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          <p className="text-slate-500 text-[12px] font-medium uppercase tracking-[0.14em]">{title}</p>
          <p className="text-slate-950 text-[26px] leading-tight font-bold tracking-tight">{value}</p>
        </div>
        <p className="mt-4 text-slate-500 text-[12px] leading-5">{note}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-slate-950 text-[24px] font-bold">Analytics & Reports</h1>
            <p className="text-slate-500 text-[14px] mt-1">Sales performance and insights</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 text-[13px]"
                />
              </div>
              <span className="text-slate-400">to</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 text-[13px]"
                />
              </div>
            </div>

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="text-[14px]">Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 hover:bg-slate-50 transition-all text-left"
                    >
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-[14px]">Export as CSV</span>
                    </button>
                    <div className="h-px bg-slate-200" />
                    <button 
                      onClick={handleExportImage}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 hover:bg-slate-50 transition-all text-left"
                    >
                      <ImageIcon className="w-4 h-4 text-orange-400" />
                      <span className="text-[14px]">Export as Image</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6" ref={chartsRef}>
        {/* KPI Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="text-slate-950 text-[16px] font-bold tracking-tight">Ringkasan Utama</h2>
            <p className="text-slate-500 text-[13px] mt-1">Angka paling penting dibuat lebih rapi dan sejajar supaya cepat dibaca.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              note={`Period: ${startDate} to ${endDate}`}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              accent="from-emerald-500 to-green-600"
            />
            <MetricCard
              title="Total Orders"
              value={String(metrics.totalOrders)}
              note="Transactions synced"
              icon={<ShoppingCart className="w-6 h-6 text-white" />}
              accent="from-orange-500 to-amber-600"
              statusLabel="Synced"
            />
            <MetricCard
              title="Average Order Value"
              value={formatCurrency(metrics.avgOrderValue)}
              note="Per transaction"
              icon={<Calendar className="w-6 h-6 text-white" />}
              accent="from-violet-500 to-fuchsia-600"
            />
            <MetricCard
              title="Total Tables"
              value={String(metrics.totalTables)}
              note="Live tables synced from the Tables page"
              icon={<Users className="w-6 h-6 text-white" />}
              accent="from-sky-500 to-blue-600"
              statusLabel="Live"
            />
          </div>
        </div>

        {/* Split Bill KPI Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="text-slate-950 text-[16px] font-bold tracking-tight">Ringkasan Split Bill</h2>
            <p className="text-slate-500 text-[13px] mt-1">Kartu di bawah dibuat sejajar supaya tidak terasa padat dan lebih mudah dipindai.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MetricCard
              title="Total Split Bills"
              value={String(metrics.totalSplitBills)}
              note="Transactions split"
              icon={<Users className="w-6 h-6 text-white" />}
              accent="from-indigo-500 to-violet-600"
            />
            <MetricCard
              title="Total Split Amount"
              value={formatCurrency(metrics.totalSplitAmount)}
              note="Split transactions value"
              icon={<DollarSign className="w-6 h-6 text-white" />}
              accent="from-cyan-500 to-sky-600"
            />
            <MetricCard
              title="Average Split Amount"
              value={formatCurrency(metrics.avgSplitAmount)}
              note="Per split transaction"
              icon={<Calendar className="w-6 h-6 text-white" />}
              accent="from-teal-500 to-emerald-600"
            />
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={metrics.salesByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5 }}
                  name="Sales (Rp)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%"
                  cy="45%"
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="name"
                >
                  {metrics.categoryData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                          <p className="text-slate-950 text-[13px] font-bold mb-1">{data.name}</p>
                          <p className="text-slate-600 text-[12px]">Revenue: {formatCurrency(data.revenue)}</p>
                          <p className="text-slate-600 text-[12px]">Items Sold: {data.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend placed inside the same card, centered and wrapped */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 px-4">
              {metrics.categoryData.map((c) => {
                const millions = (c.revenue / 1000000);
                const label = `${c.name}: Rp ${millions % 1 === 0 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`}`;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-sm" style={{ background: c.color }} />
                    <span className="text-[15px] font-medium text-slate-800">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Hour */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Revenue by Hour</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={metrics.revenueByHour}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                  name="Revenue (Rp)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Top Selling Items</h3>
            <div className="space-y-4">
              {metrics.topMenus.map((menu, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-[14px]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-slate-900 text-[14px] font-medium">{menu.name}</p>
                      <p className="text-slate-500 text-[12px]">{menu.sold} sold</p>
                    </div>
                  </div>
                  <p className="text-emerald-600 text-[13px] font-bold">{formatCurrency(menu.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 3 - Split Bill Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Split Bill Payment Methods */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Split Bill Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.splitBillMethods}>
                <defs>
                  <linearGradient id="splitBillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="method" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="url(#splitBillGradient)" 
                  radius={[8, 8, 0, 0]}
                  name="Amount (Rp)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Split Bill Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-slate-950 text-[18px] font-bold mb-6">Split Bill Breakdown</h3>
            <div className="space-y-4">
              {metrics.splitBillMethods.map((method, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-900 text-[14px] font-medium">{method.method}</p>
                    <p className="text-indigo-600 text-[12px] font-bold">{method.count} splits</p>
                  </div>
                  <p className="text-slate-600 text-[13px]">Total: {formatCurrency(method.amount)}</p>
                  <p className="text-slate-500 text-[11px] mt-1">Avg: {formatCurrency(Math.round(method.amount / method.count))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
