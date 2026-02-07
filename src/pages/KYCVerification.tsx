import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Upload, Camera, FileText, CheckCircle, XCircle,
  AlertTriangle, Eye, User, CreditCard, MapPin,
  Phone, Mail, Calendar
} from 'lucide-react';

interface KYCData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  documentType: 'aadhaar' | 'pan' | 'passport' | 'driving_license';
  documentNumber: string;
}

interface DocumentFiles {
  idDocument: File | null;
  addressProof: File | null;
  selfie: File | null;
}

const KYCVerification: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    documentType: 'aadhaar',
    documentNumber: ''
  });

  const [documents, setDocuments] = useState<DocumentFiles>({
    idDocument: null,
    addressProof: null,
    selfie: null
  });

  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'submitted' | 'verified' | 'rejected' | null>(null);

  const fileInputRefs = {
    idDocument: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null)
  };

  React.useEffect(() => {
    if (user) {
      // Pre-fill user data
      setKycData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email,
        phoneNumber: user.phone || ''
      }));

      // Check existing KYC status
      checkKYCStatus();
    }
  }, [user]);

  const checkKYCStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const status = await response.json();
        setKycStatus(status.status);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (type: keyof DocumentFiles, file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid file type (JPG, PNG, or PDF)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setDocuments(prev => ({ ...prev, [type]: file }));
    toast.success(`${type.replace(/([A-Z])/g, ' $1').toLowerCase()} uploaded successfully`);
  };

  const triggerFileInput = (type: keyof DocumentFiles) => {
    fileInputRefs[type].current?.click();
  };

  const uploadToSupabase = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `kyc/${user?.id}/${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const submitKYC = async () => {
    if (!user) {
      toast.error('Please log in to submit KYC');
      return;
    }

    // Validate required fields
    const requiredFields = ['fullName', 'dateOfBirth', 'phoneNumber', 'email', 'documentNumber'];
    const missingFields = requiredFields.filter(field => !kycData[field as keyof KYCData]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check if documents are uploaded
    if (!documents.idDocument || !documents.selfie) {
      toast.error('Please upload ID document and selfie');
      return;
    }

    setUploading(true);

    try {
      // Upload documents to Supabase storage
      const uploadPromises = [];

      if (documents.idDocument) {
        uploadPromises.push(uploadToSupabase(documents.idDocument, 'id-document'));
      }

      if (documents.addressProof) {
        uploadPromises.push(uploadToSupabase(documents.addressProof, 'address-proof'));
      }

      if (documents.selfie) {
        uploadPromises.push(uploadToSupabase(documents.selfie, 'selfie'));
      }

      const [idDocumentUrl, addressProofUrl, selfieUrl] = await Promise.all(uploadPromises);

      // Submit KYC data to backend
      const kycPayload = {
        ...kycData,
        userId: user.id,
        documents: {
          idDocument: idDocumentUrl,
          addressProof: addressProofUrl,
          selfie: selfieUrl
        },
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(kycPayload),
      });

      if (response.ok) {
        const result = await response.json();
        setKycStatus('submitted');
        toast.success('KYC verification submitted successfully! We will review your documents within 24-48 hours.');
        setCurrentStep(4); // Move to confirmation step
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit KYC verification');
      }

    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Failed to submit KYC verification. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Information', completed: !!kycData.fullName && !!kycData.email },
    { id: 2, title: 'Document Upload', completed: !!documents.idDocument && !!documents.selfie },
    { id: 3, title: 'Review & Submit', completed: false },
    { id: 4, title: 'Verification Status', completed: kycStatus === 'verified' }
  ];

  if (kycStatus === 'verified') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">KYC Verification Complete</h2>
          <p className="text-green-700 mb-4">
            Your identity has been successfully verified. You can now participate in auctions and access all platform features.
          </p>
          <div className="bg-white rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">Verified on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus === 'submitted') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-800 mb-2">KYC Verification Under Review</h2>
          <p className="text-blue-700 mb-4">
            Your documents have been submitted and are currently under review. This process typically takes 24-48 hours.
          </p>
          <div className="bg-white rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">Submitted on: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 mt-1">Status: Under Review</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
        <p className="text-gray-600">Complete your identity verification to access all platform features</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.id ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={kycData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={kycData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={kycData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={kycData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your complete address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={kycData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={kycData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={kycData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!kycData.fullName || !kycData.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Document Upload
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Document Upload</h2>

            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Document Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'aadhaar', label: 'Aadhaar Card' },
                  { value: 'pan', label: 'PAN Card' },
                  { value: 'passport', label: 'Passport' },
                  { value: 'driving_license', label: 'Driving License' }
                ].map((doc) => (
                  <button
                    key={doc.value}
                    onClick={() => handleInputChange('documentType', doc.value)}
                    className={`p-3 border rounded-lg text-sm font-medium ${
                      kycData.documentType === doc.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Number *
              </label>
              <input
                type="text"
                value={kycData.documentNumber}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your document number"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* ID Document */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ID Document</h3>
                  <p className="text-gray-600 mb-4">Upload front and back of your ID document</p>

                  <input
                    ref={fileInputRefs.idDocument}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect('idDocument', e.target.files[0])}
                    className="hidden"
                  />

                  {documents.idDocument ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">{documents.idDocument.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerFileInput('idDocument')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Choose File
                    </button>
                  )}
                </div>
              </div>

              {/* Address Proof */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Address Proof (Optional)</h3>
                  <p className="text-gray-600 mb-4">Utility bill, bank statement, or rental agreement</p>

                  <input
                    ref={fileInputRefs.addressProof}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect('addressProof', e.target.files[0])}
                    className="hidden"
                  />

                  {documents.addressProof ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">{documents.addressProof.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerFileInput('addressProof')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Choose File
                    </button>
                  )}
                </div>
              </div>

              {/* Selfie */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selfie</h3>
                  <p className="text-gray-600 mb-4">Take a clear selfie for identity verification</p>

                  <input
                    ref={fileInputRefs.selfie}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect('selfie', e.target.files[0])}
                    className="hidden"
                  />

                  {documents.selfie ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">{documents.selfie.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerFileInput('selfie')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Take Selfie
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!documents.idDocument || !documents.selfie || !kycData.documentNumber}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Review & Submit
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {kycData.fullName}</div>
                <div><span className="font-medium">Email:</span> {kycData.email}</div>
                <div><span className="font-medium">Phone:</span> {kycData.phoneNumber}</div>
                <div><span className="font-medium">DOB:</span> {kycData.dateOfBirth}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Document Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Type:</span> {kycData.documentType.toUpperCase()}</div>
                <div><span className="font-medium">Number:</span> {kycData.documentNumber}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Uploaded Documents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>ID Document: {documents.idDocument?.name}</span>
                </div>
                {documents.addressProof && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Address Proof: {documents.addressProof.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Selfie: {documents.selfie?.name}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Ensure all information is accurate and matches your documents</li>
                    <li>Documents must be clear and readable</li>
                    <li>Verification typically takes 24-48 hours</li>
                    <li>You will receive an email notification once verified</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={submitKYC}
                disabled={uploading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCVerification;
