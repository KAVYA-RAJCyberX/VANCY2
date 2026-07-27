import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { VancyV } from '../components/ui/Icons';
import { Button } from '../components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (products.length > 0 && collectionRef.current) {
      const ctx = gsap.context(() => {
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
        
        // Refresh ScrollTrigger to recalculate layout after products are rendered
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      });
      return () => ctx.revert();
    }
  }, [products]);

  return (
    <div className="flex flex-col w-full bg-background selection:bg-black selection:text-white">
      
      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
          <img src="/images/logo/leaf-logo.png" alt="Vancy Logo Background" className="w-[80vw] h-[80vw] object-contain opacity-50 grayscale contrast-200 brightness-0 dark:invert" />
        </div>
        <div ref={heroImgRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img 
            src="/images/landing-page/hero-bg.jpg"
            alt="Editorial Fashion Campaign"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80 dark:opacity-0 transition-opacity duration-[1500ms] ease-in-out"
          />
          <img 
            src="/images/landing-page/dark-hero-bg.png"
            alt="Editorial Fashion Campaign Dark"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 dark:opacity-80 transition-opacity duration-[1500ms] ease-in-out"
          />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-12 flex flex-col justify-end h-full pb-24">
          <div ref={heroTextRef} className="pt-20 md:pt-0">
            <h1 className="hero-text text-[clamp(2.75rem,12vw,10rem)] leading-[0.85] font-medium tracking-[0.05em] text-foreground uppercase max-w-5xl">
              Timeless<br/>Essentials
            </h1>
            <p className="hero-text text-sm md:text-lg mt-8 max-w-md font-medium text-foreground/80 leading-loose uppercase tracking-widest">
              Refined simplicity. Crafted for everyday living without compromise.
            </p>
            <div className="hero-text mt-12 mb-8 md:mb-0">
              <Button href="/collections" withArrow variant="default" className="min-h-[44px]">
                Explore Collection
              </Button>
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
                <div className="aspect-[3/4] overflow-hidden bg-muted mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-[0.04] transition-opacity duration-700 pointer-events-none z-10">
                    <img src="/images/logo/leaf-logo.png" alt="Vancy Logo Hover" className="w-[80%] h-[80%] object-contain opacity-50 grayscale contrast-200 brightness-0 dark:invert" />
                  </div>
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-0"
                  />
                </div>
                <div className="flex justify-between items-start uppercase tracking-widest">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-medium group-hover:text-accent transition-colors duration-300 line-clamp-2 break-words">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 font-light">{product.fabricDescription}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">₹{product.price}</span>
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
            <Button 
              href="/about" 
              variant="default"
              withArrow
              className="text-white hover:text-accent min-h-[44px]"
            >
              Our Philosophy
            </Button>
          </div>
          <div className="order-1 lg:order-2 aspect-[4/5] relative lookbook-img flex items-center justify-center bg-white/5 rounded-3xl overflow-hidden p-8">
            <img 
              src="/images/landing-page/quiet-confidence.png" 
              alt="Quiet Confidence" 
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
