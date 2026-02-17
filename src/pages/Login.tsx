import React, { useState, useEffect, useRef, FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrLoadUserKey } from '../security/keyring';
import { encryptProfileFields } from '../security/secureFields';
import { useAuth } from '../context/UnifiedAuthContext';
import SecureAPIClient from '../utils/secureAPIClient';
import { validateEmail, validatePassword } from '../utils/securityUtils';
import { LogIn, Mail, Lock, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    full_name?: string;
  };
}

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const isLoggingIn = useRef(false);

  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = 'Login - QuickMela Auction Platform';
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    // Only redirect if both token and user exist
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on stored user role
        if (userData.role === 'buyer' || userData.role === 'BUYER') {
          navigate('/buyer/dashboard', { replace: true });
        } else if (userData.role === 'seller' || userData.role === 'SELLER') {
          navigate('/seller/dashboard', { replace: true });
        } else if (userData.role === 'admin' || userData.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsCheckingAuth(false);
  }, [navigate]); // Add navigate as dependency

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple simultaneous login attempts
    if (isLoggingIn.current || loading || authLoading) {
      return;
    }

    // Client-side validation
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      return;
    } else {
      setPasswordError('');
    }

    isLoggingIn.current = true;
    setLoading(true);

    try {
      // Use UnifiedAuthContext login method
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful!');

        // Redirect based on role using user from context
        setTimeout(() => {
          if (user?.role?.toLowerCase() === 'buyer') {
            navigate('/buyer/dashboard', { replace: true });
          } else if (user?.role?.toLowerCase() === 'seller') {
            navigate('/seller/dashboard', { replace: true });
          } else if (user?.role?.toLowerCase() === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1000);
      } else {
        // Error is handled by UnifiedAuthContext
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      isLoggingIn.current = false;
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }

    // Prevent multiple OTP requests
    if (loading) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedOTP(data.otp); // For development - show OTP
        setShowOTP(true);
        toast.success(`OTP sent to ${email}! Development OTP: ${data.otp}`);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully!');
        setShowOTP(false);
        setOTP('');
      } else {
        toast.error(data.message || 'OTP verification failed.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('OTP verification failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (role: string) => {
    const demoAccounts = {
      buyer: { email: 'arjun@quickmela.com', password: 'BuyerPass123!' },
      seller: { email: 'seller1@quickmela.com', password: 'SellerPass123!' },
      admin: { email: 'admin@quickmela.com', password: 'AdminPass123!' }
    };

    const account = demoAccounts[role as keyof typeof demoAccounts];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      toast.success(`Demo credentials loaded for ${role}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error(error.message);
      }
      // OAuth will redirect, no need to handle success here
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initiate Google login');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Basic phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\+91/, ''))) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone.replace(/\+91/, '')}`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('OTP sent to your phone number');
        setShowOTP(true);
      }
    } catch (error) {
      console.error('Phone login error:', error);
      toast.error('Failed to send OTP');
    }
  };

  const handleForgotPasswordSendOTP = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(forgotEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

// ... (rest of the code remains the same)
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50">Skip to main content</a>
        <main id="main-content" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {showForgotPassword ? 'Reset Password' : 'Welcome to QuickMela'}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {showForgotPassword ? 'Enter your email to reset your password' : 'Sign in to your account to continue'}
              </p>
            </div>

            {showForgotPassword ? (
              /* Forgot Password UI */
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setShowOTP(false);
                    setForgotEmail('');
                    setForgotOTP('');
                    setNewPassword('');
                  }}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  ← Back to Login
                </button>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleForgotPasswordSendOTP(); }} >
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-email"
                        name="forgot-email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                      <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Login Method Tabs */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      loginMethod === 'phone'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </button>
                </div>

                {/* Login Forms */}
                {loginMethod === 'email' ? (
                  /* Email Login Form */
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                    <form className="space-y-6" onSubmit={handleLogin}>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Remember me
                          </label>
                        </div>

                        <div className="text-sm">
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors duration-200"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Phone Login Form */
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                    {!showOTP ? (
                      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePhoneLogin(); }} >
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              required
                              className="appearance-none rounded-lg relative block w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                              placeholder="Enter 10-digit number"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">+91</span>
                            </div>
                            <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Enter your 10-digit mobile number
                          </p>
                        </div>

                        <button
                          type="submit"
                          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                          disabled={loading}
                        >
                          {loading ? 'Sending OTP...' : 'Send SMS OTP'}
                        </button>
                      </form>
                    ) : (
                      /* Phone OTP Verification */
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Enter OTP
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            We've sent a 6-digit code to +91{phone}
                          </p>
                        </div>

                        <div>
                          <label htmlFor="phone-otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            OTP Code
                          </label>
                          <input
                            id="phone-otp"
                            name="phone-otp"
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-center text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                            value={otp}
                            onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                          >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowOTP(false);
                              setOTP('');
                            }}
                            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            Back to Phone Login
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Links */}
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    >
                      Create one
                    </Link>
                  </p>

                  {/* Demo Accounts */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-3 text-center">Demo Accounts:</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleDemoLogin('buyer')}
                        className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                      >
                        Buyer
                      </button>
                      <button
                        onClick={() => handleDemoLogin('seller')}
                        className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
                      >
                        Seller
                      </button>
                      <button
                        onClick={() => handleDemoLogin('admin')}
                        className="px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors"
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>
                </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export { Login as default };
