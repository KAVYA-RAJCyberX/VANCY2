import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { Package, AlertCircle } from "lucide-react";

export function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="p-6">Loading inventory...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto pr-24 lg:pr-32">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Variant Sizes</th>
                <th className="px-6 py-4 font-medium">Variant Colors</th>
                <th className="px-6 py-4 font-medium">Total Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const totalStock = product.variants ? product.variants.reduce((acc: number, v: any) => acc + v.stock, 0) : 0;
                const uniqueSizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || []));
                const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color) || []));

                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      {product.name}
                    </td>
                    <td className="px-6 py-4">{uniqueSizes.join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4">{uniqueColors.join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium">{totalStock}</td>
                    <td className="px-6 py-4">
                      {totalStock <= 5 ? (
                        <div className="flex items-center text-red-600 gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" /> Low Stock
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium">Healthy</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
