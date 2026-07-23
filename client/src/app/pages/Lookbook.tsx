import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Lookbook() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".lookbook-text",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out" }
      );

      gsap.utils.toArray<HTMLElement>('.lookbook-image').forEach((img) => {
        gsap.fromTo(img,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 1.5, ease: "power4.out",
            scrollTrigger: {
              trigger: img,
              start: "top 80%",
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-32 text-center">
          <h1 className="lookbook-text text-5xl md:text-8xl font-medium tracking-tighter uppercase mb-6">SS26 Campaign</h1>
          <p className="lookbook-text text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            A visual exploration of form, function, and refined simplicity. 
            Captured on the brutalist shores of nowhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-32 gap-x-12 max-w-7xl mx-auto">
          <div className="lookbook-image md:col-span-2 aspect-[16/9] bg-muted overflow-hidden">
            <img src="https://images.unsplash.com/photo-1617391753733-8a39d89163d8?q=80&w=2500&auto=format&fit=crop" alt="Look 1" className="w-full h-full object-cover mix-blend-multiply" />
          </div>

          <div className="lookbook-image aspect-[3/4] bg-muted overflow-hidden md:mt-24">
            <img src="https://images.unsplash.com/photo-1596755094514-f87e32f85e98?q=80&w=1500&auto=format&fit=crop" alt="Look 2" className="w-full h-full object-cover mix-blend-multiply" />
          </div>
          
          <div className="flex flex-col justify-center max-w-md mx-auto md:ml-12">
            <h3 className="lookbook-text text-3xl md:text-4xl font-medium tracking-tighter uppercase mb-6 leading-tight">The unstructured<br/>silhouette</h3>
            <p className="lookbook-text text-muted-foreground leading-relaxed font-light">
              "We wanted to strip away everything unnecessary. What remains is pure intentionality."
            </p>
          </div>

          <div className="flex flex-col justify-center max-w-md mx-auto md:mr-12 order-2 md:order-1 text-right">
            <h3 className="lookbook-text text-3xl md:text-4xl font-medium tracking-tighter uppercase mb-6 leading-tight">Quiet<br/>Confidence</h3>
            <p className="lookbook-text text-muted-foreground leading-relaxed font-light">
              Garments that do not shout for attention, but demand respect through their craftsmanship.
            </p>
          </div>

          <div className="lookbook-image aspect-[3/4] bg-muted overflow-hidden order-1 md:order-2 md:mt-24">
            <img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1500&auto=format&fit=crop" alt="Look 3" className="w-full h-full object-cover mix-blend-multiply" />
          </div>

          <div className="lookbook-image md:col-span-2 aspect-[21/9] bg-muted overflow-hidden mt-16">
            <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2500&auto=format&fit=crop" alt="Look 4" className="w-full h-full object-cover mix-blend-multiply object-top" />
          </div>
        </div>
      </div>
    </div>
  );
}
