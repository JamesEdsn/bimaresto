import { Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard,
  ShoppingCart,
  Grid3x3,
  UtensilsCrossed,
  FolderTree,
  Users,
  DollarSign,
  Tag,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import sidebarLogo from '../../assets/image.png';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/dashboard/tables', icon: Grid3x3, label: 'Tables' },
  { path: '/dashboard/menus', icon: UtensilsCrossed, label: 'Menus' },
  { path: '/dashboard/categories', icon: FolderTree, label: 'Categories' },
  { path: '/dashboard/promos', icon: Tag, label: 'Promos' },
  { path: '/dashboard/staff', icon: Users, label: 'Staff' },
  { path: '/dashboard/payments', icon: DollarSign, label: 'Payments' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || 'Admin');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-white flex flex-col border-r border-orange-100 shadow-lg z-30">
      {/* Logo */}
      <div className="px-2 py-4 border-b border-orange-100 flex flex-col items-center gap-3">
        <img
          src={sidebarLogo}
          alt="Bima Resto Logo"
          className="h-14 w-full object-contain"
        />
        <h1 className="text-[16px] font-bold text-orange-700 leading-tight">
          Bima Resto
        </h1>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-700 border border-orange-200">
            <span className="font-semibold text-[15px]">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-[13px] font-semibold truncate">{username}</p>
            <p className="text-slate-500 text-[11px]">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-semibold px-3">
          Menu
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors border-l-[3px] ${
                isActive
                  ? 'bg-orange-100 text-orange-700 border-l-orange-500 shadow-md'
                  : 'border-l-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-700'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-orange-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-orange-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-orange-700 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
