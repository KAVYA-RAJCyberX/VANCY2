import { Link } from "react-router";
import { Plus, Minus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-12 text-center text-[#3B121A]">Shopping Cart</h1>

        <div className="bg-white p-6 sm:p-10 shadow-sm">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-gray-500 mb-8">Your cart is currently empty.</p>
              <Link 
                to="/"
                className="inline-block bg-[#0A0A0A] text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] transition-colors"
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

              {/* Cart Summary */}
              <div className="pt-8">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center mb-8 border-t border-gray-100 pt-6">
                  <span className="text-lg font-bold tracking-widest uppercase">Total</span>
                  <span className="text-xl font-bold">₹{totalPrice().toLocaleString()}</span>
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
