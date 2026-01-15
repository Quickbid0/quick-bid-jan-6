import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Video,
  Loader2,
  Car,
  Wrench,
  Palette,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const BulkUpload = () => {
  const [uploadType, setUploadType] = useState('products');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);

  const uploadTypes = [
    {
      id: 'products',
      name: 'General Products',
      description: 'Upload multiple products with images and details',
      icon: <FileSpreadsheet className="h-6 w-6" />,
      template: 'products_template.xlsx',
      color: 'border-blue-500 bg-blue-50'
    },
    {
      id: 'vehicles',
      name: 'Seized Vehicles',
      description: 'Bank seized vehicles and automobiles',
      icon: <Car className="h-6 w-6" />,
      template: 'vehicles_template.xlsx',
      color: 'border-orange-500 bg-orange-50'
    },
    {
      id: 'machinery',
      name: 'Industrial Machinery',
      description: 'Heavy machinery and industrial equipment',
      icon: <Wrench className="h-6 w-6" />,
      template: 'machinery_template.xlsx',
      color: 'border-green-500 bg-green-50'
    },
    {
      id: 'art',
      name: 'Art & Collectibles',
      description: 'Paintings, sculptures, and collectible items',
      icon: <Palette className="h-6 w-6" />,
      template: 'art_template.xlsx',
      color: 'border-purple-500 bg-purple-50'
    },
    {
      id: 'property',
      name: 'Real Estate',
      description: 'Properties, land, and real estate assets',
      icon: <Building className="h-6 w-6" />,
      template: 'property_template.xlsx',
      color: 'border-red-500 bg-red-50'
    }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setUploadResults(null);
      } else {
        toast.error('Please upload a valid Excel or CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Mock upload results
      const mockResults = {
        totalRows: 156,
        successful: 142,
        failed: 14,
        errors: [
          { row: 5, error: 'Missing required field: price' },
          { row: 12, error: 'Invalid image URL' },
          { row: 23, error: 'Category not found' },
          { row: 34, error: 'Description too long' }
        ]
      };

      setUploadResults(mockResults);
      toast.success(`Upload completed! ${mockResults.successful} items processed successfully`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (templateName) => {
    // In a real implementation, this would download the actual template
    toast.success(`Downloading ${templateName}...`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bulk Upload</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple products at once using Excel or CSV files
        </p>
      </div>

      {/* Upload Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Upload Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploadTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                uploadType === type.id
                  ? `${type.color} border-opacity-100`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUploadType(type.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                {type.icon}
                <h3 className="font-semibold">{type.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{type.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate(type.template);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download Template
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-gray-500 mb-4">
            Supports Excel (.xlsx, .xls) and CSV files up to 10MB
          </p>
          
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
          >
            Choose File
          </label>
          
          {file && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        {file && !uploading && !uploadResults && (
          <div className="mt-6 text-center">
            <button
              onClick={handleUpload}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Start Upload
            </button>
          </div>
        )}

        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Results */}
      {uploadResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{uploadResults.totalRows}</p>
              <p className="text-sm text-blue-800">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{uploadResults.successful}</p>
              <p className="text-sm text-green-800">Successful</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{uploadResults.failed}</p>
              <p className="text-sm text-red-800">Failed</p>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Errors Found
              </h3>
              <div className="space-y-2">
                {uploadResults.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Row {error.row}:</span> {error.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                setFile(null);
                setUploadResults(null);
                setUploadProgress(0);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Upload Another File
            </button>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
              Download Error Report
            </button>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">File Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maximum file size: 10MB</li>
              <li>• Supported formats: .xlsx, .xls, .csv</li>
              <li>• Maximum 1000 rows per upload</li>
              <li>• Use provided templates for best results</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Data Validation</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All required fields must be filled</li>
              <li>• Images must be valid URLs</li>
              <li>• Prices must be numeric values</li>
              <li>• Categories must match predefined list</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;