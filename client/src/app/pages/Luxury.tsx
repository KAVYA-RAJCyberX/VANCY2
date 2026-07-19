import { useState } from "react";
import { Link } from "react-router";
import { Filter, ChevronDown, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

export function Luxury() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['luxury-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?isLuxury=true&sort=-price');
      return data;
    },
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-[#F5F1E8]">
      {/* Hero Banner */}
      <div className="relative w-full h-[70vh] flex items-center justify-center border-b border-[#C9A961]/20 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          {/* Fallback texture pattern if no image */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#C9A961 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto border border-[#C9A961]/30 p-12 bg-black/40 backdrop-blur-sm">
          <h1 className="text-5xl md:text-7xl font-['Playfair_Display'] font-black tracking-[0.2em] mb-6 text-[#C9A961]">VANCY PRIVÉ</h1>
          <p className="text-lg md:text-xl font-light italic mb-10 max-w-2xl mx-auto leading-relaxed">
            Curated for the discerning few. Crafted in small batches using premium natural fibers, hand-embroidery, and limited runs.
          </p>
          <a href="#collection" className="inline-block text-sm uppercase tracking-widest border-b border-[#C9A961] pb-1 hover:text-[#C9A961] transition-colors">
            Explore the Collection &rarr;
          </a>
        </div>
      </div>

      {/* Editorial Block */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <img src="/images/gray.png" alt="Craftsmanship" className="w-full h-auto aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
          </div>
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl font-['Playfair_Display'] text-[#C9A961] mb-6">The Art of Refinement</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Our Privé collection represents the pinnacle of menswear. Each piece is crafted in small batches by master artisans, using only the finest Italian merino wool, pure silk blends, and Giza 45 Egyptian cotton. 
            </p>
            <p className="text-gray-300 leading-relaxed mb-8">
              We reject mass production in favor of precision. When you wear VANCY Privé, you are wearing a limited edition work of art.
            </p>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div id="collection" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#C9A961]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <h2 className="text-2xl font-['Playfair_Display'] tracking-widest uppercase">The Collection</h2>
          
          <div className="flex items-center gap-4 mt-6 md:mt-0 text-sm">
            <button className="flex items-center gap-2 tracking-wider uppercase border border-[#C9A961]/30 px-4 py-2 hover:bg-[#C9A961] hover:text-black transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 tracking-wider uppercase border border-[#C9A961]/30 px-4 py-2 hover:bg-[#C9A961] hover:text-black transition-colors">
              Sort By: Price (High-Low)
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-[#C9A961] font-bold tracking-widest uppercase">
            Loading Privé...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {products.map((product: any) => (
              <div 
                key={product._id} 
                className="group flex flex-col relative"
                onMouseEnter={() => setHoveredId(product._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#111] mb-6">
                  <Link to={`/luxury/product/${product.slug}`}>
                    <img 
                      src={hoveredId === product._id && product.images.length > 1 ? product.images[1] : product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                  </Link>

                  {/* Luxury Badge */}
                  <div className="absolute top-4 left-4 bg-black/80 border border-[#C9A961] text-[#C9A961] text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] z-10">
                    {product.luxuryTier} TIER
                  </div>
                  
                  {product.limitedEdition && (
                    <div className="absolute bottom-4 left-4 text-white text-xs uppercase tracking-widest z-10 bg-black/60 px-2 py-1">
                      {product.limitedEditionStock} / {product.limitedEdition} Remaining
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                      className="bg-black/50 border border-[#C9A961]/30 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-black"
                    >
                      <svg className={`w-4 h-4 transition-colors ${wishlistItems.some(i => i.id === product._id) ? 'text-[#C9A961] fill-[#C9A961]' : 'text-white hover:text-[#C9A961]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <Link to={`/luxury/product/${product.slug}`} className="text-center group-hover:text-[#C9A961] transition-colors">
                  <h3 className="text-lg font-['Playfair_Display'] tracking-wide mb-2">{product.name}</h3>
                </Link>
                <div className="text-center mb-4">
                  <p className="text-gray-400 font-light tracking-widest">₹{product.price.toLocaleString()}</p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Link to={`/luxury/product/${product.slug}`} className="text-xs uppercase tracking-widest border-b border-gray-600 pb-1 hover:border-[#C9A961] hover:text-[#C9A961] transition-all">
                    View Details
                  </Link>
                  <button 
                    onClick={() => {
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
                    className="text-xs uppercase tracking-widest flex items-center gap-2 hover:text-[#C9A961] transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust/Craft Section */}
      <div className="border-t border-[#C9A961]/20 mt-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-[#C9A961] rounded-full flex items-center justify-center mb-6 text-[#C9A961]">1</div>
              <h4 className="font-['Playfair_Display'] text-lg mb-3">Hand-Finished Details</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Meticulous stitching and hand-attached mother-of-pearl buttons.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-[#C9A961] rounded-full flex items-center justify-center mb-6 text-[#C9A961]">2</div>
              <h4 className="font-['Playfair_Display'] text-lg mb-3">Limited Production</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Capped runs ensure exclusivity. Once they are gone, they are archived.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-[#C9A961] rounded-full flex items-center justify-center mb-6 text-[#C9A961]">3</div>
              <h4 className="font-['Playfair_Display'] text-lg mb-3">Premium Natural Fibers</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Sourced directly from centuries-old mills in Biella, Italy.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-[#C9A961] rounded-full flex items-center justify-center mb-6 text-[#C9A961]">4</div>
              <h4 className="font-['Playfair_Display'] text-lg mb-3">White-Glove Delivery</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Complimentary expedited shipping in our signature hardbox packaging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
