import { useState } from "react";
import { Link } from "react-router";
import { Plus, Minus, X, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";
import { motion, AnimatePresence } from "motion/react";
import api from "../../lib/axios";

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const addToast = useToastStore(state => state.addToast);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = totalPrice();
  const freeShippingThreshold = 5000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - subtotal;

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;

    setIsApplyingPromo(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: promoCode,
        cartTotal: subtotal
      });
      
      setDiscount(response.data.discount);
      addToast({ type: 'success', message: response.data.message });
    } catch (error: any) {
      setDiscount(0);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to validate promo code' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-16">Bag</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-start border-t border-border pt-16">
            <p className="text-2xl font-light mb-8">Your bag is empty.</p>
            <Link 
              to="/category/all"
              className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all"
            >
              Continue Exploring
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
            
            {/* Cart Items */}
            <div className="lg:w-3/5">
              <div className="border-t border-border">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      key={`${item.id}-${item.size}`} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-8 py-8 border-b border-border relative overflow-hidden"
                    >
                      <div className="w-24 aspect-[3/4] bg-muted flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover mix-blend-multiply" 
                        />
                      </div>
                      <div className="flex flex-col flex-grow justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium uppercase mb-1"><Link to={`/product/${item.id}`} className="hover:text-muted-foreground transition-colors">{item.name}</Link></h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              {item.size && `Size: ${item.size} / `}Color: {item.color || 'Standard'}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id, item.size)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-2"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                            >
                              <Minus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                          <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:w-2/5">
              <div className="sticky top-32">
                <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Summary</h2>

                {/* Free Shipping Bar */}
                <div className="mb-12 border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className={`w-4 h-4 ${remaining <= 0 ? 'text-foreground' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                    <span className="text-xs font-medium tracking-widest uppercase">
                      {remaining <= 0 
                        ? "Complimentary Shipping Unlocked"
                        : `₹${remaining.toLocaleString()} away from complimentary shipping`
                      }
                    </span>
                  </div>
                  <div className="h-1 w-full bg-border overflow-hidden">
                    <div 
                      className="h-full bg-foreground transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-12">
                  <form onSubmit={handleApplyPromo} className="flex border-b border-border pb-2">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo Code"
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50 uppercase min-h-[44px]"
                    />
                    <button type="submit" disabled={isApplyingPromo} className="text-xs font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors min-w-[44px] min-h-[44px]">
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-12">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{remaining <= 0 ? 'Complimentary' : 'Calculated at checkout'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-border pt-8 mb-12">
                  <span className="text-sm font-medium tracking-widest uppercase">Total</span>
                  <span className="text-2xl font-medium">₹{(subtotal - discount).toLocaleString()}</span>
                </div>

                <Link 
                  to="/checkout"
                  className="flex items-center justify-between w-full bg-foreground text-background p-5 text-sm font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors group"
                >
                  Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
