import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginLocal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');

  const navigate = useNavigate();

  // Backend API URL
  const API_URL = 'http://localhost:4011';

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success('Login successful!');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'BUYER') {
            navigate('/buyer/dashboard');
          } else if (data.user.role === 'SELLER') {
            navigate('/seller/dashboard');
          } else if (data.user.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
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
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: otp }),
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome to QuickBid
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account (Local Backend)
          </p>
        </div>

        {!showOTP ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@company.com"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
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
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {loading ? 'Sending OTP...' : 'Send Email OTP'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Enter OTP
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent a 6-digit code to your email
              </p>
              {generatedOTP && (
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
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
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

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

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-gray-500">Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
              className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-transparent hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Create an account
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Demo Accounts:</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleDemoLogin('buyer')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleDemoLogin('seller')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Seller
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLocal;
