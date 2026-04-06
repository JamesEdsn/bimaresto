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
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-sidebar flex flex-col border-r border-sidebar-border shadow-sm z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            B
          </div>
          <div>
            <h1 className="text-[17px] font-semibold leading-tight text-brand tracking-tight">
              Bima Resto
            </h1>
            <p className="text-muted-foreground text-[11px] mt-0.5 leading-tight">
              Restaurant POS
            </p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
            <span className="font-semibold text-[15px] text-foreground">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-[13px] font-semibold truncate">{username}</p>
            <p className="text-muted-foreground text-[11px]">Administrator</p>
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
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground border-l-sidebar-primary shadow-sm'
                  : 'border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-sidebar-primary-foreground' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
