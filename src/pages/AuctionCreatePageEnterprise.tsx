import React, { useState } from 'react';
import {
  Car,
  Calendar,
  Clock,
  DollarSign,
  Upload,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Settings,
  Zap,
  Timer
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data for form
const mockMakes = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Hyundai', 'Mahindra', 'Tata'];
const mockModels = {
  BMW: ['X3', 'X5', '3 Series', '5 Series', 'X1'],
  Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'],
  Audi: ['A4', 'A6', 'Q5', 'Q7', 'A3'],
  // ... add more
};

interface AuctionFormData {
  // Basic Info
  auctionType: 'timed' | 'flash' | 'live';
  title: string;
  description: string;

  // Vehicle Details
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  registrationNumber: string;
  insuranceExpiry: string;
  serviceHistory: string;

  // Pricing
  reservePrice: number;
  startingBid: number;
  buyNowPrice?: number;

  // Auction Settings
  startDate: string;
  endDate: string;
  duration: number; // hours
  bidIncrement: number;
  maxBidders?: number;

  // Media
  images: File[];
  video?: File;
  inspectionReport?: File;

  // Trust Elements
  isInspected: boolean;
  hasWarranty: boolean;
  warrantyPeriod?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';

  // Additional
  location: string;
  deliveryAvailable: boolean;
  testDriveAvailable: boolean;
}

const AuctionCreatePageEnterprise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AuctionFormData>({
    auctionType: 'timed',
    title: '',
    description: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    registrationNumber: '',
    insuranceExpiry: '',
    serviceHistory: '',
    reservePrice: 0,
    startingBid: 0,
    startDate: '',
    endDate: '',
    duration: 168, // 7 days default
    bidIncrement: 1000,
    images: [],
    isInspected: false,
    hasWarranty: false,
    condition: 'good',
    location: '',
    deliveryAvailable: true,
    testDriveAvailable: true
  });

  const steps = [
    { id: 1, title: 'Auction Type', icon: Settings },
    { id: 2, title: 'Vehicle Details', icon: Car },
    { id: 3, title: 'Pricing', icon: DollarSign },
    { id: 4, title: 'Media & Documents', icon: Upload },
    { id: 5, title: 'Review & Publish', icon: CheckCircle }
  ];

  const updateFormData = (field: keyof AuctionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Simulate API call
    console.log('Creating auction:', formData);
    // Show success message
    alert('Auction created successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Auction Type</h3>
              <p className="text-gray-600">Select the auction format that best suits your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Timed Auction */}
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.auctionType === 'timed'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('auctionType', 'timed')}
              >
                <Clock className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Timed Auction</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Traditional auction running for 3-7 days with multiple bidders
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Duration: 3-7 days</div>
                  <div>• Unlimited bidders</div>
                  <div>• Best for high-value vehicles</div>
                </div>
              </div>

              {/* Flash Auction */}
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.auctionType === 'flash'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('auctionType', 'flash')}
              >
                <Zap className="h-8 w-8 text-orange-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Flash Auction</h4>
                <p className="text-sm text-gray-600 mb-3">
                  High-energy auction lasting 30-60 minutes with rapid bidding
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Duration: 30-60 minutes</div>
                  <div>• Creates urgency</div>
                  <div>• Best for quick sales</div>
                </div>
              </div>

              {/* Live Auction */}
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.auctionType === 'live'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('auctionType', 'live')}
              >
                <Timer className="h-8 w-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Live Auction</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Real-time auction with live bidding and dealer participation
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Live streaming</div>
                  <div>• Expert moderation</div>
                  <div>• Premium pricing</div>
                </div>
              </div>
            </div>

            {/* Auction Settings Preview */}
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Auction Settings Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium capitalize">{formData.auctionType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Default Duration:</span>
                  <span className="ml-2 font-medium">
                    {formData.auctionType === 'timed' ? '7 days' :
                     formData.auctionType === 'flash' ? '1 hour' : '2 hours'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Information</h3>
              <p className="text-gray-600">Provide detailed information about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auction Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BMW X3 2020 Excellent Condition"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.make}
                    onChange={(e) => updateFormData('make', e.target.value)}
                  >
                    <option value="">Select Make</option>
                    {mockMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.model}
                    onChange={(e) => updateFormData('model', e.target.value)}
                    disabled={!formData.make}
                  >
                    <option value="">Select Model</option>
                    {formData.make && mockModels[formData.make as keyof typeof mockModels]?.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => updateFormData('year', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage (km) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="45000"
                    value={formData.mileage}
                    onChange={(e) => updateFormData('mileage', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.fuelType}
                    onChange={(e) => updateFormData('fuelType', e.target.value)}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.transmission}
                    onChange={(e) => updateFormData('transmission', e.target.value)}
                  >
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bodyType}
                    onChange={(e) => updateFormData('bodyType', e.target.value)}
                  >
                    <option value="">Select Body Type</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                    <option value="wagon">Wagon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trust Elements */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Trust & Quality Assurance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="inspected"
                    className="rounded"
                    checked={formData.isInspected}
                    onChange={(e) => updateFormData('isInspected', e.target.checked)}
                  />
                  <label htmlFor="inspected" className="text-sm">
                    <span className="font-medium">Inspected by QuickMela</span>
                    <p className="text-gray-600">200-point inspection report included</p>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="warranty"
                    className="rounded"
                    checked={formData.hasWarranty}
                    onChange={(e) => updateFormData('hasWarranty', e.target.checked)}
                  />
                  <label htmlFor="warranty" className="text-sm">
                    <span className="font-medium">Warranty Available</span>
                    <p className="text-gray-600">Remaining warranty period</p>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing & Auction Settings</h3>
              <p className="text-gray-600">Set competitive pricing and auction parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Pricing</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserve Price (₹) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum acceptable price"
                      value={formData.reservePrice}
                      onChange={(e) => updateFormData('reservePrice', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Bidders won't see this amount</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Bid (₹) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Opening bid amount"
                      value={formData.startingBid}
                      onChange={(e) => updateFormData('startingBid', parseInt(e.target.value))}
                    />
                  </div>

                  {formData.auctionType === 'timed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buy Now Price (₹) - Optional
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Allow instant purchase"
                        value={formData.buyNowPrice || ''}
                        onChange={(e) => updateFormData('buyNowPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Auction Settings */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Auction Settings</h4>
                <div className="space-y-4">
                  {formData.auctionType === 'timed' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.startDate}
                          onChange={(e) => updateFormData('startDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (Days) *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.duration / 24}
                          onChange={(e) => updateFormData('duration', parseInt(e.target.value) * 24)}
                        >
                          <option value="1">1 Day</option>
                          <option value="3">3 Days</option>
                          <option value="5">5 Days</option>
                          <option value="7">7 Days</option>
                          <option value="10">10 Days</option>
                        </select>
                      </div>
                    </>
                  )}

                  {formData.auctionType === 'flash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Minutes) *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.duration}
                        onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                      >
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                        <option value="90">90 Minutes</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Increment (₹) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                      value={formData.bidIncrement}
                      onChange={(e) => updateFormData('bidIncrement', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Commission Preview */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Estimated Commission</p>
                  <p className="text-sm text-blue-700">
                    {formData.reservePrice > 0 ? `₹${Math.round(formData.reservePrice * 0.08)} - ₹${Math.round(formData.reservePrice * 0.12)}` : 'Calculate after setting reserve price'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Media & Documents</h3>
              <p className="text-gray-600">Upload high-quality photos and documents to attract more bidders</p>
            </div>

            {/* Image Upload */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Vehicle Photos</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag & drop photos here or click to browse</p>
                <p className="text-sm text-gray-500">Upload at least 6 high-quality photos (max 10MB each)</p>
                <Button className="mt-4" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">Photo Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Exterior shots from multiple angles</li>
                  <li>Interior dashboard and seats</li>
                  <li>Engine compartment</li>
                  <li>Under-carriage if possible</li>
                  <li>Any damage or wear points</li>
                </ul>
              </div>
            </Card>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Inspection Report</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload inspection report</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">RC Book & Insurance</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload documents</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Choose Files
                  </Button>
                </div>
              </Card>
            </div>

            {/* Trust Badges */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Trust Elements</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Verified Dealer</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Money Back</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Fast Delivery</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Publish</h3>
              <p className="text-gray-600">Review all details before publishing your auction</p>
            </div>

            {/* Auction Summary */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Auction Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{formData.auctionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{formData.title || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{formData.make} {formData.model} {formData.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{formData.mileage.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Pricing & Duration</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Bid:</span>
                      <span className="font-medium">₹{formData.startingBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserve Price:</span>
                      <span className="font-medium">₹{formData.reservePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formData.auctionType === 'timed' ? `${formData.duration / 24} days` :
                         formData.auctionType === 'flash' ? `${formData.duration} minutes` :
                         `${formData.duration} hours`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bid Increment:</span>
                      <span className="font-medium">₹{formData.bidIncrement.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trust Elements */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Trust & Quality</h4>
              <div className="flex flex-wrap gap-2">
                {formData.isInspected && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ Inspected
                  </span>
                )}
                {formData.hasWarranty && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    ✓ Warranty
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  ✓ Verified Dealer
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  ✓ Secure Payment
                </span>
              </div>
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">Important Terms</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Auction commission will be deducted from final sale amount</li>
                    <li>• You must deliver the vehicle as described</li>
                    <li>• QuickMela reserves right to remove auction for violations</li>
                    <li>• Payment will be processed after successful delivery</li>
                  </ul>
                  <div className="mt-4 flex items-center gap-2">
                    <input type="checkbox" id="terms" className="rounded" />
                    <label htmlFor="terms" className="text-sm text-yellow-900">
                      I agree to the auction terms and conditions
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Publish Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Publish Auction
              </Button>
              <Button variant="outline" className="px-8">
                Save as Draft
              </Button>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Auction</h1>
            <p className="text-gray-600 mt-1">Set up your vehicle auction in minutes</p>
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
        <div
          key={currentStep}
        >
          {renderStepContent()}
        </div>

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

          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCreatePageEnterprise;
