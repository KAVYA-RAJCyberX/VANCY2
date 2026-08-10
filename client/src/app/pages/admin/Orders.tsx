import { useEffect, useState } from "react";
import api from "../../../lib/axios";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/admin/orders");
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: string, isDelivered: boolean) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { isDelivered });
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Delivery</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{order._id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.user?.name || "Guest"}</div>
                    <div className="text-xs text-gray-500">{order.guestEmail || order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : (order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}`}>
                      {order.isPaid ? 'Paid' : (order.paymentMethod === 'COD' ? 'COD' : 'Pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!order.isDelivered ? (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, true)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium uppercase tracking-wider"
                      >
                        Mark Delivered
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, false)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-medium uppercase tracking-wider"
                      >
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
