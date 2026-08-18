import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  signInWithGoogle, 
  signInWithEmailPassword, 
  signUpWithEmailPassword,
  resendVerificationEmail,
  checkVerificationStatus
} from '../../services/customerAuthService';

export default function CustomerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVerificationView, setIsVerificationView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { isCustomerLoggedIn, refreshCustomerProfile, triggerWelcomePopup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isCustomerLoggedIn) {
      navigate(redirectPath, { replace: true });
    }
  }, [isCustomerLoggedIn, navigate, redirectPath]);

  // 60-Second Cooldown Timer for Resend Email
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = (signUpState) => {
    setIsSignUp(signUpState);
    setIsVerificationView(false);
    resetForm();
  };

  // Handle Email & Password Login / Registration Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register New Customer
        const res = await signUpWithEmailPassword(name, email, password);
        if (res.success && res.needsVerification) {
          setIsVerificationView(true);
          setResendCooldown(60);
          setSuccessMessage(`We sent a verification link to ${res.email}. Please check your inbox and click the verification link.`);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        // Sign In Existing Customer
        triggerWelcomePopup();
        const res = await signInWithEmailPassword(email, password);
        if (res.success) {
          await refreshCustomerProfile();
          navigate(redirectPath, { replace: true });
        } else if (res.unverified) {
          setIsVerificationView(true);
          setErrorMessage('Please verify your email before logging in.');
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle "I have verified my email" Click
  const handleCheckVerifiedClick = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await checkVerificationStatus(email, password);
      if (res.verified) {
        triggerWelcomePopup();
        setSuccessMessage('Email verified successfully! Logging you in...');
        await refreshCustomerProfile();
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 600);
      } else {
        setErrorMessage(res.message || 'Your email is not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err) {
      console.error('Verification Check Error:', err);
      setErrorMessage('Unable to check verification status. Please verify your password and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle "Resend verification email" Click
  const handleResendEmailClick = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await resendVerificationEmail(email, password);
      if (res.success) {
        setSuccessMessage(res.message);
        setResendCooldown(60);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error('Resend Email Error:', err);
      setErrorMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      triggerWelcomePopup();
      const result = await signInWithGoogle();
      if (result.success) {
        await refreshCustomerProfile();
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage(result.message || 'Unable to sign in with Google. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage('Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 animate-liquid-gradient overflow-hidden relative font-sans text-[#17251F]">

      {/* Animated Background Blobs */}
      <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-[#176B4D]/15 rounded-full blur-[90px] pointer-events-none animate-blob-1" />
      <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-[#0D4A35]/15 rounded-full blur-[90px] pointer-events-none animate-blob-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Login / Verification Card Panel */}
      <div className="bg-white/95 rounded-[2.5rem] p-6 sm:p-10 border border-[#DCE6E0] shadow-2xl w-full max-w-md space-y-6 relative z-10 text-[#17251F] backdrop-blur-2xl">

        {/* Top Link & Badge */}
        <div className="flex items-center justify-between border-b border-[#DCE6E0] pb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64756D] hover:text-[#176B4D] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0D4A35] bg-[#DDEFE6] px-3 py-1 rounded-full border border-[#DCE6E0]">
            <Leaf className="w-3.5 h-3.5 text-[#176B4D]" /> Karaikudi Store
          </span>
        </div>

        {/* ================= VERIFICATION VIEW SCREEN ================= */}
        {isVerificationView ? (
          <div className="space-y-6 text-center animate-fade-in py-2">
            
            {/* Mail Icon Circle */}
            <div className="w-20 h-20 bg-[#DDEFE6] text-[#176B4D] rounded-full mx-auto flex items-center justify-center border border-[#DCE6E0] shadow-inner animate-float-soft">
              <Mail className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#0D4A35] tracking-tight">
                Verify your email
              </h2>
              <p className="text-xs text-[#64756D] leading-relaxed max-w-xs mx-auto">
                We sent a verification link to <strong className="text-[#0D4A35] font-bold">{email || 'your email address'}</strong>. Please check your inbox and click the verification link.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in font-bold text-left">
                <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="bg-[#DDEFE6] border border-[#DCE6E0] text-[#0D4A35] text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in font-bold text-left">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D] shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Verification Actions */}
            <div className="space-y-3 pt-2">
              
              {/* Button 1: "I have verified my email" */}
              <button
                type="button"
                onClick={handleCheckVerifiedClick}
                disabled={loading}
                className="w-full bg-[#176B4D] hover:bg-[#0D4A35] text-white py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking verification status...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I have verified my email</span>
                  </>
                )}
              </button>

              {/* Button 2: "Resend verification email" */}
              <button
                type="button"
                onClick={handleResendEmailClick}
                disabled={resendCooldown > 0 || resending}
                className="w-full bg-white hover:bg-slate-50 border border-[#DCE6E0] text-[#0D4A35] py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resend in {resendCooldown}s</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Resend verification email</span>
                  </>
                )}
              </button>

              {/* Button 3: "Back to Login" */}
              <button
                type="button"
                onClick={() => {
                  setIsVerificationView(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs font-bold text-[#64756D] hover:text-[#176B4D] pt-2 transition-colors block w-full text-center"
              >
                ← Back to Login
              </button>

            </div>

          </div>
        ) : (
          /* ================= STANDARD LOGIN / SIGN UP FORM ================= */
          <>
            {/* Logo & Store Title */}
            <div className="text-center space-y-2 pt-1">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center shrink-0">
                <div className="w-16 h-16 bg-white rounded-full p-1 shadow-md border border-[#DCE6E0] flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Natural Blend Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D4A35] tracking-tight">
                Natural <span className="text-[#176B4D]">Blend</span>
              </h1>
              <p className="text-xs text-[#64756D]">Pure Natural Care & Homemade Wellness</p>
            </div>

            {/* Tab Switcher: Sign In vs Create Account */}
            <div className="grid grid-cols-2 bg-[#F8FAF6] p-1 rounded-2xl border border-[#DCE6E0] text-xs font-bold">
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className={`py-2.5 rounded-xl transition-all ${!isSignUp ? 'bg-[#176B4D] text-white shadow-xs' : 'text-[#64756D] hover:text-[#0D4A35]'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className={`py-2.5 rounded-xl transition-all ${isSignUp ? 'bg-[#176B4D] text-white shadow-xs' : 'text-[#64756D] hover:text-[#0D4A35]'}`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in font-bold">
                <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="bg-[#DDEFE6] border border-[#DCE6E0] text-[#0D4A35] text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D] shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0D4A35]">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                    />
                    <User className="w-4 h-4 text-[#64756D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Email Address Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0D4A35]">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                  />
                  <Mail className="w-4 h-4 text-[#64756D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0D4A35]">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                  />
                  <Lock className="w-4 h-4 text-[#64756D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64756D] hover:text-[#0D4A35]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#176B4D] hover:bg-[#0D4A35] text-white py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#DCE6E0] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#64756D] shrink-0 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Google Sign-In Action */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 border border-[#DCE6E0] text-[#0D4A35] py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xs transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-[#64756D] border-t border-[#DCE6E0]">
          Secured by Firebase Authentication • Natural Blend
        </div>

      </div>
    </div>
  );
}
