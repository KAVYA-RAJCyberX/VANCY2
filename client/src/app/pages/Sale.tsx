import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
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

  const products = allProducts.filter((p: any) => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-4">Archive</h1>
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">{products.length} Pieces</p>
          </div>
          
          <div className="flex items-center gap-6 mt-8 md:mt-0">
            <button className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase hover:text-muted-foreground transition-colors">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
              Filter
            </button>
            <button className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase hover:text-muted-foreground transition-colors">
              Sort By
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 text-center text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Loading Archive...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length === 0 ? (
              <div className="col-span-full py-32 text-center text-xs font-medium tracking-widest uppercase text-muted-foreground">
                The archive is currently empty.
              </div>
            ) : products.map((product: any) => {
              const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <div 
                  key={product._id} 
                  className="group flex flex-col relative"
                  onMouseEnter={() => setHoveredId(product._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <Link to={`/product/${product.slug}`}>
                      <img 
                        src={hoveredId === product._id && product.images.length > 1 ? product.images[1] : product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-90 group-hover:opacity-100"
                      />
                    </Link>
                    
                    <div className="absolute top-4 left-4 bg-foreground text-background text-[10px] font-medium px-3 py-1.5 uppercase tracking-widest z-10">
                      {discountPercentage}% OFF
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
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
                        className="w-full bg-background/90 backdrop-blur text-foreground py-4 text-xs font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                  <Link to={`/product/${product.slug}`} className="mb-1">
                    <h3 className="text-sm font-medium uppercase group-hover:text-muted-foreground transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-foreground">₹{product.price}</p>
                    <p className="text-xs font-medium text-muted-foreground line-through opacity-70">₹{product.originalPrice}</p>
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
