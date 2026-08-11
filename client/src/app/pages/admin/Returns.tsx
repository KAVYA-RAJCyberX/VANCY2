import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useState } from "react";
import { Search, Filter, RefreshCcw, Check, X, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Returns() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const { data } = await api.get('/returns', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes, refundMethod }: { id: string, status: string, adminNotes?: string, refundMethod?: string }) => {
      const { data } = await api.put(`/returns/${id}/status`, { status, adminNotes, refundMethod }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
    }
  });

  const filteredReturns = returns.filter((req: any) => {
    const matchesSearch = req._id.includes(searchTerm) || req.orderId.includes(searchTerm) || (req.user && req.user.email.includes(searchTerm));
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Requested': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Picked Up': return 'bg-purple-100 text-purple-800';
      case 'In Transit': return 'bg-indigo-100 text-indigo-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Returns & Exchanges</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID, Order, or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-gray-400 w-4 h-4" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-black focus:border-black block p-2 transition-all w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Requested">Requested</option>
              <option value="Approved">Approved</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Processed">Processed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Request ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading requests...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((req: any) => (
                  <RequestRow key={req._id} req={req} updateStatusMutation={updateStatusMutation} getStatusColor={getStatusColor} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ req, updateStatusMutation, getStatusColor }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(req.adminNotes || '');

  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 font-medium text-gray-900">
          #{req._id.substring(18)}
          <div className="text-xs text-gray-500 mt-1">Ord: #{req.orderId.substring(18)}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{req.user?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{req.user?.email || 'N/A'}</div>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-gray-100 text-gray-800">
            {req.type}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-500">
          {new Date(req.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(req.status)}`}>
            {req.status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button className="text-gray-400 hover:text-black transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
            {isExpanded ? 'Hide' : 'Review'}
          </button>
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr className="bg-gray-50">
            <td colSpan={6} className="px-0 py-0">
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-gray-200"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Items to {req.type}</h4>
                    <div className="space-y-4">
                      {req.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 bg-white p-4 rounded-md border border-gray-200">
                          <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded bg-gray-100" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mb-2">Qty: {item.qty} | Size: {item.size}</p>
                            <div className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded inline-block">
                              Reason: {item.reason}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {req.notes && (
                      <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Customer Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{req.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 rounded-md border border-gray-200">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Process {req.type}</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes</label>
                        <textarea 
                          rows={2}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black sm:text-sm"
                          placeholder="Internal notes..."
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        {req.status === 'Requested' && (
                          <>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Approved', adminNotes })}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-black hover:bg-gray-800"
                            >
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Rejected', adminNotes })}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </button>
                          </>
                        )}
                        
                        {req.status === 'Approved' && (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Picked Up', adminNotes })}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Truck className="w-3 h-3 mr-1" /> Mark Picked Up
                          </button>
                        )}
                        
                        {(req.status === 'Picked Up' || req.status === 'In Transit') && (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Processed', adminNotes })}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                          >
                            <RefreshCcw className="w-3 h-3 mr-1" /> Complete Processing
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
