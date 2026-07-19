import { Outlet, Link, useLocation } from "react-router";
import { ShoppingBag, Search, User, Menu, Heart, X, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import logoImg from "../../assets/logo.png";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const totalItems = useCartStore((state) => state.totalItems());
  const cartItems = useCartStore((state) => state.items) || [];
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const user = useAuthStore((state) => state.user);
  const wishlistItems = useWishlistStore((state) => state.items) || [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    useCartStore.getState().fetchCart();
    useWishlistStore.getState().fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-[#F5F1E8] text-[#0A0A0A]">
      
      {/* Header */}
      <header className={`w-full z-50 fixed top-0 transition-all duration-300 border-b border-[#e5dfd3] ${isScrolled ? 'bg-[#F5F1E8] shadow-md py-4' : 'bg-[#F5F1E8] py-6'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button className="lg:hidden text-[#0A0A0A]" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center justify-center flex-1 lg:flex-none relative h-16 w-32">
            <img src={logoImg} alt="VANCY" className="h-full w-full object-contain" />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-10 flex-1 justify-center relative">
            <Link to="/" className={`text-sm font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors ${location.pathname === '/' ? 'text-[#C9A961] border-[#C9A961]' : 'text-[#0A0A0A] border-transparent hover:text-[#C9A961] hover:border-[#C9A961]'}`}>HOME</Link>
            
            {/* Mega Menu: Polo Shirts */}
            <div className="group relative">
              <Link to="/category/polos" className="text-sm font-bold tracking-widest uppercase text-[#0A0A0A] hover:text-[#C9A961] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C9A961]">POLO SHIRTS</Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex border border-gray-100">
                <div className="flex-1 p-8 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <h4 className="font-['Playfair_Display'] font-bold text-lg mb-2">Collections</h4>
                    <Link to="/category/artisan" className="text-sm hover:text-[#C9A961]">Artisan Embroidered</Link>
                    <Link to="/category/velvet" className="text-sm hover:text-[#C9A961]">Velvet & Merino</Link>
                    <Link to="/category/basics" className="text-sm hover:text-[#C9A961]">Timeless Basics</Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="font-['Playfair_Display'] font-bold text-lg mb-2">Featured</h4>
                    <Link to="/category/new" className="text-sm hover:text-[#C9A961]">New Arrivals</Link>
                    <Link to="/category/bestsellers" className="text-sm hover:text-[#C9A961]">Bestsellers</Link>
                  </div>
                </div>
                <div className="w-1/3 bg-[#F5F1E8] p-4 flex flex-col justify-center items-center text-center">
                  <img src="https://images.unsplash.com/photo-1596755094514-f87e32f85e98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" alt="Featured Polo" className="w-full h-auto object-cover mb-3" />
                  <span className="text-sm font-bold tracking-widest uppercase text-[#C9A961]">Shop New</span>
                </div>
              </div>
            </div>

            <Link to="/category/new" className="text-sm font-bold tracking-widest uppercase text-[#0A0A0A] hover:text-[#C9A961] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C9A961]">NEW ARRIVALS</Link>
            
            {/* Mega Menu: Accessories */}
            <div className="group relative">
              <Link to="/category/accessories" className="text-sm font-bold tracking-widest uppercase text-[#0A0A0A] hover:text-[#C9A961] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C9A961]">ACCESSORIES</Link>
            </div>
            
            <Link to="/luxury" className="text-sm font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors text-[#C9A961] border-transparent hover:border-[#C9A961]">LUXURY</Link>

            <Link to="/category/sale" className="text-sm font-bold tracking-widest uppercase text-red-600 hover:text-red-500 transition-colors pb-1 border-b-2 border-transparent hover:border-red-500">SALE</Link>
          </nav>
          
          {/* Icons */}
          <div className="flex items-center gap-6 lg:flex-none">
            <button className="hidden sm:flex flex-col items-center text-[#0A0A0A] hover:text-[#C9A961] transition-colors">
              <Search className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-wider uppercase font-semibold">Search</span>
            </button>
            <Link to={user ? "/account" : "/login"} className="hidden sm:flex flex-col items-center text-[#0A0A0A] hover:text-[#C9A961] transition-colors">
              <User className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-wider uppercase font-semibold">Account</span>
            </Link>
            <Link to="/wishlist" className="hidden sm:flex flex-col items-center text-[#0A0A0A] hover:text-[#C9A961] transition-colors relative">
              <div className="relative">
                <Heart className="w-5 h-5 mb-1" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#d4183d] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold">Wishlist</span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center text-[#0A0A0A] hover:text-[#C9A961] transition-colors group">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 mb-1" />
                <span className="absolute -top-1 -right-2 bg-[#C9A961] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mini Cart Slide-over */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F5F1E8] shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-[#e5dfd3] flex justify-between items-center">
                <h2 className="text-xl font-black font-['Playfair_Display']">YOUR CART</h2>
                <button onClick={() => setCartOpen(false)} className="text-gray-500 hover:text-black"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md mix-blend-multiply" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">Size: {item.size} | Color: {item.color}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Qty: {item.quantity}</span>
                          <span className="text-[#C9A961] font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-[#e5dfd3] bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold">Subtotal</span>
                  <span className="font-bold text-xl text-[#C9A961]">₹{cartTotal}</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={() => setCartOpen(false)}
                  className="w-full block text-center bg-[#0A0A0A] text-white py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col w-full mt-24">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-16 pb-8">
        
        {/* Trust Badges */}
        <div className="container mx-auto px-6 mb-12 flex flex-wrap justify-center gap-10 md:gap-20 border-b border-gray-800 pb-12">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ShieldCheck className="w-8 h-8 text-[#C9A961]" />
            <span className="text-sm font-semibold tracking-wide uppercase">Secure Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <RefreshCcw className="w-8 h-8 text-[#C9A961]" />
            <span className="text-sm font-semibold tracking-wide uppercase">Easy Returns</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Truck className="w-8 h-8 text-[#C9A961]" />
            <span className="text-sm font-semibold tracking-wide uppercase">COD Available</span>
          </div>
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="flex flex-col gap-4">
            <h4 className="font-['Playfair_Display'] text-xl text-[#C9A961] mb-2">Shop</h4>
            <Link to="/category/polos" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Polo Shirts</Link>
            <Link to="/category/new" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">New Arrivals</Link>
            <Link to="/category/accessories" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Accessories</Link>
            <Link to="/category/sale" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Sale</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-['Playfair_Display'] text-xl text-[#C9A961] mb-2">Support</h4>
            <Link to="/faq" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">FAQ</Link>
            <Link to="/shipping" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Shipping & Returns</Link>
            <Link to="/size-guide" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Size Guide</Link>
            <Link to="/contact" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Contact Us</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-['Playfair_Display'] text-xl text-[#C9A961] mb-2">Company</h4>
            <Link to="/about" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">About Us</Link>
            <Link to="/terms" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-[#C9A961] transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-['Playfair_Display'] text-xl text-[#C9A961] mb-2">Newsletter</h4>
            <p className="text-sm text-gray-400 leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="bg-transparent border border-gray-700 px-4 py-2 text-sm w-full focus:outline-none focus:border-[#C9A961] transition-colors" />
              <button type="submit" className="bg-[#C9A961] text-[#0A0A0A] px-4 font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        {/* Social & Copyright */}
        <div className="container mx-auto px-6 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-800">
          
          {/* Payment Icons */}
          <div className="flex items-center gap-3">
            {/* Visa */}
            <div className="bg-white px-2 py-1 rounded">
              <svg className="h-4 w-auto" viewBox="0 0 38 12" fill="none"><path d="M14.545 0l-1.503 11.455H9.421L10.924 0h3.62zM27.202 11.455V11.2c-1.393.763-2.924 1.151-4.593 1.151-3.666 0-6.248-1.954-6.273-4.757-.024-2.072 1.869-3.236 3.28-3.921 1.452-.703 1.936-1.151 1.936-1.781 0-.957-1.149-1.381-2.215-1.381-1.464 0-2.312.218-3.268.654l-.448.206L15.1 0c1.04-.485 2.59-.873 4.226-.873 3.908 0 6.453 1.939 6.478 4.939.024 1.636-.883 2.763-3.136 3.842-1.282.63-2.082 1.054-2.082 1.696 0 .618.69 1.224 2.299 1.224 1.198 0 2.058-.182 2.893-.57l.351-.157.545 3.354h.528zM36.19 11.455L33.722 3.14a1.76 1.76 0 00-1.706-1.248H27.53l-.048.242c.605.121 1.295.327 1.876.582.327.133.424.327.557.848l1.889 7.89H36.19zM8.307 0H5.353c-.63 0-1.162.363-1.428.933L.027 11.455h3.813l.763-2.109h4.654l.436 2.109h3.402L9.275 0h-.968zM5.583 6.945l1.114-3.09h.024l.569 3.09H5.583z" fill="#1434CB"/></svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white px-2 py-1 rounded">
              <svg className="h-4 w-auto" viewBox="0 0 38 24" fill="none"><path d="M12.012 11.996c0-3.327 1.58-6.275 4.02-8.158A11.968 11.968 0 009.68 0 11.996 11.996 0 109.68 23.992a11.968 11.968 0 006.353-3.837c-2.44-1.884-4.02-4.832-4.02-8.159z" fill="#EB001B"/><path d="M37.995 11.996A11.996 11.996 0 0126.014 23.99a11.968 11.968 0 01-6.352-3.837c2.44-1.884 4.02-4.832 4.02-8.159 0-3.327-1.58-6.275-4.02-8.158a11.968 11.968 0 016.352-3.838 11.996 11.996 0 0111.981 11.996z" fill="#F79E1B"/><path d="M24.4 11.996c0 3.327-1.58 6.275-4.02 8.159-2.44-1.884-4.02-4.832-4.02-8.159 0-3.327 1.58-6.275 4.02-8.158 2.44 1.883 4.02 4.831 4.02 8.158z" fill="#FF5F00"/></svg>
            </div>
            {/* UPI text representation for now */}
            <div className="bg-white px-2 py-1 rounded text-[#0A0A0A] font-bold text-xs flex items-center h-6">
              UPI
            </div>
          </div>

          <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} VANCY. All rights reserved. Crafted with sophistication.</p>
          
        </div>
      </footer>
    </div>
  );
}
