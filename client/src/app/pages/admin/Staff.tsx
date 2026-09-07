import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { UserCog, Plus, X, Mail, Phone, ShieldAlert, Check } from "lucide-react";

export function Staff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '', role: 'support-staff' });
  const [inviting, setInviting] = useState(false);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/admin/staff");
      setStaff(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdating(id);
    try {
      await api.put(`/admin/staff/${id}/role`, { role: newRole });
      await fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post('/admin/staff/invite', inviteForm);
      alert("Staff invited successfully. An email with credentials has been sent.");
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', phone: '', role: 'support-staff' });
      await fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to invite staff");
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="p-6">Loading staff...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Staff
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto pr-24 lg:pr-32">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email / Phone</th>
                <th className="px-6 py-4 font-medium">Current Role</th>
                <th className="px-6 py-4 font-medium text-right">Update Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <UserCog className="w-5 h-5 text-gray-500" />
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {user.phone && <span className="text-xs text-gray-400 mt-0.5">{user.phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={user.role}
                      disabled={updating === user._id}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border border-gray-300 rounded p-1 text-xs outline-none focus:ring-black focus:border-black"
                    >
                      <option value="customer">Demote to Customer</option>
                      <option value="support-staff">Support Staff</option>
                      <option value="manager">Manager</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Invite Staff Member</h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 text-sm focus:ring-black focus:border-black"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="tel" 
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 text-sm focus:ring-black focus:border-black"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Role</label>
                  <select 
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                  >
                    <option value="support-staff">Support Staff (Limited Access)</option>
                    <option value="manager">Manager (Standard Access)</option>
                    <option value="super-admin">Super Admin (Full Access)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    This can be changed later from the staff list.
                  </p>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="invite-form"
                disabled={inviting}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 flex items-center"
              >
                {inviting ? 'Sending Invite...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
