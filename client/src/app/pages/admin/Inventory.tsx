import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import api from "../../../lib/axios";
import { Package, AlertCircle, Search, Filter, Plus, Minus } from "lucide-react";

export function Inventory() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  const handleStockUpdate = async (productId: string, variantId: string, quantity: number, type: 'set' | 'increment' | 'decrement') => {
    try {
      const { data } = await api.put(`/admin/products/${productId}/stock`, { variantId, quantity, type });
      setProducts(products.map(p => p._id === productId ? data : p));
    } catch (err) {
      console.error(err);
      alert("Failed to update stock");
    }
  };

  // Flatten products into variants for the table
  const flattenedVariants = useMemo(() => {
    return products.flatMap(p => 
      p.variants?.map((v: any) => ({
        product: p,
        variant: v
      })) || []
    );
  }, [products]);

  const filteredVariants = useMemo(() => {
    return flattenedVariants.filter(item => {
      const matchesSearch = item.product.name.toLowerCase().includes(search.toLowerCase());
      
      const isLowStock = item.variant.stock <= 5; // Use threshold
      const matchesStatus = 
        statusFilter === 'low' ? isLowStock : 
        statusFilter === 'healthy' ? !isLowStock : true;

      return matchesSearch && matchesStatus;
    });
  }, [flattenedVariants, search, statusFilter]);

  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVariants.slice(start, start + itemsPerPage);
  }, [filteredVariants, currentPage]);

  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage);

  if (loading) return <div className="p-6">Loading inventory...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-black focus:border-black"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-black focus:border-black"
          >
            <option value="">All Stock</option>
            <option value="healthy">Healthy</option>
            <option value="low">Low Stock</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Variant</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedVariants.map((item) => {
                const { product, variant } = item;
                const isLowStock = variant.stock <= 5;

                return (
                  <tr key={variant._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="truncate max-w-[200px]" title={product.name}>{product.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Size:</span> {variant.size} 
                        <span className="mx-2 text-gray-300">|</span> 
                        <span className="text-gray-500">Color:</span> {variant.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{variant.stock}</td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <div className="flex items-center text-red-600 gap-1 font-medium text-xs uppercase tracking-wider bg-red-50 w-max px-2 py-1 rounded-md">
                          <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium text-xs uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md">Healthy</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStockUpdate(product._id, variant._id, 1, 'decrement')}
                          className="p-1 rounded hover:bg-gray-200 text-gray-600"
                          disabled={variant.stock === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input 
                          type="number"
                          className="w-16 border border-gray-200 rounded text-center text-sm py-1 focus:ring-black focus:border-black"
                          value={variant.stock}
                          onChange={(e) => handleStockUpdate(product._id, variant._id, parseInt(e.target.value) || 0, 'set')}
                        />
                        <button 
                          onClick={() => handleStockUpdate(product._id, variant._id, 1, 'increment')}
                          className="p-1 rounded hover:bg-gray-200 text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedVariants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No inventory variants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredVariants.length)}</span> of <span className="font-medium">{filteredVariants.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
