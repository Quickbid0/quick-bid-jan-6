import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Calendar, DollarSign, User, Camera, Upload, Send, ArrowLeft, Eye, Download, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';

interface ClaimFormData {
  policyId: string;
  claimType: string;
  description: string;
  estimatedAmount: number;
  incidentDate: string;
  incidentLocation: string;
  witnesses: string;
  policeReport: boolean;
  policeReportNumber: string;
  additionalInfo: string;
  documents: File[];
}

interface Policy {
  id: string;
  policyNumber: string;
  type: string;
  coverage: string;
  sumAssured: number;
  status: string;
  insuredItem: {
    name: string;
    category: string;
    value: number;
  };
}

const InsuranceClaimPage: React.FC = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    policyId: policyId || '',
    claimType: '',
    description: '',
    estimatedAmount: 0,
    incidentDate: '',
    incidentLocation: '',
    witnesses: '',
    policeReport: false,
    policeReportNumber: '',
    additionalInfo: '',
    documents: []
  });

  useEffect(() => {
    if (policyId) {
      loadPolicy();
    }
  }, [policyId]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      
      // Simulate loading policy data
      const mockPolicy: Policy = {
        id: policyId || '1',
        policyNumber: 'INS-2024-001',
        type: 'comprehensive',
        coverage: 'Full coverage including fire, theft, and collision',
        sumAssured: 1500000,
        status: 'active',
        insuredItem: {
          name: '2023 BMW X5',
          category: 'Automobile',
          value: 1500000
        }
      };
      
      setPolicy(mockPolicy);
    } catch (error) {
      console.error('Error loading policy:', error);
      toast.error('Failed to load policy information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!policy) {
      toast.error('Policy information not available');
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate form
      if (!formData.claimType || !formData.description || !formData.incidentDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Simulate claim submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Claim submitted successfully! We will review it within 3-5 business days.');
      
      // Navigate to insurance status page
      navigate('/finance/insurance/dashboard');
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const claimTypes = [
    'Accident',
    'Theft',
    'Fire',
    'Vandalism',
    'Natural Disaster',
    'Third Party Damage',
    'Glass Damage',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Policy Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The policy you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/finance/insurance/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Insurance Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/finance/insurance/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insurance Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            File Insurance Claim
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit a claim for your insurance policy
          </p>
        </div>

        {/* Policy Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Policy Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Policy Number</p>
              <p className="font-medium text-gray-900 dark:text-white">{policy.policyNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coverage Type</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{policy.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insured Item</p>
              <p className="font-medium text-gray-900 dark:text-white">{policy.insuredItem.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sum Assured</p>
              <p className="font-medium text-gray-900 dark:text-white">
                ₹{policy.sumAssured.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Claim Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Claim Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <select
                name="claimType"
                value={formData.claimType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                required
              >
                <option value="">Select claim type</option>
                {claimTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Describe what happened..."
                required
              />
            </div>

            {/* Estimated Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Amount (₹)
              </label>
              <input
                type="number"
                name="estimatedAmount"
                value={formData.estimatedAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                placeholder="0.00"
              />
            </div>

            {/* Incident Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Incident Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                required
              />
            </div>

            {/* Incident Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Incident Location
              </label>
              <input
                type="text"
                name="incidentLocation"
                value={formData.incidentLocation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Where did the incident occur?"
              />
            </div>

            {/* Witnesses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Witnesses
              </label>
              <textarea
                name="witnesses"
                value={formData.witnesses}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Names and contact information of witnesses..."
              />
            </div>

            {/* Police Report */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="policeReport"
                  checked={formData.policeReport}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Police report filed
                </span>
              </label>
            </div>

            {formData.policeReport && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Police Report Number
                </label>
                <input
                  type="text"
                  name="policeReportNumber"
                  value={formData.policeReportNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="Enter police report number"
                />
              </div>
            )}

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Any additional details you want to provide..."
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload photos, videos, or documents supporting your claim
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/finance/insurance/dashboard')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Claim
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default InsuranceClaimPage;
