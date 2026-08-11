import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { Percent, Ticket, Edit, Trash2, Plus } from "lucide-react";
import { CouponModal } from "../../components/admin/CouponModal";

export function Discounts() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get("/admin/coupons");
        setCoupons(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load coupons");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/admin/coupons");
      setCoupons(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) {
        alert("Failed to delete coupon");
      }
    }
  };

  if (loading) return <div className="p-6">Loading coupons...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Discounts & Coupons</h2>
        <button 
          onClick={() => { setSelectedCoupon(null); setIsModalOpen(true); }}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto pr-24 lg:pr-32">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Min Purchase</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-gray-400" />
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                  </td>
                  <td className="px-6 py-4">₹{coupon.minPurchaseAmount || 0}</td>
                  <td className="px-6 py-4">
                    {(!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) && coupon.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Inactive/Expired</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedCoupon(coupon); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No active coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        onSuccess={fetchCoupons}
      />
    </div>
  );
}
