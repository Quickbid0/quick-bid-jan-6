import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  FileText, 
  Upload, 
  CreditCard, 
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyRegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Basic Company Info
    companyName: '',
    companyType: 'private',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    establishedYear: '',
    
    // Contact Details
    email: '',
    phone: '',
    website: '',
    businessAddress: '',
    registeredAddress: '',
    pincode: '',
    
    // Banking Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'current',
    
    // Authorization
    authorizedPersonName: '',
    authorizedPersonEmail: '',
    authorizedPersonPhone: '',
    designation: '',
    
    // Documents
    incorporationCertificate: null,
    gstCertificate: null,
    panCard: null,
    bankStatement: null,
    authorizationLetter: null,
    
    // Business Details
    businessDescription: '',
    annualTurnover: '',
    employeeCount: '',
    businessCategories: [],
    
    // Agreement
    termsAccepted: false,
    dataProcessingConsent: false
  });

  const companyTypes = [
    { value: 'private', label: 'Private Limited Company' },
    { value: 'public', label: 'Public Limited Company' },
    { value: 'llp', label: 'Limited Liability Partnership' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'proprietorship', label: 'Sole Proprietorship' },
    { value: 'nbfc', label: 'Non-Banking Financial Company' },
    { value: 'bank', label: 'Banking Institution' },
    { value: 'government', label: 'Government Entity' },
    { value: 'trust', label: 'Trust/NGO' }
  ];

  const businessCategories = [
    'Asset Recovery & Liquidation',
    'Vehicle Financing',
    'Industrial Equipment',
    'Real Estate',
    'Art & Collectibles',
    'Electronics & Technology',
    'Machinery & Tools',
    'Furniture & Fixtures',
    'Jewelry & Precious Metals',
    'Textiles & Fashion',
    'Agriculture & Farming',
    'Construction & Infrastructure'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      businessCategories: prev.businessCategories.includes(category)
        ? prev.businessCategories.filter(c => c !== category)
        : [...prev.businessCategories, category]
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.companyName && formData.gstNumber && formData.panNumber && formData.establishedYear;
      case 2:
        return formData.email && formData.phone && formData.businessAddress;
      case 3:
        return formData.bankName && formData.accountNumber && formData.ifscCode;
      case 4:
        return formData.authorizedPersonName && formData.authorizedPersonEmail;
      case 5:
        return formData.incorporationCertificate && formData.gstCertificate && formData.panCard;
      case 6:
        return formData.businessDescription && formData.businessCategories.length > 0;
      case 7:
        return formData.termsAccepted && formData.dataProcessingConsent;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) {
      toast.error('Please complete all required fields and accept terms');
      return;
    }

    setLoading(true);
    try {
      // Upload documents
      const documentUrls = {};
      const documents = ['incorporationCertificate', 'gstCertificate', 'panCard', 'bankStatement', 'authorizationLetter'];
      
      for (const docType of documents) {
        if (formData[docType]) {
          const fileName = `company_${Date.now()}_${docType}`;
          const { data, error } = await supabase.storage
            .from('company-documents')
            .upload(fileName, formData[docType]);
          
          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from('company-documents')
            .getPublicUrl(fileName);
          
          documentUrls[docType] = urlData.publicUrl;
        }
      }

      // Create company profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'TempPassword123!', // Company will set password later
        options: {
          data: {
            company_name: formData.companyName,
            user_type: 'company'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            name: formData.companyName,
            phone: formData.phone,
            address: formData.businessAddress,
            pincode: formData.pincode,
            user_type: 'company',
            role: 'user',
            
            // Company details
            business_name: formData.companyName,
            gst_number: formData.gstNumber,
            company_type: formData.companyType,
            established_year: parseInt(formData.establishedYear),
            business_address: formData.businessAddress,
            business_documents: Object.values(documentUrls),
            bank_account: formData.accountNumber,
            ifsc_code: formData.ifscCode,
            
            verification_status: 'submitted',
            is_verified: false
          }]);

        if (profileError) throw profileError;

        // Create wallet
        await supabase.from('wallets').insert([{
          user_id: authData.user.id,
          balance: 0
        }]);

        // Send notification to admins
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['admin', 'superadmin']);

        if (admins) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            title: 'New Company Registration',
            message: `${formData.companyName} has registered and is pending verification`,
            type: 'verification_update'
          }));

          await supabase.from('notifications').insert(notifications);
        }

        toast.success('Company registration submitted successfully!');
        navigate('/company/verification-pending');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Type *
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {companyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GST Number *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="GST123456789"
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="ABCDE1234F"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CIN Number (if applicable)
                </label>
                <input
                  type="text"
                  name="cinNumber"
                  value={formData.cinNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="L12345MH2020PLC123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Established *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="business@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Complete business address"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registered Address (if different)
                </label>
                <textarea
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Registered office address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="400001"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Banking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="State Bank of India"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="current">Current Account</option>
                  <option value="savings">Savings Account</option>
                  <option value="cc">Cash Credit</option>
                  <option value="od">Overdraft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="1234567890123456"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="SBIN0001234"
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Authorized Representative</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="authorizedPersonName"
                  value={formData.authorizedPersonName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Designation *
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Managing Director"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="authorizedPersonEmail"
                    value={formData.authorizedPersonEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="authorizedPersonPhone"
                    value={formData.authorizedPersonPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Document Upload</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'incorporationCertificate', label: 'Certificate of Incorporation', required: true },
                { name: 'gstCertificate', label: 'GST Registration Certificate', required: true },
                { name: 'panCard', label: 'PAN Card', required: true },
                { name: 'bankStatement', label: 'Bank Statement (Last 3 months)', required: false },
                { name: 'authorizationLetter', label: 'Authorization Letter', required: false }
              ].map(doc => (
                <div key={doc.name} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {doc.label} {doc.required && '*'}
                  </label>
                  <input
                    type="file"
                    name={doc.name}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full"
                    required={doc.required}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Business Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Description *
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe your business activities and services"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Annual Turnover
                  </label>
                  <select
                    name="annualTurnover"
                    value={formData.annualTurnover}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select range</option>
                    <option value="0-1cr">Under ₹1 Crore</option>
                    <option value="1-5cr">₹1-5 Crores</option>
                    <option value="5-25cr">₹5-25 Crores</option>
                    <option value="25-100cr">₹25-100 Crores</option>
                    <option value="100cr+">Above ₹100 Crores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee Count
                  </label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Business Categories * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {businessCategories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.businessCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="mr-2 h-4 w-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Terms & Conditions</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Company Registration Agreement</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 max-h-40 overflow-y-auto">
                  <p>By registering your company on QuickBid, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide accurate and up-to-date business information</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Maintain valid business licenses and certifications</li>
                    <li>Pay applicable platform fees and commissions</li>
                    <li>Ensure all listed items are legally owned</li>
                    <li>Provide authentic documentation for verification</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mr-3 mt-1 h-4 w-4 text-indigo-600 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the <a href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms & Conditions</a> and 
                    <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 ml-1">Privacy Policy</a>
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="dataProcessingConsent"
                    checked={formData.dataProcessingConsent}
                    onChange={handleChange}
                    className="mr-3 mt-1 h-4 w-4 text-indigo-600 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I consent to the processing of my business data for verification and platform services
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Verification Process</p>
                    <p>Your company registration will be reviewed within 2-3 business days. You'll receive email updates on the verification status.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Building className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Company Registration
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join QuickBid as a business partner
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 p-4 text-xs sm:text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">Who should use this form?</p>
          <p>
            This registration is for **companies, banks, NBFCs, fleets, dealers and other bulk sellers** who list stock regularly and need
            team access, compliance review and audit trails. If you are an **individual** selling a few items, you can simply{' '}
            <a href="/register" className="text-primary-700 dark:text-primary-300 underline">
              create an individual account
            </a>{' '}
            and start listing from the{' '}
            <a href="/add-product" className="text-primary-700 dark:text-primary-300 underline">
              Add Product
            </a>{' '}
            page instead.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 7 && (
                  <div className={`w-full h-1 mx-2 ${
                    stepNumber < step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Company Info</span>
            <span>Contact</span>
            <span>Banking</span>
            <span>Representative</span>
            <span>Documents</span>
            <span>Business</span>
            <span>Agreement</span>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 7 ? (
              <button
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !validateStep(7)}
                className="btn btn-primary disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyRegistration;