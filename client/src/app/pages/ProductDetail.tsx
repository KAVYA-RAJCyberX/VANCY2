import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, ChevronDown, Heart, ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "../components/ui/carousel";

const COLOR_MAP: Record<string, string> = {
  black: '#111111',
  white: '#F9F9F9',
  beige: '#E1D7C6',
  cream: '#F5F1E8',
  grey: '#8A8A8A',
  navy: '#1A2942',
  olive: '#2C3527',
  brown: '#4A3B32',
  burgundy: '#4A1C1C',
  'sky blue': '#AEC6CF',
  standard: '#0A0A0A'
};

const getColorHex = (colorName: string) => {
  return COLOR_MAP[colorName.toLowerCase()] || '#0A0A0A';
};

export function ProductDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToast = useToastStore((state) => state.addToast);
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
    enabled: !!slug
  });

  const [selectedSize, setSelectedSize] = useState("");
  const [openAccordion, setOpenAccordion] = useState("details");
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  
  // Mobile Carousel State
  const [apiCarousel, setApiCarousel] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [count, setCount] = useState(0);
  
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlistItem, isInWishlist } = useWishlistStore();

  const availableColors = useMemo(() => {
    if (!product?.variants) return ["Standard"];
    return Array.from(new Set(product.variants.map((v: any) => v.color)));
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.variants) return ["S", "M", "L", "XL", "XXL"];
    return Array.from(new Set(product.variants.map((v: any) => v.size)));
  }, [product]);

  const urlColor = searchParams.get('color');
  const selectedColor = urlColor && availableColors.includes(urlColor) ? urlColor : availableColors[0];

  useEffect(() => {
    if (product && !urlColor && availableColors.length > 0) {
      setSearchParams({ color: availableColors[0] }, { replace: true });
    }
  }, [product, urlColor, availableColors, setSearchParams]);

  const handleColorSelect = (color: string) => {
    setSearchParams({ color }, { replace: true });
  };

  const getVariantStock = (color: string, size: string) => {
    if (!product?.variants) return 10;
    const variant = product.variants.find((v: any) => v.color === color && v.size === size);
    return variant ? variant.stock : 0;
  };

  const galleryImages = useMemo(() => {
    if (!product?.images) return [];
    if (availableColors.length <= 1) return product.images;
    
    const colorIndex = availableColors.indexOf(selectedColor);
    const imagesPerColor = Math.max(1, Math.floor(product.images.length / availableColors.length));
    const startIdx = (colorIndex * imagesPerColor) % product.images.length;
    const endIdx = startIdx + imagesPerColor;
    
    const slice = product.images.slice(startIdx, endIdx);
    if (slice.length === 0) return [product.images[0]];
    
    return slice;
  }, [product, selectedColor, availableColors]);

  // Update carousel indicator
  useEffect(() => {
    if (!apiCarousel) {
      return;
    }
    setCount(apiCarousel.scrollSnapList().length);
    setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);

    apiCarousel.on("select", () => {
      setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);
    });
  }, [apiCarousel, galleryImages]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && sizes.length > 0) {
      addToast({ type: 'error', message: 'Please select a size first' });
      return;
    }
    
    const stock = getVariantStock(selectedColor, selectedSize);
    if (stock <= 0) {
      addToast({ type: 'error', message: 'Selected combination is out of stock' });
      return;
    }

    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: galleryImages[0] || product.images[0],
      quantity: 1,
      size: selectedSize || "M",
      color: selectedColor
    });
    addToast({ type: 'success', message: 'Added to bag' });
  };

  if (isLoading) {
    return <div className="pt-32 pb-24 text-center text-xs font-medium tracking-widest uppercase">Loading Archive...</div>;
  }

  if (error || !product) {
    return <div className="pt-32 pb-24 text-center text-xs font-medium tracking-widest uppercase">Archive piece not found</div>;
  }

  const selectedVariantStock = selectedSize ? getVariantStock(selectedColor, selectedSize) : null;
  const inWishlist = isInWishlist(product._id);
  const isOOS = selectedVariantStock !== null && selectedVariantStock <= 0;

  return (
    <div className="pt-20 md:pt-24 pb-32 md:pb-32 min-h-screen bg-background text-foreground relative">
      <div className="container mx-auto px-0 md:px-6 lg:px-12">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
          
          {/* Gallery - Left */}
          <div className="w-full lg:w-3/5 lg:mx-0 relative">
            
            <button 
              onClick={() => addWishlistItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: galleryImages[0] || product.images[0]
              })}
              className={`absolute top-4 right-4 md:hidden z-10 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full transition-transform`}
              aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 transition-colors ${inWishlist ? 'fill-foreground text-foreground' : 'text-foreground'}`} strokeWidth={inWishlist ? 0 : 1.5} />
            </button>

            {/* Mobile Swipeable Carousel */}
            <div className="block lg:hidden relative">
              <Carousel setApi={setApiCarousel} className="w-full">
                <CarouselContent>
                  {galleryImages.map((img: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="w-full aspect-[4/5] bg-muted overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`${product.name} in ${selectedColor}`} 
                          className="w-full h-full object-cover mix-blend-multiply opacity-90" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {count > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase shadow-sm">
                  {currentSlide} / {count}
                </div>
              )}
            </div>

            {/* Desktop Stacked Gallery */}
            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-4 w-full"
                >
                  {galleryImages.map((img: string, idx: number) => (
                    <div 
                      key={`${selectedColor}-${idx}`}
                      className="w-full aspect-[4/5] bg-muted overflow-hidden flex-shrink-0"
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} in ${selectedColor}`} 
                        className="w-full h-full object-cover mix-blend-multiply opacity-90" 
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Info - Right (Sticky) */}
          <div className="w-full lg:w-2/5 px-6 md:px-0">
            <div className="sticky top-32 flex flex-col h-fit">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Link 
                  to="/category/all" 
                  className="hidden md:flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Shop
                </Link>

                <h1 className="text-3xl md:text-5xl font-serif tracking-tighter uppercase mb-2 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-8">
                  <p className="text-lg font-medium">₹{product.price}</p>
                  <div className="flex text-accent">
                    {/* Mock Stars */}
                    <span>★</span><span>★</span><span>★</span><span>★</span><span className="opacity-50">★</span>
                    <span className="text-foreground/50 ml-2 text-sm">(4.8)</span>
                  </div>
                </div>

                {/* Color Selector */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4 h-6">
                    <span className="text-sm font-medium tracking-widest uppercase">Color</span>
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={hoveredColor || selectedColor}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs font-medium tracking-widest uppercase text-muted-foreground"
                      >
                        {hoveredColor || selectedColor}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    {availableColors.map((color: string) => {
                      const isSelected = selectedColor === color;
                      const stockInSelectedSize = selectedSize ? getVariantStock(color, selectedSize) : 10;
                      const isOutOfStock = stockInSelectedSize <= 0;
                      const hex = getColorHex(color);
                      
                      return (
                        <div key={color} className="relative flex items-center justify-center min-w-[44px] min-h-[44px]">
                          <button
                            onClick={() => handleColorSelect(color)}
                            onMouseEnter={() => setHoveredColor(color)}
                            onMouseLeave={() => setHoveredColor(null)}
                            className="relative flex items-center justify-center w-8 h-8 rounded-full outline-none focus:outline-none"
                            aria-label={`Select ${color} color`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selected-color-ring"
                                className="absolute inset-0 rounded-full border border-foreground"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ padding: '2px' }}
                              />
                            )}
                            <motion.div 
                              className={`w-6 h-6 rounded-full relative overflow-hidden transition-transform duration-300 ${isSelected ? 'scale-90' : 'hover:scale-110'}`}
                              style={{ 
                                backgroundColor: hex,
                                border: hex.toLowerCase() === '#f9f9f9' || hex.toLowerCase() === '#ffffff' ? '1px solid #E5E5E5' : 'none',
                                opacity: isOutOfStock ? 0.3 : 1
                              }}
                            >
                              {isOutOfStock && (
                                <div className="absolute inset-0 w-full h-full" style={{
                                  background: 'linear-gradient(to top right, transparent calc(50% - 1px), #0A0A0A, transparent calc(50% + 1px))'
                                }} />
                              )}
                            </motion.div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium tracking-widest uppercase flex items-center gap-4">
                      Size
                      {selectedVariantStock !== null && (
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={selectedVariantStock}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-[10px] ${selectedVariantStock <= 0 ? 'text-red-500' : selectedVariantStock < 5 ? 'text-orange-500' : 'text-muted-foreground'}`}
                          >
                            {selectedVariantStock <= 0 ? 'Sold Out' : selectedVariantStock < 5 ? `Only ${selectedVariantStock} Left` : 'In Stock'}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </span>
                    <button className="text-xs tracking-widest uppercase underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(sizes as string[]).map(size => {
                      const sizeStock = getVariantStock(selectedColor, size);
                      const isOos = sizeStock <= 0;
                      return (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-full text-sm font-medium tracking-wider transition-all duration-300 border flex items-center justify-center ${
                            selectedSize === size 
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-transparent text-foreground hover:border-foreground/50'
                          } ${isOos && selectedSize !== size ? 'opacity-30' : ''}`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop Add to Bag (Hidden on mobile sticky) */}
                <div className="hidden md:flex mb-16 flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOOS}
                    className={`flex-1 min-h-[56px] py-4 w-full text-sm font-medium tracking-widest uppercase transition-colors border bg-foreground text-background ${
                      isOOS ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:border-accent'
                    }`}
                  >
                    {isOOS ? 'Sold Out' : 'Add to Bag'}
                  </button>
                  <button 
                    onClick={() => addWishlistItem({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: galleryImages[0] || product.images[0]
                    })}
                    className={`min-h-[56px] min-w-[64px] flex items-center justify-center border transition-all duration-300 ${inWishlist ? 'border-red-500 bg-red-50' : 'border-border hover:border-foreground text-foreground'}`}
                    aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`w-5 h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground'}`} strokeWidth={inWishlist ? 0 : 1.5} />
                  </button>
                </div>

                {/* Details Accordion */}
                <div className="border-t border-border mt-8 md:mt-0">
                  <div className="border-b border-border overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion("details")}
                      className="w-full py-6 flex justify-between items-center text-sm font-medium tracking-widest uppercase hover:text-muted-foreground transition-colors"
                    >
                      Description
                      <Plus className={`w-4 h-4 transition-transform duration-500 ${openAccordion === 'details' ? 'rotate-45' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openAccordion === "details" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="pb-8 text-sm text-muted-foreground leading-relaxed font-light">
                            <p>{product.description || product.fabricDescription}</p>
                            <ul className="mt-4 space-y-2">
                              <li>• Premium luxury finish</li>
                              <li>• Tailored editorial fit</li>
                              <li>• Dry clean recommended</li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-b border-border overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion("shipping")}
                      className="w-full py-6 flex justify-between items-center text-sm font-medium tracking-widest uppercase hover:text-muted-foreground transition-colors"
                    >
                      Shipping & Returns
                      <Plus className={`w-4 h-4 transition-transform duration-500 ${openAccordion === 'shipping' ? 'rotate-45' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openAccordion === "shipping" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="pb-8 text-sm text-muted-foreground leading-relaxed font-light">
                            <p className="font-medium text-foreground mb-2">White-Glove Delivery</p>
                            <p className="mb-4">All orders are shipped via complimentary expedited delivery. Delivery typically takes 2-4 business days.</p>
                            <p className="font-medium text-foreground mb-2">Returns & Exchanges</p>
                            <p>We accept returns and exchanges within 14 days of delivery. Items must be unworn and unwashed.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t border-border z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleAddToCart}
          disabled={isOOS}
          className={`flex-1 min-h-[50px] text-xs font-medium tracking-widest uppercase transition-colors border bg-foreground text-background ${
            isOOS ? 'opacity-50 cursor-not-allowed' : 'active:bg-accent active:border-accent'
          }`}
        >
          {isOOS ? 'Sold Out' : 'Add to Bag'}
        </button>
        <button 
          onClick={() => {
            // Check if size selected, if not open a drawer or toast
            if (!selectedSize) {
              addToast({ type: 'error', message: 'Please select a size first' });
              window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll back to size selector roughly
              return;
            }
            // Proceed to checkout direct logic
            handleAddToCart();
            if (selectedSize && !isOOS) {
              // Usually we'd navigate to checkout or cart
            }
          }}
          disabled={isOOS}
          className={`flex-1 min-h-[50px] text-xs font-medium tracking-widest uppercase transition-colors border border-border bg-background text-foreground ${
            isOOS ? 'opacity-50 cursor-not-allowed' : 'active:bg-muted'
          }`}
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
