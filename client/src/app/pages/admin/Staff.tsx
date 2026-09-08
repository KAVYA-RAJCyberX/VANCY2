import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { UserCog, Plus, X, Mail, Phone, ShieldAlert, Check } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users & Customers' },
  { id: 'manage_products', label: 'Manage Products & Inventory' },
  { id: 'manage_orders', label: 'Manage Orders & Returns' },
  { id: 'view_analytics', label: 'View Analytics & Dashboard' },
  { id: 'manage_settings', label: 'Manage Settings & Coupons' }
];

export function Staff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '', role: 'support-staff', permissions: [] as string[] });
  const [inviting, setInviting] = useState(false);

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessForm, setAccessForm] = useState({ id: '', role: '', permissions: [] as string[] });

  const fetchData = async () => {
    try {
      const [staffRes, invitesRes] = await Promise.all([
        api.get("/admin/staff"),
        api.get("/admin/staff/invites")
      ]);
      setStaff(staffRes.data);
      setInvites(invitesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(accessForm.id);
    try {
      await api.put(`/admin/staff/${accessForm.id}/access`, { 
        role: accessForm.role,
        permissions: accessForm.permissions 
      });
      setIsAccessModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update access");
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
      setInviteForm({ name: '', email: '', phone: '', role: 'support-staff', permissions: [] });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to invite staff");
    } finally {
      setInviting(false);
    }
  };

  const togglePermission = (form: any, setForm: any, permId: string) => {
    const isSelected = form.permissions.includes(permId);
    setForm({
      ...form,
      permissions: isSelected 
        ? form.permissions.filter((p: string) => p !== permId)
        : [...form.permissions, permId]
    });
  };

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'invites'

  if (loading) return <div className="p-6">Loading staff...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const handleResendInvite = async (id: string) => {
    try {
      await api.post(`/admin/staff/invites/${id}/resend`);
      alert("Invitation resent.");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to resend invite");
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    try {
      await api.post(`/admin/staff/invites/${id}/cancel`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel invite");
    }
  };

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

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('staff')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'staff' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Active Staff
        </button>
        <button 
          onClick={() => setActiveTab('invites')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invites' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Pending Invitations
          {invites.filter((i: any) => i.status === 'pending').length > 0 && (
            <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {invites.filter((i: any) => i.status === 'pending').length}
            </span>
          )}
        </button>
      </div>
      
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto pr-24 lg:pr-32">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email / Phone</th>
                  <th className="px-6 py-4 font-medium">Role & Permissions</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                        {user.role !== 'super-admin' && user.permissions?.length > 0 && (
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                            {user.permissions.length} Custom Permissions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={updating === user._id}
                        onClick={() => {
                          setAccessForm({ id: user._id, role: user.role, permissions: user.permissions || [] });
                          setIsAccessModalOpen(true);
                        }}
                        className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {updating === user._id ? 'Updating...' : 'Manage Access'}
                      </button>
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
      )}

      {activeTab === 'invites' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto pr-24 lg:pr-32">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role & Permissions</th>
                  <th className="px-6 py-4 font-medium">Status & Expiry</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invites.map((invite) => (
                  <tr key={invite._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      {invite.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          invite.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                          invite.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {invite.role}
                        </span>
                        {invite.role !== 'super-admin' && invite.permissions?.length > 0 && (
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                            {invite.permissions.length} Custom Permissions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          invite.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invite.status}
                        </span>
                        {invite.status === 'pending' && (
                          <span className="text-[10px] text-gray-500">
                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invite.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResendInvite(invite._id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded transition-colors"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleCancelInvite(invite._id)}
                            className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No invitations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Access Management Modal */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Manage Access</h3>
              <button 
                onClick={() => setIsAccessModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="access-form" onSubmit={handleUpdateAccess} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Base Role</label>
                  <select 
                    value={accessForm.role}
                    onChange={(e) => setAccessForm({...accessForm, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                  >
                    <option value="customer">Demote to Customer</option>
                    <option value="support-staff">Support Staff</option>
                    <option value="manager">Manager</option>
                    <option value="super-admin">Super Admin (Full Access)</option>
                  </select>
                </div>

                {accessForm.role !== 'super-admin' && accessForm.role !== 'customer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Custom Permissions</label>
                    <div className="space-y-2">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <label key={perm.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="checkbox"
                            checked={accessForm.permissions.includes(perm.id)}
                            onChange={() => togglePermission(accessForm, setAccessForm, perm.id)}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                          />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="access-form"
                disabled={!!updating}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 flex items-center"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
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
                
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-sm text-blue-800">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <p>If the email belongs to an existing customer, their account will be upgraded to staff access automatically.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Base Role</label>
                  <select 
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
                  >
                    <option value="support-staff">Support Staff (Limited Access)</option>
                    <option value="manager">Manager (Standard Access)</option>
                    <option value="super-admin">Super Admin (Full Access)</option>
                  </select>
                </div>

                {inviteForm.role !== 'super-admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Custom Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="checkbox"
                            checked={inviteForm.permissions.includes(perm.id)}
                            onChange={() => togglePermission(inviteForm, setInviteForm, perm.id)}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                          />
                          <span className="text-xs text-gray-700 font-medium">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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
