import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Image, CheckCircle, AlertCircle, Brain, Tag, Search, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ImageAnalysis {
  categories: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  objects: Array<{
    name: string;
    confidence: number;
    bbox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  attributes: Array<{
    name: string;
    value: string;
    confidence: number;
  }>;
  quality: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  tags: string[];
  suggestedCategory: string;
  suggestedPrice: number;
  description: string;
}

interface ProcessingStatus {
  stage: 'uploading' | 'analyzing' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

const AIImageRecognition: React.FC<{
  onAnalysisComplete?: (analysis: ImageAnalysis) => void;
  onCategorySelect?: (category: string) => void;
  onPriceSuggestion?: (price: number) => void;
  onDescriptionGenerate?: (description: string) => void;
}> = ({ onAnalysisComplete, onCategorySelect, onPriceSuggestion, onDescriptionGenerate }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [processing, setProcessing] = useState<ProcessingStatus | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setAnalysis(null);
      analyzeImage(result, file);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = async (imageData: string, file: File) => {
    try {
      setProcessing({
        stage: 'uploading',
        progress: 20,
        message: 'Uploading image...'
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessing({
        stage: 'analyzing',
        progress: 40,
        message: 'Analyzing image content...'
      });

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessing({
        stage: 'processing',
        progress: 70,
        message: 'Extracting insights...'
      });

      const mockAnalysis = await generateMockAnalysis(imageData, file);

      setProcessing({
        stage: 'completed',
        progress: 100,
        message: 'Analysis complete!'
      });

      setAnalysis(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);
      onCategorySelect?.(mockAnalysis.suggestedCategory);
      onPriceSuggestion?.(mockAnalysis.suggestedPrice);
      onDescriptionGenerate?.(mockAnalysis.description);

      setTimeout(() => setProcessing(null), 2000);

    } catch (error) {
      console.error('Error analyzing image:', error);
      setProcessing({
        stage: 'error',
        progress: 0,
        message: 'Failed to analyze image'
      });
      toast.error('Failed to analyze image');
    }
  };

  const generateMockAnalysis = async (imageData: string, file: File): Promise<ImageAnalysis> => {
    // Simulate different analysis based on file name or random
    const isVehicle = file.name.toLowerCase().includes('car') || Math.random() > 0.5;
    
    if (isVehicle) {
      return {
        categories: [
          { name: 'Vehicles', confidence: 92, description: 'Automobiles and motor vehicles' },
          { name: 'Cars', confidence: 88, description: 'Passenger vehicles' },
          { name: 'Luxury Cars', confidence: 75, description: 'Premium automobile brands' },
        ],
        objects: [
          { name: 'Car', confidence: 95, bbox: { x: 10, y: 20, width: 80, height: 60 } },
          { name: 'Headlight', confidence: 88, bbox: { x: 25, y: 35, width: 15, height: 10 } },
          { name: 'Wheel', confidence: 82, bbox: { x: 15, y: 65, width: 20, height: 20 } },
        ],
        attributes: [
          { name: 'Color', value: 'Silver', confidence: 90 },
          { name: 'Condition', value: 'Good', confidence: 85 },
          { name: 'Brand', value: 'Mercedes-Benz', confidence: 78 },
          { name: 'Year', value: '2020-2022', confidence: 72 },
        ],
        quality: {
          score: 85,
          issues: ['Slightly blurry in areas', 'Moderate lighting'],
          suggestions: ['Use better lighting', 'Capture from multiple angles'],
        },
        tags: ['car', 'sedan', 'mercedes', 'luxury', 'silver', '2021'],
        suggestedCategory: 'Vehicles',
        suggestedPrice: 2850000,
        description: 'Luxury Mercedes-Benz sedan in silver color, appears to be in good condition. Features include premium interior and modern technology.',
      };
    } else {
      return {
        categories: [
          { name: 'Electronics', confidence: 89, description: 'Electronic devices and gadgets' },
          { name: 'Laptops', confidence: 85, description: 'Portable computers' },
          { name: 'Apple Products', confidence: 78, description: 'Apple branded devices' },
        ],
        objects: [
          { name: 'Laptop', confidence: 93, bbox: { x: 15, y: 10, width: 70, height: 50 } },
          { name: 'Keyboard', confidence: 87, bbox: { x: 20, y: 45, width: 60, height: 15 } },
          { name: 'Screen', confidence: 91, bbox: { x: 25, y: 15, width: 50, height: 30 } },
        ],
        attributes: [
          { name: 'Brand', value: 'Apple', confidence: 88 },
          { name: 'Model', value: 'MacBook Pro', confidence: 82 },
          { name: 'Screen Size', value: '13-inch', confidence: 75 },
          { name: 'Condition', value: 'Excellent', confidence: 90 },
        ],
        quality: {
          score: 92,
          issues: [],
          suggestions: ['Good image quality', 'Clear details visible'],
        },
        tags: ['laptop', 'macbook', 'apple', 'pro', '13-inch', 'excellent'],
        suggestedCategory: 'Electronics',
        suggestedPrice: 95000,
        description: 'Apple MacBook Pro 13-inch in excellent condition. Features Retina display, M1 chip, and professional-grade performance.',
      };
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !selectedImage || !analysis) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = document.createElement('img');
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw bounding boxes
      analysis.objects.forEach((obj, index) => {
        const { x, y, width, height } = obj.bbox;
        const actualX = (x / 100) * canvas.width;
        const actualY = (y / 100) * canvas.height;
        const actualWidth = (width / 100) * canvas.width;
        const actualHeight = (height / 100) * canvas.height;
        
        // Draw box
        ctx.strokeStyle = `hsl(${index * 60}, 70%, 50%)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(actualX, actualY, actualWidth, actualHeight);
        
        // Draw label
        ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`;
        ctx.fillRect(actualX, actualY - 20, obj.name.length * 8 + 10, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${obj.name} (${Math.round(obj.confidence)}%)`, actualX + 5, actualY - 5);
      });
    };
    img.src = selectedImage;
  }, [selectedImage, analysis]);

  React.useEffect(() => {
    if (selectedImage && analysis) {
      drawBoundingBoxes();
    }
  }, [selectedImage, analysis, drawBoundingBoxes]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-blue-600 bg-blue-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Image Recognition
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart categorization and analysis with computer vision
            </p>
          </div>
        </div>
        {selectedImage && (
          <button
            onClick={() => {
              setSelectedImage(null);
              setAnalysis(null);
              setProcessing(null);
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      {!selectedImage && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${
              dragActive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {dragActive ? 'Drop image here' : 'Upload product image'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Choose Image
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports: JPG, PNG, WebP (Max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Processing Status */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-spin">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {processing.message}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Stage: {processing.stage}
                  </p>
                </div>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processing.progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {selectedImage && analysis && (
        <div className="space-y-6">
          {/* Image with Bounding Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Detected Objects
              </h4>
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Analyzed product"
                  className="w-full rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                AI Analysis Results
              </h4>
              
              {/* Suggested Category */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Suggested Category
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(analysis.categories[0].confidence)}`}>
                    {Math.round(analysis.categories[0].confidence)}%
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {analysis.suggestedCategory}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  {analysis.categories[0].description}
                </p>
              </div>

              {/* Suggested Price */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Estimated Price
                  </span>
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ₹{analysis.suggestedPrice.toLocaleString()}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Based on AI market analysis
                </p>
              </div>

              {/* Image Quality */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Image Quality
                  </span>
                  <span className={`text-sm font-medium ${getQualityColor(analysis.quality.score)}`}>
                    {analysis.quality.score}/100
                  </span>
                </div>
                {analysis.quality.issues.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Issues:</p>
                    <div className="space-y-1">
                      {analysis.quality.issues.map((issue, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.quality.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suggestions:</p>
                    <div className="space-y-1">
                      {analysis.quality.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Detected Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(category.confidence)}`}>
                      {Math.round(category.confidence)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Attributes */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Extracted Attributes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysis.attributes.map((attr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {attr.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {attr.value}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {Math.round(attr.confidence)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Generated Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Generated Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              AI-Generated Description
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {analysis.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageRecognition;
