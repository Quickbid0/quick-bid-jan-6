// Enhanced KYC Verification - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Gamified KYC experience with progress tracking, trust indicators, and smooth verification flow

import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  MapPin,
  Camera,
  CheckCircle,
  AlertTriangle,
  Shield,
  Star,
  Trophy,
  Target,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Phone,
  Mail,
  Calendar,
  Award,
  Crown,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  Info,
  Fingerprint
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// KYC Progress Tracker Component
interface KYCProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  className?: string;
}

const KYCProgress: React.FC<KYCProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  className
}) => {
  const steps = [
    { id: 1, title: 'Personal Info', icon: User, description: 'Basic details' },
    { id: 2, title: 'Identity Proof', icon: CreditCard, description: 'ID verification' },
    { id: 3, title: 'Address Proof', icon: MapPin, description: 'Address verification' },
    { id: 4, title: 'Face Verification', icon: Camera, description: 'Biometric check' },
    { id: 5, title: 'Review & Submit', icon: CheckCircle, description: 'Final verification' }
  ];

  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className={className}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-900">
              {completedSteps.length}/{totalSteps} Complete
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Achievement milestone */}
          {progressPercentage >= 100 && (
            <div
              className="absolute -top-2 right-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
            >
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`text-center ${isCurrent ? 'scale-105' : ''}`}
            >
              <div
                className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}
                animate={isCurrent ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.7)',
                    '0 0 0 10px rgba(59, 130, 246, 0)',
                    '0 0 0 0 rgba(59, 130, 246, 0)'
                  ]
                } : {}}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className={`text-xs font-medium mb-1 ${
                isCompleted ? 'text-emerald-600' :
                isCurrent ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Trust Indicators for KYC
interface KYCTrustIndicatorsProps {
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  securityScore: number;
  className?: string;
}

const KYCTrustIndicators: React.FC<KYCTrustIndicatorsProps> = ({
  verificationLevel,
  securityScore,
  className
}) => {
  const getTrustLevel = (level: string) => {
    switch (level) {
      case 'premium': return { icon: Crown, label: 'Premium Verified', color: 'purple', bg: 'bg-purple-50' };
      case 'verified': return { icon: Shield, label: 'Verified', color: 'emerald', bg: 'bg-emerald-50' };
      case 'basic': return { icon: CheckCircle, label: 'Basic Verified', color: 'blue', bg: 'bg-blue-50' };
      default: return { icon: AlertTriangle, label: 'Not Verified', color: 'gray', bg: 'bg-gray-50' };
    }
  };

  const { icon: Icon, label, color, bg } = getTrustLevel(verificationLevel);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">Secure</span>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${bg} border border-${color}-200`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <div className={`font-semibold text-${color}-900`}>{label}</div>
            <div className={`text-sm text-${color}-700`}>
              {verificationLevel === 'premium' && 'Full biometric verification with premium support'}
              {verificationLevel === 'verified' && 'Identity and address verified'}
              {verificationLevel === 'basic' && 'Basic information verified'}
              {verificationLevel === 'none' && 'Complete verification to unlock full features'}
            </div>
          </div>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Security Score</span>
          <span className="text-lg font-bold text-blue-600">{securityScore}%</span>
        </div>
        <ProgressIndicator current={securityScore} total={100} showPercentage />
        <div className="flex justify-between text-xs text-blue-600 mt-2">
          <span>Basic</span>
          <span>Advanced</span>
          <span>Fort Knox</span>
        </div>
      </div>
    </div>
  );
};

