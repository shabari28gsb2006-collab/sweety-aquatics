import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';
import { toastService } from '../../services/toastService';
import { X, CheckCircle2, ShieldCheck, Mail, Lock, User as UserIcon, Phone, ArrowRight, RefreshCw, Eye, EyeOff, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'otp';
  reasonMessage?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  reasonMessage,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'reset'>(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [hintOtp, setHintOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode);
    setOtpError('');
    setVerificationSuccess(false);
  }, [initialMode, isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if ((mode === 'otp' || mode === 'reset') && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!loginEmail || !loginPassword) {
      toastService.error('Enter your email and password');
      return;
    }
    setIsSubmitting(true);
    const res = await authService.loginWithCredentials(loginEmail.trim(), loginPassword);
    setIsSubmitting(false);
    if (res.success) {
      toastService.success('Welcome back!', 'Successfully signed in.');
      if (onSuccess) onSuccess();
      onClose();
      return;
    }
    if (res.requiresVerification) {
      setEmail(loginEmail);
      setTimer(45);
      setCanResend(false);
      setMode('otp');
      toastService.warning('Email Verification Required', res.message);
      return;
    }
    toastService.error('Unable to Sign In', res.message || 'Please check your credentials.');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name.trim()) return toastService.error('Please enter your full name');
    if (!email.trim() || !email.includes('@')) return toastService.error('Please enter a valid email address');
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))) return toastService.error('Enter a valid 10-digit Indian mobile number');
    if (!password || password.length < 6) return toastService.error('Password must contain at least 6 characters');
    if (password !== confirmPassword) return toastService.error('Passwords do not match');
    if (!acceptTerms) return toastService.error('Please accept store terms and conditions');

    try {
      setIsSubmitting(true);
      const result = await authService.registerUser({ name, email, phone, password });
      setHintOtp(result.mockOtp || '');
      setTimer(45);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setMode('otp');
      toastService.info('Verification OTP Sent', `A 6-digit code was sent to ${email}`);
    } catch (error) {
      toastService.error('Registration Failed', error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) return toastService.error('Please enter a valid email address');
    try {
      setIsSubmitting(true);
      await authService.forgotPassword(normalizedEmail);
      setResetEmail(normalizedEmail);
      setResetOtp('');
      setTimer(45);
      setCanResend(false);
      setMode('reset');
      toastService.info('Password Reset OTP Sent', `Check ${normalizedEmail} for the 6-digit code.`);
    } catch (error) {
      toastService.error('Unable to Send OTP', error instanceof Error ? error.message : 'Please try again shortly');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!/^\d{6}$/.test(resetOtp)) return toastService.error('Enter the 6-digit OTP sent to your email');
    if (newPassword.length < 6) return toastService.error('New password must contain at least 6 characters');
    if (newPassword !== confirmNewPassword) return toastService.error('New passwords do not match');
    try {
      setIsSubmitting(true);
      await authService.resetPassword(resetEmail, resetOtp, newPassword);
      setLoginEmail(resetEmail);
      setLoginPassword('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setMode('login');
      toastService.success('Password Updated', 'Sign in using your new password.');
    } catch (error) {
      toastService.error('Password Reset Failed', error instanceof Error ? error.message : 'Check your OTP and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (!canResend || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await authService.forgotPassword(resetEmail);
      setTimer(45);
      setCanResend(false);
      toastService.info('Fresh OTP Sent', 'Check your email for the new password-reset code.');
    } catch (error) {
      toastService.error('Unable to resend OTP', error instanceof Error ? error.message : 'Please retry shortly');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (digit && index === 5 && newDigits.every((d) => d.length === 1)) {
      triggerVerification(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      triggerVerification(pasted);
    }
  };

  const triggerVerification = async (codeToVerify: string) => {
    setIsVerifying(true);
    const res = await authService.verifyOtp(codeToVerify);
    setIsVerifying(false);
    if (res.success) {
      setVerificationSuccess(true);
      toastService.success('Email Verified ✓', 'Your account is now ready for ordering.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 150);
    } else {
      setOtpError(res.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await authService.resendOtp();
      setHintOtp(res.mockOtp || '');
      setTimer(45);
      setCanResend(false);
      setOtpError('');
      toastService.info('Fresh OTP Sent', 'Check your email for the new code.');
    } catch (error) {
      toastService.error('Unable to resend OTP', error instanceof Error ? error.message : 'Please retry shortly');
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="auth-modal-card"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Aquatic Header Accent */}
        <div className="bg-gradient-to-br from-[#021E31] via-[#064463] to-[#0875B5] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#50D4EE]/20 blur-xl pointer-events-none"></div>
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#50D4EE]/20 border border-[#50D4EE]/40 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#50D4EE]" />
          </div>
          <h3 className="font-bold text-lg font-['Manrope',sans-serif]">Sweety Birds & Fishes</h3>
          <p className="text-xs text-[#E8F9FC]/90 mt-1 max-w-xs mx-auto">
            {reasonMessage || 'Sign in or create a verified customer account to add to cart, save favorites, and place orders.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode Switcher Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-[#0875B5] text-[#0875B5]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-[#0875B5] text-[#0875B5]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. karthik.tn@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] text-slate-800"
                  />
                  <button type="button" onClick={() => setShowLoginPassword((value) => !value)} className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-[#0875B5]" aria-label={showLoginPassword ? 'Hide password' : 'Show password'}>
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="button" onClick={() => { setResetEmail(loginEmail.trim()); setMode('forgot'); }} className="mt-2 text-[11px] font-semibold text-[#0875B5] hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0875B5] hover:bg-[#064463] disabled:opacity-60 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In to Sweety Birds & Fishes'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* MODE: REQUEST PASSWORD RESET */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
                <h4 className="font-bold text-slate-800 text-sm mt-3">Forgot Password</h4>
                <p className="text-xs text-slate-500 mt-1">We will send a 6-digit password-reset OTP to your verified email.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Your registered email" className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0875B5] hover:bg-[#064463] disabled:opacity-60 text-white text-xs font-semibold py-3 rounded-xl shadow-md">
                {isSubmitting ? 'Sending OTP...' : 'Send Password Reset OTP'}
              </button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-semibold text-slate-500 hover:text-[#0875B5]">Back to Sign In</button>
            </form>
          )}

          {/* MODE: VERIFY RESET OTP AND CREATE PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="text-center">
                <h4 className="font-bold text-slate-800 text-sm">Verify OTP & Create Password</h4>
                <p className="text-xs text-slate-500 mt-1">Enter the code sent to <span className="font-semibold text-slate-700">{resetEmail}</span></p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">6-digit OTP</label>
                <input type="text" inputMode="numeric" maxLength={6} required value={resetOtp} onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full text-center tracking-[0.35em] font-mono font-bold px-3 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full text-xs pl-3 pr-10 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
                  <button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-2.5 text-slate-400 hover:text-[#0875B5]" aria-label={showNewPassword ? 'Hide password' : 'Show password'}>{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmNewPassword ? 'text' : 'password'} required minLength={6} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Repeat new password" className="w-full text-xs pl-3 pr-10 py-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
                  <button type="button" onClick={() => setShowConfirmNewPassword((value) => !value)} className="absolute right-3 top-2.5 text-slate-400 hover:text-[#0875B5]" aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}>{showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <button type="button" onClick={() => setMode('forgot')} className="text-slate-500 hover:underline">Change Email</button>
                {canResend ? <button type="button" onClick={handleResendResetOtp} className="font-semibold text-[#0875B5] hover:underline">Resend OTP</button> : <span className="font-mono text-slate-400">Resend in {timer}s</span>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0875B5] hover:bg-[#064463] disabled:opacity-60 text-white text-xs font-semibold py-3 rounded-xl shadow-md">
                {isSubmitting ? 'Updating Password...' : 'Verify OTP & Update Password'}
              </button>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-8 pr-2 py-2 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 9840..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-2 py-2 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs pl-3 pr-9 py-2 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2.5 top-2 text-slate-400 hover:text-[#0875B5]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} required minLength={6} placeholder="Repeat" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full text-xs pl-3 pr-9 py-2 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-2.5 top-2 text-slate-400 hover:text-[#0875B5]" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-sky-300 text-[#0875B5] focus:ring-[#0875B5]"
                />
                <label htmlFor="chk-terms" className="text-[11px] text-slate-600">
                  I accept the store terms & live transit guidelines
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0875B5] hover:bg-[#064463] disabled:opacity-60 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Creating Account...' : 'Continue to Email Verification'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* MODE: OTP VERIFICATION */}
          {mode === 'otp' && (
            <div className="space-y-4">
              {verificationSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">Email Verified ✓</h4>
                  <p className="text-xs text-slate-600">Welcome to Sweety Birds & Fishes! Redirecting to your shopping...</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm">Verify Your Email</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{email || authService.getPendingEmail() || 'your email'}</span>
                    </p>
                  </div>

                  {/* 6-digit OTP Inputs */}
                  <div className="flex justify-center gap-2 my-4">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-10 h-12 text-center text-lg font-bold font-mono bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] focus:ring-2 focus:ring-sky-200 transition-all text-slate-800"
                      />
                    ))}
                  </div>

                  {(hintOtp || authService.getCurrentOtpHint()) && (
                    <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-center">
                      <p className="text-[11px] text-slate-600">
                        Development OTP: <span className="font-mono font-bold text-[#0875B5] text-xs">{hintOtp || authService.getCurrentOtpHint()}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">This helper appears only when the backend is running without SMTP in development.</p>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-xs text-rose-600 text-center font-medium bg-rose-50 py-1.5 px-3 rounded-lg">
                      {otpError}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="hover:underline text-slate-600"
                    >
                      Change Email
                    </button>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[#0875B5] font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    ) : (
                      <span className="font-mono text-slate-400">Resend in {timer}s</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isVerifying || otpDigits.some((d) => !d)}
                    onClick={() => triggerVerification(otpDigits.join(''))}
                    className="w-full bg-[#0875B5] hover:bg-[#064463] disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isVerifying ? 'Verifying Code...' : 'Confirm & Complete Registration'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
