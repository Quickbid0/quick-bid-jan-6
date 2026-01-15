import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Camera, Loader2, Eye, EyeOff, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { createOrLoadUserKey } from '../security/keyring';
import { encryptProfileFields } from '../security/secureFields';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    password: '',
    idproof: null,
    userType: 'buyer', // New field for user type
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: { emailRedirectTo: import.meta.env.VITE_SITE_URL },
      });
      if (error) throw error;
      toast.success('Verification email resent. Please check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        idproof: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(typeof reader.result === 'string' ? reader.result : '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // Simulate OTP sending
        toast.success(`Verification code sent to ${formData.email}`);
        setStep(2);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: import.meta.env.VITE_SITE_URL,
          data: {
            full_name: formData.name,
            phone: formData.phone,
            user_type: formData.userType,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const userId = authData.user.id;
        // Derive/load user data key using password as user secret
        const dataKey = await createOrLoadUserKey(userId, formData.password);

        let idproofUrl = '';

        if (formData.idproof) {
          const { data, error } = await supabase.storage
            .from('id-proof')
            .upload(`${userId}_${Date.now()}.jpg`, formData.idproof);

          if (error) throw error;
          const { data: urlData } = supabase.storage
            .from('id-proof')
            .getPublicUrl(data.path);
          idproofUrl = urlData.publicUrl;
        }

        // Create profile (PII encrypted at rest client-side)
        const encryptedProfile = await encryptProfileFields(
          dataKey,
          {
            id: userId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            pincode: formData.pincode,
            idproof: idproofUrl,
            user_type: formData.userType,
            is_verified: false,
          },
          ['name', 'email', 'phone', 'address', 'pincode']
        );

        await supabase.from('profiles').insert([encryptedProfile]);

        // Initialize wallet
        await supabase.from('wallets').insert([{
          user_id: userId,
          balance: 0,
        }]);

        toast.success(formData.userType === 'seller' 
          ? 'Registration successful! Please complete your seller verification.'
          : 'Registration successful! Please verify your email.');
        
        navigate(formData.userType === 'seller' ? '/verify-seller' : '/verify-profile');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl"
      >
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Create your account' : 'Verify your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
          {step === 1 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 max-w-sm mx-auto">
              This flow is for **individual buyers and sellers**. If you are a **company, bank, NBFC or bulk seller** listing stock regularly,
              please use the{' '}
              <Link to="/company/register" className="text-primary-600 hover:text-primary-500 underline">
                Company Registration
              </Link>{' '}
              instead.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'buyer' }))}
                    className={`flex-1 btn ${formData.userType === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'seller' }))}
                    className={`flex-1 btn ${formData.userType === 'seller' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Seller
                  </button>
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    pattern="[0-9]{6}"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Government ID Proof
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    />
                    <Camera className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="ID Preview"
                        className="max-h-32 rounded-lg mx-auto"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload a clear photo of your government ID (Aadhar, PAN, etc.)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                We've sent a verification code to your email address
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full btn btn-ghost"
              >
                Didn't receive email? Resend verification
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center py-3"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
