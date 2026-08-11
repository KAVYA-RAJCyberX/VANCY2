import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Calendar, MapPin, ShoppingBag } from "lucide-react";

interface CustomerDetailsPanelProps {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailsPanel({ customer, isOpen, onClose }: CustomerDetailsPanelProps) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Customer Details</h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">{customer._id}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <Mail className="w-3.5 h-3.5" /> {customer.email}
                  </div>
                </div>
              </div>

              {customer.isDuplicate && (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2 border border-amber-200">
                  <div className="font-medium">Possible Duplicate</div>
                  <div className="text-amber-700">Another customer exists with the same name.</div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Account Info</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined</span>
                    <span className="font-medium text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> Role</span>
                    <span className="font-medium capitalize text-gray-900">{customer.role}</span>
                  </div>
                </div>
              </div>

              {/* Assuming we might fetch recent orders or addresses later, place holders here */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</h3>
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  Detailed order history and addresses not yet loaded.
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
