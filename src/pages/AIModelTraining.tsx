import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  Target, 
  Zap,
  Settings,
  Play,
  Pause,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AIModel {
  id: string;
  name: string;
  type: 'recommendation' | 'pricing' | 'fraud_detection' | 'content_moderation';
  version: string;
  status: 'training' | 'active' | 'deprecated' | 'testing';
  accuracy: number;
  last_trained: string;
  training_data_size: number;
  performance_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    auc: number;
  };
}

const AIModelTraining = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState({
    userBehavior: 0,
    auctionHistory: 0,
    productData: 0,
    marketTrends: 0
  });

  const mockModels: AIModel[] = [
    {
      id: '1',
      name: 'Product Recommendation Engine',
      type: 'recommendation',
      version: 'v2.1.3',
      status: 'active',
      accuracy: 87.5,
      last_trained: '2024-01-15T10:30:00Z',
      training_data_size: 125000,
      performance_metrics: {
        precision: 0.89,
        recall: 0.85,
        f1_score: 0.87,
        auc: 0.92
      }
    },
    {
      id: '2',
      name: 'Dynamic Pricing Model',
      type: 'pricing',
      version: 'v1.8.2',
      status: 'active',
      accuracy: 92.3,
      last_trained: '2024-01-12T14:20:00Z',
      training_data_size: 89000,
      performance_metrics: {
        precision: 0.94,
        recall: 0.91,
        f1_score: 0.92,
        auc: 0.95
      }
    },
    {
      id: '3',
      name: 'Fraud Detection System',
      type: 'fraud_detection',
      version: 'v3.0.1',
      status: 'training',
      accuracy: 95.8,
      last_trained: '2024-01-10T09:15:00Z',
      training_data_size: 67000,
      performance_metrics: {
        precision: 0.97,
        recall: 0.94,
        f1_score: 0.96,
        auc: 0.98
      }
    },
    {
      id: '4',
      name: 'Content Moderation AI',
      type: 'content_moderation',
      version: 'v1.5.0',
      status: 'testing',
      accuracy: 91.2,
      last_trained: '2024-01-08T16:45:00Z',
      training_data_size: 45000,
      performance_metrics: {
        precision: 0.93,
        recall: 0.89,
        f1_score: 0.91,
        auc: 0.94
      }
    }
  ];

  useEffect(() => {
    setModels(mockModels);
    setSelectedModel(mockModels[0]);
    fetchTrainingData();
    setLoading(false);
  }, []);

  const fetchTrainingData = async () => {
    // Mock training data statistics
    setTrainingData({
      userBehavior: 125000,
      auctionHistory: 89000,
      productData: 67000,
      marketTrends: 45000
    });
  };

  const startTraining = async (modelId: string) => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast.success('Model training completed successfully!');
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    toast.success('Model training started');
  };

  const deployModel = async (modelId: string) => {
    try {
      // Update model status to active
      const updatedModels = models.map(model => 
        model.id === modelId 
          ? { ...model, status: 'active' as const }
          : model
      );
      setModels(updatedModels);
      toast.success('Model deployed successfully');
    } catch (error) {
      toast.error('Failed to deploy model');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'testing': return <Clock className="h-4 w-4" />;
      case 'deprecated': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Target className="h-6 w-6" />;
      case 'pricing': return <TrendingUp className="h-6 w-6" />;
      case 'fraud_detection': return <Brain className="h-6 w-6" />;
      case 'content_moderation': return <Settings className="h-6 w-6" />;
      default: return <Brain className="h-6 w-6" />;
    }
  };

  // Chart data for model performance
  const performanceChartData = selectedModel ? {
    labels: ['Precision', 'Recall', 'F1-Score', 'AUC'],
    datasets: [{
      label: 'Performance Metrics',
      data: [
        selectedModel.performance_metrics.precision * 100,
        selectedModel.performance_metrics.recall * 100,
        selectedModel.performance_metrics.f1_score * 100,
        selectedModel.performance_metrics.auc * 100
      ],
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: '#4F46E5',
      borderWidth: 2
    }]
  } : { labels: [], datasets: [] };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            AI Model Training
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and train AI models for the platform</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Training Data
        </button>
      </div>

      {/* Training Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User Behavior Data</p>
              <p className="text-2xl font-bold text-blue-600">{trainingData.userBehavior.toLocaleString()}</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Auction History</p>
              <p className="text-2xl font-bold text-green-600">{trainingData.auctionHistory.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Product Data</p>
              <p className="text-2xl font-bold text-purple-600">{trainingData.productData.toLocaleString()}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Trends</p>
              <p className="text-2xl font-bold text-orange-600">{trainingData.marketTrends.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Models List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Models</h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {models.map((model) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedModel?.id === model.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        {getModelIcon(model.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                        <p className="text-sm text-gray-500">Version {model.version}</p>
                        <p className="text-sm text-gray-500">
                          Last trained: {new Date(model.last_trained).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(model.status)}`}>
                        {getStatusIcon(model.status)}
                        {model.status.toUpperCase()}
                      </div>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {model.accuracy}% accuracy
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {model.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTraining(model.id);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Retrain
                      </button>
                    )}
                    {model.status === 'testing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deployModel(model.id);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Deploy
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                      View Logs
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Training in Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Training Progress</span>
                  <span>{Math.round(trainingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">Data Loading</div>
                    <div className="text-gray-500">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">Feature Extraction</div>
                    <div className="text-gray-500">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-400">Model Training</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-400">Validation</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Model Details Sidebar */}
        <div className="space-y-6">
          {selectedModel && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Model Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Model Name</label>
                    <p className="font-medium">{selectedModel.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium capitalize">{selectedModel.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Version</label>
                    <p className="font-medium">{selectedModel.version}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Training Data Size</label>
                    <p className="font-medium">{selectedModel.training_data_size.toLocaleString()} samples</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Overall Accuracy</label>
                    <p className="text-xl font-bold text-green-600">{selectedModel.accuracy}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="h-64">
                  <Radar
                    data={performanceChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          grid: { color: 'rgba(0,0,0,0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Model Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => startTraining(selectedModel.id)}
                    disabled={isTraining}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Start Training
                  </button>
                  
                  {selectedModel.status === 'testing' && (
                    <button
                      onClick={() => deployModel(selectedModel.id)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Zap className="h-5 w-5" />
                      Deploy Model
                    </button>
                  )}
                  
                  <button className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Model
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Configuration */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">AI Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-6 w-6 text-blue-500" />
              <h3 className="font-medium">Recommendation Engine</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="text-green-600">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Update Frequency:</span>
                <span>Real-time</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Threshold:</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h3 className="font-medium">Price Prediction</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="text-green-600">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Update Frequency:</span>
                <span>Hourly</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span>92.3%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-6 w-6 text-purple-500" />
              <h3 className="font-medium">Fraud Detection</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="text-green-600">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Sensitivity:</span>
                <span>High</span>
              </div>
              <div className="flex justify-between">
                <span>False Positive Rate:</span>
                <span>2.1%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="h-6 w-6 text-orange-500" />
              <h3 className="font-medium">Content Moderation</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="text-green-600">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-approve:</span>
                <span>90%+ confidence</span>
              </div>
              <div className="flex justify-between">
                <span>Human Review:</span>
                <span>&lt;90% confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelTraining;