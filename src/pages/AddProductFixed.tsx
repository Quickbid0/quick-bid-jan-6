import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';
import { 
  Upload, 
  Package, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Tag,
  FileText,
  Camera,
  Loader2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  X,
  Eye,
  Clock,
  Shield,
  Truck,
  Info,
  ChevronDown
} from 'lucide-react';
import { ToySafetyForm } from '../components';

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  startingBid: number;
  reservePrice: number;
  buyNowPrice: number;
  bidIncrement: number;
  duration: number;
  location: string;
  images: string[];
  video: string;
  specifications: string;
  shipping: string;
  returns: string;
}

const AddProductFixed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [toySafetyData, setToySafetyData] = useState<any>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: 'electronics',
    condition: 'excellent',
    startingBid: 1000,
    reservePrice: 0,
    buyNowPrice: 0,
    bidIncrement: 100,
    duration: 7,
    location: '',
    images: [],
    video: '',
    specifications: '',
    shipping: 'standard',
    returns: '7-days'
  });

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'watches', label: 'Watches' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const durations = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '7 Days' },
    { value: 14, label: '14 Days' },
    { value: 30, label: '30 Days' }
  ];

  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'free', label: 'Free Shipping' },
    { value: 'pickup', label: 'Local Pickup Only' }
  ];

  const returnOptions = [
    { value: '7-days', label: '7 Days Return' },
    { value: '14-days', label: '14 Days Return' },
    { value: '30-days', label: '30 Days Return' },
    { value: 'no-returns', label: 'No Returns' }
  ];

  // Check seller verification on component mount
  useEffect(() => {
    const checkVerification = async () => {
      try {
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

        setUserType(data?.user_type || null);

        if (data?.user_type !== 'seller') {
          toast.error('Only sellers can create product listings');
          navigate('/dashboard');
          return;
        }

        if (!data?.is_verified) {
          toast.error('You must verify your seller account before creating products');
          navigate('/verify-seller');
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error('Error checking verification:', error);
        toast.error('Failed to verify seller status');
        navigate('/dashboard');
      } finally {
        setVerificationLoading(false);
      }
    };

    checkVerification();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For toys, require safety data
    if (formData.category === 'toys' && !toySafetyData) {
      toast.error('Please complete the toy safety information');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        navigate('/login');
        return;
      }

      // TODO: Create product with safety data
      const productData = {
        ...formData,
        sellerId: user.id,
        toySafetyData: formData.category === 'toys' ? toySafetyData : null
      };

      // Create product in database
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Product listing created successfully!');
      navigate(`/product/${data.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">List New Product</h1>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Product Information' :
              currentStep === 2 ? 'Pricing & Duration' :
              'Images & Location'
            }
          </h2>
          <p className="text-gray-600">
            {currentStep === 1 && "Enter basic product details"}
            {currentStep === 2 && "Set pricing and auction duration"}
            {currentStep === 3 && "Add images and location information"}
          </p>
        </div>

        {/* Step 1: Product Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter product title"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Toy Safety Form - shown when category is toys */}
            {formData.category === 'toys' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Toy Safety Requirements
                </h3>
                <ToySafetyForm 
                  onSave={setToySafetyData}
                  productId={''}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product in detail"
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Bid (₹) *
                </label>
                <input
                  type="number"
                  name="startingBid"
                  value={formData.startingBid}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Increment (₹)
                </label>
                <input
                  type="number"
                  name="bidIncrement"
                  value={formData.bidIncrement}
                  onChange={handleInputChange}
                  min="1"
                  step="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price (₹)
                </label>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Now Price (₹)
                </label>
                <input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Duration *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {durations.map(dur => (
                  <option key={dur.value} value={dur.value}>{dur.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Method
              </label>
              <select
                name="shipping"
                value={formData.shipping}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {shippingOptions.map(ship => (
                  <option key={ship.value} value={ship.value}>{ship.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Policy
              </label>
              <select
                name="returns"
                value={formData.returns}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {returnOptions.map(ret => (
                  <option key={ret.value} value={ret.value}>{ret.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Images & Location */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, State"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (JPG, PNG)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 10 images, 5MB each</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="video"
                value={formData.video}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder="Additional specifications and features"
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentStep === 1}
          >
            Previous
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {currentStep === 3 ? 'Create Listing' : 'Next'}
                <ChevronDown className="w-4 h-4" style={{ transform: currentStep === 3 ? 'none' : 'rotate(270deg)' }} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductFixed;
