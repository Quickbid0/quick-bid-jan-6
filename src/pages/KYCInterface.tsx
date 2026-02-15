import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Camera, Upload, FileText, CheckCircle, XCircle,
  AlertCircle, Eye, Download, RefreshCw, Shield
} from 'lucide-react';

interface KYCDocument {
  type: 'aadhaar' | 'pan' | 'driving_license';
  frontImage?: File;
  backImage?: File;
  frontPreview?: string;
  backPreview?: string;
}

interface KYCSubmission {
  documents: KYCDocument[];
  faceImage?: File;
  facePreview?: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
  };
}

interface KYCStatus {
  status: 'not_started' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  verificationProgress: {
    documents: boolean;
    face: boolean;
    personalInfo: boolean;
  };
}

const KYCInterface: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'documents' | 'face' | 'review' | 'status'>('documents');
  const [kycSubmission, setKycSubmission] = useState<KYCSubmission>({
    documents: [],
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    }
  });
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRefs = {
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
    panFront: useRef<HTMLInputElement>(null),
    drivingLicenseFront: useRef<HTMLInputElement>(null),
    faceCapture: useRef<HTMLInputElement>(null)
  };

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch('/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setKycStatus(status);

        // If already approved, show status
        if (status.status === 'approved') {
          setCurrentStep('status');
        }
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleFileUpload = (documentType: string, side: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;

      setKycSubmission(prev => {
        const existingDocIndex = prev.documents.findIndex(doc => doc.type === documentType);

        if (existingDocIndex >= 0) {
          // Update existing document
          const updatedDocs = [...prev.documents];
          updatedDocs[existingDocIndex] = {
            ...updatedDocs[existingDocIndex],
            [side === 'front' ? 'frontImage' : 'backImage']: file,
            [side === 'front' ? 'frontPreview' : 'backPreview']: preview
          };
          return { ...prev, documents: updatedDocs };
        } else {
          // Add new document
          const newDoc: KYCDocument = {
            type: documentType as any,
            [side === 'front' ? 'frontImage' : 'backImage']: file,
            [side === 'front' ? 'frontPreview' : 'backPreview']: preview
          };
          return { ...prev, documents: [...prev.documents, newDoc] };
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFaceCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setKycSubmission(prev => ({
        ...prev,
        faceImage: file,
        facePreview: preview
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateDocuments = (): string[] => {
    const errors: string[] = [];

    if (kycSubmission.documents.length === 0) {
      errors.push('At least one document is required');
    }

    kycSubmission.documents.forEach(doc => {
      if (!doc.frontImage) {
        errors.push(`${doc.type.toUpperCase()} front image is required`);
      }
      if (doc.type === 'aadhaar' && !doc.backImage) {
        errors.push('Aadhaar back image is required');
      }
    });

    if (!kycSubmission.faceImage) {
      errors.push('Face photo is required for verification');
    }

    return errors;
  };

  const validatePersonalInfo = (): string[] => {
    const errors: string[] = [];
    const { personalInfo } = kycSubmission;

    if (!personalInfo.name.trim()) errors.push('Full name is required');
    if (!personalInfo.email.trim()) errors.push('Email is required');
    if (!personalInfo.phone.trim()) errors.push('Phone number is required');
    if (!personalInfo.dateOfBirth) errors.push('Date of birth is required');
    if (!personalInfo.address.trim()) errors.push('Address is required');

    return errors;
  };

  const submitKYC = async () => {
    const documentErrors = validateDocuments();
    const personalInfoErrors = validatePersonalInfo();

    if (documentErrors.length > 0 || personalInfoErrors.length > 0) {
      const allErrors = [...documentErrors, ...personalInfoErrors];
      allErrors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add documents
      kycSubmission.documents.forEach((doc, index) => {
        if (doc.frontImage) {
          formData.append(`documents[${index}][type]`, doc.type);
          formData.append(`documents[${index}][frontImage]`, doc.frontImage);
        }
        if (doc.backImage) {
          formData.append(`documents[${index}][backImage]`, doc.backImage);
        }
      });

      // Add face image
      if (kycSubmission.faceImage) {
        formData.append('faceImage', kycSubmission.faceImage);
      }

      // Add personal info
      formData.append('personalInfo', JSON.stringify(kycSubmission.personalInfo));

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('KYC application submitted successfully!');
        setKycStatus(result);
        setCurrentStep('status');
      } else {
        toast.error('Failed to submit KYC application');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error('Failed to submit KYC application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentUpload = (documentType: string, requiresBack: boolean = false) => {
    const doc = kycSubmission.documents.find(d => d.type === documentType);

    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
          {documentType.replace('_', ' ')} Document
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Front Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front Side *
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => fileInputRefs[`${documentType}Front` as keyof typeof fileInputRefs]?.current?.click()}
            >
              {doc?.frontPreview ? (
                <div>
                  <img src={doc.frontPreview} alt="Front" className="max-w-full h-32 object-cover mx-auto rounded" />
                  <p className="text-sm text-gray-600 mt-2">Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload front side</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRefs[`${documentType}Front` as keyof typeof fileInputRefs]}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(documentType, 'front', file);
              }}
            />
          </div>

          {/* Back Side (if required) */}
          {requiresBack && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back Side *
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                onClick={() => fileInputRefs[`${documentType}Back` as keyof typeof fileInputRefs]?.current?.click()}
              >
                {doc?.backPreview ? (
                  <div>
                    <img src={doc.backPreview} alt="Back" className="max-w-full h-32 object-cover mx-auto rounded" />
                    <p className="text-sm text-gray-600 mt-2">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload back side</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRefs[`${documentType}Back` as keyof typeof fileInputRefs]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, 'back', file);
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFaceCapture = () => (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Face Verification</h3>
      <p className="text-gray-600 mb-4">
        Please upload a clear photo of your face for verification purposes.
        Ensure good lighting and that your face is clearly visible.
      </p>

      <div className="flex justify-center">
        <div
          className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
          onClick={() => fileInputRefs.faceCapture.current?.click()}
        >
          {kycSubmission.facePreview ? (
            <div className="text-center">
              <img
                src={kycSubmission.facePreview}
                alt="Face"
                className="w-48 h-48 object-cover rounded-lg mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">Click to change photo</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Capture Face Photo</p>
              <p className="text-sm text-gray-600">Click to upload or take photo</p>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRefs.faceCapture}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFaceCapture(file);
        }}
      />

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Verification Guidelines</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Ensure your face is clearly visible</li>
              <li>Use good lighting, avoid shadows</li>
              <li>Remove glasses if they obstruct your eyes</li>
              <li>Look directly at the camera</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={kycSubmission.personalInfo.name}
            onChange={(e) => setKycSubmission(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, name: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={kycSubmission.personalInfo.email}
            onChange={(e) => setKycSubmission(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={kycSubmission.personalInfo.phone}
            onChange={(e) => setKycSubmission(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, phone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={kycSubmission.personalInfo.dateOfBirth}
            onChange={(e) => setKycSubmission(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Residential Address *
        </label>
        <textarea
          value={kycSubmission.personalInfo.address}
          onChange={(e) => setKycSubmission(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, address: e.target.value }
          }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter your complete residential address"
        />
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Submission</h3>

        {/* Documents Review */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Documents</h4>
          {kycSubmission.documents.map((doc, index) => (
            <div key={index} className="flex items-center space-x-4 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 capitalize">
                {doc.type.replace('_', ' ')} - Front uploaded
              </span>
              {doc.backImage && (
                <span className="text-sm text-gray-700">Back uploaded</span>
              )}
            </div>
          ))}
        </div>

        {/* Face Photo Review */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Face Verification</h4>
          <div className="flex items-center space-x-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">Face photo uploaded</span>
          </div>
        </div>

        {/* Personal Info Review */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{kycSubmission.personalInfo.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{kycSubmission.personalInfo.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{kycSubmission.personalInfo.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">DOB:</span>
              <span className="ml-2 text-gray-900">{kycSubmission.personalInfo.dateOfBirth}</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-medium text-gray-700">Address:</span>
            <p className="mt-1 text-sm text-gray-900">{kycSubmission.personalInfo.address}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('documents')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Edit Documents
          </button>
          <button
            onClick={submitKYC}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </div>
            ) : (
              'Submit KYC Application'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStatus = () => {
    if (!kycStatus) return null;

    const statusConfig = {
      not_started: {
        icon: AlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        title: 'KYC Not Started',
        message: 'Complete your verification to access all features'
      },
      pending_review: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Under Review',
        message: 'Your documents are being reviewed. This usually takes 24-48 hours.'
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Verified',
        message: 'Your identity has been successfully verified!'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Verification Failed',
        message: 'Please review the feedback and resubmit your documents.'
      }
    };

    const config = statusConfig[kycStatus.status];
    const StatusIcon = config.icon;

    return (
      <div className="max-w-2xl mx-auto">
        <div className={`p-8 rounded-lg ${config.bgColor} text-center`}>
          <StatusIcon className={`w-16 h-16 ${config.color} mx-auto mb-4`} />
          <h2 className={`text-2xl font-bold ${config.color} mb-2`}>{config.title}</h2>
          <p className="text-gray-700 mb-6">{config.message}</p>

          {kycStatus.status === 'rejected' && kycStatus.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{kycStatus.rejectionReason}</p>
            </div>
          )}

          {kycStatus.status === 'pending_review' && (
            <div className="text-sm text-gray-600">
              <p>Submitted: {kycStatus.submittedAt ? new Date(kycStatus.submittedAt).toLocaleString() : 'N/A'}</p>
            </div>
          )}

          {kycStatus.status === 'approved' && (
            <div className="text-sm text-gray-600">
              <p>Approved: {kycStatus.approvedAt ? new Date(kycStatus.approvedAt).toLocaleString() : 'N/A'}</p>
            </div>
          )}

          {kycStatus.status === 'rejected' && (
            <button
              onClick={() => setCurrentStep('documents')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Resubmit Documents
            </button>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${kycStatus.verificationProgress.documents ? 'bg-green-50' : 'bg-gray-50'}`}>
            <FileText className={`w-8 h-8 mx-auto mb-2 ${kycStatus.verificationProgress.documents ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">Documents</p>
            <p className={`text-xs ${kycStatus.verificationProgress.documents ? 'text-green-600' : 'text-gray-500'}`}>
              {kycStatus.verificationProgress.documents ? 'Verified' : 'Pending'}
            </p>
          </div>

          <div className={`p-4 rounded-lg text-center ${kycStatus.verificationProgress.face ? 'bg-green-50' : 'bg-gray-50'}`}>
            <Eye className={`w-8 h-8 mx-auto mb-2 ${kycStatus.verificationProgress.face ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">Face Match</p>
            <p className={`text-xs ${kycStatus.verificationProgress.face ? 'text-green-600' : 'text-gray-500'}`}>
              {kycStatus.verificationProgress.face ? 'Verified' : 'Pending'}
            </p>
          </div>

          <div className={`p-4 rounded-lg text-center ${kycStatus.verificationProgress.personalInfo ? 'bg-green-50' : 'bg-gray-50'}`}>
            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${kycStatus.verificationProgress.personalInfo ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">Personal Info</p>
            <p className={`text-xs ${kycStatus.verificationProgress.personalInfo ? 'text-green-600' : 'text-gray-500'}`}>
              {kycStatus.verificationProgress.personalInfo ? 'Verified' : 'Pending'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const steps = [
    { id: 'documents', label: 'Documents', completed: kycSubmission.documents.length > 0 },
    { id: 'face', label: 'Face Verification', completed: !!kycSubmission.faceImage },
    { id: 'review', label: 'Review & Submit', completed: false },
    { id: 'status', label: 'Status', completed: kycStatus?.status === 'approved' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Complete your identity verification to access all features</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep === step.id
                      ? 'bg-indigo-600 text-white'
                      : step.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${step.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center ${currentStep === step.id ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}
              >
                <div className="text-sm">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 'documents' && (
            <div className="space-y-6">
              {renderDocumentUpload('aadhaar', true)}
              {renderDocumentUpload('pan', false)}
              {renderDocumentUpload('driving_license', false)}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Document Guidelines</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Upload clear, high-quality images</li>
                      <li>Ensure all text is readable</li>
                      <li>Documents must be valid and not expired</li>
                      <li>Supported formats: PNG, JPG, JPEG (max 5MB each)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'face' && renderFaceCapture()}

          {currentStep === 'review' && renderReview()}

          {currentStep === 'status' && renderStatus()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'status' && (
          <div className="flex justify-between">
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as any);
                }
              }}
              disabled={currentStep === 'documents'}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1].id as any);
                }
              }}
              disabled={currentStep === 'review'}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCInterface;
