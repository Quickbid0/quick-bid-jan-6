import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Building, Upload, CheckCircle, AlertCircle, Loader2, FileText, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const VerifySeller = () => {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    bankAccount: '',
    ifscCode: '',
    businessAddress: '',
    documents: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_verified, verification_status, user_type')
        .eq('id', user.id)
        .single();

      if (data?.user_type !== 'seller') {
        navigate('/dashboard');
        return;
      }

      if (data?.is_verified) {
        navigate('/seller/dashboard');
      } else {
        setVerificationStatus(data?.verification_status || 'pending');
      }
    };

    checkVerificationStatus();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload documents
      const documentUrls = await Promise.all(
        formData.documents.map(async (file) => {
          const fileName = `${user.id}/business_${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('seller-verification')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('seller-verification')
            .getPublicUrl(fileName);

          return publicUrl;
        })
      );

      // Update profile with business details
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          business_name: formData.businessName,
          gst_number: formData.gstNumber,
          bank_account: formData.bankAccount,
          ifsc_code: formData.ifscCode,
          business_address: formData.businessAddress,
          business_documents: documentUrls,
          verification_status: 'submitted'
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Business details submitted successfully');
      setVerificationStatus('submitted');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to submit business details');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    switch (verificationStatus) {
      case 'submitted':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Verification In Progress
            </h3>
            <p className="text-yellow-600 dark:text-yellow-300 mt-2">
              We're reviewing your business details. This usually takes 2-3 business days.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/add-product')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Add Your First Product
              </button>
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Seller Dashboard
              </button>
            </div>
          </motion.div>
        );

      case 'approved':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Business Verified
            </h3>
            <p className="text-green-600 dark:text-green-300 mt-2">
              Your seller account has been verified. You can now start listing products.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/add-product')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Add Your First Product
              </button>
              <button
                onClick={() => navigate('/seller/analytics')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                View Analytics
              </button>
            </div>
          </motion.div>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Address
                </label>
                <textarea
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Business Documents
                </label>
                <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Upload GST certificate, business registration, and bank details
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Accepted formats: PDF, JPG, PNG (Max 5MB each)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Submit Business Details'
              )}
            </button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Building className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Business
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete business verification to start selling on our platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default VerifySeller;