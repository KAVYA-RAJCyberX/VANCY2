import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Heart, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useToastStore, type Toast } from "../../store/useToastStore";

const iconMap = {
  success: <Check className="w-4 h-4 text-foreground" strokeWidth={1.5} />,
  error: <AlertCircle className="w-4 h-4 text-red-500" strokeWidth={1.5} />,
  cart: <ShoppingBag className="w-4 h-4 text-foreground" strokeWidth={1.5} />,
  wishlist: <Heart className="w-4 h-4 text-foreground" strokeWidth={1.5} />,
  info: <Check className="w-4 h-4 text-foreground" strokeWidth={1.5} />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-4 px-4 py-3 bg-background border max-w-sm ${
        toast.type === 'error' 
          ? 'border-red-500' 
          : 'border-border'
      }`}
    >
      {toast.image && (
        <img src={toast.image} alt="" className="w-10 h-12 object-cover mix-blend-multiply flex-shrink-0" />
      )}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {iconMap[toast.type]}
        <span className="text-xs font-medium uppercase tracking-widest text-foreground truncate">{toast.message}</span>
      </div>
      {toast.link && (
        <Link to={toast.link.href} className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap hover:text-foreground transition-colors border-b border-border hover:border-foreground">
          {toast.link.label}
        </Link>
      )}
      <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors">
        <X className="w-4 h-4" strokeWidth={1} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
