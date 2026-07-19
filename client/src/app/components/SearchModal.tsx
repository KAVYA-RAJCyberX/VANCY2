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

  const { data: results = [] } = useQuery({
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
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex flex-col items-center pt-32"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        className="w-full max-w-2xl mx-4 bg-[#F5F1E8] shadow-2xl rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[#e5dfd3] px-6 py-4">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg bg-transparent focus:outline-none placeholder-gray-400 text-[#0A0A0A]"
          />
          <button onClick={onClose} className="ml-3 text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {query.length >= 2 && (
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg mb-1">No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {results.slice(0, 8).map((product: any) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-[#e5dfd3]/50 transition-colors"
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded mix-blend-multiply bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0A0A0A] truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{product.fabricDescription}</p>
                    </div>
                    <span className="text-sm font-bold text-[#C9A961]">₹{product.price?.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {query.length < 2 && (
          <div className="py-8 text-center text-gray-400 text-sm">
            Type at least 2 characters to search
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
