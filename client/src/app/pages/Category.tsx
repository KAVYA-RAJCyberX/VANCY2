import { useState } from "react";
import { Link } from "react-router";
import { Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

export function Category() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#ffffff]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mt-2 mb-8">
          <Link to="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">Polos</span>
        </div>

        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-gray-100 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase mb-2">Polos</h1>
            <p className="text-gray-500 text-sm">{products.length} Products</p>
          </div>
          
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <button className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase border border-gray-200 px-4 py-2 hover:bg-black hover:text-white active:scale-95 transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase border border-gray-200 px-4 py-2 hover:bg-black hover:text-white active:scale-95 transition-all">
              Sort By
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product: any) => (
              <div 
                key={product._id} 
                className="group flex flex-col relative"
                onMouseEnter={() => setHoveredId(product._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-xl">
                  <Link to={`/product/${product.slug}`}>
                    <img 
                      src={hoveredId === product._id && product.images.length > 1 ? product.images[1] : product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                    />
                  </Link>

                  {/* Sale Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-[#d4183d] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm z-10">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        const el = e.currentTarget;
                        el.style.transform = 'scale(1.2)';
                        setTimeout(() => el.style.transform = 'scale(1)', 300);
                        toggleWishlist({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.images[0],
                          originalPrice: product.originalPrice
                        });
                      }}
                      className="bg-white p-2 rounded-full shadow-md transition-all duration-300"
                    >
                      <svg className={`w-4 h-4 transition-colors ${wishlistItems.some(i => i.id === product._id) ? 'text-[#C9A961] fill-[#C9A961]' : 'text-gray-700 hover:text-[#C9A961]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Add overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.images[0],
                          quantity: 1,
                          size: product.variants?.[0]?.size || 'M',
                          color: product.variants?.[0]?.color || 'Standard'
                        });
                      }}
                      className="w-full bg-[#111111] text-white py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#111111] transition-colors"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                <Link to={`/product/${product.slug}`} className="hover:underline">
                  <h3 className="text-sm font-bold text-[#111111] mb-1">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2">
                  <p className="text-[#C9A961] font-bold">₹{product.price}</p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-gray-400 text-xs line-through decoration-gray-400">₹{product.originalPrice}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
