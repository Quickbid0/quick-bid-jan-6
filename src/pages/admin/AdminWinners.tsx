import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { Trophy, Printer, MapPin, Phone } from 'lucide-react';
import AuctionTypeBadge from '../../components/auctions/AuctionTypeBadge';
import { toast } from 'react-hot-toast';

// Interfaces
interface BranchOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface WinnerRow {
  auction_id: string;
  auction_type?: 'live' | 'timed' | 'flash' | 'tender' | null;
  seller_id: string | null;
  product_title: string;
  product_id: string | null;
  product_category: string | null;
  winner_id: string;
  winner_name: string | null;
  winner_phone: string | null;
  winner_token_fee_paid_at?: string | null;
  finance_provider_key?: string | null;
  finance_status?: string | null;
  insurance_provider_key?: string | null;
  final_price: number | null;
  status: string;
  winner_risk_level?: 'low' | 'medium' | 'high' | null;
  winner_is_verified?: boolean | null;
  winner_verification_status?: string | null;
  delivery_mode: 'delivery' | 'pickup' | null;
  branch_id: string | null;
  branch_name: string | null;
  pref_status: string | null;
  pref_contact_name?: string | null;
  pref_primary_phone?: string | null;
  pref_alternate_phone?: string | null;
  pref_address_line1?: string | null;
  pref_address_line2?: string | null;
  pref_city?: string | null;
  pref_state?: string | null;
  pref_pincode?: string | null;
  pref_country?: string | null;
  has_preferences?: boolean;
  payout_status?: string | null;
  payout_sale_price?: number | null;
  payout_commission?: number | null;
  payout_net_payout?: number | null;
  seller_total_auctions?: number | null;
  seller_total_sales?: number | null;
  location_id?: string | null;
}

import LocationFilter from '../../components/admin/LocationFilter';

