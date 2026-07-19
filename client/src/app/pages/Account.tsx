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

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>('orders');

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
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 p-4 font-bold transition-colors ${activeTab === 'orders' ? 'bg-gray-50 border-l-2 border-[#0A0A0A] text-[#0A0A0A]' : 'text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <Package className="w-5 h-5" />
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 p-4 font-bold transition-colors ${activeTab === 'addresses' ? 'bg-gray-50 border-l-2 border-[#0A0A0A] text-[#0A0A0A]' : 'text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-3 p-4 font-bold transition-colors ${activeTab === 'wishlist' ? 'bg-gray-50 border-l-2 border-[#0A0A0A] text-[#0A0A0A]' : 'text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 p-4 font-bold transition-colors ${activeTab === 'settings' ? 'bg-gray-50 border-l-2 border-[#0A0A0A] text-[#0A0A0A]' : 'text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <Settings className="w-5 h-5" />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 font-bold text-red-500 hover:bg-red-50 transition-colors mt-auto border-l-2 border-transparent"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white p-8 shadow-sm min-h-[500px]">
              
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-[#0A0A0A]">Recent Orders</h2>
                  
                  {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                      <Link to="/category/new" className="inline-block bg-[#0A0A0A] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors rounded-sm">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {orders.map((order: any) => (
                        <div key={order._id} className="border border-gray-200 p-6 flex flex-col gap-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                            <div>
                              <p className="text-xs font-bold tracking-widest uppercase mb-1 text-gray-500">Order #{order._id.substring(18)}</p>
                              <p className="text-sm font-semibold mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm font-bold text-[#C9A961]">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-4 py-1 text-xs font-bold uppercase tracking-wider ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                              </span>
                              <button className="text-xs font-bold uppercase tracking-widest border-b border-[#0A0A0A] hover:text-[#C9A961] hover:border-[#C9A961] transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                          
                          {/* Order Timeline (Simple UI) */}
                          <div className="pt-2">
                            <div className="relative flex justify-between items-center max-w-md">
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                              <div className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 z-0 transition-all ${order.isDelivered ? 'w-full bg-green-500' : 'w-1/2 bg-[#C9A961]'}`}></div>
                              
                              <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#C9A961] ring-4 ring-white"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Placed</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ring-4 ring-white ${order.isDelivered ? 'bg-green-500' : 'bg-[#C9A961]'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Shipped</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ring-4 ring-white ${order.isDelivered ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivered</span>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-widest uppercase text-[#0A0A0A]">Saved Addresses</h2>
                    <button className="text-xs font-bold uppercase tracking-widest border-b border-[#0A0A0A] hover:text-[#C9A961] hover:border-[#C9A961] transition-colors">
                      + Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 p-6 relative">
                      <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Default</span>
                      <h4 className="font-bold mb-2 uppercase tracking-widest text-sm">{user.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">123 Luxury Avenue</p>
                      <p className="text-sm text-gray-600 mb-1">Bandra West, Mumbai 400050</p>
                      <p className="text-sm text-gray-600 mb-4">India</p>
                      <div className="flex gap-4">
                        <button className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#0A0A0A] transition-colors">Edit</button>
                        <button className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-[#0A0A0A]">Profile Settings</h2>
                  <form className="max-w-md flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Full Name</label>
                      <input type="text" defaultValue={user.name} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#0A0A0A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Email Address</label>
                      <input type="email" defaultValue={user.email} className="w-full border border-gray-300 p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                    </div>
                    <button type="button" className="mt-4 bg-[#0A0A0A] text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-[#C9A961] transition-colors self-start">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-[#0A0A0A]">My Wishlist</h2>
                  <p className="text-sm text-gray-500 mb-6">Manage your saved items and move them to your cart when you are ready to purchase.</p>
                  <Link to="/wishlist" className="inline-block bg-[#0A0A0A] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#C9A961] transition-colors rounded-sm">
                    View Wishlist Page
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
