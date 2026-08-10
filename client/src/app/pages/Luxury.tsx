import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useCartStore } from "../../store/useCartStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Luxury() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['luxury-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?isLuxury=true&sort=-price');
      return Array.isArray(data) ? data : (data?.products || []);
    },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".luxury-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-foreground text-background selection:bg-background selection:text-foreground">
      {/* Hero Banner */}
      <div className="container mx-auto px-6 lg:px-12 mb-32">
        <h1 className="luxury-title text-[clamp(4rem,10vw,12rem)] leading-[0.85] font-medium tracking-tighter uppercase mb-12">
          Vancy<br/>Privé
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <p className="text-lg md:text-2xl font-light max-w-2xl leading-relaxed opacity-80">
            Curated for the discerning few. Crafted in small batches using premium natural fibers and uncompromising attention to detail.
          </p>
          <a href="#collection" className="text-xs font-medium tracking-widest uppercase border-b border-background pb-1 hover:opacity-50 transition-opacity">
            Explore Privé
          </a>
        </div>
      </div>

      <div className="w-full aspect-[21/9] bg-muted overflow-hidden mb-32">
        <img src="https://images.unsplash.com/photo-1596755094514-f87e32f85e98?q=80&w=2500&auto=format&fit=crop" alt="Vancy Prive" className="w-full h-full object-cover mix-blend-multiply opacity-80 grayscale" />
      </div>

      {/* Collection Grid */}
      <div id="collection" className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-background/20 pb-8 mb-16">
          <h2 className="text-2xl font-medium tracking-tighter uppercase">The Collection</h2>
          <span className="text-xs font-medium tracking-widest uppercase opacity-50">{products.length} Pieces</span>
        </div>

        {isLoading ? (
          <div className="py-32 text-center text-xs font-medium tracking-widest uppercase opacity-50">
            Loading Privé Archive...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
            {products.map((product: any) => (
              <div 
                key={product._id} 
                className="group flex flex-col relative"
                onMouseEnter={() => setHoveredId(product._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-background/5 mb-6 relative">
                  <Link to={`/luxury/product/${product.slug}`}>
                    <img 
                      src={hoveredId === product._id && product.images.length > 1 ? product.images[1] : product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                    />
                  </Link>

                  <div className="absolute top-4 left-4 bg-background text-foreground text-[10px] font-medium px-3 py-1.5 uppercase tracking-widest z-10">
                    Tier {product.luxuryTier || '1'}
                  </div>
                  
                  {product.limitedEdition && (
                    <div className="absolute bottom-4 left-4 text-background text-[10px] font-medium uppercase tracking-widest z-10 bg-foreground/80 px-3 py-1.5 backdrop-blur-md">
                      {product.limitedEditionStock} / {product.limitedEdition} Remaining
                    </div>
                  )}
                </div>
                
                <Link to={`/luxury/product/${product.slug}`} className="flex justify-between items-start mb-2 group-hover:opacity-70 transition-opacity">
                  <h3 className="text-sm font-medium uppercase">{product.name}</h3>
                  <span className="text-sm font-medium">₹{product.price.toLocaleString()}</span>
                </Link>
                
                <div className="flex justify-between items-center mt-4">
                  <Link to={`/luxury/product/${product.slug}`} className="text-xs font-medium uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
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
                    className="text-xs font-medium uppercase tracking-widest border-b border-background pb-0.5 hover:opacity-50 transition-opacity"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
