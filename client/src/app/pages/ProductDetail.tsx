import { useState } from "react";
import { ChevronDown, Plus, Minus, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { Heart } from "lucide-react";

export function ProductDetail({ isLuxuryRoute = false }: { isLuxuryRoute?: boolean }) {
  const { slug } = useParams();
  
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
  
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && product.variants?.length > 0) {
      alert("Please select a size first");
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
        
        {/* Breadcrumbs */}
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
          
          {/* Split Screen Image Gallery (Left) */}
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

          {/* Product Info (Right) */}
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
              {product.limitedEdition && (
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                  Limited Edition — {product.limitedEditionStock} of {product.limitedEdition} Available
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <p className="text-xl text-[#C9A961] font-bold">₹{product.price}</p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg text-gray-400 line-through decoration-gray-400">₹{product.originalPrice}</p>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="bg-[#d4183d] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ml-2">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-8 text-sm">
                <div className="flex text-[#C9A961]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} />
                  ))}
                </div>
                <span className="text-gray-500 underline cursor-pointer">{product.numReviews || 0} Reviews</span>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold tracking-widest uppercase">Size</span>
                  <button className="text-xs text-gray-500 underline uppercase tracking-widest">Size Guide</button>
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

              {/* Actions */}
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
                  className="flex-1 bg-[#C9A961] text-[#0A0A0A] text-sm font-bold tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => toggleWishlist({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    originalPrice: product.originalPrice
                  })}
                  className={`w-12 h-12 flex items-center justify-center border transition-colors ${isLuxuryRoute ? 'border-gray-700 text-gray-400 hover:text-[#C9A961] hover:border-[#C9A961]' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${wishlistItems.some(i => i.id === product._id) ? (isLuxuryRoute ? 'text-[#C9A961] fill-[#C9A961]' : 'text-red-500 fill-red-500') : ''}`} />
                </button>
              </div>

              {/* Accordions */}
              <div className="border-t border-gray-200">
                {/* Details */}
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

                {/* Shipping */}
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
                          <p>Free standard shipping on all orders over ₹2000. Delivery within 3-5 business days. Returns accepted within 14 days of delivery. The item must be unworn and in its original condition with tags attached.</p>
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
  );
}
