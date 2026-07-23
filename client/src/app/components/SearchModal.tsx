import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Search as SearchIcon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const { data } = await api.get(`/products?search=${encodeURIComponent(query)}`);
      return data;
    },
    enabled: query.length >= 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-background flex flex-col pt-32 px-6 lg:px-12"
    >
      <div className="container mx-auto flex flex-col h-full max-w-6xl relative">
        <button 
          onClick={onClose} 
          className="absolute -top-16 right-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-8 h-8" strokeWidth={1} />
        </button>

        <div className="flex items-end border-b border-border pb-6 mb-16">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for essentials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter bg-transparent focus:outline-none placeholder:text-muted-foreground/30 text-foreground"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.length >= 2 ? (
            isLoading ? (
              <div className="text-muted-foreground uppercase tracking-widest text-sm">Searching...</div>
            ) : results.length === 0 ? (
              <div className="text-muted-foreground uppercase tracking-widest text-sm">No results found for "{query}"</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {results.slice(0, 8).map((product: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    key={product._id}
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[3/4] bg-muted mb-4 overflow-hidden">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                      <h4 className="text-sm font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">{product.name}</h4>
                      <span className="text-sm">₹{product.price?.toLocaleString()}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div>
                <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Popular Categories</h3>
                <ul className="space-y-4 text-2xl font-medium tracking-tighter">
                  <li><Link to="/category/men" onClick={onClose} className="hover:text-muted-foreground transition-colors">Men</Link></li>
                  <li><Link to="/category/essentials" onClick={onClose} className="hover:text-muted-foreground transition-colors">Essentials</Link></li>
                  <li><Link to="/category/luxury" onClick={onClose} className="hover:text-muted-foreground transition-colors">Vancy Privé</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Trending Searches</h3>
                <ul className="space-y-4 text-2xl font-medium tracking-tighter">
                  <li><button onClick={() => setQuery("Polo")} className="hover:text-muted-foreground transition-colors">Polo Shirts</button></li>
                  <li><button onClick={() => setQuery("Merino")} className="hover:text-muted-foreground transition-colors">Merino Wool</button></li>
                  <li><button onClick={() => setQuery("Joggers")} className="hover:text-muted-foreground transition-colors">Everyday Joggers</button></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
