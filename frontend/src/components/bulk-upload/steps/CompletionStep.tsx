// src/components/bulk-upload/steps/CompletionStep.tsx
import React from 'react';
import {
  CheckCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Package,
  Gavel,
  BarChart3,
  ArrowRight,
  Clock
} from 'lucide-react';

interface CompletionStepProps {
  results: {
    successfulUploads: number;
    failedUploads: number;
    createdProducts: Array<{
      id: string;
      title: string;
      price: number;
    }>;
    createdAuctions: Array<{
      id: string;
      productId: string;
      startPrice: number;
    }>;
  };
  onUploadMore: () => void;
  onClose: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  results,
  onUploadMore,
  onClose,
}) => {
  const totalRecords = results.successfulUploads + results.failedUploads;
  const successRate = totalRecords > 0 ? (results.successfulUploads / totalRecords) * 100 : 0;
  const totalValue = results.createdProducts.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Import Successful! 🎉
        </h3>
        <p className="text-lg text-gray-600">
          Your vehicle data has been successfully imported and auctions have been created.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResultCard
          title="Records Processed"
          value={totalRecords.toString()}
          subtitle="Total from all files"
          icon={BarChart3}
          color="blue"
        />
        <ResultCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          subtitle={`${results.successfulUploads} of ${totalRecords}`}
          icon={CheckCircle}
          color="green"
        />
        <ResultCard
          title="Products Created"
          value={results.createdProducts.length.toString()}
          subtitle="Ready for auction"
          icon={Package}
          color="purple"
        />
        <ResultCard
          title="Auctions Launched"
          value={results.createdAuctions.length.toString()}
          subtitle="Live bidding available"
          icon={Gavel}
          color="orange"
        />
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Import Summary
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Value Imported</span>
              <span className="font-semibold text-gray-900">
                ₹{totalValue.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Average Product Value</span>
              <span className="font-semibold text-gray-900">
                ₹{results.createdProducts.length > 0
                  ? (totalValue / results.createdProducts.length).toLocaleString()
                  : '0'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Processing Time</span>
              <span className="font-semibold text-gray-900">~2 minutes</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Files Processed</span>
              <span className="font-semibold text-gray-900">2 files</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-green-600" />
            What's Next?
          </h4>

          <div className="space-y-3">
            <NextStepItem
              icon={<Gavel className="h-4 w-4" />}
              title="Auctions Going Live"
              description="Your auctions will start accepting bids shortly"
              status="scheduled"
            />

            <NextStepItem
              icon={<Package className="h-4 w-4" />}
              title="Monitor Performance"
              description="Track bids, views, and auction progress"
              status="available"
            />

            <NextStepItem
              icon={<TrendingUp className="h-4 w-4" />}
              title="View Analytics"
              description="Analyze auction performance and revenue"
              status="available"
            />

            <NextStepItem
              icon={<Download className="h-4 w-4" />}
              title="Download Reports"
              description="Export detailed import and auction reports"
              status="available"
            />
          </div>
        </div>
      </div>

      {/* Sample Products Preview */}
      {results.createdProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-gray-900">Sample Products Created</h4>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.createdProducts.slice(0, 6).map((product, index) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1 truncate">
                  {product.title}
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  ₹{product.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Auction Live
                  </span>
                </div>
              </div>
            ))}
          </div>

          {results.createdProducts.length > 6 && (
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                And {results.createdProducts.length - 6} more products...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Import completed successfully! Your products are now ready for auction.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onUploadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Upload More
          </button>

          <button
            onClick={() => window.location.href = '/auctions/my'}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            View My Auctions
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Result Card Component
const ResultCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 opacity-75" />
        <div className="text-right">
          <div className="text-3xl font-bold">{value}</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>

      {/* Decorative element */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${color.replace('50', '100')} rounded-full -mr-8 -mt-8 opacity-20`} />
    </div>
  );
};

// Next Step Item Component
const NextStepItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'completed' | 'available' | 'scheduled' | 'pending';
}> = ({ icon, title, description, status }) => {
  const statusConfig = {
    completed: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    available: { color: 'text-blue-600 bg-blue-100', icon: ArrowRight },
    scheduled: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
    pending: { color: 'text-gray-600 bg-gray-100', icon: Clock },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
        {status === 'completed' ? (
          <StatusIcon className="h-3 w-3" />
        ) : (
          icon
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-gray-900">{title}</h5>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium capitalize ${config.color}`}>
        {status}
      </div>
    </div>
  );
};

export default CompletionStep;
