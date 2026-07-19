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
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-4">
          <h2 className="text-2xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-2">
            Size Guide
          </h2>
          <p className="text-gray-500 text-sm">
            Measurements for {type === 'polo' ? 'Polo Shirts' : 'Joggers'}
          </p>
        </div>

        <div className="p-8 pt-0 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F1E8] text-[#0A0A0A] font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Size</th>
                {type === 'polo' ? (
                  <>
                    <th className="px-4 py-3">Chest</th>
                    <th className="px-4 py-3">Length</th>
                    <th className="px-4 py-3">Sleeve</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3">Waist</th>
                    <th className="px-4 py-3">Inseam</th>
                    <th className="px-4 py-3">Hip</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(type === 'polo' ? poloSizes : joggerSizes).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{row.size}</td>
                  <td className="px-4 py-3">{type === 'polo' ? (row as any).chest : (row as any).waist}</td>
                  <td className="px-4 py-3">{type === 'polo' ? (row as any).length : (row as any).inseam}</td>
                  <td className="px-4 py-3">{type === 'polo' ? (row as any).sleeve : (row as any).hip}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
            <p><strong>Note:</strong> Measurements are approximate and may vary slightly due to the handcrafted nature of our garments.</p>
            <p>For between sizes, we recommend sizing up for a more relaxed fit.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
