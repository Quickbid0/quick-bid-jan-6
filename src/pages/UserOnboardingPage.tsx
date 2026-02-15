import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  Shield,
  Star,
  Trophy,
  Car,
  IndianRupee,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data for form validation
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

interface OnboardingData {
  // Account Type
  userType: 'buyer' | 'dealer';

  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Personal Details
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  panNumber: string;
  aadharNumber: string;

  // Dealer Specific
  businessName?: string;
  gstNumber?: string;
  dealershipType?: string;
  yearsInBusiness?: number;
  monthlyVolume?: number;

  // KYC Documents
  panCard?: File;
  aadharCard?: File;
  addressProof?: File;
  businessLicense?: File;

  // Preferences
  notifications: boolean;
  marketingEmails: boolean;
  termsAccepted: boolean;
}

const UserOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    userType: 'buyer',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadharNumber: '',
    businessName: '',
    gstNumber: '',
    dealershipType: '',
    yearsInBusiness: 0,
    monthlyVolume: 0,
    notifications: true,
    marketingEmails: false,
    termsAccepted: false
  });

  const steps = [
    { id: 1, title: 'Account Type', icon: User },
    { id: 2, title: 'Basic Info', icon: Mail },
    { id: 3, title: 'Personal Details', icon: FileText },
    { id: 4, title: 'KYC Verification', icon: Shield },
    { id: 5, title: 'Preferences', icon: CheckCircle }
  ];

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.userType) {
          newErrors.userType = 'Please select account type';
        }
        break;

      case 2:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;

      case 3:
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
        if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
        else if (!/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(formData.panNumber.toUpperCase())) newErrors.panNumber = 'Invalid PAN format';
        if (!formData.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required';
        else if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = 'Invalid Aadhar number';

        if (formData.userType === 'dealer') {
          if (!formData.businessName?.trim()) newErrors.businessName = 'Business name is required';
          if (!formData.gstNumber?.trim()) newErrors.gstNumber = 'GST number is required';
          if (!formData.dealershipType) newErrors.dealershipType = 'Dealership type is required';
          if (!formData.yearsInBusiness || formData.yearsInBusiness < 0) newErrors.yearsInBusiness = 'Years in business is required';
        }
        break;

      case 4:
        // Document validation would be more complex in real app
        if (!formData.panCard) newErrors.panCard = 'PAN card upload is required';
        if (!formData.aadharCard) newErrors.aadharCard = 'Aadhar card upload is required';
        if (!formData.addressProof) newErrors.addressProof = 'Address proof is required';
        if (formData.userType === 'dealer' && !formData.businessLicense) newErrors.businessLicense = 'Business license is required';
        break;

      case 5:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success - redirect based on user type
      if (formData.userType === 'dealer') {
        navigate('/dealer-dashboard');
      } else {
        navigate('/auctions');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Account Type</h2>
              <p className="text-gray-600 mb-8">Select whether you're here to buy vehicles or sell them through auctions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Buyer Account */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'buyer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('userType', 'buyer')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm a Buyer</h3>
                  <p className="text-gray-600 mb-4">Find verified vehicles at great prices through live auctions</p>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Browse 1,000+ verified auctions</li>
                    <li>• Instant loan pre-approvals</li>
                    <li>• 200-point vehicle inspections</li>
                    <li>• Secure escrow payments</li>
                  </ul>
                </div>
              </motion.div>

              {/* Dealer Account */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'dealer'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('userType', 'dealer')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm a Dealer</h3>
                  <p className="text-gray-600 mb-4">List your vehicles and reach thousands of verified buyers</p>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Commission-based earnings</li>
                    <li>• Advanced analytics & marketing</li>
                    <li>• Enterprise dealer tools</li>
                    <li>• Priority auction placement</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {errors.userType && (
              <div className="flex items-center gap-2 text-red-600 text-sm max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.userType}</span>
              </div>
            )}

            {/* Benefits Preview */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Why Choose QuickMela?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Bank-Grade Security</div>
                </div>
                <div>
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Verified Dealers</div>
                </div>
                <div>
                  <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Best Prices</div>
                </div>
                <div>
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Award Winning</div>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Create your account with essential details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <Card className="p-4 bg-blue-50">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-blue-800">
                    Password must contain at least 8 characters, including uppercase, lowercase, and numbers.
                  </span>
                </div>
              </Card>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Details</h2>
              <p className="text-gray-600">Provide your personal information for verification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.gender}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={(e) => updateFormData('pincode', e.target.value)}
                />
                {errors.pincode && (
                  <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.panNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="AAAAA1234A"
                  value={formData.panNumber}
                  onChange={(e) => updateFormData('panNumber', e.target.value.toUpperCase())}
                />
                {errors.panNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.panNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.aadharNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12-digit Aadhar number"
                  value={formData.aadharNumber}
                  onChange={(e) => updateFormData('aadharNumber', e.target.value)}
                />
                {errors.aadharNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.aadharNumber}</p>
                )}
              </div>
            </div>

            {/* Dealer Specific Fields */}
            {formData.userType === 'dealer' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.businessName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.businessName}
                      onChange={(e) => updateFormData('businessName', e.target.value)}
                    />
                    {errors.businessName && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.gstNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="22AAAAA0000A1Z5"
                      value={formData.gstNumber}
                      onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                    />
                    {errors.gstNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.gstNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dealership Type *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.dealershipType ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.dealershipType}
                      onChange={(e) => updateFormData('dealershipType', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="authorized">Authorized Dealer</option>
                      <option value="independent">Independent Dealer</option>
                      <option value="used-car">Used Car Specialist</option>
                      <option value="multi-brand">Multi-brand Dealer</option>
                    </select>
                    {errors.dealershipType && (
                      <p className="text-red-600 text-sm mt-1">{errors.dealershipType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.yearsInBusiness ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.yearsInBusiness}
                      onChange={(e) => updateFormData('yearsInBusiness', parseInt(e.target.value))}
                    />
                    {errors.yearsInBusiness && (
                      <p className="text-red-600 text-sm mt-1">{errors.yearsInBusiness}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h2>
              <p className="text-gray-600">Upload documents for identity and address verification</p>
            </div>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Secure Verification Process</h4>
                  <p className="text-sm text-blue-700">
                    Your documents are encrypted and stored securely. We comply with RBI guidelines and use bank-grade security.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN Card */}
              <Card className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">PAN Card *</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload clear photo of your PAN card
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="panCard"
                    onChange={(e) => updateFormData('panCard', e.target.files?.[0])}
                  />
                  <label
                    htmlFor="panCard"
                    className={`inline-block px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                      formData.panCard
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {formData.panCard ? '✓ Uploaded' : 'Choose File'}
                  </label>
                  {errors.panCard && (
                    <p className="text-red-600 text-sm mt-2">{errors.panCard}</p>
                  )}
                </div>
              </Card>

              {/* Aadhar Card */}
              <Card className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Aadhar Card *</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload front and back of your Aadhar card
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    id="aadharCard"
                    onChange={(e) => updateFormData('aadharCard', e.target.files?.[0])}
                  />
                  <label
                    htmlFor="aadharCard"
                    className={`inline-block px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                      formData.aadharCard
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {formData.aadharCard ? '✓ Uploaded' : 'Choose File'}
                  </label>
                  {errors.aadharCard && (
                    <p className="text-red-600 text-sm mt-2">{errors.aadharCard}</p>
                  )}
                </div>
              </Card>

              {/* Address Proof */}
              <Card className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Address Proof *</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Utility bill, bank statement, or rental agreement
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="addressProof"
                    onChange={(e) => updateFormData('addressProof', e.target.files?.[0])}
                  />
                  <label
                    htmlFor="addressProof"
                    className={`inline-block px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                      formData.addressProof
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {formData.addressProof ? '✓ Uploaded' : 'Choose File'}
                  </label>
                  {errors.addressProof && (
                    <p className="text-red-600 text-sm mt-2">{errors.addressProof}</p>
                  )}
                </div>
              </Card>

              {/* Business License (Dealer Only) */}
              {formData.userType === 'dealer' && (
                <Card className="p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Business License *</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your dealership license or registration
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="businessLicense"
                      onChange={(e) => updateFormData('businessLicense', e.target.files?.[0])}
                    />
                    <label
                      htmlFor="businessLicense"
                      className={`inline-block px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.businessLicense
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {formData.businessLicense ? '✓ Uploaded' : 'Choose File'}
                    </label>
                    {errors.businessLicense && (
                      <p className="text-red-600 text-sm mt-2">{errors.businessLicense}</p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Verification Timeline */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Verification Process</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Document Upload</p>
                    <p className="text-sm text-gray-600">Completed - Documents received</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manual Verification</p>
                    <p className="text-sm text-gray-600">2-4 hours - Our team will review your documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-600">Account Activation</p>
                    <p className="text-sm text-gray-500">24 hours - Full access to platform features</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost Done!</h2>
              <p className="text-gray-600">Set your preferences and complete registration</p>
            </div>

            {/* Preferences */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auction Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified about auctions matching your interests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.notifications}
                      onChange={(e) => updateFormData('notifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.marketingEmails}
                      onChange={(e) => updateFormData('marketingEmails', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-32 overflow-y-auto">
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>1. Account Terms:</strong> You must provide accurate and complete information during registration.</p>
                  <p><strong>2. KYC Verification:</strong> All users must complete KYC verification to access full platform features.</p>
                  <p><strong>3. Privacy Policy:</strong> Your personal information is protected under our privacy policy and RBI guidelines.</p>
                  <p><strong>4. Platform Usage:</strong> You agree to use the platform for legitimate automotive transactions only.</p>
                  <p><strong>5. Payment Terms:</strong> All payments are processed through secure escrow system with buyer protection.</p>
                  <p><strong>6. Dispute Resolution:</strong> Any disputes will be resolved through our mediation process.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className={`mt-1 ${errors.termsAccepted ? 'border-red-500' : ''}`}
                  checked={formData.termsAccepted}
                  onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-600 text-sm mt-2">{errors.termsAccepted}</p>
              )}
            </Card>

            {/* Account Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account Type</h4>
                  <p className="text-gray-600 capitalize">{formData.userType}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Full Name</h4>
                  <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>
                {formData.userType === 'dealer' && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Business</h4>
                      <p className="text-gray-600">{formData.businessName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dealership Type</h4>
                      <p className="text-gray-600 capitalize">{formData.dealershipType}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Welcome Message */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to QuickMela!</h3>
                <p className="text-blue-700">
                  {formData.userType === 'buyer'
                    ? 'Start browsing verified auctions and find your dream car today.'
                    : 'List your first auction and start earning commissions from verified buyers.'
                  }
                </p>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">QuickMela</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
              <p className="font-medium text-gray-900">{steps[currentStep - 1].title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              className="px-6"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOnboardingPage;
