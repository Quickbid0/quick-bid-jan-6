// Security UI Components
// Account Restrictions UI, Identity Verification, Reporting, Appeals

import React, { useState, useEffect } from 'react';
import { securityService, type AccountRestriction, type IdentityVerification, type ContentReport, type AppealRequest } from '../../services/securityService';
import { supabase } from '../../config/supabaseClient';
import { createHash } from 'crypto';
import { toast } from 'react-hot-toast';
import { Shield, AlertTriangle, FileText, Camera, CheckCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';

interface SecurityStatusProps {
  userId: string;
}

const SecurityStatusBanner: React.FC<SecurityStatusProps> = ({ userId }) => {
  const [access, setAccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAccess();
  }, [userId]);

  const checkUserAccess = async () => {
    try {
      const accessData = await securityService.checkUserAccess(userId);
      setAccess(accessData);
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !access) return null;

  if (!access.restrictionMessage) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Account Temporarily Restricted
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            {access.restrictionMessage}
          </p>
          {access.restrictions.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => {/* Open appeal modal */}}
                className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors"
              >
                Submit Appeal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface IdentityVerificationFormProps {
  userId: string;
  onComplete: () => void;
}

const IdentityVerificationForm: React.FC<IdentityVerificationFormProps> = ({ userId, onComplete }) => {
  const [verificationType, setVerificationType] = useState<'aadhaar' | 'pan' | 'dl' | 'passport' | 'gst'>('aadhaar');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const verificationTypes = [
    { value: 'aadhaar', label: 'Aadhaar Card', description: 'Indian National ID' },
    { value: 'pan', label: 'PAN Card', description: 'Income Tax ID' },
    { value: 'dl', label: 'Driving License', description: 'Vehicle License' },
    { value: 'passport', label: 'Passport', description: 'Travel Document' },
    { value: 'gst', label: 'GST Certificate', description: 'Business Registration' }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile) {
      toast.error('Please upload your identity document');
      return;
    }

    setUploading(true);
    try {
      // Upload files to Supabase Storage
      let documentUrl = '';
      let selfieUrl = '';

      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${userId}/verification/document_${Date.now()}.${fileExt}`;

        const { data: docData, error: docError } = await supabase.storage
          .from('identity-documents')
          .upload(fileName, documentFile);

        if (docError) throw docError;
        documentUrl = docData.path;
      }

      if (selfieFile) {
        const fileExt = selfieFile.name.split('.').pop();
        const fileName = `${userId}/verification/selfie_${Date.now()}.${fileExt}`;

        const { data: selfieData, error: selfieError } = await supabase.storage
          .from('identity-documents')
          .upload(fileName, selfieFile);

        if (selfieError) throw selfieError;
        selfieUrl = selfieData.path;
      }

      // Submit verification
      const success = await securityService.submitIdentityVerification({
        userId,
        verificationType,
        documentUrl,
        selfieUrl
      });

      if (success) {
        toast.success('Identity verification submitted successfully. We will review it within 24-48 hours.');
        onComplete();
      } else {
        toast.error('Failed to submit verification. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          To ensure a safe and trustworthy platform, we require identity verification.
          Your documents are encrypted and only used for verification purposes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verification Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Document Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verificationTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  verificationType === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="verificationType"
                  value={type.value}
                  checked={verificationType === type.value}
                  onChange={(e) => setVerificationType(e.target.value as any)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </div>
                {verificationType === type.value && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Identity Document *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="document-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload document</span>
                  <input
                    id="document-upload"
                    name="document-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              {documentFile && (
                <p className="text-sm text-green-600">✓ {documentFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Selfie Upload (Optional but recommended) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selfie with Document (Recommended)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="selfie-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Take selfie</span>
                  <input
                    id="selfie-upload"
                    name="selfie-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="pl-1">or upload photo</p>
              </div>
              <p className="text-xs text-gray-500">Clear photo of your face with document</p>
              {selfieFile && (
                <p className="text-sm text-green-600">✓ {selfieFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !documentFile}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

interface ReportFormProps {
  contentType: 'post' | 'comment' | 'auction' | 'profile' | 'product';
  contentId: string;
  reportedUserId: string;
  onClose: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({
  contentType,
  contentId,
  reportedUserId,
  onClose
}) => {
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    'Harassment or bullying',
    'Fraud or scam',
    'Misinformation',
    'Privacy violation',
    'Policy violation',
    'Spam or inappropriate content',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to report content');
        return;
      }

      // Generate hashes for anti-mass-report detection
      const crypto = await import('crypto');
      const ipHash = crypto.default.createHash('sha256').update('anonymous').digest('hex');
      const deviceHash = crypto.default.createHash('sha256').update(navigator.userAgent).digest('hex');

      const success = await securityService.submitReport({
        reporterId: user.id,
        reportedUserId,
        contentType,
        contentId,
        reportReason,
        ipHash,
        deviceHash
      });

      if (success) {
        toast.success('Report submitted successfully. We will review it shortly.');
        onClose();
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Report Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            <p>Reports are reviewed by our moderation team. False reports may result in account restrictions.</p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reportReason}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AppealFormProps {
  restrictionId?: string;
  reportId?: string;
  onClose: () => void;
}

const AppealForm: React.FC<AppealFormProps> = ({ restrictionId, reportId, onClose }) => {
  const [explanation, setExplanation] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [publicInterest, setPublicInterest] = useState(false);
  const [whistleblowerTag, setWhistleblowerTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      toast.error('Please provide an explanation for your appeal');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit an appeal');
        return;
      }

      const success = await securityService.submitAppeal({
        userId: user.id,
        restrictionId,
        reportId,
        explanation,
        evidenceUrls,
        publicInterest,
        whistleblowerTag
      });

      if (success) {
        toast.success('Appeal submitted successfully. We will review it within 24-48 hours.');
        onClose();
      } else {
        toast.error('Failed to submit appeal. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting appeal:', error);
      toast.error('Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Submit Appeal</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explain your appeal *
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please explain why you believe this restriction should be lifted..."
              required
            />
          </div>

          {/* Evidence URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence URLs (optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/evidence"
              onChange={(e) => {
                if (e.target.value) {
                  setEvidenceUrls([...evidenceUrls, e.target.value]);
                  e.target.value = '';
                }
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {evidenceUrls.length > 0 && (
              <div className="mt-2 space-y-1">
                {evidenceUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={publicInterest}
                onChange={(e) => setPublicInterest(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                This content serves public interest or awareness
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={whistleblowerTag}
                onChange={(e) => setWhistleblowerTag(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                I am reporting this as a whistleblower (protected under IT Act)
              </span>
            </label>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p>Your appeal will be reviewed by our moderation team within 24-48 hours. We may contact you for additional information.</p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !explanation.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SecurityLogsProps {
  userId: string;
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ userId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityLogs();
  }, [userId]);

  const loadSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_security_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('visible_to_user', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading security logs...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Security Activity</h3>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No security activity recorded.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Export all components
export {
  SecurityStatusBanner,
  IdentityVerificationForm,
  ReportForm,
  AppealForm,
  SecurityLogs
};
