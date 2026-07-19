import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

export function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
  });

  return (
    <div className="flex flex-col w-full font-['Inter'] bg-transparent">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] lg:h-[700px] bg-[#111111] flex items-center mt-[90px]">
        {/* Background texture or gradient if needed */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between relative z-20 h-full">
          
          <div className="flex flex-col items-start justify-center md:w-1/2 pt-10 md:pt-0">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[#ba9a5a] text-5xl md:text-6xl lg:text-7xl font-black font-['Playfair_Display'] leading-[1.1] tracking-wide mb-6"
            >
              VANCY:<br/>UNCOMPROMISING<br/>MENSWEAR LUXURY
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-white/90 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed"
            >
              Discover the finest polo shirts and essentials, crafted with timeless sophistication.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <Link 
                to="/category/polos" 
                className="bg-[#ba9a5a] text-[#111111] px-8 py-4 font-bold text-lg rounded-sm hover:bg-[#cbb07a] transition-colors shadow-lg"
              >
                Shop Men's Polos
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden md:flex w-1/2 h-full relative justify-center items-center"
          >
            <img 
              src="https://images.unsplash.com/photo-1617391753733-8a39d89163d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Blue Polo"
              className="absolute top-10 right-20 w-64 h-80 object-cover object-top rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
            />
             <img 
              src="https://images.unsplash.com/photo-1596755094514-f87e32f85e98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Yellow Polo"
              className="absolute top-32 right-56 w-72 h-[350px] object-cover object-top rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 scale-110"
            />
            <img 
              src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Brown Polo"
              className="absolute top-64 right-10 w-60 h-72 object-cover object-top rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30"
            />
          </motion.div>
        </div>
      </section>

      {/* Sale Banner Section */}
      <section className="w-full bg-[#3B121A] py-12 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-4">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-[#C9A961] text-3xl md:text-5xl font-black font-['Playfair_Display'] tracking-widest uppercase"
          >
            END OF SEASON SALE — UP TO 40% OFF
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg md:text-xl font-medium tracking-wide"
          >
            On select polos & essentials
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <Link 
              to="/category/sale" 
              className="inline-block bg-[#C9A961] text-[#0A0A0A] px-10 py-3 font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
            >
              Shop the Sale
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 bg-transparent">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/category/essentials" className="group relative h-[350px] rounded-xl overflow-hidden shadow-md block">
              <img 
                src="https://images.unsplash.com/photo-1594938298598-70f90bf7e7d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                alt="Velvet & Merino Essentials"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <h2 className="text-[#ffffff] text-2xl lg:text-3xl font-black font-['Playfair_Display'] uppercase tracking-wider leading-snug">
                  VELVET & MERINO<br/>ESSENTIALS
                </h2>
              </div>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/category/artisan" className="group relative h-[350px] rounded-xl overflow-hidden shadow-md block">
              <img 
                src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                alt="Artisan Embroidered Polos"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#111111]/60 group-hover:bg-[#111111]/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <h2 className="text-[#ffffff] text-2xl lg:text-3xl font-black font-['Playfair_Display'] uppercase tracking-wider leading-snug">
                  ARTISAN EMBROIDERED<br/>POLOS
                </h2>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/category/basics" className="group relative h-[350px] rounded-xl overflow-hidden shadow-md block">
              <img 
                src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                alt="Timeless Basic Polos"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <h2 className="text-[#ffffff] text-2xl lg:text-3xl font-black font-['Playfair_Display'] uppercase tracking-wider leading-snug">
                  TIMELESS BASIC<br/>POLOS
                </h2>
              </div>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Luxury Collection Banner */}
      <section className="w-full h-[500px] relative overflow-hidden bg-black mt-12 mb-12 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/black.png" 
            alt="Vancy Privé" 
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center">
          <h2 className="text-[#C9A961] text-4xl md:text-6xl font-black font-['Playfair_Display'] tracking-[0.2em] mb-4">VANCY PRIVÉ</h2>
          <p className="text-gray-300 text-lg md:text-xl font-light italic mb-8">Limited runs. Exquisite craftsmanship. The pinnacle of menswear.</p>
          <Link 
            to="/luxury" 
            className="border border-[#C9A961] text-[#C9A961] px-8 py-3 font-bold text-sm uppercase tracking-widest hover:bg-[#C9A961] hover:text-black transition-colors"
          >
            Explore The Collection
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-transparent pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex items-center justify-center relative">
            <button className="absolute left-0 z-10 w-16 h-16 bg-[#111111] border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-[#ba9a5a] -ml-2 lg:-ml-7 transition-colors">
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-10">
              {/* Featured Products Map */}
              {/* Featured Products Map */}
              {isLoading ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-20 text-center text-gray-500 font-bold tracking-widest uppercase">
                  Loading latest collections...
                </div>
              ) : products.slice(0, 4).map((product: any, i: number) => (
                <motion.div 
                  key={product._id} 
                  className="flex flex-col group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className={`w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 relative flex items-center justify-center bg-gray-100`}>
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-90 mix-blend-multiply" />
                    
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-3">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => toggleWishlist({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.images[0],
                            originalPrice: product.originalPrice
                          })}
                          className="bg-white p-2 rounded-full shadow-md transition-colors"
                        >
                          <svg className={`w-4 h-4 ${wishlistItems.some(i => i.id === product._id) ? 'text-red-500 fill-red-500' : 'text-gray-700 hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <Link to={`/product/${product.slug}`} className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-black transition-colors block">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                      </div>
                    </div>

                    {product.isNewArrival && (
                      <div className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                        New Arrival
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/product/${product.slug}`} className="hover:underline">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 mb-2 truncate">{product.fabricDescription}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-[#ba9a5a]">
                      {[...Array(5)].map((_, idx) => (
                        <svg key={idx} className={`w-3 h-3 ${idx < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
                  </div>

                  <p className="text-[#C9A961] font-bold mb-4">₹{product.price}</p>
                  <button 
                    onClick={() => addItem({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      quantity: 1,
                      size: product.variants?.[0]?.size || 'M',
                      color: product.variants?.[0]?.color || 'Standard'
                    })}
                    className="w-full bg-[#C9A961] text-[#0A0A0A] py-3 rounded-md font-bold text-sm uppercase tracking-wide hover:bg-white border hover:border-[#C9A961] transition-colors shadow-sm"
                  >
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>

            <button className="absolute right-0 z-10 w-16 h-16 bg-[#111111] border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-[#ba9a5a] -mr-2 lg:-mr-7 transition-colors">
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
          
        </div>
      </section>
    </div>
  );
}
