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
  Settings 
} from "lucide-react";

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Products', path: '/admin/products', icon: Tags },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Discounts', path: '/admin/discounts', icon: Percent },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Staff', path: '/admin/staff', icon: UserCog },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-sm text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 font-bold tracking-widest uppercase border-b border-gray-800">
          Vancy Admin
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" strokeWidth={1.5} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">Logged in as</div>
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">Admin User</span>
            <button className="text-xs hover:text-red-400 uppercase tracking-widest">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm z-10 flex-shrink-0">
          <h1 className="text-xl font-medium">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
