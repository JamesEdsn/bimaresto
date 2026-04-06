import { useState, useRef } from 'react';
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

// Sample data (converted to IDR)
const salesData = [
  { id: 'jan', month: 'Jan', sales: 187500000, orders: 145 },
  { id: 'feb', month: 'Feb', sales: 237000000, orders: 178 },
  { id: 'mar', month: 'Mar', sales: 213000000, orders: 162 },
  { id: 'apr', month: 'Apr', sales: 283500000, orders: 201 },
  { id: 'may', month: 'May', sales: 336000000, orders: 245 },
  { id: 'jun', month: 'Jun', sales: 384000000, orders: 278 },
];

const categoryData = [
  { id: 'main', name: 'Main Course', value: 45, color: '#ff8533' },
  { id: 'beverages', name: 'Beverages', value: 25, color: '#1976d2' },
  { id: 'desserts', name: 'Desserts', value: 20, color: '#3a8a70' },
  { id: 'appetizers', name: 'Appetizers', value: 10, color: '#5c9fd6' },
];

const topMenus = [
  { id: 1, name: 'Grilled Chicken', category: 'Main Course', sold: 234, revenue: 42120000 },
  { id: 2, name: 'Caesar Salad', category: 'Appetizers', sold: 198, revenue: 26730000 },
  { id: 3, name: 'Beef Burger', category: 'Main Course', sold: 187, revenue: 33660000 },
  { id: 4, name: 'Pasta Carbonara', category: 'Main Course', sold: 156, revenue: 32760000 },
  { id: 5, name: 'Iced Coffee', category: 'Beverages', sold: 145, revenue: 8700000 },
];

const categoryColorMap = categoryData.reduce((map, category) => {
  map[category.name] = category.color;
  return map;
}, {} as Record<string, string>);

