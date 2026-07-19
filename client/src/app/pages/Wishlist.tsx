import { Link } from "react-router";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { Trash2, ShoppingCart } from "lucide-react";

export function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#F5F1E8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex justify-between items-end mb-8 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-2 text-[#3B121A]">Your Wishlist</h1>
            <p className="text-gray-600 text-sm">{items.length} Items</p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={clearWishlist}
              className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-[#d4183d] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold tracking-widest uppercase mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love to review them later.</p>
            <Link to="/" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 font-bold text-sm tracking-widest uppercase hover:bg-[#C9A961] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex flex-col relative group">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 z-10 bg-white p-1.5 rounded-full text-gray-400 hover:text-[#d4183d] shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden mb-3 relative">
                  <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </Link>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="absolute top-2 left-2 bg-[#d4183d] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm z-10">
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                <Link to={`/product/${item.id}`} className="hover:underline">
                  <h3 className="text-sm font-bold text-[#0A0A0A] line-clamp-1 mb-1">{item.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[#C9A961] font-bold">₹{item.price}</p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <p className="text-xs text-gray-400 line-through decoration-gray-400">₹{item.originalPrice}</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    addItem({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      quantity: 1,
                      size: 'M',
                      color: 'Standard'
                    });
                  }}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2 border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors rounded-sm"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
