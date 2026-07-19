import { useState } from "react";
import { Star, ChevronDown, Minus, Plus, Heart, MapPin } from "lucide-react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useToastStore } from "../../store/useToastStore";
import { SizeGuideModal } from "../components/SizeGuideModal";

export function ProductDetail({ isLuxuryRoute = false }: { isLuxuryRoute?: boolean }) {
  const { slug } = useParams();
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{status: 'idle'|'checking'|'success'|'error', msg: string}>({status: 'idle', msg: ''});
  
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && product.variants?.length > 0) {
      addToast({ type: 'error', message: 'Please select a size first' });
      return;
    }
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      size: selectedSize || (product.variants?.[0]?.size || "M"),
      color: product.variants?.[0]?.color || "Standard"
    });
    addToast({ type: 'success', message: 'Added to cart' });
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setPincodeResult({status: 'error', msg: 'Enter a valid 6-digit pincode'});
      return;
    }
    setPincodeResult({status: 'checking', msg: 'Checking availability...'});
    setTimeout(() => {
      if (pincode.endsWith('0')) {
        setPincodeResult({status: 'error', msg: 'Delivery not available to this pincode.'});
      } else {
        setPincodeResult({status: 'success', msg: 'Delivery available! 2-4 business days.'});
      }
    }, 800);
  };

  if (isLoading) {
    return <div className="pt-32 pb-24 text-center font-bold tracking-widest uppercase">Loading Product...</div>;
  }

  if (error || !product) {
    return <div className="pt-32 pb-24 text-center font-bold tracking-widest uppercase text-red-500">Product not found</div>;
  }

  const sizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || ["S", "M", "L", "XL", "XXL"]));

  return (
    <div className={`pt-24 pb-24 min-h-screen ${isLuxuryRoute ? 'bg-[#050505] text-[#F5F1E8]' : 'bg-[#ffffff] text-[#0A0A0A]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex text-xs tracking-widest uppercase text-gray-500 mb-8 gap-2">
          <Link to="/" className={`hover:${isLuxuryRoute ? 'text-[#C9A961]' : 'text-black'}`}>Home</Link>
          <span>/</span>
          {isLuxuryRoute ? (
            <Link to="/luxury" className={`hover:text-[#C9A961]`}>Luxury</Link>
          ) : (
            <Link to="/category/polos" className={`hover:text-black`}>Polos</Link>
          )}
          <span>/</span>
          <span className={isLuxuryRoute ? 'text-[#C9A961]' : 'text-black'}>{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          <div className="lg:w-[60%] grid grid-cols-2 gap-4">
            {product.images.map((img: string, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`${idx === 0 ? 'col-span-2' : 'col-span-1'} aspect-[3/4] bg-gray-100 overflow-hidden group rounded-xl`}
              >
                <img 
                  src={img} 
                  alt={`Product ${idx}`} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" 
                />
              </motion.div>
            ))}
          </div>

          <div className="lg:w-[40%] flex flex-col pt-8 sticky top-24 h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold tracking-widest uppercase mb-2 font-['Playfair_Display']">{product.name}</h1>
              {product.isLuxury && product.luxuryTier && (
                <div className="inline-block border border-[#C9A961] text-[#C9A961] text-xs font-bold px-3 py-1 uppercase tracking-[0.2em] mb-4">
                  {product.luxuryTier} TIER
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <p className="text-xl text-[#C9A961] font-bold">₹{product.price}</p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg text-gray-400 line-through decoration-gray-400">₹{product.originalPrice}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-6 text-sm">
                <div className="flex text-[#C9A961]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} />
                  ))}
                </div>
                <span className="text-gray-500 underline cursor-pointer">{product.numReviews || 0} Reviews</span>
              </div>

              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold tracking-widest uppercase">Size</span>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-gray-500 underline uppercase tracking-widest hover:text-[#C9A961]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-3">
                  {(sizes as string[]).map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-3 text-sm font-bold border transition-colors ${
                        selectedSize === size 
                        ? (isLuxuryRoute ? 'border-[#C9A961] bg-[#C9A961] text-black' : 'border-[#0A0A0A] bg-[#0A0A0A] text-white')
                        : (isLuxuryRoute ? 'border-gray-700 text-[#F5F1E8] hover:border-[#C9A961]' : 'border-gray-300 text-[#0A0A0A] hover:border-[#0A0A0A]')
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mb-12">
                <div className="flex items-center border border-gray-200 w-32">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-500 hover:text-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-500 hover:text-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#C9A961] text-[#0A0A0A] text-sm font-bold tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-white active:scale-95 transition-all"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      originalPrice: product.originalPrice
                    });
                  }}
                  className={`w-12 h-12 flex items-center justify-center border transition-all duration-300 ${isLuxuryRoute ? 'border-gray-700 text-gray-400 hover:text-[#C9A961] hover:border-[#C9A961]' : 'border-gray-200 text-gray-500 hover:text-[#C9A961] hover:border-[#C9A961]'}`}
                >
                  <Heart className={`w-5 h-5 transition-colors ${wishlistItems.some(i => i.id === product._id) ? 'text-[#C9A961] fill-[#C9A961]' : ''}`} />
                </button>
              </div>

              {/* Accordions */}
              <div className="border-t border-gray-200">
                <div className="border-b border-gray-200 overflow-hidden">
                  <button 
                    onClick={() => toggleAccordion("details")}
                    className="w-full py-6 flex justify-between items-center text-sm font-bold tracking-widest uppercase"
                  >
                    Details
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'details' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === "details" && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                          <p>{product.fabricDescription}</p>
                          <ul className="mt-4 list-disc pl-5 space-y-2">
                            <li>Premium luxury finish</li>
                            <li>Tailored fit</li>
                            <li>Dry clean recommended</li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-b border-gray-200 overflow-hidden">
                  <button 
                    onClick={() => toggleAccordion("shipping")}
                    className="w-full py-6 flex justify-between items-center text-sm font-bold tracking-widest uppercase"
                  >
                    Shipping & Returns
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === "shipping" && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                          <p className="font-bold mb-2">White-Glove Delivery</p>
                          <p className="mb-4">All orders are shipped via complimentary expedited delivery. Delivery typically takes 2-4 business days.</p>
                          <p className="font-bold mb-2">Returns & Exchanges</p>
                          <p>We accept returns and exchanges within 14 days of delivery. Items must be unworn, unwashed, and in their original condition.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Pincode Checker */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Check Delivery
                </h4>
                <form onSubmit={checkPincode} className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                  />
                  <button type="submit" className="bg-[#0A0A0A] text-white px-6 font-bold text-xs uppercase tracking-widest hover:bg-[#C9A961] active:scale-95 transition-all">
                    Check
                  </button>
                </form>
                {pincodeResult.status !== 'idle' && (
                  <p className={`mt-3 text-sm font-medium ${
                    pincodeResult.status === 'checking' ? 'text-gray-500' : 
                    pincodeResult.status === 'success' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {pincodeResult.msg}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-24 pt-12 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h3 className="text-2xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (product.averageRating || 5) ? 'text-[#C9A961] fill-[#C9A961]' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold">{product.averageRating || 5} out of 5</span>
                <span className="text-sm text-gray-500">({product.numReviews || 0} Reviews)</span>
              </div>
            </div>
            <button className="mt-6 md:mt-0 bg-[#0A0A0A] text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-[#C9A961] transition-colors">
              Write a Review
            </button>
          </div>

          {product.numReviews === 0 ? (
            <div className="text-center py-12 bg-gray-50">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dummy reviews for UI since we don't fetch real ones yet */}
              <div className="bg-gray-50 p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#C9A961] fill-[#C9A961]" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">2 months ago</span>
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-2">Exceptional Quality</h4>
                <p className="text-sm text-gray-600 mb-4">The fit and finish on this piece is incredible. Truly a luxury garment.</p>
                <p className="text-xs font-bold text-gray-400">— Verified Buyer</p>
              </div>
            </div>
          )}
        </div>

        {/* You May Also Like */}
        <div className="mt-24 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-12 text-center">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Dummy cross-sell placeholders */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="group relative">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                  <img src={product.images[0]} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Related" />
                </div>
                <h4 className="text-sm font-bold tracking-widest uppercase mb-2 truncate">Related Item {i}</h4>
                <p className="text-[#C9A961] text-sm">₹{product.price}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showSizeGuide && (
          <SizeGuideModal 
            type={product.sizeChartType || 'polo'} 
            onClose={() => setShowSizeGuide(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sticky Mobile Add To Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex items-center gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex-1 flex flex-col">
          <span className="text-xs font-bold truncate">{product.name}</span>
          <span className="text-[#C9A961] font-bold text-sm">₹{product.price}</span>
        </div>
        <button 
          onClick={handleAddToCart}
          className="bg-[#C9A961] text-[#0A0A0A] px-6 py-3 font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
