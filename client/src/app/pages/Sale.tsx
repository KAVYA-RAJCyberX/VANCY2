import { useState } from "react";
import { Link } from "react-router";
import { Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useCartStore } from "../../store/useCartStore";

export function Sale() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
  });

  // Filter products to only those with an originalPrice (which implies they are on sale)
  const products = allProducts.filter((p: any) => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#F5F1E8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-gray-300 mb-8">
          <div>
            <h1 className="text-3xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-2 text-[#3B121A]">Sale</h1>
            <p className="text-gray-600 text-sm">{products.length} Products</p>
          </div>
          
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <button className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase border-2 border-[#0A0A0A] px-4 py-2 hover:bg-[#0A0A0A] hover:text-white transition-colors rounded-sm">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase border-2 border-[#0A0A0A] px-4 py-2 hover:bg-[#0A0A0A] hover:text-white transition-colors rounded-sm">
              Sort By
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 font-bold tracking-widest uppercase">
            Loading sale items...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.length === 0 ? (
              <div className="col-span-full py-10 text-center text-gray-500 font-bold uppercase">
                No items currently on sale. Check back later!
              </div>
            ) : products.map((product: any) => {
              const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <div 
                  key={product._id} 
                  className="group flex flex-col relative bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  onMouseEnter={() => setHoveredId(product._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-md">
                    <Link to={`/product/${product.slug}`}>
                      <img 
                        src={hoveredId === product._id && product.images.length > 1 ? product.images[1] : product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                      />
                    </Link>
                    
                    {/* Sale Badge */}
                    <div className="absolute top-2 left-2 bg-[#d4183d] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm z-10">
                      {discountPercentage}% OFF
                    </div>

                    {/* Quick Add overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
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
                        className="w-full bg-[#0A0A0A] text-white py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#C9A961] transition-colors rounded-sm shadow-lg"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                  <Link to={`/product/${product.slug}`} className="hover:underline mt-2">
                    <h3 className="text-sm font-bold text-[#0A0A0A] mb-1 line-clamp-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[#d4183d] font-bold text-lg">₹{product.price}</p>
                    <p className="text-gray-400 text-sm line-through decoration-gray-400">₹{product.originalPrice}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
