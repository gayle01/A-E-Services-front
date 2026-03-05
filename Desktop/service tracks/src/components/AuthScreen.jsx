import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

function isEmailValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function AuthScreen({ onAuthenticate, onResetPassword, initialMode = 'signup', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetFormState = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetPassword('');
    setResetConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setShowResetPassword(false);
    setShowResetConfirm(false);
    setError('');
    setSuccess('');
    setIsResettingPassword(false);
  };

  useEffect(() => {
    setMode(initialMode);
    resetFormState();
  }, [initialMode]);

  const submitLabel = mode === 'signup' ? 'Sign Up' : 'Sign In';
  const signupNameLabel = role === 'company' ? 'Company Name' : 'Full Name';
  const signupNamePlaceholder = role === 'company' ? 'Your company name' : 'Your full name';

  const handleSubmit = () => {
    if (mode === 'signup' && !fullName.trim()) {
      setError(role === 'company' ? 'Enter your company name.' : 'Enter your name.');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    const result = onAuthenticate?.({ mode, role, email, password, fullName: fullName.trim() });
    if (result && result.ok === false) {
      setError(result.error || 'Authentication failed.');
    }
  };

  const handleResetPassword = () => {
    if (!isEmailValid(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (resetPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setError('');
    const result = onResetPassword?.({ email, role, newPassword: resetPassword });
    if (result && result.ok === false) {
      setError(result.error || 'Password reset failed.');
      return;
    }

    setSuccess('Password updated. Sign in with your new password.');
    setIsResettingPassword(false);
    setMode('signin');
    setPassword(resetPassword);
    setResetPassword('');
    setResetConfirmPassword('');
  };

  return (
    <div className="px-1 py-2">
      <div className="relative flex items-center justify-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 inline-flex items-center gap-1 text-blue-600 text-sm font-medium"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 font-['Playfair_Display']">Taskflow</h1>
      </div>

      <div className="w-full bg-slate-50 rounded-full p-1 grid grid-cols-3 gap-1 mb-5">
        {['client', 'company', 'worker'].map((tab) => {
          const active = role === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (role === tab) return;
                setRole(tab);
                resetFormState();
              }}
              className={`py-2 rounded-full text-sm font-semibold transition ${
                active
                  ? 'bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.25)]'
                  : 'bg-transparent text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{signupNameLabel}</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={signupNamePlaceholder}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {!isResettingPassword && (
          <div>
            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {mode === 'signin' && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsResettingPassword(true);
                  }}
                  className="text-xs text-blue-600 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Retype password"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        )}

        {isResettingPassword && (
          <>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder="New password"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showResetPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showResetConfirm ? 'text' : 'password'}
                  value={resetConfirmPassword}
                  onChange={(event) => setResetConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showResetConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      {success && <p className="text-xs text-emerald-600 mt-3">{success}</p>}

      {isResettingPassword ? (
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setIsResettingPassword(false);
            }}
            className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Reset Password
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {submitLabel}
        </button>
      )}

      <p className="text-sm text-gray-600 text-center mt-6">
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            resetFormState();
            setMode((prev) => (prev === 'signup' ? 'signin' : 'signup'));
          }}
          className="text-blue-600 font-semibold hover:underline"
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}

export default AuthScreen;
