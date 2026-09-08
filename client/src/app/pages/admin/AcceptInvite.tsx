import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../../../lib/axios';

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [inviteDetails, setInviteDetails] = useState<{ email: string; role: string } | null>(null);
  
  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const { data } = await api.get(`/admin/auth/invites/${token}`);
        setInviteDetails(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      validateToken();
    } else {
      setError('No token provided');
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/admin/auth/invites/accept', {
        token,
        name: form.name,
        password: form.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 mb-6">Your admin account has been set up successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Accept Invitation</h1>
          <p className="text-sm text-gray-500 mt-2">Set up your Vancy Admin account</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Invited Email</div>
          <div className="font-medium text-gray-900">{inviteDetails?.email}</div>
          <div className="text-sm text-gray-500 mt-3 mb-1">Role</div>
          <div className="font-medium text-gray-900 capitalize">{inviteDetails?.role.replace('-', ' ')}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black transition-colors"
              placeholder="e.g. Jane Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              required 
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
