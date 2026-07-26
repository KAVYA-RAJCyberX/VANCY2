import { Link } from "react-router";
import { X, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";

export function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      size: 'M',
      color: 'Standard'
    });
    removeItem(item.id);
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-16 border-b border-border pb-8">Curated Selection</h1>

        {items.length === 0 ? (
          <div className="py-32 flex flex-col items-start">
            <img src="/images/leaf-logo.png" alt="Vancy Leaf" className="w-16 h-16 object-contain mb-8 opacity-80" />
            <p className="text-2xl font-light mb-8">Your selection is currently empty.</p>
            <Link 
              to="/category/all"
              className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all"
            >
              Discover Essentials
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <div key={item.id} className="group flex flex-col relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                  <Link to={`/product/${item.id}`}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-90 group-hover:opacity-100"
                    />
                  </Link>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur rounded-full text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full flex items-center justify-center gap-2 bg-background/90 backdrop-blur text-foreground py-4 text-xs font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                      Move to Bag
                    </button>
                  </div>
                </div>
                
                <Link to={`/product/${item.id}`} className="mb-1">
                  <h3 className="text-sm font-medium uppercase group-hover:text-muted-foreground transition-colors">{item.name}</h3>
                </Link>
                <p className="text-sm font-medium text-foreground">₹{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
