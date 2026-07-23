import { Link } from "react-router";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Journal() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".journal-header",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      );

      gsap.utils.toArray<HTMLElement>('.journal-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const articles = [
    {
      id: 1,
      title: "The Anatomy of a Perfect Polo",
      category: "Craftsmanship",
      date: "October 12, 2026",
      image: "https://images.unsplash.com/photo-1594938298598-70f90bf7e7d6?q=80&w=1500&auto=format&fit=crop",
      excerpt: "Exploring the meticulous details that elevate a basic garment into a timeless essential."
    },
    {
      id: 2,
      title: "Merino Wool: Nature's Performance Fabric",
      category: "Materials",
      date: "September 28, 2026",
      image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1500&auto=format&fit=crop",
      excerpt: "Why we source our merino exclusively from sustainable farms in New Zealand."
    },
    {
      id: 3,
      title: "SS26 Campaign Behind The Scenes",
      category: "Campaign",
      date: "September 15, 2026",
      image: "https://images.unsplash.com/photo-1617391753733-8a39d89163d8?q=80&w=1500&auto=format&fit=crop",
      excerpt: "A glimpse into our recent shoot on the rugged coastlines of northern Europe."
    }
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-24 md:mb-32">
          <h1 className="journal-header text-5xl md:text-8xl font-medium tracking-tighter uppercase mb-6">Journal</h1>
          <p className="journal-header text-lg md:text-xl text-muted-foreground font-light max-w-2xl">
            Stories, insights, and the philosophy behind our garments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
          {articles.map((article) => (
            <Link key={article.id} to="#" className="journal-card group flex flex-col">
              <div className="aspect-[4/5] overflow-hidden bg-muted mb-6">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium tracking-widest uppercase mb-4">
                <span>{article.category}</span>
                <span>{article.date}</span>
              </div>
              <h3 className="text-2xl font-medium tracking-tight leading-snug mb-3 group-hover:text-muted-foreground transition-colors">{article.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
