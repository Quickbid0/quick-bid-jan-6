import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { ProductSchema, ProductForm, categorySubcategories } from '../schemas/ProductSchema';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSellerVerified, setIsSellerVerified] = useState<boolean | null>(null);
  
  const methods = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: 'other',
      subcategory: 'misc',
      description: '',
      condition: 'used',
      auctionType: 'timed',
      basePrice: 0,
      bidIncrement: 1,
      reservePrice: undefined,
      buyNowPrice: undefined,
      thumbnail: '',
      images: [],
      video: undefined,
      location: {
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      shippingMethod: 'pickup',
      returnPolicy: 'not_accepted',
      agreeToTerms: false,
      acceptReturnPolicy: false
    }
  });

  const { watch, setValue, handleSubmit, register, formState: { errors, isValid } } = methods;
  const watchedCategory = watch('category');
  const watchedName = watch('name');

  // Auto-generate slug from name
  React.useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, setValue]);

  // Handle image upload
  const handleImageUpload = useCallback(async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        file,
        id: `img-${Date.now()}-${index}`
      };
    });

    try {
      const newImages = await Promise.all(uploadPromises);
      
      // Set thumbnail if first image
      if (watch('images').length === 0 && newImages.length > 0) {
        setValue('thumbnail', newImages[0].url);
      }

      // Update form images
      const formImages = newImages.map((img, index) => ({
        id: img.id,
        url: img.url,
        alt: `${watchedName} - Image ${index + 1}`,
        isThumbnail: index === 0 && watch('images').length === 0,
        order: watch('images').length + index
      }));
      
      setValue('images', [...watch('images'), ...formImages]);
      
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    }
  }, [watch, setValue, watchedName]);

  // Handle form submission
  const onSubmit = async (data: ProductForm) => {
    if (data.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    setLoading(true);
    try {
      // Add seller ID and status
      const productData = {
        ...data,
        sellerId: currentUserId,
        status: 'DRAFT' as const
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Product created successfully! It\'s now pending review.');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Get current user session
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
          
          // Check if user is verified seller
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setIsSellerVerified(profile.is_verified);
          }
        }
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };
    
    getUserSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Login First
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to add a product.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Add New Product
          </h1>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="vehicles">Vehicles</option>
                  <option value="electronics">Electronics</option>
                  <option value="property">Property</option>
                  <option value="art">Art</option>
                  <option value="creative-artist">Creative Artist</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="fashion">Fashion</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory *
                </label>
                <select
                  {...register('subcategory')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categorySubcategories[watchedCategory]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                {errors.subcategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.subcategory.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condition *
              </label>
              <select
                {...register('condition')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
              {errors.condition && (
                <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your product in detail..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Pricing & Auction */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Type *
              </label>
              <select
                {...register('auctionType')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="timed">Timed Auction</option>
                <option value="live">Live Auction</option>
                <option value="sealed">Sealed Bid</option>
              </select>
              {errors.auctionType && (
                <p className="text-red-500 text-sm mt-1">{errors.auctionType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Price ($) *
                </label>
                <input
                  {...register('basePrice', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.basePrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bid Increment ($) *
                </label>
                <input
                  {...register('bidIncrement', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1.00"
                />
                {errors.bidIncrement && (
                  <p className="text-red-500 text-sm mt-1">{errors.bidIncrement.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reserve Price (optional)
                </label>
                <input
                  {...register('reservePrice', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
                {errors.reservePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.reservePrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buy Now Price (optional)
                </label>
                <input
                  {...register('buyNowPrice', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
                {errors.buyNowPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.buyNowPrice.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload high-quality images of your product
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    fileInput?.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Choose Images
                </button>
              </div>
              {watch('images').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {watch('images').map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = watch('images').filter(img => img.id !== image.id);
                          setValue('images', newImages);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City"
                />
                {errors.location?.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <input
                  {...register('location.state')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="State"
                />
                {errors.location?.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.state.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <input
                  {...register('location.country')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Country"
                />
                {errors.location?.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.country.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  {...register('location.postalCode')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Postal Code"
                />
                {errors.location?.postalCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shipping Method
                </label>
                <select
                  {...register('shippingMethod')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pickup">Pickup Only</option>
                  <option value="delivery">Delivery Available</option>
                  <option value="both">Both Pickup & Delivery</option>
                </select>
                {errors.shippingMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.shippingMethod.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Return Policy
                </label>
                <select
                  {...register('returnPolicy')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="not_accepted">Returns Not Accepted</option>
                  <option value="accepted">Returns Accepted</option>
                </select>
                {errors.returnPolicy && (
                  <p className="text-red-500 text-sm mt-1">{errors.returnPolicy.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('agreeToTerms')}
                type="checkbox"
                className="rounded border-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the terms and conditions *
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isValid || loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddProduct;
