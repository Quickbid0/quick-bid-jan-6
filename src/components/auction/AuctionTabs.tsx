import React, { useState } from 'react';

interface Auction {
  id: string;
  title: string;
  description: string;
  inspection?: {
    grade: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
    report: string;
  };
  seller: {
    id: string;
    name: string;
    rating: number;
    ratingCount: number;
  };
}

interface UserBid {
  amount: number;
  timestamp: string;
}

interface AuctionTabsProps {
  auction: Auction;
  userBid?: UserBid | null;
}

type TabName = 'details' | 'inspection' | 'history' | 'seller';

export function AuctionTabs({ auction, userBid }: AuctionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>('details');

  const tabs: Array<{
    id: TabName;
    label: string;
    icon: string;
  }> = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'inspection', label: 'Inspection', icon: '🔍' },
    { id: 'history', label: 'Bid History', icon: '📊' },
    { id: 'seller', label: 'Seller Profile', icon: '👤' },
  ];

  return (
    <div className="border-t border-gray-200 w-full min-w-0">
      {/* Tab Headers - Scrollable on mobile, wrapping on desktop */}
      <div className="flex overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 md:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 md:px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] touch-manipulation md:min-h-auto ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content - Prevent overflow */}
      <div className="px-4 md:px-6 py-6 overflow-x-hidden">
        {activeTab === 'details' && (
          <DetailsTab auction={auction} />
        )}
        {activeTab === 'inspection' && (
          <InspectionTab auction={auction} />
        )}
        {activeTab === 'history' && (
          <HistoryTab />
        )}
        {activeTab === 'seller' && (
          <SellerTab seller={auction.seller} />
        )}
      </div>
    </div>
  );
}

function DetailsTab({ auction }: { auction: Auction }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{auction.title}</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {auction.description}
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Original condition</li>
          <li>✓ Complete documentation</li>
          <li>✓ Verified by AI inspection</li>
          <li>✓ Escrow protection available</li>
        </ul>
      </div>
    </div>
  );
}

function InspectionTab({ auction }: { auction: Auction }) {
  if (!auction.inspection) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No inspection report available</p>
      </div>
    );
  }

  const gradeColors = {
    'ACE': 'bg-green-100 text-green-800',
    'GOOD': 'bg-blue-100 text-blue-800',
    'FAIR': 'bg-amber-100 text-amber-800',
    'POOR': 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className={`p-4 rounded-lg ${gradeColors[auction.inspection.grade]}`}>
        <div className="text-sm font-semibold uppercase mb-2">AI Inspection Grade</div>
        <div className="text-3xl font-bold">{auction.inspection.grade}</div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Inspection Report</h4>
        <p className="text-gray-600 whitespace-pre-line">
          {auction.inspection.report}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">What does this mean?</h4>
        <p className="text-sm text-gray-700">
          This item has been inspected by our AI system. The detailed report above outlines the condition, any issues found, and the overall grade.
        </p>
      </div>
    </div>
  );
}

function HistoryTab() {
  // Sample bid history data
  const bidHistory = [
    { bidder: 'Anonymous', amount: '₹18,500', time: '2 minutes ago' },
    { bidder: 'Anonymous', amount: '₹18,000', time: '15 minutes ago' },
    { bidder: 'Anonymous', amount: '₹17,500', time: '1 hour ago' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr className="text-left text-gray-500 font-semibold">
              <th className="pb-3">Bidder</th>
              <th className="pb-3 text-right">Bid Amount</th>
              <th className="pb-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bidHistory.map((bid, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3">{bid.bidder}</td>
                <td className="py-3 text-right font-medium">{bid.amount}</td>
                <td className="py-3 text-right text-gray-500">{bid.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerTab({ seller }: { seller: Auction['seller'] }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
          <div className="text-sm text-gray-600 mt-1">
            ⭐ {seller.rating}/5 ({seller.ratingCount} reviews)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-xs text-gray-500 mt-1">Rating</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">1.2k</div>
          <div className="text-xs text-gray-500 mt-1">Sales</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">2h</div>
          <div className="text-xs text-gray-500 mt-1">Avg Response</div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-green-900 mb-2">✓ Verified Seller</div>
        <p className="text-sm text-green-800">
          This seller has been verified and has a strong track record of successful transactions.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Seller Policies</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Returns accepted (30 days)</li>
          <li>✓ Shipping by next business day</li>
          <li>✓ Member since January 2023</li>
          <li>✓ Located in Mumbai, India</li>
        </ul>
      </div>

      <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Contact Seller
      </button>
    </div>
  );
}
