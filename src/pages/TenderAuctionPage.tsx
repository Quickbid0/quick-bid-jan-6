import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FileText, Lock, Eye, Shield, Calendar, DollarSign, Building, Truck, Award, Users, Download, Upload, AlertTriangle, CheckCircle, Clock, Scale, Gavel, Search } from 'lucide-react';
import AuctionTypeBadge from '../components/auctions/AuctionTypeBadge';
import SellerTrustSummary from '../components/auctions/SellerTrustSummary';

interface TenderAuction {
  id: string;
  title: string;
  description: string;
  min_bid: number;
  tender_fee: number;
  submission_deadline: string;
  opening_date: string;
  status: 'open' | 'closed' | 'awarded';
  bid_count: number;
  image_url: string;
  seller: {
    id?: string;
    name: string;
    type: 'government' | 'company' | 'third_party';
    verified: boolean;
    gst_number: string;
    contact_email: string;
    contact_phone: string;
    avatar_url: string;
    auctions_count?: number | null;
    total_sales_amount?: number | null;
  };
  category: string;
  location: string;
  requirements: string[];
  documents_required: string[];
  technical_specifications: any;
  evaluation_criteria: any;
  tender_documents: string[];
  estimated_value: number;
  contract_duration: string;
  payment_terms: string;
}

