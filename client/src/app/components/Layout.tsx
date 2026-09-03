import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import Lenis from "lenis";
import { Capacitor } from "@capacitor/core";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useToastStore } from "../../store/useToastStore";
import { ToastContainer } from "./Toast";
import { SearchModal } from "./SearchModal";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { VancyV, VancyLeaf, VancyClose, VancyMenu, VancyMinus, VancyPlus } from "./ui/Icons";
import { useTheme } from "next-themes";
import { Sun, Moon, Search, ShoppingBag, User, Heart, Home, Grid, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

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
        {/* Logo Loading Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-40 object-contain" />
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
    // Lenis Smooth Scroll Setup - Disable on native mobile apps for better UX
    if (Capacitor.isNativePlatform()) {
      return;
    }

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
        className={`w-full z-50 fixed top-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pt-[env(safe-area-inset-top)] ${
          isScrolled ? 'bg-background/90 backdrop-blur-xl py-4 md:py-6 border-b border-border' : 'bg-transparent py-6 md:py-10'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
          
          <button className="lg:hidden text-foreground hover:text-accent transition-colors flex items-center justify-center min-w-[48px] min-h-[48px] -ml-2" onClick={() => setMobileMenuOpen(true)} aria-label="Open Menu">
            <VancyMenu className="w-6 h-6" strokeWidth={1} />
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
          <Link to="/" className="flex-1 lg:flex-none flex justify-center items-center relative z-10 group">
            <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-12 md:h-16 lg:h-20 object-contain transition-all duration-300" />
          </Link>
          
          <div className="flex items-center justify-end gap-1 md:gap-4 lg:gap-8 flex-1">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="text-foreground hover:text-accent transition-colors hidden md:flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <button onClick={() => setSearchOpen(true)} className="text-foreground hover:text-accent hidden md:flex items-center justify-center min-w-[48px] min-h-[48px]" aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <Link to={user ? "/account" : "/login"} className="text-foreground hover:text-accent hidden md:flex items-center justify-center min-w-[48px] min-h-[48px]" aria-label="Account">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <NotificationsDropdown />
            <Link to="/wishlist" className="text-foreground hover:text-accent hidden md:flex items-center justify-center min-w-[48px] min-h-[48px] relative" aria-label="Wishlist">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistItems.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent"></span>}
            </Link>
            <button onClick={() => setCartOpen(true)} className="text-foreground hover:text-accent flex items-center justify-center min-w-[48px] min-h-[48px] relative -mr-2 md:-mr-0" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              {totalItems > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent"></span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-foreground/10 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-background shadow-2xl z-[70] flex flex-col border-r border-border lg:hidden"
            >
              <div className="p-6 flex justify-between items-center border-b border-border/50">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-12 object-contain" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-accent transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <VancyClose className="w-5 h-5" strokeWidth={1} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-8">
                <Link to="/category/all" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif tracking-wide uppercase hover:text-accent transition-colors">Shop All</Link>
                <Link to="/category/polo-shirts" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif tracking-wide uppercase hover:text-accent transition-colors">Polo Shirts</Link>
                <Link to="/category/joggers" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif tracking-wide uppercase hover:text-accent transition-colors">Joggers</Link>
                <Link to="/journal" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif tracking-wide uppercase hover:text-accent transition-colors">Journal</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif tracking-wide uppercase hover:text-accent transition-colors">About</Link>
              </div>
              <div className="p-8 border-t border-border/50 flex flex-col gap-6 bg-muted/20">
                <Link to={user ? "/account" : "/login"} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground p-2 -ml-2">
                  <User className="w-5 h-5" strokeWidth={1.5} /> Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground p-2 -ml-2">
                  <Heart className="w-5 h-5" strokeWidth={1.5} /> Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </Link>
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                  className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground text-left p-2 -ml-2"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />} Theme
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              className="fixed inset-y-0 right-0 w-full max-w-[440px] sm:w-[440px] bg-background/95 backdrop-blur-xl shadow-2xl z-[70] flex flex-col border-l border-border"
            >
              <div className="p-6 md:p-10 flex justify-between items-center border-b border-border/50">
                <h2 className="text-xs font-medium tracking-[0.2em] uppercase">Your Wardrobe</h2>
                <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-accent transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2">
                  <VancyClose className="w-5 h-5" strokeWidth={1} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 md:px-10 flex flex-col gap-10 py-6 md:py-10">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                    <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-24 object-contain mb-6 opacity-80" />
                    <h3 className="text-2xl font-medium tracking-tighter mb-4">Your wardrobe awaits.</h3>
                    <p className="text-sm text-muted-foreground mb-8">Discover our latest essentials.</p>
                    <Button variant="outline" withArrow href="/category/all" onClick={() => setCartOpen(false)}>
                      Explore Collection
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start relative group">
                      <button onClick={() => removeItem(item.id, item._id)} className="absolute -left-4 top-0 p-2 text-muted-foreground hover:text-accent md:opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <VancyClose className="w-4 h-4" />
                      </button>
                      <div className="w-24 aspect-square bg-muted overflow-hidden relative">
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
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item._id)} className="text-muted-foreground hover:text-accent transition-colors p-2 min-w-[32px] min-h-[32px] flex items-center justify-center">
                              <VancyMinus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item._id)} className="text-muted-foreground hover:text-accent transition-colors p-2 min-w-[32px] min-h-[32px] flex items-center justify-center">
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
                <div className="p-6 md:p-10 bg-background border-t border-border/50">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs tracking-widest uppercase text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-lg">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={() => { setCartOpen(false); navigate("/checkout"); }}
                    className="w-full bg-foreground text-background py-5 hover:bg-accent hover:text-foreground border-none uppercase tracking-widest font-medium"
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

      <footer className="bg-background pt-12 md:pt-32 pb-8 md:pb-16 px-4 md:px-6 lg:px-12 border-t border-border mt-auto">
        <div className="container mx-auto">
          
          <div className="flex flex-col items-center mb-10 md:mb-24 text-center">
            <div className="mb-6 md:mb-10">
              <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-16 md:h-40 object-contain" />
            </div>
            <p className="text-sm md:text-xl text-muted-foreground max-w-xl font-light uppercase tracking-widest leading-loose">
              Crafted for Everyday.
            </p>
          </div>

          {/* Mobile Footer (Accordion) */}
          <div className="md:hidden flex flex-col w-full mb-12">
            <Accordion type="single" collapsible className="w-full uppercase tracking-widest">
              <AccordionItem value="shop" className="border-b border-border">
                <AccordionTrigger className="text-xs font-medium py-6 hover:no-underline">Shop</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-6">
                  <Link to="/category/new" className="text-xs text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
                  <Link to="/category/all" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Collections</Link>
                  <Link to="/category/sale" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sale</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="help" className="border-b border-border">
                <AccordionTrigger className="text-xs font-medium py-6 hover:no-underline">Help</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-6">
                  <Link to="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                  <Link to="/shipping" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Shipping & Returns</Link>
                  <Link to="/size-guide" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Size Guide</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="about" className="border-b border-border">
                <AccordionTrigger className="text-xs font-medium py-6 hover:no-underline">About</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-6">
                  <Link to="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Our Story</Link>
                  <Link to="/journal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Journal</Link>
                  <Link to="/careers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-12 flex flex-col gap-6 text-center">
              <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Follow Us</h4>
              <div className="flex justify-center gap-8">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest hover:text-accent transition-colors">Instagram</a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest hover:text-accent transition-colors">Pinterest</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest hover:text-accent transition-colors">Facebook</a>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-border flex flex-col items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
              <p>Secure Payments • Free Shipping • Easy Returns</p>
            </div>
          </div>

          {/* Desktop Footer (Multi-column) */}
          <div className="hidden md:grid grid-cols-5 gap-8 text-xs uppercase tracking-widest mb-20">
            <div className="col-span-2 flex flex-col gap-8 pr-12">
              <div className="flex items-center gap-3 text-accent mb-2">
                <img src="/images/logo/vancy-logo.png" alt="Vancy Logo" className="h-6 object-contain" />
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

            <div className="flex flex-col gap-6">
              <h4 className="font-medium text-muted-foreground mb-2">Shop</h4>
              <Link to="/category/new" className="hover:text-accent transition-colors w-fit">New Arrivals</Link>
              <Link to="/category/all" className="hover:text-accent transition-colors w-fit">Collections</Link>
              <Link to="/category/sale" className="hover:text-accent transition-colors w-fit">Sale</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="font-medium text-muted-foreground mb-2">Help</h4>
              <Link to="/contact" className="hover:text-accent transition-colors w-fit">Contact</Link>
              <Link to="/shipping" className="hover:text-accent transition-colors w-fit">Shipping & Returns</Link>
              <Link to="/size-guide" className="hover:text-accent transition-colors w-fit">Size Guide</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="font-medium text-muted-foreground mb-2">About</h4>
              <Link to="/about" className="hover:text-accent transition-colors w-fit">Our Story</Link>
              <Link to="/journal" className="hover:text-accent transition-colors w-fit">Journal</Link>
              <Link to="/careers" className="hover:text-accent transition-colors w-fit">Careers</Link>
              <div className="mt-4 flex flex-col gap-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors w-fit">Instagram</a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors w-fit">Pinterest</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest text-center md:text-left gap-4 md:gap-0 pb-[calc(env(safe-area-inset-bottom,16px)+64px)] lg:pb-0">
            <p>© {new Date().getFullYear()} VANCY. All Rights Reserved.</p>
            <div className="flex gap-4 md:gap-8 mt-2 md:mt-0">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            </div>
            <p className="mt-2 md:mt-0">Designed without compromise.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-background/95 backdrop-blur-xl border-t border-border z-40 px-4 py-2 flex justify-between items-center pb-[env(safe-area-inset-bottom,16px)]">
        <Link to="/" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground min-w-[60px] min-h-[48px] active:scale-95 transition-transform">
          <Home className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium tracking-widest uppercase">Home</span>
        </Link>
        <Link to="/category/all" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground min-w-[60px] min-h-[48px] active:scale-95 transition-transform">
          <Grid className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium tracking-widest uppercase">Shop</span>
        </Link>
        <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground min-w-[60px] min-h-[48px] active:scale-95 transition-transform">
          <Search className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium tracking-widest uppercase">Search</span>
        </button>
        <button onClick={() => setCartOpen(true)} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground min-w-[60px] min-h-[48px] relative active:scale-95 transition-transform">
          <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          {totalItems > 0 && <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-accent"></span>}
          <span className="text-[9px] font-medium tracking-widest uppercase">Cart</span>
        </button>
        <Link to={user ? "/account" : "/login"} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground min-w-[60px] min-h-[48px] active:scale-95 transition-transform">
          <User className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium tracking-widest uppercase">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