// Gamified Achievement System
interface AchievementProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const Achievement: React.FC<AchievementProps> = ({
  title,
  description,
  icon: Icon,
  unlocked,
  progress,
  maxProgress,
  rarity
}) => {
  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  };

  const rarityTextColors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${rarityColors[rarity]} transition-all duration-300 ${
        unlocked ? 'shadow-lg scale-105' : 'opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-3 rounded-lg ${unlocked ? 'bg-white shadow-md' : 'bg-gray-100'}`}
        >
          <Icon className={`w-6 h-6 ${unlocked ? 'text-gray-900' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {title}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${rarityTextColors[rarity]} bg-white/50`}>
              {rarity}
            </span>
            {unlocked && <Sparkles className="w-4 h-4 text-yellow-500" />}
          </div>

          <p className={`text-sm ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {description}
          </p>

          {progress !== undefined && maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progress}/{maxProgress}</span>
              </div>
              <ProgressIndicator current={progress} total={maxProgress} showPercentage={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced KYC Verification Component
export const EnhancedKYCVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState<'none' | 'basic' | 'verified' | 'premium'>('none');
  const [securityScore, setSecurityScore] = useState(0);

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    panNumber: '',

    // Step 2: Identity Proof
    idType: 'aadhar' as 'aadhar' | 'passport' | 'driving_license',
    idNumber: '',
    idFront: null as File | null,
    idBack: null as File | null,

    // Step 3: Address Proof
    addressProofType: 'aadhar' as 'aadhar' | 'utility_bill' | 'bank_statement',
    addressProof: null as File | null,

    // Step 4: Face Verification
    faceImage: null as File | null,
    selfie: null as File | null
  });

  const achievements: AchievementProps[] = [
    {
      title: "First Steps",
      description: "Complete your personal information",
      icon: User,
      unlocked: completedSteps.includes(1),
      rarity: 'common'
    },
    {
      title: "Identity Verified",
      description: "Upload and verify your identity documents",
      icon: CreditCard,
      unlocked: completedSteps.includes(2),
      progress: formData.idFront ? 50 : 0,
      maxProgress: 100,
      rarity: 'rare'
    },
    {
      title: "Home Sweet Home",
      description: "Verify your address with official documents",
      icon: MapPin,
      unlocked: completedSteps.includes(3),
      rarity: 'epic'
    },
    {
      title: "Face of Trust",
      description: "Complete biometric face verification",
      icon: Camera,
      unlocked: completedSteps.includes(4),
      rarity: 'legendary'
    },
    {
      title: "Verification Master",
      description: "Complete full KYC verification process",
      icon: Crown,
      unlocked: verificationLevel === 'premium',
      rarity: 'legendary'
    }
  ];

  const handleNext = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setSecurityScore(prev => Math.min(100, prev + 20));
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setVerificationLevel('premium');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFileUpload = (field: string, file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Let's Get Started!</h3>
              <p className="text-gray-600">Tell us a bit about yourself to begin verification</p>
            </div>

            <Grid cols={2} gap="md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Doe"
                />
              </div>
            </Grid>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="john@example.com"
              />
            </div>

            <Grid cols={2} gap="md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </Grid>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="AAAAA0000A"
                maxLength={10}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Verification</h3>
              <p className="text-gray-600">Upload your government-issued ID for verification</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="aadhar">Aadhaar Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter your ID number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Front Side</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                    {formData.idFront ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Upload front side</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                    {formData.idBack ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Upload back side</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Continue with remaining steps...
      default:
        return (
          <div
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h3>
            <p className="text-gray-600">Your KYC verification has been submitted successfully.</p>
          </div>
        );
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Tracker */}
        <KYCProgress
          currentStep={currentStep}
          totalSteps={5}
          completedSteps={completedSteps}
          className="mb-8"
        />

        <Grid cols={3} gap="lg">
          {/* Main Form */}
          <div className="col-span-2">
            <Card className="p-8">
              <Fragment mode="wait">
                {renderStepContent()}
              </Fragment>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  loading={isLoading}
                  disabled={currentStep === 5}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentStep === 5 ? 'Complete Verification' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Indicators */}
            <KYCTrustIndicators
              verificationLevel={verificationLevel}
              securityScore={securityScore}
            />

            {/* Achievements */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>

              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <Achievement key={index} {...achievement} />
                ))}
              </div>
            </Card>

            {/* Security Tips */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-900">Security Tips</h3>
              </div>

              <div className="space-y-2 text-sm text-emerald-700">
                <p>• Your data is encrypted and secure</p>
                <p>• Verification helps prevent fraud</p>
                <p>• Only verified users can bid</p>
                <p>• Your information is never shared</p>
              </div>
            </Card>
          </div>
        </Grid>
      </div>
    </Container>
  );
};

export default EnhancedKYCVerification;
