import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (isAdmin) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setErrorMessage('Please enter both Admin ID and Password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const result = await loginAdmin(adminId.trim(), password.trim());
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(result.message || 'Invalid Admin ID or Password');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMessage('Invalid Admin ID or Password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl w-full max-w-md space-y-6">

        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-500">Natural Blend • Authorized Management Access</p>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin ID</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter Admin ID"
                value={adminId}
                onChange={(e) => {
                  setAdminId(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          Natural Blend Store • Karaikudi
        </div>
      </div>
    </div>
  );
}
type = "submit"
disabled = { loading }
className = "w-full bg-[#246B45] hover:bg-[#173D2B] text-white py-4 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
  >
{
  loading?(
              <>
  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
              </>
            ) : (
  <>
    <ShieldCheck className="w-5 h-5" /> Secure Admin Login
  </>
)}
          </button >
        </form >

  <div className="text-center text-[11px] text-[#65736A] pt-2 border-t border-[#173D2B]/10">
    Natural Blend Store Management System • Karaikudi
  </div>

      </div >
    </div >
  );
}
