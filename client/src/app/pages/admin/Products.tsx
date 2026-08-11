import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { Package, Edit, Trash2, BarChart2, X, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <button className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
          Add New Product
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto pr-24 lg:pr-32">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const totalStock = product.variants ? product.variants.reduce((acc: number, v: any) => acc + v.stock, 0) : 0;
                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400 m-auto mt-2" />
                          )}
                        </div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{product.category}</td>
                    <td className="px-6 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {totalStock > 10 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In Stock</span>
                      ) : totalStock > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Low Stock</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedProductId(product._id)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Insights"><BarChart2 className="w-4 h-4" /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedProductId && (
          <ProductInsightsModal 
            productId={selectedProductId} 
            onClose={() => setSelectedProductId(null)} 
            productName={products.find(p => p._id === selectedProductId)?.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductInsightsModal({ productId, onClose, productName }: { productId: string, onClose: () => void, productName?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['product-insights', productId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/products/${productId}/cross-reference`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cross-Reference Insights</h3>
            <p className="text-sm text-gray-500">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Loading insights...</div>
          ) : data ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalTickets}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalReviews}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Avg Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{data.stats.averageRating.toFixed(1)}</p>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-100 pb-2">Support Tickets ({data.tickets.length})</h4>
                  {data.tickets.length === 0 ? (
                    <p className="text-sm text-gray-500">No support tickets for this product.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {data.tickets.map((t: any) => (
                        <div key={t._id} className="border border-gray-200 rounded p-3 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-medium uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t.category}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status.replace('_', ' ')}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 mb-1">Customer: {t.user?.email}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{t.subject}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-100 pb-2">Reviews ({data.reviews.length})</h4>
                  {data.reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews for this product.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {data.reviews.map((r: any) => (
                        <div key={r._id} className="border border-gray-200 rounded p-3 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                            </div>
                            <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 mb-1">{r.user?.email || r.name}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">Failed to load data.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