const AdminWinners: React.FC = () => {
  // State
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [detailsRow, setDetailsRow] = useState<WinnerRow | null>(null);
  const [settlementFilter, setSettlementFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [auctionTypeFilter, setAuctionTypeFilter] = useState<'all' | 'live' | 'timed' | 'flash' | 'tender'>('all');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [commissionSummary, setCommissionSummary] = useState<{
    buyerPct: number;
    sellerPct: number;
    platformFlatRupees: number;
  } | null>(null);
  const [sellerRiskSummary, setSellerRiskSummary] = useState<{
    riskLevel: 'low' | 'medium' | 'high';
    status: 'normal' | 'limited' | 'blocked' | 'flagged';
    cooldownActive: boolean;
  } | null>(null);
  const [settlementEta, setSettlementEta] = useState<{
    minDays: number;
    maxDays: number;
    medianDays: number;
    label: string;
  } | null>(null);
  const [settlementEtaLoading, setSettlementEtaLoading] = useState(false);
  const [sellerSettlementEta, setSellerSettlementEta] = useState<{
    minDays: number;
    maxDays: number;
    medianDays: number;
    label: string;
  } | null>(null);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [financedOnly, setFinancedOnly] = useState(false);
  
  // Get URL params
  const location = useLocation();
  const sellerFilter = new URLSearchParams(location.search).get('sellerId');
  const auctionFilter = new URLSearchParams(location.search).get('auctionId');

  // Load winners data
  const loadWinners = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: qError } = await supabase
        .from('auctions')
        .select(`
          id,
          status,
          auction_type,
          seller_id,
          winner_id,
          final_price,
          finance_provider_key,
          finance_status,
          product:products(id, title, category, main_category, sub_category, location_id),
          winner:profiles(id, name, phone, is_verified, verification_status, token_fee_paid_at)
        `)
        .eq('status', 'ended')
        .not('winner_id', 'is', null)
        .order('actual_end_time', { ascending: false })
        .limit(200);

      if (qError) throw qError;

      // Process and set rows
      const processedRows = (data || []).map((a: any) => ({
        auction_id: a.id,
        auction_type: a.auction_type ?? null,
        seller_id: a.seller_id ?? null,
        status: a.status,
        winner_id: a.winner_id,
        final_price: a.final_price ?? null,
        product_title: a.product?.title || '—',
        product_id: a.product?.id ?? null,
        product_category: (a.product?.main_category || a.product?.category || a.product?.sub_category || null),
        winner_name: a.winner?.name ?? null,
        winner_phone: a.winner?.phone ?? null,
        winner_token_fee_paid_at: a.winner?.token_fee_paid_at ?? null,
        finance_provider_key: a.finance_provider_key ?? null,
        finance_status: a.finance_status ?? null,
        winner_risk_level: null,
        winner_is_verified: a.winner?.is_verified ?? null,
        winner_verification_status: a.winner?.verification_status ?? null,
        delivery_mode: null,
        branch_id: null,
        branch_name: null,
        pref_status: null,
        has_preferences: false,
        payout_status: null,
        payout_sale_price: null,
        payout_commission: null,
        payout_net_payout: null,
        seller_total_auctions: null,
        seller_total_sales: null,
      }));

      setRows(processedRows);
    } catch (e) {
      console.error('Error loading winners:', e);
      setError('Failed to load winners');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load branches
  const loadBranches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city, state')
        .order('name');
      
      if (error) throw error;
      
      setBranches(data || []);
    } catch (e) {
      console.error('Error loading branches:', e);
    }
  }, []);

  // Filter rows based on current filters
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      // Apply auction filter from URL
      if (auctionFilter && row.auction_id !== auctionFilter) {
        return false;
      }

      // Apply seller filter from URL
      if (sellerFilter && row.seller_id !== sellerFilter) {
        return false;
      }

      // Apply auction type filter
      if (auctionTypeFilter !== 'all' && row.auction_type !== auctionTypeFilter) {
        return false;
      }

      // Apply settlement status filter
      if (settlementFilter !== 'all' && row.payout_status !== settlementFilter) {
        return false;
      }

      // Apply attention only filter
      if (attentionOnly && row.payout_status !== 'pending') {
        return false;
      }

      // Apply financed only filter
      if (financedOnly && !row.finance_provider_key) {
        return false;
      }

      return true;
    });
  }, [rows, auctionFilter, sellerFilter, auctionTypeFilter, settlementFilter, attentionOnly, financedOnly]);

  // Load data on component mount
  useEffect(() => {
    loadWinners();
    loadBranches();
  }, [loadWinners, loadBranches]);

  // Handle CSV export
  const handleExportCsv = () => {
    const headers = [
      'Auction ID',
      'Product',
      'Winner',
      'Price',
      'Status',
      'Seller ID',
      'Category',
      'Auction Type',
      'Payment Status'
    ];

    // Create CSV rows
    const csvRows = [
      headers.join(','),
      ...filteredRows.map(row => [
        `"${row.auction_id}"`,
        `"${row.product_title}"`,
        `"${row.winner_name || 'N/A'}"`,
        `"${row.final_price ? '₹' + row.final_price.toLocaleString() : 'N/A'}"`,
        `"${row.payout_status === 'completed' ? 'Paid' : 'Pending'}"`,
        `"${row.seller_id || 'N/A'}"`,
        `"${row.product_category || 'N/A'}"`,
        `"${row.auction_type || 'N/A'}"`,
        `"${row.payout_status || 'pending'}"`
      ].join(','))
    ];

    // Create and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `winners_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading winners...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}. <button onClick={loadWinners} className="font-medium text-red-700 hover:text-red-600 underline">Try again</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auction Winners</h1>
        <div className="flex space-x-3 items-center">
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[180px]" />
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="auction-type" className="block text-sm font-medium text-gray-700">Auction Type</label>
              <select
                id="auction-type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={auctionTypeFilter}
                onChange={(e) => setAuctionTypeFilter(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="live">Live</option>
                <option value="timed">Timed</option>
                <option value="flash">Flash</option>
                <option value="tender">Tender</option>
              </select>
            </div>

            <div>
              <label htmlFor="settlement-status" className="block text-sm font-medium text-gray-700">Settlement Status</label>
              <select
                id="settlement-status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={settlementFilter}
                onChange={(e) => setSettlementFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center h-5">
                <input
                  id="attention-only"
                  name="attention-only"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={attentionOnly}
                  onChange={(e) => setAttentionOnly(e.target.checked)}
                />
                <label htmlFor="attention-only" className="ml-2 block text-sm text-gray-900">
                  Needs Attention
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center h-5">
                <input
                  id="financed-only"
                  name="financed-only"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={financedOnly}
                  onChange={(e) => setFinancedOnly(e.target.checked)}
                />
                <label htmlFor="financed-only" className="ml-2 block text-sm text-gray-900">
                  Financed Only
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winners Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={`${row.auction_id}-${row.winner_id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-md">
                          <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{row.auction_id}</div>
                          <div className="text-sm text-gray-500">
                            {row.auction_type && <AuctionTypeBadge type={row.auction_type} />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{row.product_title}</div>
                      <div className="text-sm text-gray-500">{row.product_category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{row.winner_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{row.winner_phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {row.final_price ? `₹${row.final_price.toLocaleString()}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        row.payout_status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : row.payout_status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {row.payout_status === 'completed' 
                          ? 'Paid' 
                          : row.payout_status === 'in_progress'
                            ? 'In Progress'
                            : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setDetailsRow(row)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No winners found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {detailsRow && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setDetailsRow(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Winner Details - {detailsRow.product_title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Auction ID: {detailsRow.auction_id}</p>
                      </div>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setDetailsRow(null)}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Product Information</h4>
                        <dl className="space-y-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Product</dt>
                            <dd className="mt-1 text-sm text-gray-900">{detailsRow.product_title}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Category</dt>
                            <dd className="mt-1 text-sm text-gray-900">{detailsRow.product_category || 'N/A'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Auction Type</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <AuctionTypeBadge type={detailsRow.auction_type} />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Final Price</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {detailsRow.final_price ? `₹${detailsRow.final_price.toLocaleString()}` : 'N/A'}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Winner Information</h4>
                        <dl className="space-y-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{detailsRow.winner_name || 'N/A'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {detailsRow.winner_phone ? (
                                <a href={`tel:${detailsRow.winner_phone}`} className="text-blue-600 hover:text-blue-500">
                                  {detailsRow.winner_phone}
                                </a>
                              ) : 'N/A'}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Verification</dt>
                            <dd className="mt-1 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                detailsRow.winner_is_verified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {detailsRow.winner_is_verified ? 'Verified' : 'Not Verified'}
                              </span>
                            </dd>
                          </div>
                          {detailsRow.finance_provider_key && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Financing</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {detailsRow.finance_provider_key} - {detailsRow.finance_status || 'Pending'}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Settlement</h4>
                        <dl className="space-y-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                detailsRow.payout_status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : detailsRow.payout_status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {detailsRow.payout_status === 'completed' 
                                  ? 'Paid' 
                                  : detailsRow.payout_status === 'in_progress'
                                    ? 'In Progress'
                                    : 'Pending'}
                              </span>
                            </dd>
                          </div>
                          {detailsRow.payout_status === 'completed' && detailsRow.payout_net_payout && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Net Payout</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                ₹{detailsRow.payout_net_payout.toLocaleString()}
                              </dd>
                            </div>
                          )}
                          {settlementEta && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Estimated Settlement</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {settlementEta.label}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    {/* Delivery Preferences */}
                    {detailsRow.has_preferences && (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Preferences</h4>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Delivery Method</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">
                              {detailsRow.delivery_mode || 'Not specified'}
                            </dd>
                          </div>
                          {detailsRow.branch_name && (
                            <div className="sm:col-span-4">
                              <dt className="text-sm font-medium text-gray-500">Preferred Branch</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {detailsRow.branch_name}
                                {detailsRow.branch_name && (detailsRow.pref_city || detailsRow.pref_state) && ' - '}
                                {[detailsRow.pref_city, detailsRow.pref_state].filter(Boolean).join(', ')}
                              </dd>
                            </div>
                          )}
                          {detailsRow.pref_contact_name && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                              <dd className="mt-1 text-sm text-gray-900">{detailsRow.pref_contact_name}</dd>
                            </div>
                          )}
                          {detailsRow.pref_primary_phone && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <a href={`tel:${detailsRow.pref_primary_phone}`} className="text-blue-600 hover:text-blue-500">
                                  {detailsRow.pref_primary_phone}
                                </a>
                                {detailsRow.pref_alternate_phone && (
                                  <span className="ml-2 text-gray-500">
                                    (Alt: <a href={`tel:${detailsRow.pref_alternate_phone}`} className="text-blue-600 hover:text-blue-500">
                                      {detailsRow.pref_alternate_phone}
                                    </a>)
                                  </span>
                                )}
                              </dd>
                            </div>
                          )}
                          {(detailsRow.pref_address_line1 || detailsRow.pref_address_line2) && (
                            <div className="sm:col-span-6">
                              <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {[detailsRow.pref_address_line1, detailsRow.pref_address_line2, detailsRow.pref_city, detailsRow.pref_state, detailsRow.pref_pincode, detailsRow.pref_country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDetailsRow(null)}
                >
                  Close
                </button>
                {detailsRow.payout_status !== 'completed' && (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      // Show confirmation dialog before marking as paid
                      if (window.confirm(`Are you sure you want to mark this auction (${detailsRow.auction_id}) as paid to winner ${detailsRow.winner_name}? This action cannot be undone.`)) {
                        // Handle mark as paid
                        toast.success('Payment marked as completed');
                        setDetailsRow(prev => prev ? { ...prev, payout_status: 'completed' } : null);
                      }
                    }}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWinners;
