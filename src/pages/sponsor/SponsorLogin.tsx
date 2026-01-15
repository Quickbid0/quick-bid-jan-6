import React, { useState } from 'react';
import { sponsorAuthService } from '../../services/sponsorAuthService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SponsorLogin: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sponsorAuthService.requestOtp(email.trim());
      toast.success('OTP sent. Please check your email.');
      setStep('otp');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const auth = await sponsorAuthService.verifyOtp(email.trim(), otp.trim());
      sponsorAuthService.saveAuth(auth);
      toast.success('Logged in as sponsor');
      navigate('/sponsor/dashboard');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sponsor Login</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Login with your registered sponsor email to view campaigns and billing.
        </p>

        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 tracking-[0.3em] text-center"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-xs text-gray-500 mt-2"
            >
              Change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SponsorLogin;
