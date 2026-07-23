import { Outlet, Link, useLocation } from "react-router";
import { Search, User, Menu, Heart, X, Minus, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lenis from "lenis";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useToastStore } from "../../store/useToastStore";
import { ToastContainer } from "./Toast";
import { SearchModal } from "./SearchModal";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const totalItems = useCartStore((state) => state.totalItems());
  const cartItems = useCartStore((state) => state.items) || [];
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  const user = useAuthStore((state) => state.user);
  const wishlistItems = useWishlistStore((state) => state.items) || [];
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Header scroll effect
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    useCartStore.getState().fetchCart();
    useWishlistStore.getState().fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-black selection:text-white">
      
      {/* Header */}
      <header 
        className={`w-full z-50 fixed top-0 transition-all duration-500 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md py-4 border-b border-border' : 'bg-transparent py-8'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          <button className="lg:hidden text-foreground" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <nav className="hidden lg:flex gap-8 flex-1">
            <Link to="/category/all" className="text-sm font-medium tracking-wide relative group">
              Shop
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/collections" className="text-sm font-medium tracking-wide relative group">
              Collections
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/journal" className="text-sm font-medium tracking-wide relative group">
              Journal
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/about" className="text-sm font-medium tracking-wide relative group">
              About
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          </nav>

          <Link to="/" className="text-2xl font-semibold tracking-tighter uppercase flex-1 text-center lg:flex-none relative z-10">
            VANCY
          </Link>
          
          <div className="flex items-center gap-6 flex-1 justify-end">
            <button onClick={() => setSearchOpen(true)} className="text-sm font-medium tracking-wide relative group hidden sm:block">
              Search
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </button>
            <Link to={user ? "/account" : "/login"} className="text-sm font-medium tracking-wide relative group hidden sm:block">
              Profile
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/wishlist" className="text-sm font-medium tracking-wide relative group hidden sm:block">
              Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="text-sm font-medium tracking-wide relative group">
              Bag {totalItems > 0 && `(${totalItems})`}
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-background shadow-2xl z-[70] flex flex-col border-l border-border"
            >
              <div className="p-8 flex justify-between items-center">
                <h2 className="text-sm font-semibold tracking-widest uppercase">Your Bag</h2>
                <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-8 flex flex-col gap-8">
                {cartItems.length === 0 ? (
                  <div className="text-left mt-20 flex flex-col">
                    <h3 className="text-4xl font-medium tracking-tighter mb-4 leading-tight">Nothing here yet.<br/>Let's fix that.</h3>
                    <Link to="/category/all" onClick={() => setCartOpen(false)} className="text-sm font-medium tracking-wide underline underline-offset-4 hover:text-muted-foreground transition-colors">
                      Explore Collection →
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start relative group">
                      <button onClick={() => removeItem(item.id, item._id)} className="absolute -left-2 top-0 p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-24 aspect-[3/4] bg-muted overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col h-full justify-between pt-1">
                        <div>
                          <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-4">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item._id)} className="text-muted-foreground hover:text-foreground">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item._id)} className="text-muted-foreground hover:text-foreground">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-8 bg-background">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-medium text-lg">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Link 
                    to="/checkout" 
                    onClick={() => setCartOpen(false)}
                    className="w-full flex items-center justify-center bg-black text-white py-4 text-sm font-medium hover:bg-black/80 transition-colors"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      <main className="flex-grow flex flex-col w-full">
        <Outlet />
      </main>

      <ToastContainer />

      <footer className="bg-background pt-32 pb-12 px-6 lg:px-12 border-t border-border mt-auto">
        <div className="container mx-auto">
          <div className="mb-24">
            <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-none mb-6">VANCY</h2>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-light">
              We don't just sell clothes.<br/>We create timeless essentials.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div className="flex flex-col gap-4">
              <Link to="/category/all" className="hover:text-muted-foreground transition-colors w-fit">Shop</Link>
              <Link to="/collections" className="hover:text-muted-foreground transition-colors w-fit">Collections</Link>
              <Link to="/journal" className="hover:text-muted-foreground transition-colors w-fit">Journal</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/about" className="hover:text-muted-foreground transition-colors w-fit">About</Link>
              <Link to="/shipping" className="hover:text-muted-foreground transition-colors w-fit">Shipping & Returns</Link>
              <Link to="/terms" className="hover:text-muted-foreground transition-colors w-fit">Terms</Link>
              <Link to="/privacy" className="hover:text-muted-foreground transition-colors w-fit">Privacy</Link>
            </div>
            <div className="flex flex-col gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-muted-foreground transition-colors w-fit">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-muted-foreground transition-colors w-fit">Pinterest</a>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground">Subscribe for journal updates and new essentials.</p>
              <form className="flex border-b border-border pb-2 group" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email Address" className="bg-transparent w-full focus:outline-none placeholder:text-muted-foreground/50" />
                <button type="submit" className="text-muted-foreground group-hover:text-foreground transition-colors">
                  →
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-32 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} VANCY</p>
            <p>Designed without compromise.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
