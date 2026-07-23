import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.fromTo(heroImgRef.current, 
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power4.out" }
      );

      gsap.fromTo(".hero-text",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: 0.5 }
      );

      // Scroll Animations
      if (collectionRef.current) {
        gsap.fromTo(".collection-item",
          { y: 100, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out",
            scrollTrigger: {
              trigger: collectionRef.current,
              start: "top 80%",
            }
          }
        );
      }

      if (lookbookRef.current) {
        gsap.fromTo(".lookbook-img",
          { scale: 0.9, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 1.5, ease: "power4.out",
            scrollTrigger: {
              trigger: lookbookRef.current,
              start: "top 70%",
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col w-full bg-background selection:bg-black selection:text-white">
      
      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-[#EAE8E3]">
        <img 
          ref={heroImgRef}
          src="https://images.unsplash.com/photo-1596755094514-f87e32f85e98?q=80&w=2500&auto=format&fit=crop"
          alt="Editorial Fashion Campaign"
          className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90"
        />
        <div className="relative z-10 w-full px-6 lg:px-12 flex flex-col justify-end h-full pb-20">
          <div ref={heroTextRef}>
            <h1 className="hero-text text-[clamp(4rem,10vw,10rem)] leading-[0.85] font-medium tracking-tighter text-foreground uppercase max-w-5xl">
              Timeless<br/>Essentials
            </h1>
            <p className="hero-text text-lg md:text-2xl mt-8 max-w-md font-light text-foreground/80 leading-relaxed">
              Refined simplicity. Crafted for everyday living without compromise.
            </p>
            <div className="hero-text mt-12">
              <Link 
                to="/collections" 
                className="inline-flex items-center gap-4 text-sm font-medium uppercase tracking-widest group"
              >
                Explore Collection
                <span className="w-12 h-[1px] bg-foreground group-hover:w-20 transition-all duration-500"></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection / New Arrivals */}
      <section ref={collectionRef} className="py-32 lg:py-48 px-6 lg:px-12">
        <div className="mb-24 flex justify-between items-end border-b border-border pb-8">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase">New Arrivals</h2>
          <Link to="/category/new" className="text-sm font-medium tracking-wide underline underline-offset-4 hover:text-muted-foreground transition-colors hidden sm:block">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-8">
          {isLoading ? (
            // Skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-6"></div>
                <div className="h-4 bg-muted w-3/4 mb-2"></div>
                <div className="h-4 bg-muted w-1/4"></div>
              </div>
            ))
          ) : (
            products.slice(0, 3).map((product: any, idx: number) => (
              <Link 
                key={product._id} 
                to={`/product/${product.slug}`} 
                className={`collection-item group flex flex-col ${idx === 1 ? 'md:mt-24' : ''}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted mb-6">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-300">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.fabricDescription}</p>
                  </div>
                  <span className="text-sm font-medium">₹{product.price}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Editorial Lookbook Section */}
      <section ref={lookbookRef} className="py-32 px-6 lg:px-12 bg-black text-white min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full max-w-[1600px] mx-auto">
          <div className="order-2 lg:order-1">
            <h2 className="text-[clamp(3rem,8vw,8rem)] leading-[0.9] font-medium tracking-tighter uppercase mb-12">
              Quiet<br/>Confidence
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-md font-light leading-relaxed mb-12">
              We believe in fewer, better things. Each piece in our collection is meticulously designed to outlast trends and become a foundational element of your wardrobe.
            </p>
            <Link 
              to="/about" 
              className="inline-flex items-center gap-4 text-sm font-medium uppercase tracking-widest group text-white"
            >
              Our Philosophy
              <span className="w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500"></span>
            </Link>
          </div>
          <div className="order-1 lg:order-2 aspect-[4/5] relative lookbook-img">
            <img 
              src="https://images.unsplash.com/photo-1617391753733-8a39d89163d8?q=80&w=2000&auto=format&fit=crop" 
              alt="Editorial Shot" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Category Panels */}
      <section className="min-h-screen flex flex-col md:flex-row">
        <Link to="/category/men" className="flex-1 relative group overflow-hidden h-[50vh] md:h-screen">
          <img 
            src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2000&auto=format&fit=crop" 
            alt="Men" 
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-5xl md:text-7xl font-medium tracking-tighter uppercase">Men</h2>
          </div>
        </Link>
        <Link to="/category/essentials" className="flex-1 relative group overflow-hidden h-[50vh] md:h-screen">
          <img 
            src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2000&auto=format&fit=crop" 
            alt="Essentials" 
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-5xl md:text-7xl font-medium tracking-tighter uppercase">Essentials</h2>
          </div>
        </Link>
      </section>

    </div>
  );
}
