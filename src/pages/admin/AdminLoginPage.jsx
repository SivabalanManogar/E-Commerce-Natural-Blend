import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setErrorMessage('Please enter both Admin ID and Password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await loginAdmin(adminId.trim(), password.trim());
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMessage('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 animate-liquid-gradient overflow-hidden relative font-sans text-[#18231D]">
      
      {/* Animated Floating Organic Blobs */}
      <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-[#246B45]/20 rounded-full blur-[90px] pointer-events-none animate-blob-1" />
      <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-[#10291D]/15 rounded-full blur-[90px] pointer-events-none animate-blob-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Full-Page Translucent Glass Card */}
      <div className="glass-panel rounded-[2.5rem] p-8 sm:p-12 border border-white/80 shadow-2xl w-full max-w-lg space-y-6 relative z-10 text-[#18231D] backdrop-blur-2xl">
        
        {/* Top Header & Store Link */}
        <div className="flex items-center justify-between border-b border-[#173D2B]/10 pb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#65736A] hover:text-[#246B45] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Storefront
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#246B45] bg-[#EEF2EA] px-3 py-1 rounded-full border border-[#173D2B]/10">
            <ShieldCheck className="w-3.5 h-3.5" /> Portal Security
          </span>
        </div>

        {/* Header Logo (UNCHANGED) */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center shrink-0">
            <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl border-2 border-[#246B45]/30 flex items-center justify-center animate-float-soft">
              <img src="/logo.png" alt="Natural Blend Logo" className="w-full h-full object-contain rounded-full" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#173D2B] tracking-tight leading-none">
            Admin Portal Login
          </h1>
          <p className="text-xs text-[#65736A] font-medium">
            Authorized Store Management Portal • M. Kavitha M.Sc
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-[#D95C5C] text-xs p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#D95C5C] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
          <div>
            <label className="block font-extrabold text-[#173D2B] mb-1">Admin ID *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-white/80 border border-[#173D2B]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45] focus:bg-white transition-all shadow-inner"
              />
              <User className="w-4 h-4 text-[#65736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-[#173D2B] mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/80 border border-[#173D2B]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45] focus:bg-white transition-all shadow-inner"
              />
              <Lock className="w-4 h-4 text-[#65736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#246B45] hover:bg-[#173D2B] text-white py-4 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Secure Admin Login
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-[#65736A] pt-2 border-t border-[#173D2B]/10">
          Natural Blend Store Management System • Karaikudi
        </div>

      </div>
    </div>
  );
}
