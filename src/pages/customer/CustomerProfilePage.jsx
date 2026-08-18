import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateCustomerProfile } from '../../services/customerAuthService';

export default function CustomerProfilePage() {
  const { customerUser, customerProfile, refreshCustomerProfile } = useAuth();

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    address: '',
    city: 'Karaikudi',
    state: 'Tamil Nadu',
    pincode: '630001'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (customerProfile || customerUser) {
      setForm({
        displayName: customerProfile?.displayName || customerUser?.displayName || customerProfile?.name || '',
        email: customerProfile?.email || customerUser?.email || '',
        photoURL: customerProfile?.photoURL || customerUser?.photoURL || '',
        address: customerProfile?.address || '',
        city: customerProfile?.city || 'Karaikudi',
        state: customerProfile?.state || 'Tamil Nadu',
        pincode: customerProfile?.pincode || '630001'
      });
      setImgError(false);
    }
  }, [customerProfile, customerUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'photoURL') {
      setImgError(false);
    }
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customerUser || !customerUser.uid) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateCustomerProfile(customerUser.uid, form);
      await refreshCustomerProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayEmail = customerUser?.email || customerProfile?.email || 'Authenticated User';
  const photoURL = form.photoURL || customerUser?.photoURL || customerProfile?.photoURL;
  const rawName = form.displayName || customerProfile?.name || customerUser?.displayName || 'User';
  const userInitial = rawName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-5">
        {photoURL && !imgError ? (
          <img
            src={photoURL}
            alt="Profile Avatar"
            onError={() => setImgError(true)}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#176B4D]/30 shadow-md shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#176B4D] to-[#0D4A35] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-400/30 shrink-0 select-none">
            {userInitial}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage your personal information and default shipping address.</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Read-only Authenticated Google Email */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Authenticated Google Account</span>
            <strong className="text-slate-900 text-sm font-bold">{displayEmail}</strong>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
            Google Auth ✓
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="displayName"
                placeholder="Enter your name"
                value={form.displayName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                readOnly
                disabled
                value={form.email}
                className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Default Shipping Address</label>
            <textarea
              name="address"
              rows={3}
              placeholder="Door No, Street Name, Landmark..."
              value={form.address}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> SAVE PROFILE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
