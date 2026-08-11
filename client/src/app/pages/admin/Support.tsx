import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useState } from "react";
import { Search, Filter, Send, ChevronDown, ChevronUp, UserPlus, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Support() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/support', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    }
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data } = await api.get('/admin/staff', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, assignedTo }: { id: string, status?: string, assignedTo?: string }) => {
      const payload: any = {};
      if (status) payload.status = status;
      if (assignedTo !== undefined) payload.assignedTo = assignedTo;

      const { data } = await api.put(`/support/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string, message: string }) => {
      const { data } = await api.post(`/support/${id}/reply`, { message }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    }
  });

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = ticket._id.includes(searchTerm) || ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || (ticket.user && ticket.user.email.includes(searchTerm));
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const STATUSES = ['raised', 'under_review', 'replied', 'return_accepted', 'returned', 'resolved', 'reopened'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Support Tickets</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID, Subject, or Email..." 
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
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Ticket ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Category / Subject</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket: any) => (
                  <TicketRow 
                    key={ticket._id} 
                    ticket={ticket} 
                    staffList={staffList}
                    updateStatusMutation={updateStatusMutation} 
                    replyMutation={replyMutation} 
                    STATUSES={STATUSES}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TicketRow({ ticket, staffList, updateStatusMutation, replyMutation, STATUSES }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate({ id: ticket._id, message: replyMessage });
    setReplyMessage('');
  };

  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 font-medium text-gray-900">
          #{ticket._id.substring(18)}
          <div className="text-xs text-gray-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{ticket.user?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{ticket.user?.email || 'N/A'}</div>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest bg-gray-100 text-gray-800 mb-1">
            {ticket.category}
          </span>
          <div className="truncate max-w-[200px] text-gray-900 text-xs">{ticket.subject}</div>
        </td>
        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
          <select 
            value={ticket.assignedTo?._id || ''} 
            onChange={(e) => updateStatusMutation.mutate({ id: ticket._id, assignedTo: e.target.value })}
            className="text-xs border-gray-300 rounded-md focus:ring-black focus:border-black p-1 w-full max-w-[150px]"
          >
            <option value="">Unassigned</option>
            {staffList.map((staff: any) => (
              <option key={staff._id} value={staff._id}>{staff.name}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
          <select
            value={ticket.status}
            onChange={(e) => updateStatusMutation.mutate({ id: ticket._id, status: e.target.value })}
            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 uppercase tracking-wider ${
              ['resolved', 'closed'].includes(ticket.status) ? 'bg-gray-100 text-gray-800 focus:ring-gray-500' :
              ticket.status === 'raised' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' :
              'bg-blue-100 text-blue-800 focus:ring-blue-500'
            }`}
          >
            {STATUSES.map((s: string) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </td>
        <td className="px-6 py-4 text-right">
          <button className="text-gray-400 hover:text-black transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
            {isExpanded ? <ChevronUp className="w-5 h-5 inline" /> : <ChevronDown className="w-5 h-5 inline" />}
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
                <div className="p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Status Tracker */}
                    <div className="mb-6 flex items-center justify-between relative text-xs text-gray-500 uppercase tracking-widest font-medium">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2 z-0"></div>
                      {STATUSES.map((step: string) => {
                        const isPassed = ticket.statusHistory.some((h:any) => h.status === step);
                        const isCurrent = ticket.status === step;
                        return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ring-4 ring-gray-50 ${isPassed || isCurrent ? 'bg-black' : 'bg-gray-300'}`}></div>
                          <span className="hidden sm:block text-[8px]">{step.replace('_', ' ')}</span>
                        </div>
                      )})}
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                      {ticket.thread.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-widest">{msg.sender} {msg.senderRole ? `(${msg.senderRole})` : ''}</span>
                          <div className={`p-4 rounded-lg max-w-[80%] text-sm shadow-sm ${
                            msg.sender === 'Admin' 
                              ? 'bg-black text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            {msg.images && msg.images.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {msg.images.map((img:string, i:number) => (
                                  <a href={img} target="_blank" rel="noreferrer" key={i}>
                                    <img src={img} className="w-24 h-24 object-cover border border-gray-200 rounded" alt="attachment" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    
                    {!['resolved', 'closed'].includes(ticket.status) && (
                      <form onSubmit={handleReply} className="mt-4 flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Type your reply here..." 
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                        <button 
                          type="submit" 
                          disabled={replyMutation.isPending}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Reply
                        </button>
                      </form>
                    )}
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
