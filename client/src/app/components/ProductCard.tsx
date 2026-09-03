import { useState } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { useToastStore } from "../../store/useToastStore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: any;
  idx: number;
  priorityLoad?: boolean;
}

export function ProductCard({ product, idx, priorityLoad = false }: ProductCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const { addItem: addWishlistItem, isInWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  const inWishlist = isInWishlist(product._id);
  const isNew = product.isNewArrival;
  const isSale = product.price < (product.originalPrice || product.price);

  // Determine available sizes (simplified for Quick Add)
  const sizes = product.variants 
    ? Array.from(new Set(product.variants.map((v: any) => v.size)))
    : ["S", "M", "L", "XL", "XXL"];

  const getStock = (size: string) => {
    if (!product.variants) return 10;
    const variant = product.variants.find((v: any) => v.size === size);
    return variant ? variant.stock : 0;
  };

  const handleQuickAdd = () => {
    if (!selectedSize) {
      addToast({ type: 'error', message: 'Please select a size first' });
      return;
    }
    
    const stock = getStock(selectedSize);
    if (stock <= 0) {
      addToast({ type: 'error', message: 'Selected size is out of stock' });
      return;
    }

    addItemToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      size: selectedSize,
      color: product.variants?.[0]?.color || "Standard",
    });
    
    addToast({ type: 'success', message: 'Added to bag' });
    setQuickAddOpen(false);
    setSelectedSize("");
  };

  return (
    <div 
      className="group flex flex-col relative"
      onMouseEnter={() => setHoveredId(product._id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <Link to={`/product/${product.slug}`} className="block relative w-full mb-3 md:mb-4">
        <div className="product-image-container">
          <img 
            src={product.images[0]}
            alt={product.name}
            loading={priorityLoad ? "eager" : "lazy"}
            fetchPriority={priorityLoad ? "high" : "auto"}
            className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ease-out ${
              hoveredId === product._id && product.images.length > 1 ? 'opacity-0 md:opacity-0' : 'opacity-100'
            }`}
          />
          {product.images.length > 1 && (
            <img 
              src={product.images[1]}
              alt={`${product.name} Alternate`}
              loading={priorityLoad ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ease-out hidden md:block ${
                hoveredId === product._id ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              addWishlistItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0]
              });
            }}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 text-foreground hover:scale-110 transition-transform min-w-[40px] min-h-[40px] flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full sm:bg-transparent sm:backdrop-blur-none sm:rounded-none opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Toggle Wishlist"
          >
            <Heart 
              className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${inWishlist ? 'fill-foreground text-foreground' : 'text-foreground/70 hover:text-foreground'}`} 
              strokeWidth={inWishlist ? 0 : 1.5} 
            />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-1 pointer-events-none">
            {isNew && (
              <span className="bg-foreground text-background text-[9px] md:text-[10px] font-medium tracking-widest uppercase px-2 py-1">
                New
              </span>
            )}
            {isSale && (
              <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-medium tracking-widest uppercase px-2 py-1">
                Sale
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-col items-start gap-1 font-sans mt-2">
        <Link to={`/product/${product.slug}`} className="w-full">
          <h3 className="text-[10px] sm:text-xs md:text-sm font-medium tracking-wide leading-tight text-left truncate w-full">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-wide text-left">
              ₹{product.price}
            </p>
            {isSale && product.originalPrice && (
              <p className="text-[9px] md:text-xs text-muted-foreground line-through">
                ₹{product.originalPrice}
              </p>
            )}
          </div>
        </Link>

        {/* Quick Add Drawer */}
        <Drawer open={quickAddOpen} onOpenChange={setQuickAddOpen}>
          <DrawerTrigger asChild>
            <button className="text-[10px] md:text-xs font-medium tracking-widest uppercase underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors mt-2 md:mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 min-h-[32px] md:min-h-0 flex items-center">
              Quick Add
            </button>
          </DrawerTrigger>
          <DrawerContent className="px-4">
            <DrawerHeader className="text-left pt-6">
              <DrawerTitle className="text-lg font-serif uppercase tracking-wider">{product.name}</DrawerTitle>
              <p className="text-sm font-medium mt-1">₹{product.price}</p>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Select Size</p>
              <div className="flex flex-wrap gap-3">
                {(sizes as string[]).map(size => {
                  const stock = getStock(size);
                  const isOos = stock <= 0;
                  return (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOos}
                      className={`w-12 h-12 rounded-full text-sm font-medium tracking-wider transition-all duration-300 border flex items-center justify-center ${
                        selectedSize === size 
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-transparent text-foreground hover:border-foreground/50'
                      } ${isOos ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
            <DrawerFooter className="pb-8 pt-4">
              <Button onClick={handleQuickAdd} className="w-full uppercase tracking-widest">
                Add To Bag
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full uppercase tracking-widest mt-2">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

      </div>
    </div>
  );
}
