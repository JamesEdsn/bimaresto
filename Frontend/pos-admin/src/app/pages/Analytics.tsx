import { useState, useRef, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Calendar, Download, FileText, Image as ImageIcon, ChevronDown, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';
import { calculateAnalytics } from '../../utils/analyticsHelper';
import api from '../../api/api';

const getDailyReport = async (startDate: string, endDate: string, days: number) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await api.get('/reports/daily', { 
      params: { start_date: startDate, end_date: endDate, days },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Daily report request timed out');
    }
    throw error;
  }
};

// NOTE: untuk sementara agar TS tidak error, daily report diperlakukan sebagai `any`.
// Struktur field dari backend: { date, total_orders, total_revenue, total_tax, total_service }

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

const Analytics = () => {
  const { tables, orders, orderItems, menus, splitBills } = useAppContext();
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return start.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => today.toISOString().split('T')[0]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const daysFromRange = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffMs = e.getTime() - s.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays + 1 : 30;
  }, [startDate, endDate]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoadingReports(true);
      setReportsError(null);
      try {
        const data = await getDailyReport(startDate, endDate, daysFromRange);
        if (!cancelled) setDailyReports(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load daily report:', err);
          let errorMsg = 'Gagal mengambil data laporan harian';
          
          // More specific error messages
          if (err.name === 'AbortError' || err.message?.includes('timed out')) {
            errorMsg = 'API request timeout - silakan coba lagi';
          } else if (err.response?.status === 401) {
            errorMsg = 'Session expired - silakan login kembali';
          } else if (err.response?.status === 403) {
            errorMsg = 'Anda tidak memiliki akses ke laporan';
          } else if (err.message?.includes('Network')) {
            errorMsg = 'Koneksi gagal - periksa internet Anda';
          }
          
          setReportsError(errorMsg);
          setDailyReports([]);
        }
      } finally {
        if (!cancelled) setIsLoadingReports(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, retryCount]);

  const metrics = useMemo(() => {
    return calculateAnalytics(orders, orderItems, menus, startDate, endDate, splitBills, tables.length);
  }, [orders, orderItems, menus, startDate, endDate, splitBills, tables.length]);

  const dailyRevenue = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const reportMap = new Map<string, any>();
    if (Array.isArray(dailyReports)) {
      dailyReports.forEach(r => {
        reportMap.set(r.date, r);
      });
    }

    const result = [];
    let current = new Date(start);
    let idx = 0;

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const r = reportMap.get(dateStr);

      result.push({
        id: `day-${idx++}`,
        date: dateStr,
        revenue: r ? (Number(r.total_revenue) || 0) : 0,
        orders: r ? (Number(r.total_orders) || 0) : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    if (result.length === 0) {
      return [{ id: 'empty', date: 'No Data', revenue: 0, orders: 0 }];
    }

    return result;
  }, [dailyReports, startDate, endDate]);

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
    metrics.salesByMonth.forEach((item: any) => {
      csv += `${item.month},${item.sales},${item.orders}\n`;
    });
    
    csv += '\nTOP SELLING ITEMS\n';
    csv += 'Item,Sold,Revenue (Rp)\n';
    metrics.topMenus.forEach((item: any) => {
      csv += `${item.name},${item.sold},${item.revenue}\n`;
    });

    csv += '\nSALES BY CATEGORY\n';
    csv += 'Category,Items Sold,Revenue (Rp)\n';
    metrics.categoryData.forEach((item: any) => {
      csv += `${item.name},${item.value},${item.revenue}\n`;
    });

    csv += '\nSPLIT BILL PAYMENT METHODS\n';
    csv += 'Method,Count,Amount (Rp)\n';
    metrics.splitBillMethods.forEach((item: any) => {
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
            {/* Refresh Button */}
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingReports ? 'animate-spin text-orange-500' : ''}`} />
            </button>

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
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-slate-950 text-[16px] font-bold tracking-tight">Ringkasan Utama</h2>
              <p className="text-slate-500 text-[13px] mt-1">Angka paling penting (sumber: data API laporan harian).</p>
            </div>
          <div className="text-right">
              {isLoadingReports ? (
                <p className="text-slate-500 text-[13px]">⏳ Memuat laporan harian...</p>
              ) : reportsError ? (
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-red-600 text-[13px]">⚠️ {reportsError}</p>
                  <button
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="text-blue-600 text-[12px] font-semibold hover:text-blue-700 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-[13px]">✓ Daily data: {dailyReports.length} hari</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(
                isLoadingReports ? 0 : dailyRevenue.reduce((sum: number, d: any) => sum + (Number(d.revenue) || 0), 0)
              )}
              note={isLoadingReports ? "Loading from API..." : `Period: ${startDate} to ${endDate}`}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              accent="from-emerald-500 to-green-600"
            />
            <MetricCard
              title="Total Orders"
              value={String(
                isLoadingReports ? 0 : dailyRevenue.reduce((sum: number, d: any) => sum + (Number(d.orders) || 0), 0)
              )}
              note={isLoadingReports ? "Loading from API..." : "Transactions synced"}
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
              <LineChart data={dailyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : String(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
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
                  {metrics.categoryData.map((entry: any) => (
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
              {metrics.categoryData.map((c: any) => {
                const label = `${c.name}: ${formatCurrency(c.revenue)}`;
                return (
                  <div key={c.id} className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
                    <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-[15px] font-medium text-slate-800 whitespace-nowrap">{label}</span>
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
              {metrics.topMenus.map((menu: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 text-[14px] font-medium break-words">{menu.name}</p>
                      <p className="text-slate-500 text-[12px]">{menu.sold} sold</p>
                    </div>
                  </div>
                  <p className="text-emerald-600 text-[13px] font-bold flex-shrink-0">{formatCurrency(menu.revenue)}</p>
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
              {metrics.splitBillMethods.map((method: any, index: number) => (
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
};

export default Analytics;

