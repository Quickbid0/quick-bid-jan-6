// src/components/bulk-upload/steps/ReviewStep.tsx
import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  Package,
  Gavel,
  TrendingUp
} from 'lucide-react';

interface ReviewStepProps {
  results: {
    successfulUploads: number;
    failedUploads: number;
    createdProducts: Array<{
      id: string;
      title: string;
      price: number;
      status: string;
    }>;
    createdAuctions: Array<{
      id: string;
      productId: string;
      startPrice: number;
      status: string;
    }>;
  };
  onApprove: () => void;
  onEdit: (changes: any) => void;
  onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  results,
  onApprove,
  onEdit,
  onBack,
}) => {
  const [selectedTab, setSelectedTab] = useState<'summary' | 'products' | 'auctions'>('summary');

  const totalRecords = results.successfulUploads + results.failedUploads;
  const successRate = totalRecords > 0 ? (results.successfulUploads / totalRecords) * 100 : 0;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package, count: results.createdProducts.length },
    { id: 'auctions', label: 'Auctions', icon: Gavel, count: results.createdAuctions.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Import Complete - Review Results
        </h3>
        <p className="text-gray-600">
          Your data has been processed successfully. Please review the results before finalizing.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Records"
          value={totalRecords.toString()}
          subtitle="Processed from files"
          icon={FileText}
          color="blue"
        />
        <SummaryCard
          title="Successful Imports"
          value={results.successfulUploads.toString()}
          subtitle={`${successRate.toFixed(1)}% success rate`}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="Created Items"
          value={(results.createdProducts.length + results.createdAuctions.length).toString()}
          subtitle={`${results.createdProducts.length} products, ${results.createdAuctions.length} auctions`}
          icon={Package}
          color="purple"
        />
      </div>

      {/* Results Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'summary' && (
            <SummaryTab results={results} />
          )}

          {selectedTab === 'products' && (
            <ProductsTab products={results.createdProducts} />
          )}

          {selectedTab === 'auctions' && (
            <AuctionsTab auctions={results.createdAuctions} />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Review complete? Approve to finalize the import or go back to make changes.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Processing
          </button>

          <button
            onClick={() => onEdit({})}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Edit Details
          </button>

          <button
            onClick={onApprove}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Approve & Finalize
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'red';
}> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 opacity-75" />
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>
    </div>
  );
};

// Summary Tab
const SummaryTab: React.FC<{ results: ReviewStepProps['results'] }> = ({ results }) => {
  const totalRecords = results.successfulUploads + results.failedUploads;
  const successRate = totalRecords > 0 ? (results.successfulUploads / totalRecords) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Success Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h4 className="font-semibold text-green-900">Successful Imports</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Records processed:</span>
              <span className="font-medium">{results.successfulUploads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Success rate:</span>
              <span className="font-medium">{successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Items Created</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Products:</span>
              <span className="font-medium">{results.createdProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Auctions:</span>
              <span className="font-medium">{results.createdAuctions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Import Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total records processed:</span>
            <span className="font-medium">{totalRecords}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Successfully imported:</span>
            <span className="font-medium text-green-600">{results.successfulUploads}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Failed to import:</span>
            <span className="font-medium text-red-600">{results.failedUploads}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Products created:</span>
            <span className="font-medium">{results.createdProducts.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Auctions launched:</span>
            <span className="font-medium">{results.createdAuctions.length}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>All products will be listed for auction</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>You'll receive notifications when auctions start</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Real-time bidding will be available on all auctions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Escrow protection ensures secure transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Tab
const ProductsTab: React.FC<{ products: ReviewStepProps['results']['createdProducts'] }> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No products were created</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Created Products ({products.length})</h4>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export List
        </button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">{product.title}</h5>
                <p className="text-sm text-gray-500">
                  ₹{product.price.toLocaleString()} • {product.status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'approved' ? 'bg-green-100 text-green-800' :
                product.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {product.status.replace('_', ' ')}
              </span>

              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Auctions Tab
const AuctionsTab: React.FC<{ auctions: ReviewStepProps['results']['createdAuctions'] }> = ({ auctions }) => {
  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No auctions were created</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Created Auctions ({auctions.length})</h4>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export List
        </button>
      </div>

      <div className="grid gap-4">
        {auctions.map((auction) => (
          <div key={auction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Gavel className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Auction #{auction.id}</h5>
                <p className="text-sm text-gray-500">
                  Starting bid: ₹{auction.startPrice.toLocaleString()} • {auction.status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                auction.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                auction.status === 'live' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {auction.status}
              </span>

              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View Auction
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStep;
