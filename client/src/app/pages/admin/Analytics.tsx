import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { BarChart3, TrendingUp } from "lucide-react";

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics");
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const maxSales = Math.max(...(data.chartData?.map((d: any) => d.sales) || [0]), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Detailed Analytics (30 Days)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-green-600"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-widest">Total Revenue</div>
            <div className="text-3xl font-bold">₹{data.totalRevenue30d?.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600"><BarChart3 className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-widest">Total Orders</div>
            <div className="text-3xl font-bold">{data.totalOrders30d || 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium mb-6 uppercase tracking-widest">Sales Trend</h3>
        <div className="flex items-end h-64 gap-2 overflow-x-auto pb-2">
          {data.chartData && data.chartData.length > 0 ? (
            data.chartData.map((day: any) => {
              const heightPercentage = (day.sales / maxSales) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col justify-end items-center group min-w-[30px]">
                  <div 
                    className="w-full bg-gray-900 rounded-t-sm group-hover:bg-accent transition-all relative"
                    style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                      ₹{day.sales.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left whitespace-nowrap">
                    {day.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No data available for the last 30 days</div>
          )}
        </div>
      </div>
    </div>
  );
}
