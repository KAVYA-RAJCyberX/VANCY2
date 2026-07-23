import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { motion } from "motion/react";

export function Category() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end border-b border-border pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tighter uppercase mb-2">Collection</h1>
            <p className="text-muted-foreground font-light">{products.length} pieces</p>
          </div>
          <div className="flex gap-8 mt-8 md:mt-0 text-sm">
            <button className="hover:text-muted-foreground transition-colors uppercase tracking-widest font-medium">Filter</button>
            <button className="hover:text-muted-foreground transition-colors uppercase tracking-widest font-medium">Sort</button>
          </div>
        </div>

        {/* 2 or 3 Column Grid for large cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-6"></div>
                <div className="h-4 bg-muted w-2/3 mb-2"></div>
                <div className="h-4 bg-muted w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {products.map((product: any, idx: number) => (
              <Link 
                key={product._id}
                to={`/product/${product.slug}`} 
                className="group flex flex-col relative"
                onMouseEnter={() => setHoveredId(product._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-6">
                  <img 
                    src={product.images[0]}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-all duration-1000 ease-out ${hoveredId === product._id && product.images.length > 1 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                  />
                  {product.images.length > 1 && (
                    <img 
                      src={product.images[1]}
                      alt={`${product.name} Alternate`}
                      className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-all duration-1000 ease-out ${hoveredId === product._id ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                    />
                  )}
                </div>
                
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium tracking-wide group-hover:translate-x-1 transition-transform duration-300 ease-out">{product.name}</h3>
                  <p className="text-sm font-medium tracking-wide">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
