import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router";
import { LogOut, Package, MapPin, Heart, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { motion, AnimatePresence } from "motion/react";

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
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        
        <div className="mb-16 border-b border-border pb-12">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-4">Account</h1>
          <p className="text-muted-foreground font-light text-lg">Welcome back, {user.name}.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="flex flex-col sticky top-32">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase transition-colors border-b ${activeTab === 'orders' ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <Package className="w-4 h-4" strokeWidth={1.5} />
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase transition-colors border-b ${activeTab === 'addresses' ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                Addresses
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase transition-colors border-b ${activeTab === 'wishlist' ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className="w-4 h-4" strokeWidth={1.5} />
                Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase transition-colors border-b ${activeTab === 'settings' ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mt-8"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Order History</h2>
                  
                  {isLoading ? (
                    <div className="py-12 text-muted-foreground font-light">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light mb-8">You have no recent orders.</p>
                      <Link to="/category/all" className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all">
                        Discover Essentials
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {orders.map((order: any) => (
                        <div key={order._id} className="border border-border p-8">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6 mb-6">
                            <div>
                              <p className="text-xs font-medium tracking-widest uppercase mb-2 text-muted-foreground">Order #{order._id.substring(18)}</p>
                              <p className="text-sm font-medium mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm font-medium">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <span className="text-xs font-medium tracking-widest uppercase text-foreground">
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                              </span>
                              <button className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <div className="relative flex justify-between items-center w-full max-w-sm">
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0"></div>
                              <div className={`absolute top-1/2 left-0 h-[1px] -translate-y-1/2 z-0 transition-all ${order.isDelivered ? 'w-full bg-foreground' : 'w-1/2 bg-foreground'}`}></div>
                              
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-foreground ring-4 ring-background"></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Placed</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background ${order.isDelivered ? 'bg-foreground' : 'bg-foreground'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Shipped</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background ${order.isDelivered ? 'bg-foreground' : 'bg-muted'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Delivered</span>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Saved Addresses</h2>
                    <button className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors">
                      Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-border p-8 relative">
                      <span className="absolute top-6 right-6 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Primary</span>
                      <h4 className="font-medium uppercase tracking-widest text-sm mb-4">{user.name}</h4>
                      <div className="text-sm font-light text-muted-foreground leading-relaxed mb-6">
                        <p>123 Luxury Avenue</p>
                        <p>Bandra West, Mumbai 400050</p>
                        <p>India</p>
                      </div>
                      <div className="flex gap-6">
                        <button className="text-xs font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors">Edit</button>
                        <button className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Profile Details</h2>
                  <form className="max-w-md flex flex-col gap-8">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-4 text-muted-foreground">Full Name</label>
                      <input type="text" defaultValue={user.name} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-4 text-muted-foreground">Email Address</label>
                      <input type="email" defaultValue={user.email} className="w-full bg-transparent border-b border-border py-3 text-sm text-muted-foreground cursor-not-allowed" readOnly />
                    </div>
                    <button type="button" className="mt-4 bg-foreground text-background py-5 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors w-full">
                      Update Profile
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Curated Selection</h2>
                  <div className="py-12 border-t border-border">
                    <p className="text-lg font-light mb-8">Your wishlist is currently empty.</p>
                    <Link to="/category/all" className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all">
                      Discover Essentials
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
