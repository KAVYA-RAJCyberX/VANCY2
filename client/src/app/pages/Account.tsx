import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router";
import { LogOut, Package, MapPin, Heart, Settings } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

export function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/orders/myorders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return data;
    },
    enabled: !!user
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-2 text-[#3B121A]">My Account</h1>
          <p className="text-gray-600 font-medium">Welcome back, {user.name}!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white shadow-sm flex flex-col p-4">
              <button className="flex items-center gap-3 p-4 bg-gray-50 font-bold border-l-2 border-[#0A0A0A] text-[#0A0A0A]">
                <Package className="w-5 h-5" />
                Orders
              </button>
              <button className="flex items-center gap-3 p-4 text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
              <button className="flex items-center gap-3 p-4 text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button className="flex items-center gap-3 p-4 text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 transition-colors mt-auto"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-[#0A0A0A]">Recent Orders</h2>
              
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <Link to="/category/polos" className="inline-block bg-[#0A0A0A] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors rounded-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order: any) => (
                    <div key={order._id} className="border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-xs font-bold tracking-widest uppercase mb-1 text-gray-500">Order ID: {order._id}</p>
                        <p className="text-sm font-semibold mb-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm font-bold text-[#C9A961]">₹{order.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs font-bold uppercase ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold uppercase bg-blue-100 text-blue-700`}>
                          Processing
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
