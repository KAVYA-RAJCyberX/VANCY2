import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { Button } from "../components/ui/button";
import { Filter } from "lucide-react";

export function Category() {
  const { id } = useParams<{ id: string }>();

  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const FilterContent = () => (
    <div className="flex flex-col md:flex-row gap-12 w-full">
      <div className="flex-1">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Size</h3>
        <div className="flex flex-wrap gap-4">
          {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
            <button 
              key={s} 
              onClick={() => setSize(size === s ? '' : s)}
              className={`min-w-[44px] min-h-[44px] border flex items-center justify-center text-xs transition-colors ${size === s ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer group w-max">
          <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${isSale ? 'border-foreground bg-foreground' : 'border-border group-hover:border-foreground'}`}>
            {isSale && <span className="w-2 h-2 bg-background"></span>}
          </div>
          <span className="text-sm">Sale Items Only</span>
          <input type="checkbox" className="hidden" checked={isSale} onChange={() => setIsSale(!isSale)} />
        </label>
      </div>
    </div>
  );

  const SortContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 md:hidden">Sort By</h3>
      {[
        { label: 'Featured', value: '' },
        { label: 'Price: Low to High', value: 'price' },
        { label: 'Price: High to Low', value: '-price' },
        { label: 'Newest Arrivals', value: '-createdAt' },
      ].map(option => (
        <button 
          key={option.value}
          onClick={() => { setSort(option.value); setMobileFilterOpen(false); }}
          className={`text-left text-sm transition-colors ${sort === option.value ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4 md:pb-8 ${filterOpen || sortOpen ? 'mb-0' : 'mb-8 md:mb-16'} sticky top-[72px] md:top-[88px] z-40 bg-background pt-4 -mx-6 px-6 lg:-mx-12 lg:px-12`}>
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tighter uppercase mb-1 md:mb-2">{displayHeading}</h1>
            <p className="text-muted-foreground font-light text-sm">{products.length} pieces</p>
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden md:flex gap-8 mt-4 md:mt-0 text-sm">
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

          {/* Mobile Filters Trigger */}
          <div className="md:hidden w-full mt-2">
            <button 
              onClick={() => setMobileFilterOpen(true)}
              className="w-full flex items-center justify-between border border-border px-4 py-3 text-xs uppercase tracking-widest font-medium"
            >
              <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> Filter & Sort</span>
              {size || isSale || sort ? <span className="text-accent">• Active</span> : <span>+</span>}
            </button>
          </div>
        </div>

        {/* Desktop Expandable Filter/Sort Panel */}
        <div className="hidden md:block">
          <AnimatePresence>
            {(filterOpen || sortOpen) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-16 border-b border-border"
              >
                <div className="py-8">
                  {filterOpen && <FilterContent />}
                  {sortOpen && <SortContent />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <DrawerContent className="px-4 h-[85vh]">
            <DrawerHeader className="text-left pt-6 pb-2 border-b border-border">
              <DrawerTitle className="text-lg font-serif uppercase tracking-wider">Filter & Sort</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-10 mt-4">
              <SortContent />
              <div className="h-px bg-border w-full"></div>
              <FilterContent />
            </div>
            <DrawerFooter className="pb-8 pt-4 border-t border-border">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setSize(''); setIsSale(false); setSort(''); }}
                  className="flex-1 uppercase tracking-widest"
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 uppercase tracking-widest"
                >
                  Apply
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-10 md:gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-muted mb-2 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-muted w-2/3 mb-1 md:mb-2"></div>
                <div className="h-2 md:h-3 bg-muted w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-10 md:gap-y-16">
            {products.map((product: any, idx: number) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                idx={idx} 
                priorityLoad={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
