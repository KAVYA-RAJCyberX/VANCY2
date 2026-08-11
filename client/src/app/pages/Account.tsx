import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { Link, useNavigate } from "react-router";
import { LogOut, Package, MapPin, Heart, Settings, ChevronDown, ChevronUp, RefreshCcw, MessageSquare, ShieldAlert, Star, Send, Bot, X, Camera } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { motion, AnimatePresence } from "motion/react";

const FAQ_DATA = [
  {
    q: "Where is my order?",
    a: "You can track your order status in the 'Orders' tab of this dashboard. Once shipped, you'll see a tracking link."
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 14 days of delivery. Items must be unworn with original tags attached. Initiate a return from the 'Returns & Exchanges' tab."
  },
  {
    q: "How do I change my shipping address?",
    a: "You can manage your addresses in the 'Addresses' tab. Please note that you cannot change the address of an order that has already been shipped."
  }
];

export function Account() {
  const { user, logout } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const addCartItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: orders = [], isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/orders/myorders');
      return data;
    },
    enabled: !!user
  });

  const { data: returns = [], refetch: refetchReturns } = useQuery({
    queryKey: ['my-returns'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/returns/my-returns');
      return data;
    },
    enabled: !!user
  });

  const { data: tickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/support/my-tickets');
      return data;
    },
    enabled: !!user
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/reviews/my-reviews');
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

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'returns' | 'support' | 'reviews' | 'wishlist' | 'settings'>('overview');
  
  // Orders State
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');

  // Addresses State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    street: '', city: '', state: '', postalCode: '', country: ''
  });

  // Settings State
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', password: '', newPassword: '' });

  // Returns State
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnType, setReturnType] = useState('Return');
  const [returnReason, setReturnReason] = useState('');

  // Support State
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketSubject, setTicketSubject] = useState(''); // Only used if category is 'Other' internally
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCustomMessage, setTicketCustomMessage] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketProductId, setTicketProductId] = useState('');
  const [ticketImages, setTicketImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImages, setReplyImages] = useState<string[]>([]);

  // Chatbot State
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Hello! I am the Vancy Assistant. How can I help you today?' }
  ]);

  // Review State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  if (!user) return null;

  const handleLogout = () => {
    clearCart();
    clearWishlist();
    logout();
    navigate("/");
  };

  // Chatbot Handlers
  const handleChatOption = (option: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: option }]);
    
    if (option === 'Other / Need Human') {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: 'I understand. Let me hand you over to our support team. Please open a new ticket using the button above.' }]);
        setShowChatbot(false);
        setShowTicketForm(true);
        setActiveTab('support');
      }, 500);
      return;
    }

    const faq = FAQ_DATA.find(f => f.q === option);
    if (faq) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: faq.a }]);
      }, 500);
    }
  };

  // File Upload Simulator
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    // Simulate Cloudinary upload delay
    setTimeout(() => {
      // In reality this would be the secure Cloudinary URL
      const mockUrl = URL.createObjectURL(e.target.files![0]); 
      setter(prev => [...prev, mockUrl]);
      setIsUploadingImage(false);
    }, 1500);
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const toggleTicketDetails = (ticketId: string) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  // Addresses Handlers
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

  // Settings Handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: profileForm.name };
      if (profileForm.newPassword) payload.password = profileForm.newPassword;
      await api.put('/auth/profile', payload);
      alert('Profile updated successfully');
      setProfileForm({ ...profileForm, password: '', newPassword: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    }
  };

  const handleDPDPRequest = async (type: string) => {
    if (confirm(`Are you sure you want to request account ${type.toLowerCase()}? This action may be irreversible.`)) {
      try {
        await api.post('/auth/profile/dpdp-request', { type, notes: 'User requested via Account Dashboard' });
        alert('Your request has been submitted to our Data Protection Officer.');
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Return Handlers
  const handleInitiateReturn = (order: any) => {
    setReturnOrder(order);
    setReturnItems([]);
    setReturnType('Return');
    setReturnReason('');
    setShowReturnForm(true);
    setActiveTab('returns');
  };

  const toggleReturnItem = (item: any) => {
    const exists = returnItems.find(i => i.product === item.product);
    if (exists) {
      setReturnItems(returnItems.filter(i => i.product !== item.product));
    } else {
      setReturnItems([...returnItems, { product: item.product, name: item.name, image: item.image, qty: item.qty, size: item.size, color: item.color, reason: '' }]);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (returnItems.length === 0) return alert('Please select at least one item');
    if (returnItems.some(i => !i.reason)) return alert('Please provide a reason for all items');

    try {
      await api.post('/returns', {
        orderId: returnOrder._id,
        items: returnItems,
        type: returnType,
        notes: returnReason
      });
      setShowReturnForm(false);
      refetchReturns();
      setActiveTab('returns');
    } catch (error) {
      console.error(error);
      alert('Failed to submit return request');
    }
  };

  // Ticket Handlers
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCategory) return alert('Please select a category');
    if (ticketCategory === 'Other' && !ticketCustomMessage) return alert('Please provide details for "Other"');
    
    const requiresImage = ['Wrong/Damaged Item Received', 'Product Quality'].includes(ticketCategory);
    if (requiresImage && ticketImages.length === 0) return alert('Please attach at least one image for this issue type');

    try {
      await api.post('/support', { 
        category: ticketCategory,
        customMessage: ticketCustomMessage,
        message: ticketMessage || ticketCustomMessage, 
        orderId: ticketOrderId || undefined,
        productId: ticketProductId || undefined,
        attachedImages: ticketImages
      });
      setShowTicketForm(false);
      setTicketCategory('');
      setTicketMessage('');
      setTicketCustomMessage('');
      setTicketOrderId('');
      setTicketProductId('');
      setTicketImages([]);
      refetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyTicket = async (ticketId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage && replyImages.length === 0) return;
    try {
      await api.post(`/support/${ticketId}/reply`, { message: replyMessage, images: replyImages });
      setReplyMessage('');
      setReplyImages([]);
      refetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  // Review Handlers
  const handleInitiateReview = (item: any, order: any) => {
    setReviewProduct({ ...item, orderId: order._id });
    setReviewRating(5);
    setReviewComment('');
    setReviewImages([]);
    setShowReviewForm(true);
    setActiveTab('reviews');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        productId: reviewProduct.product,
        name: user.name,
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages
      });
      setShowReviewForm(false);
      setReviewProduct(null);
      refetchReviews();
      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach(item => {
      addCartItem({
        id: item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.qty,
        size: item.size,
        color: item.color
      });
    });
    navigate('/cart');
  };

  const renderSidebarItem = (id: typeof activeTab, label: string, Icon: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 py-4 text-sm font-medium tracking-widest uppercase transition-colors border-b ${activeTab === id ? 'border-foreground text-foreground border-b-2 border-b-[#D4AF37]' : 'border-border text-muted-foreground hover:text-foreground'}`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-[#D4AF37]' : ''}`} strokeWidth={1.5} />
      {label}
    </button>
  );

  const filteredOrders = orders.filter((order: any) => {
    if (!orderSearch) return true;
    const searchLower = orderSearch.toLowerCase();
    const matchesId = order._id.toLowerCase().includes(searchLower);
    const matchesProducts = order.orderItems.some((item: any) => item.name.toLowerCase().includes(searchLower) || item.product.toLowerCase().includes(searchLower));
    return matchesId || matchesProducts;
  });

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        <div className="mb-16 border-b border-border pb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter uppercase mb-4 text-[#D4AF37]">My Account</h1>
            <p className="text-muted-foreground font-light text-lg">Feel the Luxury, {user.name}.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="flex flex-col sticky top-32">
              {renderSidebarItem('overview', 'Overview', ShieldAlert)}
              {renderSidebarItem('orders', 'Orders', Package)}
              {renderSidebarItem('returns', 'Returns & Exchanges', RefreshCcw)}
              {renderSidebarItem('reviews', 'My Reviews', Star)}
              {renderSidebarItem('addresses', 'Addresses', MapPin)}
              {renderSidebarItem('wishlist', 'Wishlist', Heart)}
              {renderSidebarItem('support', 'Support', MessageSquare)}
              {renderSidebarItem('settings', 'Profile', Settings)}
              
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
          <div className="lg:w-3/4 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Account Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <div className="border border-border p-8 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setActiveTab('orders')}>
                      <Package className="w-6 h-6 mb-4 text-[#D4AF37]" strokeWidth={1} />
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-2">Active Orders</h3>
                      <p className="text-sm text-muted-foreground font-light">{orders.filter((o:any) => !o.isDelivered).length} orders in progress</p>
                    </div>
                    <div className="border border-border p-8 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setActiveTab('support')}>
                      <MessageSquare className="w-6 h-6 mb-4 text-[#D4AF37]" strokeWidth={1} />
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-2">Support Tickets</h3>
                      <p className="text-sm text-muted-foreground font-light">{tickets.filter((t:any) => t.status !== 'resolved' && t.status !== 'closed').length} open tickets</p>
                    </div>
                    <div className="border border-border p-8 hover:bg-muted/30 transition-colors cursor-pointer md:col-span-2 lg:col-span-1" onClick={() => setActiveTab('reviews')}>
                      <Star className="w-6 h-6 mb-4 text-[#D4AF37]" strokeWidth={1} />
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-2">My Reviews</h3>
                      <p className="text-sm text-muted-foreground font-light">{reviews.length} reviews submitted</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Order History</h2>
                    <input 
                      type="text" 
                      placeholder="Search by product or order ID" 
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="border-b border-border py-1 text-sm bg-transparent focus:outline-none focus:border-foreground w-64"
                    />
                  </div>
                  
                  {isOrdersLoading ? (
                    <div className="py-12 text-muted-foreground font-light">Loading orders...</div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light mb-8">No orders found.</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {filteredOrders.map((order: any) => {
                        const isExpanded = expandedOrderId === order._id;
                        return (
                        <div key={order._id} className="border border-border p-8">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6 mb-6">
                            <div>
                              <p className="text-xs font-medium tracking-widest uppercase mb-2 text-[#D4AF37]">Order #{order._id.substring(18)}</p>
                              <p className="text-sm font-medium mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm font-medium">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <span className="text-xs font-medium tracking-widest uppercase text-foreground">
                                {order.isDelivered ? 'Delivered' : (order.isPaid || order.paymentMethod === 'COD' ? 'Processing' : 'Payment Pending')}
                              </span>
                              <div className="flex gap-4">
                                <button onClick={() => handleReorder(order.orderItems)} className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Reorder</button>
                                {order.isDelivered && (
                                  <button onClick={() => handleInitiateReturn(order)} className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Return/Exchange</button>
                                )}
                                <button onClick={() => toggleOrderDetails(order._id)} className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors">
                                  {isExpanded ? 'Hide' : 'Details'} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 mb-2">
                            <div className="relative flex justify-between items-center w-full max-w-md mx-auto">
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0"></div>
                              <div className={`absolute top-1/2 left-0 h-[1px] -translate-y-1/2 z-0 transition-all duration-1000 ${order.isDelivered ? 'w-full bg-[#D4AF37]' : ((order.isPaid || order.paymentMethod === 'COD') ? 'w-1/2 bg-[#D4AF37]' : 'w-0')}`}></div>
                              
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#D4AF37] ring-4 ring-background"></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Placed</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background transition-colors duration-500 ${order.isPaid || order.paymentMethod === 'COD' || order.isDelivered ? 'bg-[#D4AF37]' : 'bg-muted'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Processing</span>
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-background transition-colors duration-500 ${order.isDelivered ? 'bg-[#D4AF37]' : 'bg-muted'}`}></div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Delivered</span>
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="border-t border-border mt-8 pt-8 flex flex-col lg:flex-row gap-12">
                                  <div className="flex-1">
                                    <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Items Ordered</h4>
                                    <div className="flex flex-col gap-6">
                                      {order.orderItems.map((item: any) => (
                                        <div key={item._id || item.product} className="flex gap-4">
                                          <Link to={`/product/${item.product}`} className="w-16 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0 group">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform" />
                                          </Link>
                                          <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                              <Link to={`/product/${item.product}`} className="hover:text-[#D4AF37] transition-colors">
                                                <h5 className="text-sm font-medium">{item.name}</h5>
                                              </Link>
                                              <p className="text-xs text-muted-foreground mt-1">Qty: {item.qty} | Size: {item.size} | Color: {item.color}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
                                              {order.isDelivered && (
                                                <button onClick={() => handleInitiateReview(item, order)} className="text-[10px] uppercase tracking-widest font-medium border-b border-border hover:border-foreground transition-colors pb-0.5">
                                                  Leave Review
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
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

              {activeTab === 'returns' && (
                <motion.div key="returns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Returns & Exchanges</h2>
                    {showReturnForm && (
                      <button onClick={() => setShowReturnForm(false)} className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors">Cancel</button>
                    )}
                  </div>

                  {showReturnForm && returnOrder ? (
                    <form onSubmit={handleSubmitReturn} className="border border-border p-8 mb-8">
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-6 text-center text-[#D4AF37]">Initiate {returnType}</h3>
                      <p className="text-sm text-muted-foreground mb-8 text-center font-light">Order #{returnOrder._id.substring(18)}</p>
                      
                      <div className="flex justify-center gap-8 mb-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" value="Return" checked={returnType === 'Return'} onChange={(e) => setReturnType(e.target.value)} className="accent-[#D4AF37]" />
                          <span className="text-sm tracking-widest uppercase">Return</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" value="Exchange" checked={returnType === 'Exchange'} onChange={(e) => setReturnType(e.target.value)} className="accent-[#D4AF37]" />
                          <span className="text-sm tracking-widest uppercase">Exchange</span>
                        </label>
                      </div>

                      <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Select Items</h4>
                      <div className="space-y-4 mb-8">
                        {returnOrder.orderItems.map((item: any) => {
                          const isSelected = returnItems.some(i => i.product === item.product);
                          return (
                            <div key={item.product} className={`border p-4 transition-colors ${isSelected ? 'border-[#D4AF37] bg-muted/10' : 'border-border'}`}>
                              <div className="flex items-center gap-4">
                                <input type="checkbox" checked={isSelected} onChange={() => toggleReturnItem(item)} className="accent-[#D4AF37] w-4 h-4" />
                                <div className="w-12 aspect-[3/4] bg-muted overflow-hidden">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Size: {item.size} | Color: {item.color}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="mt-4 pl-8">
                                  <input type="text" placeholder="Reason for return/exchange" required value={returnItems.find(i => i.product === item.product)?.reason || ''} onChange={(e) => {
                                    setReturnItems(returnItems.map(ri => ri.product === item.product ? { ...ri, reason: e.target.value } : ri));
                                  }} className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Additional Notes (Optional)</h4>
                      <textarea rows={3} value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full bg-transparent border border-border p-4 text-sm focus:outline-none focus:border-[#D4AF37] mb-8" placeholder="Provide any additional details..." />

                      <button type="submit" className="w-full bg-foreground text-background py-4 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors">Submit Request</button>
                    </form>
                  ) : returns.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light">You have no return or exchange requests.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {returns.map((req: any) => (
                        <div key={req._id} className="border border-border p-6 flex flex-col md:flex-row justify-between gap-6">
                          <div>
                            <span className="inline-block px-3 py-1 bg-muted text-[10px] font-medium tracking-widest uppercase mb-3 text-[#D4AF37] border border-[#D4AF37]/30">{req.type}</span>
                            <p className="text-sm font-medium mb-1">Order #{req.orderId.substring(18)}</p>
                            <p className="text-xs text-muted-foreground mb-4">{new Date(req.createdAt).toLocaleDateString()}</p>
                            <div className="flex -space-x-2">
                              {req.items.map((i:any, idx:number) => (
                                <img key={idx} src={i.image} className="w-8 h-8 rounded-full border-2 border-background object-cover bg-muted" alt="item" />
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end justify-center">
                            <span className="text-xs font-medium tracking-widest uppercase text-foreground mb-2">Status</span>
                            <span className={`text-sm tracking-widest uppercase font-medium ${req.status === 'Processed' || req.status === 'Approved' ? 'text-green-600' : req.status === 'Rejected' ? 'text-red-600' : 'text-[#D4AF37]'}`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Support Center</h2>
                    {!showTicketForm && (
                      <div className="flex gap-4">
                        <button onClick={() => setShowChatbot(!showChatbot)} className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest border-b border-border pb-0.5 hover:border-foreground transition-colors">
                          <Bot className="w-3 h-3" /> Assistant
                        </button>
                        <button onClick={() => setShowTicketForm(true)} className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors">
                          New Ticket
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {showChatbot && !showTicketForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                        <div className="border border-border bg-muted/5">
                          <div className="p-4 border-b border-border flex justify-between items-center bg-foreground text-background">
                            <div className="flex items-center gap-2"><Bot className="w-4 h-4" /> <span className="text-xs font-medium uppercase tracking-widest">Vancy Assistant</span></div>
                            <button onClick={() => setShowChatbot(false)}><X className="w-4 h-4" /></button>
                          </div>
                          <div className="p-6 h-64 overflow-y-auto space-y-4">
                            {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 max-w-[80%] text-sm font-light ${msg.sender === 'user' ? 'bg-border text-foreground' : 'bg-background border border-border'}`}>
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 border-t border-border flex flex-wrap gap-2">
                            {FAQ_DATA.map(faq => (
                              <button key={faq.q} onClick={() => handleChatOption(faq.q)} className="text-[10px] uppercase tracking-widest font-medium border border-border px-3 py-1.5 hover:bg-border transition-colors">{faq.q}</button>
                            ))}
                            <button onClick={() => handleChatOption('Other / Need Human')} className="text-[10px] uppercase tracking-widest font-medium border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 hover:bg-[#D4AF37] hover:text-white transition-colors">Other / Human</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {showTicketForm ? (
                    <form onSubmit={handleSubmitTicket} className="border border-border p-8 mb-8">
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-6 text-center text-[#D4AF37]">Open Support Ticket</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Issue Category</label>
                          <select required value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors">
                            <option value="">Select a category</option>
                            <option value="Order Delay">Order Delay</option>
                            <option value="Wrong/Damaged Item Received">Wrong/Damaged Item Received</option>
                            <option value="Size/Fit Issue">Size/Fit Issue</option>
                            <option value="Return/Exchange Status">Return/Exchange Status</option>
                            <option value="Refund Not Received">Refund Not Received</option>
                            <option value="Payment Issue">Payment Issue</option>
                            <option value="Product Quality">Product Quality</option>
                            <option value="Website/Account Issue">Website/Account Issue</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {ticketCategory === 'Other' && (
                          <div>
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Subject</label>
                            <input type="text" required value={ticketCustomMessage} onChange={e => setTicketCustomMessage(e.target.value)} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="Brief subject for your issue" />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Related Order (Optional)</label>
                          <select value={ticketOrderId} onChange={(e) => setTicketOrderId(e.target.value)} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors">
                            <option value="">None</option>
                            {orders.map((o: any) => (
                              <option key={o._id} value={o._id}>Order #{o._id.substring(18)} ({new Date(o.createdAt).toLocaleDateString()})</option>
                            ))}
                          </select>
                        </div>

                        {ticketOrderId && (
                          <div>
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Specific Product (Optional)</label>
                            <select value={ticketProductId} onChange={(e) => setTicketProductId(e.target.value)} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors">
                              <option value="">Entire Order</option>
                              {orders.find((o:any) => o._id === ticketOrderId)?.orderItems.map((item: any) => (
                                <option key={item.product} value={item.product}>{item.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Message</label>
                          <textarea placeholder="Describe your issue in detail..." required rows={5} value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} className="w-full bg-transparent border border-border p-4 text-sm focus:outline-none focus:border-[#D4AF37]" />
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Attachments ({(ticketCategory === 'Wrong/Damaged Item Received' || ticketCategory === 'Product Quality') ? 'Required' : 'Optional'})</label>
                          <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer border border-border px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-muted/10 transition-colors">
                              <Camera className="w-4 h-4" /> {isUploadingImage ? 'Uploading...' : 'Add Image'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setTicketImages)} disabled={isUploadingImage} />
                            </label>
                            <div className="flex gap-2">
                              {ticketImages.map((img, idx) => (
                                <img key={idx} src={img} className="w-10 h-10 object-cover border border-border" alt="attachment preview" />
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="flex gap-4 mt-8">
                        <button type="submit" className="flex-1 bg-foreground text-background py-4 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors">Submit Ticket</button>
                        <button type="button" onClick={() => setShowTicketForm(false)} className="flex-1 border border-foreground py-4 text-sm font-medium uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">Cancel</button>
                      </div>
                    </form>
                  ) : tickets.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light">You have no support tickets.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tickets.map((ticket: any) => {
                        const isExpanded = expandedTicketId === ticket._id;
                        return (
                        <div key={ticket._id} className="border border-border">
                          <div className="p-6 flex flex-col md:flex-row justify-between cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => toggleTicketDetails(ticket._id)}>
                            <div>
                              <div className="flex gap-3 items-center mb-2">
                                <span className={`text-[10px] font-medium tracking-widest uppercase px-2 py-1 ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'}`}>
                                  {ticket.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest font-medium border border-border px-2 py-1">{ticket.category}</span>
                              </div>
                              <h4 className="text-sm font-medium mb-1">{ticket.subject}</h4>
                              <p className="text-xs text-muted-foreground">Ticket #{ticket._id.substring(18)} | Updated {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                                <div className="p-6 bg-muted/5">
                                  {/* Status Tracker */}
                                  <div className="mb-8 flex items-center justify-between relative max-w-lg mx-auto">
                                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0"></div>
                                    {['raised', 'under_review', 'replied', 'resolved'].map((step, idx) => {
                                      const passed = ticket.statusHistory.some((h:any) => h.status === step) || (ticket.status === 'resolved' && idx <= 3);
                                      return (
                                      <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ring-4 ring-background transition-colors ${passed ? 'bg-[#D4AF37]' : 'bg-muted'}`}></div>
                                        <span className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground hidden sm:block">{step.replace('_', ' ')}</span>
                                      </div>
                                    )})}
                                  </div>

                                  <div className="space-y-6">
                                    {ticket.thread.map((msg: any, idx: number) => (
                                      <div key={idx} className={`flex flex-col ${msg.sender === 'Customer' ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{msg.sender} {msg.senderRole ? `(${msg.senderRole})` : ''}</span>
                                        <div className={`p-4 max-w-[80%] text-sm font-light ${msg.sender === 'Customer' ? 'bg-foreground text-background' : 'bg-white border border-border shadow-sm'}`}>
                                          <p className="whitespace-pre-wrap">{msg.message}</p>
                                          {msg.images && msg.images.length > 0 && (
                                            <div className="mt-4 flex gap-2 flex-wrap">
                                              {msg.images.map((img:string, i:number) => (
                                                <img key={i} src={img} className="w-20 h-20 object-cover border border-border" alt="attachment" />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleString()}</span>
                                      </div>
                                    ))}
                                    
                                    {ticket.status !== 'closed' && (
                                      <form onSubmit={(e) => handleReplyTicket(ticket._id, e)} className="mt-6 pt-6 border-t border-border">
                                        <div className="flex gap-4 items-end">
                                          <div className="flex-1">
                                            <input type="text" placeholder="Type your reply..." required value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground" />
                                          </div>
                                          <label className="cursor-pointer text-muted-foreground hover:text-foreground">
                                            <Camera className="w-5 h-5 mb-2" />
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setReplyImages)} />
                                          </label>
                                          <button type="submit" className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-2 hover:text-[#D4AF37] transition-colors"><Send className="w-4 h-4 mb-1 inline" /> Send</button>
                                        </div>
                                        {replyImages.length > 0 && (
                                          <div className="mt-4 flex gap-2">
                                            {replyImages.map((img, i) => <img key={i} src={img} className="w-12 h-12 object-cover border border-border" alt="reply attachment" />)}
                                          </div>
                                        )}
                                      </form>
                                    )}
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

              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">My Reviews</h2>
                  
                  {showReviewForm && reviewProduct ? (
                    <form onSubmit={handleSubmitReview} className="border border-border p-8 mb-8 relative">
                      <button type="button" onClick={() => setShowReviewForm(false)} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                      
                      <h3 className="text-lg font-medium tracking-widest uppercase mb-6 text-center text-[#D4AF37]">Write a Review</h3>
                      <div className="flex items-center gap-6 mb-8 border-b border-border pb-8">
                        <img src={reviewProduct.image} alt={reviewProduct.name} className="w-20 aspect-[3/4] object-cover bg-muted" />
                        <div>
                          <p className="font-medium">{reviewProduct.name}</p>
                          <p className="text-xs text-muted-foreground">Order #{reviewProduct.orderId.substring(18)}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button type="button" key={star} onClick={() => setReviewRating(star)} className={`hover:scale-110 transition-transform ${star <= reviewRating ? 'text-[#D4AF37]' : 'text-border'}`}>
                              <Star className="w-8 h-8 fill-current" strokeWidth={1} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Your Experience</label>
                        <textarea required rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full bg-transparent border border-border p-4 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="What did you think about the fit, quality, and style?" />
                      </div>

                      <div className="mb-8">
                        <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Add Photos (Optional)</label>
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-2 cursor-pointer border border-border px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-muted/10 transition-colors">
                            <Camera className="w-4 h-4" /> {isUploadingImage ? 'Uploading...' : 'Add Photo'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setReviewImages)} disabled={isUploadingImage} />
                          </label>
                          <div className="flex gap-2">
                            {reviewImages.map((img, idx) => (
                              <img key={idx} src={img} className="w-12 h-12 object-cover border border-border" alt="review preview" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-foreground text-background py-4 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors">Publish Review</button>
                    </form>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light mb-8">You haven't reviewed any products yet.</p>
                      <p className="text-sm text-muted-foreground font-light">Leave a review from your delivered orders to help others make the right choice.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {reviews.map((rev: any) => (
                        <div key={rev._id} className="border border-border p-6 flex flex-col sm:flex-row gap-6">
                          <Link to={`/product/${rev.product?.slug || rev.product?._id}`} className="w-24 aspect-[3/4] flex-shrink-0 group">
                            <img src={rev.product?.image} alt={rev.product?.name} className="w-full h-full object-cover bg-muted mix-blend-multiply group-hover:scale-105 transition-transform" />
                          </Link>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <Link to={`/product/${rev.product?.slug || rev.product?._id}`} className="hover:text-[#D4AF37] transition-colors">
                                <h4 className="font-medium text-lg">{rev.product?.name}</h4>
                              </Link>
                              <span className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-1 mb-4 text-[#D4AF37]">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-border'}`} />)}
                            </div>
                            <p className="text-sm font-light leading-relaxed mb-4">{rev.comment}</p>
                            {rev.images && rev.images.length > 0 && (
                              <div className="flex gap-2">
                                {rev.images.map((img:string, i:number) => (
                                  <img key={i} src={img} className="w-16 h-16 object-cover border border-border" alt="review photo" />
                                ))}
                              </div>
                            )}
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
                    {!showAddressForm && (
                      <button onClick={() => { setEditingAddress(null); setAddressForm({ street: '', city: '', state: '', postalCode: '', country: '' }); setShowAddressForm(true); }} className="text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-[#D4AF37] transition-colors">Add New</button>
                    )}
                  </div>
                  
                  {showAddressForm ? (
                    <form onSubmit={handleSaveAddress} className="border border-border p-8 mb-8">
                      <h3 className="text-xs font-medium tracking-widest uppercase mb-6">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="Street Address" required value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                          <input type="text" placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Postal Code" required value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                          <input type="text" placeholder="Country" required value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
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
                          {idx === 0 && <span className="absolute top-6 right-6 text-[10px] font-medium uppercase tracking-widest text-[#D4AF37]">Primary</span>}
                          <h4 className="font-medium uppercase tracking-widest text-sm mb-4">{user.name}</h4>
                          <div className="text-sm font-light text-muted-foreground leading-relaxed mb-6">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="flex gap-6">
                            <button onClick={() => { setEditingAddress(address); setAddressForm(address); setShowAddressForm(true); }} className="text-xs font-medium uppercase tracking-widest hover:text-[#D4AF37] transition-colors">Edit</button>
                            <button onClick={() => handleRemoveAddress(address._id)} className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Curated Selection</h2>
                  {wishlistItems.length === 0 ? (
                    <div className="py-12 border-t border-border">
                      <p className="text-lg font-light mb-8">Your wishlist is currently empty.</p>
                      <Link to="/category/all" className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all">Discover Essentials</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="group relative">
                          <Link to={`/product/${item.id}`} className="block aspect-[3/4] bg-muted mb-4 overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                          </Link>
                          <div>
                            <Link to={`/product/${item.id}`} className="hover:text-[#D4AF37] transition-colors">
                              <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">₹{item.price.toLocaleString()}</p>
                            <button onClick={() => { addCartItem({ ...item, quantity: 1, size: 'N/A', color: 'N/A' }); toggleWishlist(item); }} className="mt-4 text-[10px] font-medium uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-[#D4AF37] transition-colors">
                              Move to Bag
                            </button>
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
                  
                  <form onSubmit={handleUpdateProfile} className="max-w-md flex flex-col gap-8 mb-16">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-4 text-muted-foreground">Email Address</label>
                      <input type="email" defaultValue={user.email} className="w-full bg-transparent border-b border-border py-3 text-sm text-muted-foreground cursor-not-allowed" readOnly />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-4 text-muted-foreground">Full Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-4 text-muted-foreground">New Password (Optional)</label>
                      <input type="password" placeholder="Leave blank to keep current" value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    </div>
                    <button type="submit" className="mt-4 bg-foreground text-background py-5 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors w-full">
                      Update Profile
                    </button>
                  </form>

                  <div className="border-t border-border pt-12 max-w-md">
                    <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Data & Privacy (DPDP)</h2>
                    <p className="text-sm font-light text-muted-foreground mb-8">
                      In compliance with the DPDP Act 2023, you can request an export of your personal data or request account deletion.
                    </p>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleDPDPRequest('Export')} className="border border-border py-4 text-sm font-medium uppercase tracking-widest hover:border-foreground transition-colors w-full">Request Data Export</button>
                      <button onClick={() => handleDPDPRequest('Deletion')} className="border border-red-200 text-red-600 hover:bg-red-50 py-4 text-sm font-medium uppercase tracking-widest transition-colors w-full">Request Account Deletion</button>
                    </div>
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
