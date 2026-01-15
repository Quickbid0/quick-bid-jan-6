import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Phone,
  FileText,
  Shield,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const CompanyVerificationPending = () => {
  const [verificationStatus, setVerificationStatus] = useState('submitted');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyStatus();
  }, []);

  const fetchCompanyStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile.is_verified) {
        navigate('/company/dashboard');
        return;
      }

      setCompanyDetails(profile);
      setVerificationStatus(profile.verification_status || 'submitted');
    } catch (error) {
      console.error('Error fetching company status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (verificationStatus) {
      case 'submitted':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500" />,
          title: 'Verification In Progress',
          message: 'Your company registration is being reviewed by our team.',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          timeline: '2-3 business days'
        };
      case 'under_review':
        return {
          icon: <Shield className="h-16 w-16 text-blue-500" />,
          title: 'Under Detailed Review',
          message: 'Our compliance team is conducting a detailed review of your documents.',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          timeline: '1-2 business days'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: 'Verification Approved',
          message: 'Congratulations! Your company has been verified and approved.',
          color: 'bg-green-50 border-green-200 text-green-800',
          timeline: 'Complete'
        };
      case 'rejected':
        return {
          icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
          title: 'Verification Rejected',
          message: 'Your application needs additional information or corrections.',
          color: 'bg-red-50 border-red-200 text-red-800',
          timeline: 'Action required'
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-gray-500" />,
          title: 'Processing',
          message: 'Your application is being processed.',
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          timeline: 'Please wait'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Building className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Company Verification Status
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track your company registration progress
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`border-2 rounded-2xl p-8 mb-8 ${statusInfo.color}`}
        >
          <div className="text-center">
            {statusInfo.icon}
            <h2 className="text-2xl font-bold mt-4 mb-2">{statusInfo.title}</h2>
            <p className="text-lg mb-4">{statusInfo.message}</p>
            <div className="inline-flex items-center px-4 py-2 bg-white/50 rounded-full">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">Expected: {statusInfo.timeline}</span>
            </div>
          </div>
        </motion.div>

        {/* Company Details Summary */}
        {companyDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Submitted Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.gst_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Type</label>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{companyDetails.company_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Established</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.established_year}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Address</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyDetails.business_address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Submission Date</label>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(companyDetails.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Verification Process
          </h3>
          
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'Application Submitted',
                description: 'Your company registration has been received',
                status: 'completed',
                time: 'Completed'
              },
              {
                step: 2,
                title: 'Document Review',
                description: 'Our team is reviewing your submitted documents',
                status: verificationStatus === 'submitted' ? 'current' : 'completed',
                time: '1-2 business days'
              },
              {
                step: 3,
                title: 'Compliance Check',
                description: 'Verifying GST, PAN, and other regulatory compliance',
                status: verificationStatus === 'under_review' ? 'current' : verificationStatus === 'approved' ? 'completed' : 'pending',
                time: '1 business day'
              },
              {
                step: 4,
                title: 'Final Approval',
                description: 'Final review and account activation',
                status: verificationStatus === 'approved' ? 'completed' : 'pending',
                time: 'Same day'
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  item.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : item.status === 'current'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {item.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    item.step
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            What Happens Next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Email Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You'll receive email notifications at each verification stage
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Account Activation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Once approved, your company account will be activated with full features
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
                <ArrowRight className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Start Trading</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Begin listing products and participating in B2B auctions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions about your verification?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:business@quickbid.com"
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Support
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerificationPending;