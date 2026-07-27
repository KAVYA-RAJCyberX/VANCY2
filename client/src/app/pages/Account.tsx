import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { Link, useNavigate } from "react-router";
import { LogOut, Package, MapPin, Heart, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { motion, AnimatePresence } from "motion/react";

export function Account() {
  const { user, logout } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const addCartItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
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
      const { data } = await api.get('/orders/myorders');
      return data;
    },
    enabled: !!user
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await api.get('/auth/profile');
      return data;
    },
    enabled: !!user
  });

  if (!user) return null;

  const handleLogout = () => {
    clearCart();
    clearWishlist();
    logout();
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    street: '', city: '', state: '', postalCode: '', country: ''
  });

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street, city: address.city, state: address.state, postalCode: address.postalCode, country: address.country
    });
    setShowAddressForm(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ street: '', city: '', state: '', postalCode: '', country: '' });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/auth/profile/addresses/${editingAddress._id}`, addressForm);
      } else {
        await api.post(`/auth/profile/addresses`, addressForm);
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      refetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await api.delete(`/auth/profile/addresses/${id}`);
      refetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

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
                      {orders.map((order: any) => {
                        const isExpanded = expandedOrderId === order._id;
                        return (
                        <div key={order._id} className="border border-border p-8">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6 mb-6">
                            <div>
                              <p className="text-xs font-medium tracking-widest uppercase mb-2 text-muted-foreground">Order #{order._id.substring(18)}</p>
                              <p className="text-sm font-medium mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm font-medium">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <span className="text-xs font-medium tracking-widest uppercase text-foreground">
                                {order.isDelivered ? 'Delivered' : (order.isPaid || order.paymentMethod === 'COD' ? 'Processing' : 'Payment Pending')}
                              </span>
                              <button 
                                onClick={() => toggleOrderDetails(order._id)}
                                className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="pt-2 mb-2">
                            <div className="relative flex justify-between items-center w-full max-w-sm">
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0"></div>
                              <div className={`absolute top-1/2 left-0 h-[1px] -translate-y-1/2 z-0 transition-all ${order.isDelivered ? 'w-full bg-foreground' : ((order.isPaid || order.paymentMethod === 'COD') ? 'w-1/2 bg-foreground' : 'w-0')}`}></div>
                              
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-foreground ring-4 ring-background"></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Placed</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background ${order.isPaid || order.paymentMethod === 'COD' || order.isDelivered ? 'bg-foreground' : 'bg-muted'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Processing</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background ${order.isDelivered ? 'bg-foreground' : 'bg-muted'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Delivered</span>
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-border mt-8 pt-8 flex flex-col lg:flex-row gap-12">
                                  {/* Items */}
                                  <div className="flex-1">
                                    <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Items Ordered</h4>
                                    <div className="flex flex-col gap-6">
                                      {order.orderItems.map((item: any) => (
                                        <div key={item._id || item.product} className="flex gap-4">
                                          <div className="w-16 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                          </div>
                                          <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                              <h5 className="text-sm font-medium">{item.name}</h5>
                                              <p className="text-xs text-muted-foreground mt-1">Qty: {item.qty} | Size: {item.size} | Color: {item.color}</p>
                                            </div>
                                            <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Order Info */}
                                  <div className="flex-1 flex flex-col sm:flex-row gap-12">
                                    <div className="flex-1">
                                      <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Shipping Address</h4>
                                      <div className="text-sm font-light leading-relaxed">
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Payment</h4>
                                      <div className="text-sm font-light leading-relaxed">
                                        <p className="mb-1">Method: {order.paymentMethod}</p>
                                        <p className="mb-1">Status: {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Pending'}</p>
                                        <p className="mt-4 font-medium">Total: ₹{order.totalPrice.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )})}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Saved Addresses</h2>
                    {!showAddressForm && (
                      <button 
                        onClick={handleAddAddress}
                        className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
                      >
                        Add New
                      </button>
                    )}
                  </div>
                  
                  {showAddressForm ? (
                    <form onSubmit={handleSaveAddress} className="border border-border p-8 mb-8">
                      <h3 className="text-xs font-medium tracking-widest uppercase mb-6">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="Street Address" required value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                          <input type="text" placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Postal Code" required value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                          <input type="text" placeholder="Country" required value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground transition-colors" />
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button type="submit" className="bg-foreground text-background px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors">Save Address</button>
                          <button type="button" onClick={() => setShowAddressForm(false)} className="border border-foreground px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">Cancel</button>
                        </div>
                      </div>
                    </form>
                  ) : profile?.savedAddresses?.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light">You have no saved addresses.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {profile?.savedAddresses?.map((address: any, idx: number) => (
                        <div key={address._id} className="border border-border p-8 relative">
                          {idx === 0 && <span className="absolute top-6 right-6 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Primary</span>}
                          <h4 className="font-medium uppercase tracking-widest text-sm mb-4">{user.name}</h4>
                          <div className="text-sm font-light text-muted-foreground leading-relaxed mb-6">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="flex gap-6">
                            <button onClick={() => handleEditAddress(address)} className="text-xs font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors">Edit</button>
                            <button onClick={() => handleRemoveAddress(address._id)} className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {wishlistItems.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light mb-8">Your wishlist is currently empty.</p>
                      <Link to="/category/all" className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all">
                        Discover Essentials
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="group relative">
                          <Link to={`/product/${item.id}`} className="block aspect-[3/4] bg-muted mb-4 overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                          </Link>
                          <div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">₹{item.price.toLocaleString()}</p>
                            <button 
                              onClick={() => {
                                addCartItem({ ...item, quantity: 1, size: 'N/A', color: 'N/A' });
                                toggleWishlist(item);
                              }}
                              className="mt-4 text-[10px] font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
                            >
                              Move to Bag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
