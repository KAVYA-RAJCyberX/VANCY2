import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from '@tanstack/react-query';
import { Heart } from "lucide-react";
import api from '../../lib/axios';
import { motion, AnimatePresence } from "motion/react";
import { useWishlistStore } from "../../store/useWishlistStore";

export function Category() {
  const { id } = useParams<{ id: string }>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { addItem: addWishlistItem, isInWishlist } = useWishlistStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  
  const [sort, setSort] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [isSale, setIsSale] = useState<boolean>(false);

  let displayHeading = "Collection";
  let queryCategory = "";
  let isNewArrivalQuery = false;
  let isSaleQuery = isSale;

  if (id === 'polo-shirts') {
    displayHeading = "Timeless polo";
    queryCategory = "polo";
  } else if (id === 'joggers') {
    displayHeading = "Legacy jogger";
    queryCategory = "jogger";
  } else if (id === 'new') {
    displayHeading = "New Arrivals";
    isNewArrivalQuery = true;
  } else if (id === 'sale') {
    displayHeading = "Sale";
    isSaleQuery = true;
  } else if (id && id !== 'all') {
    displayHeading = id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ');
    queryCategory = id;
  }

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', queryCategory, sort, size, isSaleQuery, isNewArrivalQuery, id],
    queryFn: async () => {
      const params: any = {};
      if (queryCategory) params.category = queryCategory;
      if (sort) params.sort = sort;
      if (size) params.size = size;
      if (isSaleQuery) params.isSale = true;
      if (isNewArrivalQuery) params.isNewArrival = true;

      const { data } = await api.get('/products', { params });
      return Array.isArray(data) ? data : (data?.products || []);
    },
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-end border-b border-border pb-8 ${filterOpen || sortOpen ? 'mb-0' : 'mb-24'}`}>
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tighter uppercase mb-2">{displayHeading}</h1>
            <p className="text-muted-foreground font-light">{products.length} pieces</p>
          </div>
          <div className="flex gap-8 mt-8 md:mt-0 text-sm">
            <button 
              onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
              className={`transition-colors uppercase tracking-widest font-medium ${filterOpen ? 'text-accent' : 'hover:text-muted-foreground'}`}
            >
              Filter {size || isSale ? '(Active)' : ''}
            </button>
            <button 
              onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
              className={`transition-colors uppercase tracking-widest font-medium ${sortOpen ? 'text-accent' : 'hover:text-muted-foreground'}`}
            >
              Sort
            </button>
          </div>
        </div>

        {/* Expandable Filter/Sort Panel */}
        <AnimatePresence>
          {(filterOpen || sortOpen) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-16 border-b border-border"
            >
              <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {filterOpen && (
                  <>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Size</h3>
                      <div className="flex gap-4">
                        {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setSize(size === s ? '' : s)}
                            className={`w-10 h-10 border flex items-center justify-center text-xs transition-colors ${size === s ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Availability</h3>
                      <label className="flex items-center gap-3 cursor-pointer group w-max">
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${isSale ? 'border-foreground bg-foreground' : 'border-border group-hover:border-foreground'}`}>
                          {isSale && <span className="w-2 h-2 bg-background"></span>}
                        </div>
                        <span className="text-sm">Sale Items Only</span>
                        <input type="checkbox" className="hidden" checked={isSale} onChange={() => setIsSale(!isSale)} />
                      </label>
                    </div>
                  </>
                )}
                {sortOpen && (
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Featured', value: '' },
                      { label: 'Price: Low to High', value: 'price' },
                      { label: 'Price: High to Low', value: '-price' },
                      { label: 'Newest Arrivals', value: '-createdAt' },
                    ].map(option => (
                      <button 
                        key={option.value}
                        onClick={() => setSort(option.value)}
                        className={`text-left text-sm transition-colors ${sort === option.value ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2 or 3 Column Grid for large cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-6"></div>
                <div className="h-4 bg-muted w-2/3 mb-2"></div>
                <div className="h-4 bg-muted w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
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
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addWishlistItem({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.images[0]
                      });
                    }}
                    className="absolute top-4 right-4 z-10 p-2 text-foreground hover:scale-110 transition-transform md:opacity-0 md:group-hover:opacity-100 opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center bg-background/50 backdrop-blur-md rounded-full sm:bg-transparent sm:backdrop-blur-none sm:rounded-none"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product._id) ? 'fill-foreground text-foreground' : 'text-foreground/70 hover:text-foreground'}`} strokeWidth={isInWishlist(product._id) ? 0 : 1.5} />
                  </button>
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
