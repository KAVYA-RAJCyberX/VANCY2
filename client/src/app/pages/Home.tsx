import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Button } from '../components/ui/button';
import { ProductCard } from "../components/ProductCard";

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'newArrivals', 'limit-4'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { isNewArrival: true, limit: 4 } });
      return Array.isArray(data) ? data : (data?.products || []);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const { data: shopTheLook = [] } = useQuery({
    queryKey: ['products', 'shopTheLook'],
    queryFn: async () => {
      // Just fetch some products to populate the shop the look
      const { data } = await api.get('/products', { params: { limit: 3 } });
      return Array.isArray(data) ? data : (data?.products || []);
    },
    staleTime: 1000 * 60 * 5,
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
        
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      });
      return () => ctx.revert();
    }
  }, [products]);

  const shopTheLookTotal = shopTheLook.reduce((acc, p: any) => acc + p.price, 0);

  return (
    <div className="flex flex-col w-full bg-background selection:bg-black selection:text-white">
      
      {/* Hero Section */}
      <section className="relative w-full h-[100dvh] min-h-[600px] md:h-screen md:min-h-[800px] flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
          <img src="/images/logo/vancy-logo.png" alt="Vancy Logo Background" className="w-[80vw] h-[80vw] object-contain opacity-50 grayscale contrast-200 brightness-0 dark:invert" />
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
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-12 flex flex-col justify-end h-full pb-[calc(10vh+env(safe-area-inset-bottom,16px))] md:pb-24">
          <div ref={heroTextRef} className="pt-10 md:pt-0">
            <h1 className="hero-text text-[clamp(2.75rem,12vw,10rem)] leading-[0.85] font-medium tracking-[0.05em] text-foreground uppercase max-w-5xl">
              Timeless<br/>Essentials
            </h1>
            <p className="hero-text text-sm md:text-lg mt-8 max-w-md font-medium text-foreground/80 leading-loose uppercase tracking-widest">
              Refined simplicity. Crafted for everyday living without compromise.
            </p>
            <div className="hero-text mt-12 mb-8 md:mb-0">
              <Button href="/category/all" withArrow variant="default" className="min-h-[44px]">
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection / New Arrivals */}
      <section ref={collectionRef} className="py-16 md:py-32 px-0 md:px-6 lg:px-12">
        <div className="px-4 md:px-0 mb-8 md:mb-24 flex justify-between items-end border-b border-border pb-4 md:pb-8">
          <h2 className="text-3xl md:text-6xl font-medium tracking-tighter uppercase">New Arrivals</h2>
          <Link to="/category/new" className="text-sm font-medium tracking-wide underline underline-offset-4 hover:text-muted-foreground transition-colors hidden sm:block">
            View All
          </Link>
        </div>
        
        {/* Mobile Carousel & Desktop Grid */}
        <div className="w-full">
          {isLoading ? (
            <div className="px-6 md:px-0 flex md:grid md:grid-cols-4 gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex-none w-[80vw] md:w-auto">
                  <div className="aspect-[4/5] bg-muted mb-4"></div>
                  <div className="h-4 bg-muted w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-4 gap-4 md:gap-8 px-6 md:px-0 pb-8 md:pb-0">
              {products.map((product: any, idx: number) => (
                <div key={product._id} className="collection-item flex-none w-[80vw] md:w-auto snap-center md:snap-align-none first:pl-0 last:pr-6 md:last:pr-0">
                  <ProductCard product={product} idx={idx} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 mt-8 sm:hidden">
           <Button href="/category/new" variant="outline" className="w-full uppercase tracking-widest">
            View All
          </Button>
        </div>
      </section>

      {/* Shop The Look */}
      <section className="py-16 md:py-32 px-4 md:px-6 lg:px-12 bg-muted/30">
        <div className="mb-10 md:mb-24 text-center">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter uppercase mb-4">Shop The Look</h2>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Curated Editorial Styling</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Editorial Image */}
          <div className="lg:col-span-7 aspect-[4/5] md:aspect-[3/4] lg:aspect-auto lg:h-[80vh] bg-muted relative overflow-hidden -mx-4 md:mx-0">
            <img 
              src="/images/landing-page/hero-bg.jpg" 
              alt="Editorial Styling" 
              className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply" 
            />
          </div>
          
          {/* Products */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-medium tracking-wide uppercase mb-8">The Look</h3>
            
            <div className="flex flex-col gap-6 mb-12">
              {shopTheLook.map((p: any) => (
                <div key={p._id} className="flex justify-between items-center border-b border-border/50 pb-4">
                  <Link to={`/product/${p.slug}`} className="flex items-center gap-4 group">
                    <div className="w-16 h-20 bg-muted overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-widest group-hover:text-accent transition-colors">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">₹{p.price}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center border-t border-border pt-6 mb-8">
              <span className="text-sm font-medium uppercase tracking-widest">Total Look</span>
              <span className="text-lg font-medium tracking-wide">₹{shopTheLookTotal}</span>
            </div>
            
            <Button className="w-full md:w-auto uppercase tracking-widest min-h-[56px]">
              Shop Complete Look
            </Button>
          </div>
        </div>
      </section>

      {/* Editorial Lookbook Section */}
      <section ref={lookbookRef} className="py-16 md:py-32 px-4 md:px-6 lg:px-12 bg-black text-white min-h-[100dvh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center w-full max-w-[1600px] mx-auto">
          <div className="order-2 lg:order-1 text-center md:text-left">
            <h2 className="text-[clamp(2.75rem,8vw,8rem)] leading-[0.9] font-medium tracking-tighter uppercase mb-8 md:mb-12">
              Quiet<br/>Confidence
            </h2>
            <p className="text-base md:text-xl text-white/70 max-w-md mx-auto md:mx-0 font-light leading-relaxed mb-10 md:mb-12">
              We believe in fewer, better things. Each piece in our collection is meticulously designed to outlast trends and become a foundational element of your wardrobe.
            </p>
            <Button 
              href="/about" 
              variant="outline"
              withArrow
              className="text-white hover:text-black hover:bg-white border-white min-h-[48px]"
            >
              Our Philosophy
            </Button>
          </div>
          <div className="order-1 lg:order-2 aspect-[4/5] relative lookbook-img flex items-center justify-center bg-white/5 rounded-3xl overflow-hidden p-6 md:p-8">
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