const revenueByHour = [
  { id: '9am', hour: '9AM', revenue: 12750000 },
  { id: '10am', hour: '10AM', revenue: 18000000 },
  { id: '11am', hour: '11AM', revenue: 31500000 },
  { id: '12pm', hour: '12PM', revenue: 57000000 },
  { id: '1pm', hour: '1PM', revenue: 63000000 },
  { id: '2pm', hour: '2PM', revenue: 43500000 },
  { id: '3pm', hour: '3PM', revenue: 24000000 },
  { id: '4pm', hour: '4PM', revenue: 16500000 },
  { id: '5pm', hour: '5PM', revenue: 36000000 },
  { id: '6pm', hour: '6PM', revenue: 58500000 },
  { id: '7pm', hour: '7PM', revenue: 67500000 },
  { id: '8pm', hour: '8PM', revenue: 48000000 },
];

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <p className="text-foreground text-[13px] font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-muted-foreground text-[12px]">
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
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-30');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = () => {
    // Prepare data for export
    const reportData = {
      period: `${startDate} to ${endDate}`,
      generated: new Date().toLocaleString('id-ID'),
      restaurant: 'Bima Resto',
      summary: {
        totalRevenue: 1641000000,
        totalOrders: 1209,
        avgOrderValue: 1357350,
        totalCustomers: 856,
      },
      salesByMonth: salesData,
      topSellingItems: topMenus,
      categoryDistribution: categoryData,
      revenueByHour: revenueByHour,
    };

    // Convert to CSV format
    let csv = 'BIMA RESTO - Analytics Report\n';
    csv += `Generated: ${reportData.generated}\n`;
    csv += `Period: ${reportData.period}\n\n`;
    
    csv += 'SUMMARY\n';
    csv += `Total Revenue,${formatCurrency(reportData.summary.totalRevenue)}\n`;
    csv += `Total Orders,${reportData.summary.totalOrders}\n`;
    csv += `Average Order Value,${formatCurrency(reportData.summary.avgOrderValue)}\n`;
    csv += `Total Customers,${reportData.summary.totalCustomers}\n\n`;
    
    csv += 'SALES BY MONTH\n';
    csv += 'Month,Sales (Rp),Orders\n';
    salesData.forEach(item => {
      csv += `${item.month},${item.sales},${item.orders}\n`;
    });
    
    csv += '\nTOP SELLING ITEMS\n';
    csv += 'Item,Sold,Revenue (Rp)\n';
    topMenus.forEach(item => {
      csv += `${item.name},${item.sold},${item.revenue}\n`;
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
      // Wait for any animations to complete and ensure charts are rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use html-to-image which supports oklch colors and SVG
      const dataUrl = await toPng(chartsRef.current, {
        cacheBust: true,
        backgroundColor: '#f5f5f5',
        pixelRatio: 2,
        filter: (node) => {
          // Exclude elements that might cause issues
          return !node.classList?.contains('no-export');
        },
      });

      // Download the image
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground text-[14px] mt-1">Sales performance and insights</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground text-[13px]"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground text-[13px]"
                />
              </div>
            </div>

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
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
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-all text-left"
                    >
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-[14px]">Export as CSV</span>
                    </button>
                    <div className="h-px bg-[#2e2e3e]" />
                    <button 
                      onClick={handleExportImage}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-all text-left"
                    >
                      <ImageIcon className="w-4 h-4 text-primary" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-card rounded-2xl p-6 border border-border min-w-[240px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-brand flex items-center justify-center shadow-sm">
                <DollarSign className="w-6 h-6 text-brand-foreground" />
              </div>
              <div className="flex items-center gap-1 text-brand text-[12px]">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-[12px] mb-1">Total Revenue</p>
            <p className="text-foreground text-[24px] font-bold break-words whitespace-normal">{formatCurrency(1641000000)}</p>
            <p className="text-muted-foreground text-[11px] mt-2">vs last period: {formatCurrency(1458000000)}</p>
          </div>

          {/* Total Orders */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-info flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-6 h-6 text-info-foreground" />
              </div>
              <div className="flex items-center gap-1 text-info text-[12px]">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-[12px] mb-1">Total Orders</p>
            <p className="text-foreground text-[28px] font-bold">1,209</p>
            <p className="text-muted-foreground text-[11px] mt-2">vs last period: 1,117</p>
          </div>

          {/* Average Order Value */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-1 text-primary text-[12px]">
                <TrendingUp className="w-4 h-4" />
                <span>+4.1%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-[12px] mb-1">Avg Order Value</p>
            <p className="text-foreground text-[24px] font-bold">{formatCurrency(1357350)}</p>
            <p className="text-muted-foreground text-[11px] mt-2">vs last period: {formatCurrency(1304250)}</p>
          </div>

          {/* Total Customers */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-destructive text-[12px]">
                <TrendingDown className="w-4 h-4" />
                <span>-2.3%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-[12px] mb-1">Total Customers</p>
            <p className="text-foreground text-[28px] font-bold">856</p>
            <p className="text-muted-foreground text-[11px] mt-2">vs last period: 876</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-6">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid key="grid-sales" strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis key="xaxis-sales" dataKey="month" stroke="#666666" />
                <YAxis 
                  key="yaxis-sales"
                  stroke="#666666"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip key="tooltip-sales" content={<CustomTooltip />} />
                <Legend key="legend-sales" />
                <Line 
                  key="sales-line"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ff8533" 
                  strokeWidth={3}
                  dot={{ fill: '#ff8533', r: 5 }}
                  name="Sales (Rp)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-6">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  key="category-pie"
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-category" content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              {categoryData.map((category) => (
                <div key={category.id} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-muted-foreground">
                    {category.name} • {(category.value).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Hour */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-6">Revenue by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByHour}>
                <CartesianGrid key="grid-revenue" strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis key="xaxis-revenue" dataKey="hour" stroke="#666666" />
                <YAxis 
                  key="yaxis-revenue"
                  stroke="#666666"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip key="tooltip-revenue" content={<CustomTooltip />} />
                <Bar 
                  key="revenue-bar"
                  dataKey="revenue" 
                  fill="#ff8533" 
                  radius={[8, 8, 0, 0]}
                  name="Revenue (Rp)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-6">Top Selling Items</h3>
            <div className="space-y-4">
              {topMenus.map((menu, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[14px]"
                      style={{ backgroundColor: categoryColorMap[menu.category] || '#ff8533' }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground text-[14px] font-medium truncate">{menu.name}</p>
                      <p className="text-muted-foreground text-[12px]">
                        {menu.category} • {menu.sold} sold
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground text-[13px] font-bold">{formatCurrency(menu.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Month */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground text-[18px] font-bold mb-6">Orders Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid key="grid-orders" strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis key="xaxis-orders" dataKey="month" stroke="#666666" />
              <YAxis key="yaxis-orders" stroke="#666666" />
              <Tooltip key="tooltip-orders" content={<CustomTooltip />} />
              <Legend key="legend-orders" />
              <Bar 
                key="orders-bar"
                dataKey="orders" 
                fill="#1976d2" 
                radius={[8, 8, 0, 0]} 
                name="Total Orders" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}