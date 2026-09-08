import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { User, Shield, Key, Monitor, Smartphone, Check, X, ShieldAlert } from 'lucide-react';

interface Session {
  _id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  expiresAt: string;
  isCurrent: boolean;
}

export function Profile() {
  const { currentAdmin } = useAdminAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });
  
  const [twoFaStatus, setTwoFaStatus] = useState({ loading: false, error: '', success: '', qrCode: '', token: '', step: 'init' }); // init, setup, confirm

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/admin/profile/sessions');
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleTerminateSession = async (id: string) => {
    try {
      await api.delete(`/admin/profile/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to terminate session');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus({ loading: true, error: '', success: '' });
    
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setPassStatus({ loading: false, error: 'New passwords do not match', success: '' });
    }
    
    try {
      await api.put('/admin/profile/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassStatus({ loading: false, error: '', success: 'Password updated successfully' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPassStatus({ loading: false, error: err.response?.data?.message || 'Update failed', success: '' });
    }
  };

  const handleEnable2FA = async () => {
    setTwoFaStatus({ ...twoFaStatus, loading: true, error: '' });
    try {
      const { data } = await api.post('/admin/profile/2fa/toggle', { action: 'enable' });
      setTwoFaStatus({ ...twoFaStatus, loading: false, qrCode: data.qrCode, step: 'setup' });
    } catch (err: any) {
      setTwoFaStatus({ ...twoFaStatus, loading: false, error: err.response?.data?.message || 'Failed to start 2FA setup' });
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaStatus({ ...twoFaStatus, loading: true, error: '' });
    try {
      await api.post('/admin/profile/2fa/toggle', { action: 'enable', token: twoFaStatus.token });
      setTwoFaStatus({ loading: false, error: '', success: '2FA Enabled Successfully!', qrCode: '', token: '', step: 'init' });
    } catch (err: any) {
      setTwoFaStatus({ ...twoFaStatus, loading: false, error: err.response?.data?.message || 'Invalid token' });
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaStatus({ ...twoFaStatus, loading: true, error: '' });
    try {
      await api.post('/admin/profile/2fa/toggle', { action: 'disable', token: twoFaStatus.token });
      setTwoFaStatus({ loading: false, error: '', success: '2FA Disabled Successfully.', qrCode: '', token: '', step: 'init' });
    } catch (err: any) {
      setTwoFaStatus({ ...twoFaStatus, loading: false, error: err.response?.data?.message || 'Invalid token' });
    }
  };

  if (!currentAdmin) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Profile</h2>
        <p className="text-gray-500 mt-1">Manage your account settings and active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Password */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              Account Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Name</span>
                <span className="font-medium">{currentAdmin.name}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Email</span>
                <span className="font-medium">{currentAdmin.email}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Role</span>
                <span className="font-medium capitalize bg-gray-100 px-2 py-1 rounded inline-block">{currentAdmin.role.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Custom Permissions</span>
                <span className="font-medium text-xs text-gray-600">
                  {currentAdmin.role === 'super-admin' ? 'Full Access' : (currentAdmin.permissions?.length ? currentAdmin.permissions.join(', ') : 'None')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Key className="w-5 h-5 mr-2 text-gray-400" />
              Change Password
            </h3>
            
            {passStatus.success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {passStatus.success}
              </div>
            )}
            
            {passStatus.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                <X className="w-4 h-4 mr-2" />
                {passStatus.error}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  required 
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-black focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-black focus:border-black"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={passStatus.loading}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {passStatus.loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <ShieldAlert className="w-5 h-5 mr-2 text-gray-400" />
              Two-Factor Authentication (2FA)
            </h3>
            
            {twoFaStatus.success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                {twoFaStatus.success}
              </div>
            )}
            
            {twoFaStatus.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {twoFaStatus.error}
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              Protect your admin account with an extra layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile phone in order to sign in.
            </div>

            {twoFaStatus.step === 'init' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleEnable2FA}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  Setup 2FA
                </button>
                <button 
                  onClick={() => setTwoFaStatus({...twoFaStatus, step: 'disable'})}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Disable 2FA
                </button>
              </div>
            )}

            {twoFaStatus.step === 'setup' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">1. Scan this QR Code in your Authenticator App (Google Authenticator, Authy, etc)</p>
                {twoFaStatus.qrCode && <img src={twoFaStatus.qrCode} alt="2FA QR Code" className="border p-2 rounded-lg w-48 h-48" />}
                <p className="text-sm font-medium">2. Enter the 6-digit code to confirm</p>
                <form onSubmit={handleConfirm2FA} className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="000000"
                    value={twoFaStatus.token}
                    onChange={(e) => setTwoFaStatus({...twoFaStatus, token: e.target.value})}
                    className="w-32 border border-gray-300 rounded-lg p-2 text-center tracking-widest text-lg font-mono focus:ring-black focus:border-black"
                  />
                  <button type="submit" disabled={twoFaStatus.loading} className="bg-black text-white px-4 py-2 rounded-lg font-medium">
                    {twoFaStatus.loading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button type="button" onClick={() => setTwoFaStatus({...twoFaStatus, step: 'init', qrCode: ''})} className="px-4 py-2 text-gray-500">Cancel</button>
                </form>
              </div>
            )}

            {twoFaStatus.step === 'disable' && (
              <form onSubmit={handleDisable2FA} className="space-y-4 bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-red-800 font-medium">Are you sure you want to disable 2FA? This will reduce your account security.</p>
                <p className="text-sm text-red-700">Please enter your current 6-digit authenticator code to confirm.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="000000"
                    value={twoFaStatus.token}
                    onChange={(e) => setTwoFaStatus({...twoFaStatus, token: e.target.value})}
                    className="w-32 border border-gray-300 rounded-lg p-2 text-center tracking-widest text-lg font-mono focus:ring-black focus:border-black"
                  />
                  <button type="submit" disabled={twoFaStatus.loading} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                    Disable
                  </button>
                  <button type="button" onClick={() => setTwoFaStatus({...twoFaStatus, step: 'init'})} className="px-4 py-2 text-gray-600">Cancel</button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Right Column: Sessions */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[800px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0">
              <h3 className="text-lg font-semibold flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-gray-400" />
                Active Sessions
              </h3>
            </div>
            <div className="p-0 overflow-y-auto divide-y divide-gray-100">
              {loadingSessions ? (
                <div className="p-6 text-center text-sm text-gray-500">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No active sessions.</div>
              ) : (
                sessions.map(session => (
                  <div key={session._id} className={`p-4 flex flex-col gap-2 ${session.isCurrent ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {session.deviceInfo.toLowerCase().includes('mobile') ? 
                          <Smartphone className="w-4 h-4 text-gray-400" /> : 
                          <Monitor className="w-4 h-4 text-gray-400" />
                        }
                        <span className="font-medium text-sm text-gray-900 truncate max-w-[180px]" title={session.deviceInfo}>
                          {session.deviceInfo.split(' ')[0]}
                        </span>
                        {session.isCurrent && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>
                      {!session.isCurrent && (
                        <button 
                          onClick={() => handleTerminateSession(session._id)}
                          className="text-xs text-red-600 hover:text-red-700 hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5 ml-6">
                      <p>IP: {session.ipAddress}</p>
                      <p>Last Active: {new Date(session.lastActive).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
