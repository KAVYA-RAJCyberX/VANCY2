import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useState } from "react";
import { Search, Filter, EyeOff, Eye, Star } from "lucide-react";

export function Reviews() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("All");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data } = await api.get('/reviews', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    }
  });

  const toggleHideMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/reviews/${id}/hide`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    }
  });

  const filteredReviews = reviews.filter((rev: any) => {
    const matchesSearch = rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rev.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rev.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "All" || rev.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Reviews Moderation</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by keyword, product, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-gray-400 w-4 h-4" />
            <select 
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-black focus:border-black block p-2 transition-all w-full sm:w-auto"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium w-1/3">Review</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading reviews...</td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No reviews found.</td>
                </tr>
              ) : (
                filteredReviews.map((rev: any) => (
                  <tr key={rev._id} className={`hover:bg-gray-50/50 transition-colors ${rev.isHidden ? 'bg-red-50/30 opacity-75' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={rev.product?.image} className="w-10 h-14 object-cover rounded bg-gray-100" alt="product" />
                        <span className="font-medium text-gray-900 truncate max-w-[150px] block">{rev.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{rev.user?.name || rev.name}</div>
                      <div className="text-xs text-gray-500">{rev.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 line-clamp-2 text-xs">{rev.comment}</p>
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {rev.images.map((img:string, i:number) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer">
                              <img src={img} className="w-8 h-8 object-cover border border-gray-200 rounded" alt="attachment" />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest ${rev.isHidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {rev.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleHideMutation.mutate(rev._id)} 
                        className="text-gray-500 hover:text-black transition-colors flex items-center justify-end gap-1 ml-auto"
                      >
                        {rev.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-xs uppercase tracking-widest">{rev.isHidden ? 'Unhide' : 'Hide'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
