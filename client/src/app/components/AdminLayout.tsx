import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  Users, 
  Percent, 
  BarChart3, 
  UserCog, 
  Settings,
  RefreshCcw,
  MessageSquare,
  Star,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Products', path: '/admin/products', icon: Tags },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Discounts', path: '/admin/discounts', icon: Percent },
  { name: 'Returns', path: '/admin/returns', icon: RefreshCcw },
  { name: 'Support', path: '/admin/support', icon: MessageSquare },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Staff', path: '/admin/staff', icon: UserCog },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate, location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-sm text-gray-900 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="font-bold tracking-widest uppercase flex items-center gap-2">
          Vancy Admin
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-gray-600 hover:text-black transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 hidden md:flex items-center px-6 font-bold tracking-widest uppercase border-b border-gray-100 text-black">
          Vancy Admin
        </div>
        
        <div className="md:hidden h-16 border-b border-gray-100" /> {/* Spacer for mobile header */}
        
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      isActive 
                        ? 'bg-black text-white shadow-md shadow-black/10' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={isActive ? 2 : 1.5} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-0.5">Logged in as</span>
              <span className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">Admin</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0 bg-gray-50/50">
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/80 items-center px-8 flex-shrink-0 sticky top-0 z-30">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
