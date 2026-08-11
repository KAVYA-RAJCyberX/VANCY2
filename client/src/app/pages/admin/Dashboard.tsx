import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../lib/axios";
import { DollarSign, ShoppingBag, AlertTriangle, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

interface Order {
  _id: string;
  totalPrice: number;
  isDelivered: boolean;
  createdAt: string;
  user?: { name: string; email: string };
  guestEmail?: string;
}

interface DashboardStats {
  salesToday: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockCount: number;
  chartData: { name: string; revenue: number }[];
  recentOrders: Order[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-px w-32 bg-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-gray-900 transform -translate-x-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <div 
          onClick={() => navigate('/admin/orders')}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Today's Sales</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">₹{stats?.salesToday.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-400 mt-2">Revenue from today's orders</p>
        </div>

        {/* Today's Orders */}
        <div 
          onClick={() => navigate('/admin/orders')}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Today's Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.ordersToday || 0}</div>
          <p className="text-xs text-gray-400 mt-2">Total orders placed today</p>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => navigate('/admin/orders?status=Processing')}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Pending Action</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.pendingOrders || 0}</div>
          <p className="text-xs text-gray-400 mt-2">Orders waiting to be shipped</p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => navigate('/admin/inventory?filter=low')}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Low Stock</h3>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.lowStockCount || 0}</div>
          <p className="text-xs text-gray-400 mt-2">Products below threshold</p>
        </div>
      </div>

      {/* Revenue Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">Revenue (Last 7 Days)</h3>
          <div className="flex-1 min-h-[250px]">
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Recent Orders</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div 
                    key={order._id} 
                    onClick={() => navigate(`/admin/orders?highlight=${order._id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.name || order.user?.email || order.guestEmail || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} &middot; {order._id.substring(order._id.length - 6).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase ${
                        order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.isDelivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No recent orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
