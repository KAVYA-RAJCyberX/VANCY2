import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Heart, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useToastStore, type Toast } from "../../store/useToastStore";

const iconMap = {
  success: <Check className="w-4 h-4 text-green-600" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  cart: <ShoppingBag className="w-4 h-4 text-[#C9A961]" />,
  wishlist: <Heart className="w-4 h-4 text-[#C9A961] fill-[#C9A961]" />,
  info: <Check className="w-4 h-4 text-[#C9A961]" />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border max-w-sm ${
        toast.type === 'error' 
          ? 'bg-red-50 border-red-200' 
          : 'bg-[#F5F1E8] border-[#C9A961]/40'
      }`}
    >
      {toast.image && (
        <img src={toast.image} alt="" className="w-10 h-12 object-cover rounded mix-blend-multiply flex-shrink-0" />
      )}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {iconMap[toast.type]}
        <span className="text-sm font-medium text-[#0A0A0A] truncate">{toast.message}</span>
      </div>
      {toast.link && (
        <Link to={toast.link.href} className="text-xs font-bold text-[#C9A961] uppercase tracking-wider whitespace-nowrap hover:underline">
          {toast.link.label}
        </Link>
      )}
      <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  
  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
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
