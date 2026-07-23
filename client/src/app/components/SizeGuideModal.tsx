import { useEffect } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  type: 'polo' | 'jogger';
  onClose: () => void;
}

export function SizeGuideModal({ type, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const poloSizes = [
    { size: 'S', chest: '36-38"', length: '27"', sleeve: '8"' },
    { size: 'M', chest: '39-41"', length: '28"', sleeve: '8.5"' },
    { size: 'L', chest: '42-44"', length: '29"', sleeve: '9"' },
    { size: 'XL', chest: '45-47"', length: '30"', sleeve: '9.5"' },
    { size: 'XXL', chest: '48-50"', length: '31"', sleeve: '10"' },
  ];

  const joggerSizes = [
    { size: 'S', waist: '28-30"', inseam: '29"', hip: '36"' },
    { size: 'M', waist: '31-33"', inseam: '30"', hip: '39"' },
    { size: 'L', waist: '34-36"', inseam: '31"', hip: '42"' },
    { size: 'XL', waist: '37-39"', inseam: '32"', hip: '45"' },
    { size: 'XXL', waist: '40-42"', inseam: '33"', hip: '48"' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-background border border-border relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1} />
        </button>

        <div className="p-8 lg:p-12 pb-8 border-b border-border">
          <h2 className="text-2xl font-medium tracking-tighter uppercase mb-2">
            Size Guide
          </h2>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            Measurements for {type === 'polo' ? 'Polo Shirts' : 'Joggers'}
          </p>
        </div>

        <div className="p-8 lg:p-12 pt-0 overflow-y-auto">
          <table className="w-full text-sm text-left mt-8">
            <thead className="text-foreground font-medium uppercase tracking-widest text-xs border-b border-border">
              <tr>
                <th className="py-4 font-medium">Size</th>
                {type === 'polo' ? (
                  <>
                    <th className="py-4 font-medium">Chest</th>
                    <th className="py-4 font-medium">Length</th>
                    <th className="py-4 font-medium">Sleeve</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 font-medium">Waist</th>
                    <th className="py-4 font-medium">Inseam</th>
                    <th className="py-4 font-medium">Hip</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(type === 'polo' ? poloSizes : joggerSizes).map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 font-medium">{row.size}</td>
                  <td className="py-4 text-muted-foreground">{type === 'polo' ? (row as any).chest : (row as any).waist}</td>
                  <td className="py-4 text-muted-foreground">{type === 'polo' ? (row as any).length : (row as any).inseam}</td>
                  <td className="py-4 text-muted-foreground">{type === 'polo' ? (row as any).sleeve : (row as any).hip}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground space-y-2 uppercase tracking-widest">
            <p>Measurements are approximate. Between sizes? Size up for an editorial fit.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
