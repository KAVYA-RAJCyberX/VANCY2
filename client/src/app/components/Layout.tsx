import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import Lenis from "lenis";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useToastStore } from "../../store/useToastStore";
import { ToastContainer } from "./Toast";
import { SearchModal } from "./SearchModal";
import { VancyV, VancyLeaf, VancyClose, VancyMenu, VancyMinus, VancyPlus } from "./ui/Icons";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

// Botanical Stem Scroll Progress Component
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed right-6 top-1/4 bottom-1/4 w-8 z-40 hidden lg:flex flex-col items-center pointer-events-none opacity-40">
      <motion.div 
        className="w-[1px] bg-foreground origin-top"
        style={{ scaleY, height: '100%' }}
      />
      {/* Decorative Leaves along the stem - they fade in based on scroll */}
      {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
        <motion.div 
          key={i}
          className="absolute text-foreground"
          style={{ 
            top: `${pos * 100}%`,
            opacity: useTransform(scrollYProgress, [pos - 0.1, pos], [0, 1]),
            x: i % 2 === 0 ? -12 : 12,
            rotate: i % 2 === 0 ? -45 : 45
          }}
        >
          <VancyLeaf size={12} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

// Loading Sequence Overlay
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center pointer-events-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Leaf Logo Loading Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <img src="/images/logo/leaf-logo.png" alt="Vancy Leaf" className="w-32 h-32 object-contain" />
        </motion.div>

        {/* Champagne Gold Sweep */}
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "100%", opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent mix-blend-overlay w-[200%] h-full"
        />
      </div>
    </motion.div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  
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
      duration: 1.5, // Slower, more cinematic
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Power4.out equivalent
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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

  useEffect(() => {
    setCartOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    document.body.style.overflow = '';
    if ((window as any).lenis) {
      (window as any).lenis.start();
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (cartOpen || mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
      if ((window as any).lenis) (window as any).lenis.stop();
    } else {
      document.body.style.overflow = '';
      if ((window as any).lenis) (window as any).lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if ((window as any).lenis) (window as any).lenis.start();
    };
  }, [cartOpen, mobileMenuOpen, searchOpen]);

  const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link to={to} className="text-sm font-medium tracking-widest uppercase relative group">
      {children}
      <span className="absolute left-1/2 -bottom-2 w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-300"></span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-accent selection:text-foreground">
      
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <ScrollProgress />

      {/* Header */}
      <header 
        className={`w-full z-50 fixed top-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? 'bg-background/90 backdrop-blur-xl py-6 border-b border-border' : 'bg-transparent py-10'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          <button className="lg:hidden text-foreground hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <VancyMenu className="w-5 h-5" strokeWidth={1} />
          </button>
          
          <nav className="hidden lg:flex gap-10 flex-1 items-center">
            <div className="relative group/shop">
              <span className="text-sm font-medium tracking-widest uppercase cursor-pointer py-4">Shop</span>
              <div className="absolute left-0 top-full mt-2 w-48 bg-background border border-border shadow-xl opacity-0 invisible group-hover/shop:opacity-100 group-hover/shop:visible transition-all duration-300 z-50 flex flex-col py-2">
                <Link to="/category/polo-shirts" className="px-4 py-2 text-sm font-medium tracking-wider uppercase hover:bg-muted transition-colors">Polo Tshirt</Link>
                <Link to="/category/joggers" className="px-4 py-2 text-sm font-medium tracking-wider uppercase hover:bg-muted transition-colors">Joggers</Link>
              </div>
            </div>
            <NavLink to="/journal">Journal</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>

          {/* Logo Section */}
          <Link to="/" className="flex-1 lg:flex-none flex justify-center items-center gap-3 relative z-10 group">
            <img src="/images/logo/leaf-logo.png" alt="Vancy Leaf" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-medium tracking-[0.2em] uppercase mt-1 hidden sm:block">VANCY</span>
          </Link>
          
          <div className="flex items-center gap-8 flex-1 justify-end">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="text-foreground hover:text-accent transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <button onClick={() => setSearchOpen(true)} className="text-sm font-medium tracking-widest uppercase relative group hidden sm:block">
              Search
              <span className="absolute left-1/2 -bottom-2 w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-300"></span>
            </button>
            <Link to={user ? "/account" : "/login"} className="text-sm font-medium tracking-widest uppercase relative group hidden sm:block">
              Profile
              <span className="absolute left-1/2 -bottom-2 w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-300"></span>
            </Link>
            <Link to="/wishlist" className="text-sm font-medium tracking-widest uppercase relative group hidden sm:block">
              Wishlist {wishlistItems.length > 0 && <span className="text-accent ml-1">{wishlistItems.length}</span>}
              <span className="absolute left-1/2 -bottom-2 w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-300"></span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="text-sm font-medium tracking-widest uppercase relative group">
              Bag {totalItems > 0 && <span className="text-accent ml-1">{totalItems}</span>}
              <span className="absolute left-1/2 -bottom-2 w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-300"></span>
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
              className="fixed inset-0 bg-foreground/10 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 w-full max-w-[440px] bg-background shadow-2xl z-[70] flex flex-col border-l border-border"
            >
              <div className="p-10 flex justify-between items-center border-b border-border/50">
                <h2 className="text-xs font-medium tracking-[0.2em] uppercase">Your Wardrobe</h2>
                <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-accent transition-colors">
                  <VancyClose className="w-5 h-5" strokeWidth={1} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-10 flex flex-col gap-10 py-10">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                    <img src="/images/logo/leaf-logo.png" alt="Vancy Leaf" className="w-16 h-16 object-contain mb-6 opacity-80" />
                    <h3 className="text-2xl font-medium tracking-tighter mb-4">Your wardrobe awaits.</h3>
                    <p className="text-sm text-muted-foreground mb-8">Discover our latest essentials.</p>
                    <Button variant="outline" withArrow href="/category/all" onClick={() => setCartOpen(false)}>
                      Explore Collection
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start relative group">
                      <button onClick={() => removeItem(item.id, item._id)} className="absolute -left-4 top-0 p-2 text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <VancyClose className="w-4 h-4" />
                      </button>
                      <div className="w-28 aspect-[3/4] bg-muted overflow-hidden relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div className="flex-1 flex flex-col h-full justify-between pt-1">
                        <div>
                          <h4 className="font-medium text-sm mb-1 uppercase tracking-wider">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                        </div>
                        <div className="flex justify-between items-end mt-6">
                          <div className="flex items-center gap-4 border border-border px-3 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item._id)} className="text-muted-foreground hover:text-accent transition-colors">
                              <VancyMinus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item._id)} className="text-muted-foreground hover:text-accent transition-colors">
                              <VancyPlus className="w-3 h-3" />
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
                <div className="p-10 bg-background border-t border-border/50">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs tracking-widest uppercase text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-lg">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={() => { setCartOpen(false); navigate("/checkout"); }}
                    className="w-full bg-foreground text-background py-5 hover:bg-accent hover:text-foreground border-none"
                  >
                    Proceed to Checkout
                  </Button>
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

      <footer className="bg-background pt-40 pb-16 px-6 lg:px-12 border-t border-border mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-32 text-center">
            <div className="mb-10">
              <img src="/images/logo/leaf-logo.png" alt="Vancy Leaf" className="w-20 h-20 object-contain" />
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-[0.2em] uppercase mb-8">VANCY</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-light uppercase tracking-widest leading-loose">
              Timeless Essentials.<br/>Crafted for Everyday.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 text-xs uppercase tracking-widest">
            <div className="flex flex-col gap-6">
              <Link to="/category/all" className="hover:text-accent transition-colors w-fit">Shop</Link>
              <Link to="/journal" className="hover:text-accent transition-colors w-fit">Journal</Link>
            </div>
            <div className="flex flex-col gap-6">
              <Link to="/about" className="hover:text-accent transition-colors w-fit">About</Link>
              <Link to="/shipping" className="hover:text-accent transition-colors w-fit">Shipping & Returns</Link>
              <Link to="/terms" className="hover:text-accent transition-colors w-fit">Terms</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors w-fit">Privacy</Link>
            </div>
            <div className="flex flex-col gap-6">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors w-fit">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors w-fit">Pinterest</a>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 text-accent mb-2">
                <img src="/images/logo/leaf-logo.png" alt="Vancy Leaf" className="w-6 h-6 object-contain" />
                <span className="font-medium text-foreground">Join the VANCY Journal</span>
              </div>
              <p className="text-muted-foreground leading-relaxed normal-case tracking-normal">
                Receive early access to new collections, editorials, and exclusive releases.
              </p>
              <form className="flex border-b border-border pb-3 group relative" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email Address" className="bg-transparent w-full focus:outline-none placeholder:text-muted-foreground/40 normal-case tracking-normal" />
                <button type="submit" className="text-muted-foreground group-hover:text-accent transition-colors">
                  <VancyPlus className="w-4 h-4" />
                </button>
                <span className="absolute left-0 bottom-[-1px] w-full h-[1px] bg-accent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700 origin-left ease-[cubic-bezier(0.16,1,0.3,1)]"></span>
              </form>
            </div>
          </div>
          
          <div className="mt-40 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground uppercase tracking-widest">
            <p>© {new Date().getFullYear()} VANCY. All Rights Reserved.</p>
            <p className="mt-4 md:mt-0">Designed without compromise.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
