import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { Activity, Filter, Search, User } from 'lucide-react';

export function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        setLogs(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionTypes = Array.from(new Set(logs.map(log => log.actionType)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.adminId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.collectionName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

    return matchesSearch && matchesAction;
  });

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  if (loading) return <div className="p-6">Loading activity logs...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Activity className="w-6 h-6 mr-2 text-gray-400" />
            Activity Log
          </h2>
          <p className="text-gray-500 mt-1">Audit trail of all administrative actions.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by admin name, email, or resource..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-black focus:border-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg py-2 pl-3 pr-8 focus:ring-black focus:border-black"
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>{formatAction(type)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Resource</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.adminId ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{log.adminId.name}</span>
                          <span className="text-xs text-gray-500">{log.adminId.email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">System / Deleted Admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium uppercase tracking-wider">
                      {formatAction(log.actionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{log.collectionName}</span>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">{log.documentId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs text-gray-500 flex flex-col items-end">
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No activity logs match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
