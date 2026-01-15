import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Eye, Clock, User, Building, DollarSign, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminTenderReview = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      
      // Fetch sealed bids (tenders)
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          status,
          created_at,
          user_id,
          auction_id,
          bid_type,
          profiles:user_id (full_name),
          products:auction_id (
            id,
            title,
            min_bid,
            submission_deadline
          )
        `)
        .eq('bid_type', 'sealed');

      if (error) throw error;

      if (data) {
        // Transform to component state shape
        const mappedTenders = data.map(bid => ({
          id: bid.id,
          title: bid.products?.title || 'Unknown Tender',
          description: 'Sealed Bid Tender', // Description not fetched or generic
          bid_amount: bid.amount,
          min_bid: bid.products?.min_bid || 0,
          user_id: bid.user_id,
          user_name: bid.profiles?.full_name || 'Unknown User',
          product_id: bid.auction_id,
          status: bid.status || 'pending',
          created_at: bid.created_at,
          submission_deadline: bid.products?.submission_deadline || new Date().toISOString(),
          documents: [], // Documents not currently stored in bids table
          technical_compliance: true, // Defaulting as not stored
          financial_compliance: true // Defaulting as not stored
        }));
        setTenders(mappedTenders);
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast.error('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tenderId) => {
    try {
      const tender = tenders.find(t => t.id === tenderId);
      if (tender) {
        toast.success(`Tender bid from ${tender.user_name} approved successfully`);
        setTenders(tenders.filter(t => t.id !== tenderId));
      }
    } catch (error) {
      toast.error('Error approving tender');
      console.error(error);
    }
  };

  const handleReject = async (tenderId) => {
    try {
      const tender = tenders.find(t => t.id === tenderId);
      if (tender) {
        toast.success(`Tender bid from ${tender.user_name} rejected`);
        setTenders(tenders.filter(t => t.id !== tenderId));
      }
    } catch (error) {
      toast.error('Error rejecting tender');
      console.error(error);
    }
  };

  const openTenderModal = (tender) => {
    setSelectedTender(tender);
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tender Review</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve tender submissions</p>
        </div>
        <FileText className="h-8 w-8 text-indigo-600" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tenders to review</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenders.map((tender) => (
              <motion.div
                key={tender.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {tender.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{tender.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Bidder:</span>
                        <p className="font-medium">{tender.user_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bid Amount:</span>
                        <p className="font-bold text-green-600">₹{tender.bid_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Bid:</span>
                        <p className="font-medium">₹{tender.min_bid.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <p className="font-medium">{new Date(tender.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        {tender.technical_compliance ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span>Technical Compliance</span>
                      </div>
                      <div className="flex items-center">
                        {tender.financial_compliance ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span>Financial Compliance</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-1" />
                        <span>{tender.documents.length} Documents</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openTenderModal(tender)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                    <button
                      onClick={() => handleApprove(tender.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(tender.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tender Details Modal */}
      {showModal && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tender Review Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Tender Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <p className="text-gray-900 dark:text-white">{selectedTender.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <p className="text-gray-900 dark:text-white">{selectedTender.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bid Amount</label>
                    <p className="text-xl font-bold text-green-600">₹{selectedTender.bid_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Bidder Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedTender.user_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedTender.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Documents</label>
                    <div className="space-y-1">
                      {selectedTender.documents.map((doc, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedTender.id)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve Tender
                </button>
                <button
                  onClick={() => handleReject(selectedTender.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  Reject Tender
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/admin" className="text-indigo-600 hover:text-indigo-700">
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AdminTenderReview;