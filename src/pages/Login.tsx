import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrLoadUserKey } from '../security/keyring';
import { encryptProfileFields } from '../security/secureFields';
import { useUnifiedAuth } from '../context/UnifiedAuthContext';
import SecureAPIClient from '../utils/secureAPIClient';
import { validateEmail, validatePassword } from '../utils/securityUtils';
import { LogIn, Mail, Lock, Eye, EyeOff, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const isLoggingIn = useRef(false);

  const navigate = useNavigate();

  // Backend API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4011';

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
    if (isLoggingIn.current || loading) {
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
      const response = await SecureAPIClient.login({ email, password }) as LoginResponse;

      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Login successful!');

      // Redirect based on role
      setTimeout(() => {
        if (response.user.role === 'buyer' || response.user.role === 'BUYER') {
          navigate('/buyer/dashboard', { replace: true });
        } else if (response.user.role === 'seller' || response.user.role === 'SELLER') {
          navigate('/seller/dashboard', { replace: true });
        } else if (response.user.role === 'admin' || response.user.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 1000);
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
      buyer: { email: 'buyer@quickbid.com', password: 'QuickBid2026!' },
      seller: { email: 'seller@quickbid.com', password: 'QuickBid2026!' },
      admin: { email: 'founder@quickbid.com', password: 'QuickBid2026!' }
    };

    const account = demoAccounts[role as keyof typeof demoAccounts];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      toast.success(`Demo credentials loaded for ${role}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50">Skip to main content</a>
        <main id="main-content" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg" aria-labelledby="login-heading">
          <h1 id="login-heading" className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome to QuickMela
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400" aria-describedby="login-description">
            Sign in to your account (Local Backend)
          </p>
          <div id="login-description" className="sr-only">
            Enter your email and password to access your QuickMela account. New users can create an account using the registration link below.
          </div>

        {!showOTP ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin} role="form" aria-labelledby="login-form-heading">
            <div className="space-y-4" role="group" aria-labelledby="credentials-heading">
              <h3 id="credentials-heading" className="sr-only">Login Credentials</h3>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="email-input"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  data-testid="password-input"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="password-help"
                  aria-required="true"
                />
                <div id="password-help" className="sr-only">
                  Enter your password to sign in to your account
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                data-testid="login-button"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-describedby={loading ? "login-status" : undefined}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <div id="login-status" className="sr-only" aria-live="polite">
                {loading ? 'Signing in to your account' : ''}
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-describedby={loading ? "otp-status" : undefined}
              >
                <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                {loading ? 'Sending OTP...' : 'Send Email OTP'}
              </button>
              <div id="otp-status" className="sr-only" aria-live="polite">
                {loading ? 'Sending one-time password to your email' : ''}
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6" role="region" aria-labelledby="otp-heading">
            <div className="text-center">
              <h3 id="otp-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Enter OTP
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400" aria-describedby="otp-description">
                We've sent a 6-digit code to your email
              </p>
              <div id="otp-description" className="sr-only">
                A one-time password has been sent to your email address. Enter the 6-digit code to complete verification.
              </div>
              {generatedOTP && (
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400" aria-live="polite">
                  Development OTP: {generatedOTP}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-lg"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                aria-describedby="otp-input-help"
                aria-required="true"
                inputMode="numeric"
                pattern="[0-9]{6}"
              />
              <div id="otp-input-help" className="sr-only">
                Enter the 6-digit one-time password sent to your email
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
                aria-describedby={loading ? "verify-status" : undefined}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div id="verify-status" className="sr-only" aria-live="polite">
                {loading ? 'Verifying your one-time password' : ''}
              </div>

              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6" role="region" aria-labelledby="account-options">
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-gray-500" aria-describedby="registration-help">
              Don't have an account?
            </p>
            <div id="registration-help" className="sr-only">
              Create a new account to start buying and selling on QuickMela
            </div>
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-transparent hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              aria-describedby="register-help"
            >
              Create an account
            </Link>
            <div id="register-help" className="sr-only">
              Navigate to the registration page to create a new QuickMela account
            </div>
            
            <div className="text-center" role="region" aria-labelledby="demo-accounts">
              <p id="demo-accounts" className="text-xs text-gray-500 mb-2">Demo Accounts:</p>
              <div className="flex gap-2 justify-center" role="group" aria-label="Demo account options">
                <button
                  onClick={() => handleDemoLogin('buyer')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  aria-label="Load demo buyer account credentials"
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleDemoLogin('seller')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
                  aria-label="Load demo seller account credentials"
                >
                  Seller
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors"
                  aria-label="Load demo admin account credentials"
                >
                  Admin
                </button>
              </div>
              <div className="sr-only" aria-live="polite" id="demo-status">
                {email && password ? `Demo credentials loaded: ${email}` : ''}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default Login;
