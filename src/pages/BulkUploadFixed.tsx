import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Plus,
  X,
  Eye,
  Loader2,
  Package,
  ChevronRight,
  Info,
  HelpCircle,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';

interface BulkProduct {
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
}

const BulkUploadFixed = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<BulkProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const categories = [
    'electronics', 'vehicles', 'fashion', 'jewelry', 'watches', 
    'furniture', 'books', 'sports', 'toys', 'other'
  ];

  const conditions = ['new', 'excellent', 'good', 'fair', 'poor'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('Invalid CSV file');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const products: BulkProduct[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length >= headers.length) {
          const product: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            
            // Map CSV columns to product fields
            switch (header) {
              case 'title':
              case 'product name':
                product.title = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'category':
                product.category = categories.includes(value.toLowerCase()) ? value.toLowerCase() : 'other';
                break;
              case 'condition':
                product.condition = conditions.includes(value.toLowerCase()) ? value.toLowerCase() : 'good';
                break;
              case 'starting bid':
              case 'starting_price':
              case 'startingbid':
                product.startingBid = parseFloat(value) || 1000;
                break;
              case 'reserve price':
              case 'reserve_price':
              case 'reserveprice':
                product.reservePrice = parseFloat(value) || 0;
                break;
              case 'buy now price':
              case 'buy_now_price':
              case 'buynowprice':
                product.buyNowPrice = parseFloat(value) || 0;
                break;
              case 'bid increment':
              case 'bid_increment':
              case 'bidincrement':
                product.bidIncrement = parseFloat(value) || 100;
                break;
              case 'duration':
                product.duration = parseInt(value) || 7;
                break;
              case 'location':
                product.location = value || '';
                break;
              default:
                break;
            }
          });

          // Set default values for required fields
          if (!product.title) product.title = `Product ${i}`;
          if (!product.description) product.description = 'Product description';
          if (!product.category) product.category = 'other';
          if (!product.condition) product.condition = 'good';
          if (!product.startingBid) product.startingBid = 1000;
          if (!product.bidIncrement) product.bidIncrement = 100;
          if (!product.duration) product.duration = 7;
          if (!product.location) product.location = 'Default Location';
          product.images = [];

          products.push(product);
        }
      }

      setParsedProducts(products);
      setCurrentStep(2);
      toast.success(`Parsed ${products.length} products from CSV`);
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = `title,description,category,condition,starting bid,reserve price,buy now price,bid increment,duration,location
iPhone 14 Pro Max,"Like new iPhone 14 Pro Max",electronics,excellent,50000,45000,60000,1000,7,"Mumbai, India"
MacBook Pro 16"","Powerful MacBook Pro",electronics,good,120000,100000,150000,2000,7,"Delhi, India"
Vintage Rolex,"Classic Rolex watch",watches,excellent,500000,450000,600000,5000,14,"Bangalore, India"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded');
  };

  const handleBulkUpload = async () => {
    if (parsedProducts.length === 0) {
      toast.error('No products to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResults({ success: 0, failed: 0, errors: [] });

    try {
      // Simulate bulk upload process
      for (let i = 0; i < parsedProducts.length; i++) {
        const product = parsedProducts[i];
        
        // Simulate API call for each product
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate random success/failure (90% success rate)
        const success = Math.random() > 0.1;
        
        if (success) {
          setUploadResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
        } else {
          setUploadResults(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, `Failed to upload: ${product.title}`]
          }));
        }
        
        setUploadProgress(Math.round(((i + 1) / parsedProducts.length) * 100));
      }

      toast.success(`Bulk upload completed: ${uploadResults.success} successful, ${uploadResults.failed} failed`);
      setCurrentStep(3);
    } catch (error) {
      toast.error('Bulk upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bulk Upload Products</h1>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-full h-1 mx-2 ${
                  currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Upload CSV</span>
          <span>Review Products</span>
          <span>Upload Results</span>
        </div>
      </div>

      {/* Step 1: Upload CSV */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            
            {/* Download Template */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Download Template</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Download our CSV template to ensure your data is formatted correctly.
                    Required columns: title, description, category, condition, starting bid, reserve price, buy now price, bid increment, duration, location.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-indigo-600 font-medium hover:text-indigo-700">
                  Click to upload CSV file
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-1">CSV files only, max 10MB</p>
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">File uploaded successfully</p>
                    <p className="text-sm text-green-700">{uploadedFile.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Review Products */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Review Products ({parsedProducts.length} items)
              </h2>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Upload Different File
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Condition</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Starting Bid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={product.title}>
                          {product.title}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 capitalize">{product.condition}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(product.startingBid)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{product.duration} days</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{product.location}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleBulkUpload}
                disabled={uploading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Start Bulk Upload
                  </>
                )}
              </button>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Upload Results */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{uploadResults.success}</p>
                <p className="text-sm text-green-700">Successful</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-900">{uploadResults.failed}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{parsedProducts.length}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Errors:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload More
              </button>
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Bulk Upload Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure your CSV file has the correct column headers</li>
              <li>• All products must have a title, category, and starting bid</li>
              <li>• Use standard categories: electronics, vehicles, fashion, jewelry, watches, furniture, books, sports, toys, other</li>
              <li>• Condition should be: new, excellent, good, fair, or poor</li>
              <li>• Prices should be in numbers (no currency symbols)</li>
              <li>• Duration is in days (1, 3, 7, 14, or 30)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadFixed;
