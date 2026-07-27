import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../lib/axios";

export function AdminLogin() {
  const [step, setStep] = useState<'login' | 'setup-2fa' | 'verify-2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/auth/login', { email, password });
      setUserId(data.userId);
      if (data.setupRequired) {
        setQrCode(data.qrCode);
        setStep('setup-2fa');
      } else {
        setStep('verify-2fa');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/auth/verify-2fa', { userId, token: twoFactorToken });
      // Store token (or rely on httpOnly cookies)
      localStorage.setItem('admin_access_token', data.accessToken);
      // We should ideally have a useAdminAuthStore, but for now redirect
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">Vancy Admin</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-200 rounded">
            {error}
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white p-3 rounded font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Continue
            </button>
          </form>
        )}

        {step === 'setup-2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-6 text-center">
            <h2 className="text-lg font-medium">Set up 2FA</h2>
            <p className="text-sm text-gray-500">Scan this QR code with Google Authenticator or Authy to secure your account.</p>
            <div className="flex justify-center p-4 bg-gray-50 rounded">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit code</label>
              <input 
                type="text"
                maxLength={6}
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white p-3 rounded font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Verify & Login
            </button>
          </form>
        )}

        {step === 'verify-2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-6 text-center">
            <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500">Enter the 6-digit code from your authenticator app.</p>
            <div>
              <input 
                type="text"
                maxLength={6}
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-300 p-3 rounded text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white p-3 rounded font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Verify & Login
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
