import { motion, AnimatePresence } from "motion/react";
import { X, Package, Truck, CheckCircle, XCircle, RotateCcw, MapPin, CreditCard } from "lucide-react";
import api from "../../../../lib/axios";
import { useState } from "react";

interface OrderDetailsPanelProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const STATUS_OPTIONS = [
  'Processing', 
  'Confirmed', 
  'Shipped', 
  'Out for Delivery', 
  'Delivered', 
  'Cancelled', 
  'Returned'
];

export function OrderDetailsPanel({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsPanelProps) {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: newStatus });
      onStatusUpdate(order._id, newStatus);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = order.status || (order.isDelivered ? 'Delivered' : 'Processing');

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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Order Details</h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">{order._id}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status Manager */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Order Status</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <select 
                    value={currentStatus}
                    onChange={handleStatusChange}
                    disabled={updating}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 outline-none"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Customer</h3>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{order.user?.name || order.guestEmail || 'Guest'}</p>
                  <p className="text-gray-500">{order.user?.email || order.guestEmail}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Shipping Address
                </h3>
                {order.shippingAddress ? (
                  <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-900 font-medium">{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No shipping address provided</p>
                )}
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1" /> Payment
                </h3>
                <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.paymentResult?.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-xs">{order.paymentResult.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <Package className="w-3.5 h-3.5 mr-1" /> Line Items
                </h3>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any) => (
                    <div key={item._id} className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-20 object-cover rounded bg-gray-100"
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Size: {item.size} | Color: {item.color}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-500">Qty: {item.qty}</span>
                          <span className="font-medium">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{order.itemsPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>₹{order.shippingPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
