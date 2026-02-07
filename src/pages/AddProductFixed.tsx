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
    // Handle form submission
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
            Step {currentStep} of 3: Product Information
          </h2>
          <p className="text-gray-600">
            {currentStep === 1 && "Enter basic product details"}
            {currentStep === 2 && "Set pricing and auction duration"}
            {currentStep === 3 && "Add images and location information"}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <ChevronDown className="w-4 h-4 rotate-270" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
