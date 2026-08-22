import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, ChevronDown, Heart, ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";
import { useWishlistStore } from "../../store/useWishlistStore";

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
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState("details");
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlistItem, isInWishlist } = useWishlistStore();

  // Derive unique colors and sizes from variants
  const availableColors = useMemo(() => {
    if (!product?.variants) return ["Standard"];
    return Array.from(new Set(product.variants.map((v: any) => v.color)));
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.variants) return ["S", "M", "L", "XL", "XXL"];
    return Array.from(new Set(product.variants.map((v: any) => v.size)));
  }, [product]);

  // Sync color with URL
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

  // Check stock for a specific size + color combination
  const getVariantStock = (color: string, size: string) => {
    if (!product?.variants) return 10; // default if no variants array
    const variant = product.variants.find((v: any) => v.color === color && v.size === size);
    return variant ? variant.stock : 0;
  };

  // Mock splitting images for colors
  const galleryImages = useMemo(() => {
    if (!product?.images) return [];
    
    // If only one color, show all images
    if (availableColors.length <= 1) return product.images;
    
    // Otherwise, slice the array based on the color's index to mock color-specific images
    const colorIndex = availableColors.indexOf(selectedColor);
    
    // Give each color at least 1 image, wrapping around if necessary
    const imagesPerColor = Math.max(1, Math.floor(product.images.length / availableColors.length));
    const startIdx = (colorIndex * imagesPerColor) % product.images.length;
    const endIdx = startIdx + imagesPerColor;
    
    // If we only have a few images, just return the specific slice or wrap around
    const slice = product.images.slice(startIdx, endIdx);
    
    // Fallback: if we ran out of images (e.g. 1 image total, 3 colors), just return the first image
    if (slice.length === 0) return [product.images[0]];
    
    return slice;
  }, [product, selectedColor, availableColors]);

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
      quantity: quantity,
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

  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          
          {/* Gallery - Left */}
          <div className="lg:w-3/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedColor} // Triggers unmount/mount on color change
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:grid lg:grid-cols-1 gap-4 w-full"
              >
                {galleryImages.map((img: string, idx: number) => (
                  <div 
                    key={`${selectedColor}-${idx}`}
                    className="w-full aspect-[3/4] bg-muted overflow-hidden flex-shrink-0"
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

          {/* Info - Right (Sticky) */}
          <div className="lg:w-2/5">
            <div className="sticky top-32 flex flex-col h-fit">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Link 
                  to="/category/all" 
                  className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Shop
                </Link>
                <nav className="flex text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8 gap-2">
                  <Link to="/" className="hover:text-foreground transition-colors">Archive</Link>
                  <span>—</span>
                  <Link to="/category/all" className="hover:text-foreground transition-colors">Collection</Link>
                </nav>

                <h1 className="text-4xl md:text-5xl font-medium tracking-tighter uppercase mb-4 leading-tight">{product.name}</h1>
                <p className="text-lg font-medium mb-10">₹{product.price}</p>

                {/* Color Selector */}
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6 h-6">
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
                            {/* Outer Ring for Selected State */}
                            {isSelected && (
                              <motion.div
                                layoutId="selected-color-ring"
                                className="absolute inset-0 rounded-full border border-foreground"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ padding: '2px' }}
                              />
                            )}
                            
                            {/* Swatch Circle */}
                            <motion.div 
                              className={`w-6 h-6 rounded-full relative overflow-hidden transition-transform duration-300 ${isSelected ? 'scale-90' : 'hover:scale-110'}`}
                              style={{ 
                                backgroundColor: hex,
                                border: hex.toLowerCase() === '#f9f9f9' || hex.toLowerCase() === '#ffffff' ? '1px solid #E5E5E5' : 'none',
                                opacity: isOutOfStock ? 0.3 : 1
                              }}
                            >
                              {/* Strike-through for out of stock */}
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
                  <div className="flex justify-between items-center mb-6">
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
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(sizes as string[]).map(size => {
                      const sizeStock = getVariantStock(selectedColor, size);
                      const isOos = sizeStock <= 0;
                      return (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[4rem] min-h-[44px] px-4 py-3 text-sm font-medium tracking-wider transition-all duration-300 border flex items-center justify-center ${
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

                {/* Add to Bag and Wishlist */}
                <div className="mb-16 flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={selectedVariantStock !== null && selectedVariantStock <= 0}
                    className={`flex-1 min-h-[44px] py-5 text-sm font-medium tracking-widest uppercase transition-colors ${
                      selectedVariantStock !== null && selectedVariantStock <= 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {selectedVariantStock !== null && selectedVariantStock <= 0 ? 'Sold Out' : 'Add to Bag'}
                  </button>
                  <button 
                    onClick={() => addWishlistItem({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: galleryImages[0] || product.images[0]
                    })}
                    className={`min-w-[64px] min-h-[44px] flex items-center justify-center border transition-all duration-300 ${inWishlist ? 'border-red-500 bg-red-50' : 'border-border hover:border-foreground text-foreground'}`}
                    aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`w-5 h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground'}`} strokeWidth={inWishlist ? 0 : 1.5} />
                  </button>
                </div>

                {/* Details Accordion */}
                <div className="border-t border-border">
                  {/* Description */}
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

                  {/* Shipping */}
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
    </div>
  );
}