const TenderAuctionPage = () => {
  const { id } = useParams();
  const [tenders, setTenders] = useState<TenderAuction[]>([]);
  const [selectedTender, setSelectedTender] = useState<TenderAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('closing_soon');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidDocuments, setBidDocuments] = useState<File[]>([]);
  const [technicalCompliance, setTechnicalCompliance] = useState({});
  const [userBid, setUserBid] = useState(null);



  useEffect(() => {
    const loadTenders = async () => {
      try {
        const forceMock = (typeof window !== 'undefined' && localStorage.getItem('test-mock-tender') === 'true') || (import.meta as any)?.env?.VITE_TEST_MOCK_TENDER === 'true';
        let source: any[] = [];
        if (!forceMock) {
          try {
            const res: any = await Promise.race([
              supabase
                .from('auctions')
                .select(`
                  id,
                  auction_type,
                  status,
                  starting_price,
                  reserve_price,
                  end_date,
                  product:products(title, description, image_url, category, location),
                  seller:profiles(id, name, is_verified, avatar_url),
                  seller_metrics: seller_metrics(total_auctions, total_sales)
                `)
                .eq('auction_type', 'tender'),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]);
            if (res && !res.error) {
              source = res.data || [];
            }
          } catch (_) {
            source = [];
          }
        }
        if (forceMock || source.length === 0) {
          source = [
            {
              id: 'mock-tender-1',
              auction_type: 'tender',
              status: 'open',
              starting_price: 2500000,
              reserve_price: 3500000,
              end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              product: {
                title: 'Government Office Furniture Supply Contract',
                description: 'Supply and installation of office furniture.',
                image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
                category: 'Furniture & Fixtures',
                location: 'New Delhi, NCR'
              },
              seller: { id: 'gov-1', name: 'Ministry of Public Works', is_verified: true, avatar_url: '' },
              seller_metrics: { total_auctions: 12, total_sales: 40 }
            }
          ];
        }
        const mapped: TenderAuction[] = (source || []).map((a: any) => ({
          id: a.id,
          title: a.product?.title || 'Tender auction',
          description: a.product?.description || '',
          min_bid: a.starting_price || 0,
          tender_fee: 0,
          submission_deadline: a.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          opening_date: a.end_date || new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          status: a.status === 'closed' || a.status === 'ended' ? 'closed' : 'open',
          bid_count: 0,
          image_url: a.product?.image_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
          seller: {
            id: a.seller?.id,
            name: a.seller?.name || 'Tender authority',
            type: 'government',
            verified: !!a.seller?.is_verified,
            gst_number: 'GSTXXXXXXXXX',
            contact_email: 'tenders@example.com',
            contact_phone: '+91 0000 000 000',
            avatar_url: a.seller?.avatar_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80',
            auctions_count: (a.seller_metrics as any)?.total_auctions != null ? Number((a.seller_metrics as any).total_auctions) : null,
            total_sales_amount: (a.seller_metrics as any)?.total_sales != null ? Number((a.seller_metrics as any).total_sales) : null,
          },
          category: a.product?.category || 'General',
          location: a.product?.location || 'Online',
          requirements: ['GST Registration', 'PAN Card', 'Trade License'],
          documents_required: ['Company Registration', 'GST Certificate', 'Financial Statements'],
          technical_specifications: { description: 'As per tender document' },
          evaluation_criteria: { technical: '70%', financial: '30%' },
          tender_documents: ['Tender Notice', 'Terms & Conditions'],
          estimated_value: a.reserve_price || a.starting_price || 0,
          contract_duration: 'As per terms',
          payment_terms: 'As per terms',
        }));
        setTenders(mapped);
      } catch (e) {
        console.error('Unexpected error loading tenders', e);
        toast.error('Failed to load tenders');
        setTenders([]);
      } finally {
        setLoading(false);
      }
    };

    loadTenders();
  }, []);

  useEffect(() => {
    // If no id is provided but we have tenders, default to the first one
    if (!id) {
      if (tenders.length > 0) {
        setSelectedTender(tenders[0]);
      } else {
        setSelectedTender(null);
      }
      return;
    }

    // Try to find tender by id
    const selected = tenders.find(t => t.id === id) || null;
    setSelectedTender(selected);
  }, [id, tenders]);

  useEffect(() => {
    const loadUserSealedBid = async () => {
      if (!selectedTender) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserBid(null as any);
          return;
        }

        const { data, error } = await supabase
          .from('bids')
          .select('amount, created_at, bid_type, status')
          .eq('auction_id', selectedTender.id)
          .eq('user_id', user.id)
          .eq('bid_type', 'sealed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading user sealed tender bid', error);
          return;
        }

        if (data && data.length > 0) {
          const b = data[0];
          setUserBid({
            amount: b.amount,
            documents: [],
            compliance: {},
            submitted_at: b.created_at,
          } as any);
        } else {
          setUserBid(null as any);
        }
      } catch (e) {
        console.error('Unexpected error loading user sealed tender bid', e);
      }
    };

    loadUserSealedBid();
  }, [selectedTender]);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      
      tenders.forEach(tender => {
        const now = new Date().getTime();
        const deadline = new Date(tender.submission_deadline).getTime();
        const distance = deadline - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeLeft[tender.id] = `${days} days ${hours} hours`;
          } else if (hours > 0) {
            newTimeLeft[tender.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeLeft[tender.id] = `${minutes} minutes`;
          }
        } else {
          newTimeLeft[tender.id] = 'Closed';
        }
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [tenders]);

  const handleSubmitBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || !selectedTender || amount < selectedTender.min_bid) {
      toast.error(`Bid must be at least ₹${selectedTender?.min_bid.toLocaleString()}`);
      return;
    }

    if (bidDocuments.length === 0) {
      toast.error('Please upload all required documents');
      return;
    }

    const requiredCompliance = Object.keys(selectedTender.technical_specifications || {});
    const providedCompliance = Object.keys(technicalCompliance || {});
    
    if (requiredCompliance.length > 0 && requiredCompliance.some(req => !providedCompliance.includes(req))) {
      toast.error('Please confirm compliance with all technical specifications');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to submit a bid');
        return;
      }

      const { error } = await supabase
        .from('bids')
        .insert([{ 
          auction_id: selectedTender.id,
          user_id: user.id,
          amount,
          bid_type: 'sealed',
          status: 'active',
        }]);

      if (error) {
        console.error('Error submitting sealed tender bid', error);
        toast.error('Failed to submit sealed bid. Please try again.');
        return;
      }

      const submittedAt = new Date().toISOString();
      setUserBid({
        amount,
        documents: bidDocuments,
        compliance: technicalCompliance,
        submitted_at: submittedAt,
      } as any);

      toast.success('Sealed bid submitted successfully! You will be notified when bids are opened.');
      setShowBidModal(false);
      setBidAmount('');
      setBidDocuments([]);
      setTechnicalCompliance({});
      
      setSelectedTender(prev => prev ? {
        ...prev,
        bid_count: prev.bid_count + 1,
      } : prev);
    } catch (e) {
      console.error('Unexpected error submitting sealed bid', e);
      toast.error('Something went wrong while submitting your bid. Please try again.');
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBidDocuments(files);
  };

  const handleComplianceChange = (spec: string, compliant: boolean) => {
    setTechnicalCompliance(prev => ({
      ...prev,
      [spec]: compliant
    }));
  };

  const downloadTenderDocument = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
    // In real implementation, this would download the actual document
  };

  const filteredTenders = tenders.filter(tender => {
    if (filter === 'closing_soon') {
      const deadline = new Date(tender.submission_deadline).getTime();
      const now = new Date().getTime();
      if ((deadline - now) >= 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
    } else if (filter === 'high_value') {
      if (tender.min_bid <= 5000000) {
        return false;
      }
    }

    if (categoryFilter !== 'all') {
      if (!tender.category || !tender.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
    }

    if (locationFilter) {
      if (!tender.location || !tender.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = Number(minStr) || 0;
      const max = maxStr ? Number(maxStr) : null;
      if (max !== null) {
        if (tender.min_bid < min || tender.min_bid > max) return false;
      } else {
        if (tender.min_bid < min) return false;
      }
    }

    return true;
  });

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    switch (sortBy) {
      case 'closing_soon': {
        const aDeadline = new Date(a.submission_deadline).getTime();
        const bDeadline = new Date(b.submission_deadline).getTime();
        return aDeadline - bDeadline;
      }
      case 'value_low':
        return a.min_bid - b.min_bid;
      case 'value_high':
        return b.min_bid - a.min_bid;
      case 'most_bids':
        return (b.bid_count || 0) - (a.bid_count || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {selectedTender ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tender Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-4">{selectedTender.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {selectedTender.seller.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedTender.location}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        selectedTender.seller.type === 'government'
                          ? 'bg-green-100 text-green-800'
                          : selectedTender.seller.type === 'company'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {selectedTender.seller.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 max-w-xl">
                    You pay the tender fee, any earnest money / security deposits, and contract amount with applicable taxes as per
                    tender terms. Platform commissions (if any) are settled with the authority / seller and are not added on top of
                    your quoted amount.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-0 text-lg leading-relaxed">{selectedTender.description}</p>
                </div>
                <img
                  src={selectedTender.image_url}
                  alt={selectedTender.title}
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                />
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-lg">Tender Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Bid:</span>
                        <span className="font-medium text-lg">₹{selectedTender.min_bid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Value:</span>
                        <span className="font-medium">₹{selectedTender.estimated_value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tender Fee:</span>
                        <span className="font-medium">₹{selectedTender.tender_fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedTender.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bids:</span>
                        <span className="font-medium">{selectedTender.bid_count}</span>
                      </div>
                    </div>
                  </div>
                  {selectedTender.seller && (
                    <div className="mb-4">
                      <SellerTrustSummary
                        name={selectedTender.seller.name}
                        avatarUrl={selectedTender.seller.avatar_url}
                        verified={selectedTender.seller.verified}
                        verificationLabelVerified="Trusted authority"
                        verificationLabelPending="Authority verification in progress"
                        auctionsCount={selectedTender.seller.auctions_count ?? undefined}
                        totalSalesAmount={selectedTender.seller.total_sales_amount ?? undefined}
                        profileHref={selectedTender.seller.id ? `/seller/${selectedTender.seller.id}` : null}
                        profileLabel="View authority profile"
                        size="md"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-lg">Important Dates</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Deadline:</span>
                        <span className="font-medium">{new Date(selectedTender.submission_deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opening Date:</span>
                        <span className="font-medium">{new Date(selectedTender.opening_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Remaining:</span>
                        <span className="font-medium text-red-600">{timeLeft[selectedTender.id]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contract Duration:</span>
                        <span className="font-medium">{selectedTender.contract_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-medium">{selectedTender.payment_terms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4 text-xl">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedTender.technical_specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4 text-xl">Evaluation Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedTender.evaluation_criteria).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4 text-xl">Eligibility Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTender.requirements.map((req, index) => (
                    <div key={index} className="flex items-start p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-xl">Required Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTender.documents_required.map((doc, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <FileText className="h-4 w-4 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bidding Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                  <Lock className="h-4 w-4 mr-2" />
                  Sealed Bid Tender
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your bid will remain confidential until the opening date
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Submission Deadline</p>
                  <p className="text-xl font-bold text-red-600">
                    {timeLeft[selectedTender.id] || 'Calculating...'}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Bid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{selectedTender.min_bid.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Opening Date</p>
                  <p className="text-lg font-bold text-blue-600">
                    {new Date(selectedTender.opening_date).toLocaleDateString()}
                  </p>
                </div>

                {userBid ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Bid Submitted</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Your sealed bid of ₹{userBid.amount.toLocaleString()} has been submitted successfully.
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Submitted on {new Date(userBid.submitted_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBidModal(true)}
                    disabled={timeLeft[selectedTender.id] === 'Closed' || !!userBid}
                    className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="h-5 w-5" />
                    Submit Sealed Bid
                  </button>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Tender Fee: ₹{selectedTender.tender_fee.toLocaleString()} (Non-refundable)
                  </p>
                  {userBid && (
                    <p className="text-xs text-gray-500 mt-1">
                      You can submit only one sealed bid per tender. If you need to revise your bid, please contact the tender authority.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Tender Authority</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedTender.seller.avatar_url}
                    alt={selectedTender.seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-lg">{selectedTender.seller.name}</p>
                    <div className="flex items-center gap-2">
                      {selectedTender.seller.verified && (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-600">Verified Government Authority</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedTender.seller.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedTender.seller.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium">{selectedTender.seller.gst_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Tender Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Tender Documents</h3>
              <div className="space-y-3">
                {selectedTender.tender_documents.map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => downloadTenderDocument(doc)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span>{doc}</span>
                    </div>
                    <Download className="h-4 w-4 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tender Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Tender Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{selectedTender.bid_count}</div>
                  <div className="text-sm text-gray-500">Bids Submitted</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {Math.floor(Math.random() * 50) + 20}
                  </div>
                  <div className="text-sm text-gray-500">Companies Interested</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Submission Modal */}
          {showBidModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-6">Submit Sealed Bid</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium mb-1">Important Notice</p>
                        <p>Your bid will be sealed and confidential until the opening date. Ensure all documents are uploaded and technical compliance is confirmed before submission.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bid Amount (₹) *
                        </label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Minimum: ₹${selectedTender.min_bid.toLocaleString()}`}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Required Documents *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Upload all required documents as per tender notice
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Accepted formats: PDF, JPG, PNG (Max 10MB each)
                          </p>
                        </div>
                        {bidDocuments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Selected Files ({bidDocuments.length}):
                            </p>
                            <div className="space-y-1">
                              {bidDocuments.map((file, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Technical Compliance Confirmation *
                        </label>
                        <div className="space-y-3">
                          {Object.entries(selectedTender.technical_specifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div>
                                <p className="text-sm font-medium capitalize">{key.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-500">{String(value)}</p>
                              </div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={technicalCompliance[key] || false}
                                  onChange={(e) => handleComplianceChange(key, e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm">Compliant</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p><strong>Tender Fee:</strong> ₹{selectedTender.tender_fee.toLocaleString()}</p>
                        <p><strong>Opening Date:</strong> {new Date(selectedTender.opening_date).toLocaleDateString()}</p>
                        <p><strong>Submission Deadline:</strong> {new Date(selectedTender.submission_deadline).toLocaleDateString()}</p>
                        <p><strong>Contract Duration:</strong> {selectedTender.contract_duration}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowBidModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBid}
                    disabled={!bidAmount || bidDocuments.length === 0 || Object.keys(technicalCompliance).length === 0}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Submit Sealed Bid
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Government Tenders</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Secure, transparent tender auctions for government and corporate procurement
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/advanced-search"
                className="border border-indigo-300 text-indigo-700 px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 text-xs md:text-sm"
              >
                <Search className="h-4 w-4" />
                Advanced Search
              </Link>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
              >
                <option value="all">All Tenders</option>
                <option value="closing_soon">Closing Soon (≤ 7 days)</option>
                <option value="high_value">High Value (₹50L+)</option>
              </select>
            </div>
          </div>

          {/* Tender Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tenders.length}</p>
              <p className="text-sm text-gray-500">Active Tenders</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(tenders.reduce((sum, t) => sum + t.min_bid, 0) / 10000000).toFixed(1)}Cr</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tenders.reduce((sum, t) => sum + t.bid_count, 0)}</p>
              <p className="text-sm text-gray-500">Total Bids</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8 flex flex-wrap items-center gap-3 md:gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="furniture">Furniture & Fixtures</option>
              <option value="machinery">Heavy Machinery</option>
              <option value="it">IT Equipment</option>
              <option value="medical">Medical Equipment</option>
              <option value="vehicles">Vehicle Fleet</option>
              <option value="construction">Construction</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="">All Values</option>
              <option value="0-5000000">Under ₹50,00,000</option>
              <option value="5000000-20000000">₹50,00,000 - ₹2,00,00,000</option>
              <option value="20000000">Above ₹2,00,00,000</option>
            </select>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm w-full md:w-40 lg:w-56"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="closing_soon">Closing Soon</option>
              <option value="value_low">Value: Low to High</option>
              <option value="value_high">Value: High to Low</option>
              <option value="most_bids">Most Bids</option>
            </select>
          </div>

          {sortedTenders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tenders match your filters</p>
              <p className="text-sm text-gray-400 mt-2 mb-4">Try adjusting filters or browse other auctions.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900"
              >
                <Eye className="h-4 w-4" />
                No tenders? Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTenders.map((tender) => (
              <motion.div
                key={tender.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={tender.image_url}
                    alt={tender.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    TENDER
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    {tender.bid_count} bids
                  </div>
                  {tender.seller.verified && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2">{tender.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-sm">
                    {tender.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{tender.seller.name}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Min Bid</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{tender.min_bid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="text-sm font-medium text-red-600">
                        {timeLeft[tender.id] || 'Calculating...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                    <span>{tender.category}</span>
                    <span>•</span>
                    <span>{tender.location}</span>
                    <span>•</span>
                    <span>Fee: ₹{tender.tender_fee.toLocaleString()}</span>
                  </div>

                  <Link
                    to={`/tender-auction/${tender.id}`}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View Tender Details
                  </Link>
                </div>
              </motion.div>
            ))}
            </div>
          )}

          {/* Tender Guidelines */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Tender Participation Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Document Preparation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ensure all required documents are properly certified and up-to-date before submission
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Compliance Verification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Verify all eligibility criteria and technical specifications before bidding
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Sealed Bidding Process</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your bid remains confidential until the official opening ceremony
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderAuctionPage;
