import { useState } from "react";
import { Link } from "react-router";
import { Plus, Minus, X, ArrowRight, ShoppingBag, Truck, CheckCircle2 } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const addToast = useToastStore(state => state.addToast);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = totalPrice();
  const freeShippingThreshold = 5000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - subtotal;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'VANCY10') {
      setDiscount(subtotal * 0.1);
      addToast({ type: 'success', message: 'Promo code applied!' });
    } else {
      addToast({ type: 'error', message: 'Invalid promo code' });
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-6 text-center text-[#3B121A]">Shopping Cart</h1>

        <div className="bg-white p-6 sm:p-10 shadow-sm">
          {items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="animate-bounce mb-6">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-lg text-gray-500 mb-8 font-medium">Your cart is currently empty.</p>
              <Link 
                to="/"
                className="inline-block bg-[#0A0A0A] text-white px-10 py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] active:scale-95 transition-all shadow-md hover:shadow-lg rounded-sm"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-8 border-b border-gray-100 pb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6 relative">
                    <button 
                      onClick={() => removeItem(item.id, item._id)}
                      className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-[#d4183d] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex flex-col flex-grow justify-center py-2">
                      <h3 className="text-sm font-bold text-[#0A0A0A] tracking-widest uppercase mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {item.size && `Size: ${item.size} | `}Color: {item.color || 'Default'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 w-24">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item._id)}
                            className="px-2 py-1 text-gray-500 hover:text-[#0A0A0A]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="flex-1 text-center text-xs font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item._id)}
                            className="px-2 py-1 text-gray-500 hover:text-[#0A0A0A]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-[#C9A961]">₹{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Shipping Bar */}
              <div className="py-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className={`w-5 h-5 ${remaining <= 0 ? 'text-green-600' : 'text-[#C9A961]'}`} />
                  <span className="text-sm font-bold tracking-widest uppercase">
                    {remaining <= 0 
                      ? "You've unlocked Free White-Glove Delivery!"
                      : `You're ₹${remaining.toLocaleString()} away from Free Shipping`
                    }
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${remaining <= 0 ? 'bg-green-600' : 'bg-[#C9A961]'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Promo Code */}
              <div className="py-6 border-b border-gray-100">
                <form onSubmit={handleApplyPromo} className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter Promo Code (Try VANCY10)"
                    className="flex-1 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#0A0A0A] uppercase"
                  />
                  <button type="submit" className="bg-gray-100 text-[#0A0A0A] px-6 font-bold text-xs uppercase tracking-widest hover:bg-[#C9A961] transition-colors">
                    Apply
                  </button>
                </form>
              </div>

              {/* Cart Summary */}
              <div className="pt-8">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-4 text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{remaining <= 0 ? 'Free' : 'Calculated at checkout'}</span>
                </div>
                <div className="flex justify-between items-center mb-8 border-t border-gray-100 pt-6">
                  <span className="text-lg font-bold tracking-widest uppercase">Total</span>
                  <span className="text-xl font-bold">₹{(subtotal - discount).toLocaleString()}</span>
                </div>

                <div className="bg-gray-50 p-4 mb-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">Order now for delivery within 2-4 business days.</p>
                  </div>
                </div>

                <Link 
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-[#C9A961] text-[#0A0A0A] py-4 font-bold tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
