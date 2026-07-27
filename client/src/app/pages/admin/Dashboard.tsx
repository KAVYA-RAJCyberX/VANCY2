import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { DollarSign, ShoppingBag, AlertTriangle, Clock } from "lucide-react";

interface DashboardStats {
  salesToday: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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

      {/* Placeholder for Recent Orders / Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">Revenue Chart (Coming Soon)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">Recent Orders Feed (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
