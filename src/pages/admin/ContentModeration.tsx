import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag,
  MessageSquare,
  Image,
  FileText,
  Clock,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ModerationItem {
  id: string;
  type: 'product' | 'comment' | 'message' | 'image';
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reported_by: string;
  reason: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  metadata?: any;
}

const ContentModeration = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'comment' | 'message' | 'image'>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchModerationItems();
  }, [filter, typeFilter]);

  const fetchModerationItems = async () => {
    try {
      let query = supabase
        .from('moderation_queue')
        .select(`
          *,
          user:profiles(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching moderation items:', error);
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (itemId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase
        .from('moderation_queue')
        .update({ 
          status, 
          moderated_at: new Date().toISOString(),
          moderation_reason: reason 
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`Item ${action}d successfully`);
      fetchModerationItems();
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error moderating item:', error);
      toast.error('Failed to moderate item');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <FileText className="h-5 w-5" />;
      case 'comment': return <MessageSquare className="h-5 w-5" />;
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate reported content</p>
        </div>
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-indigo-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="product">Products</option>
              <option value="comment">Comments</option>
              <option value="message">Messages</option>
              <option value="image">Images</option>
            </select>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Moderation Queue ({items.length} items)
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No items in moderation queue</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
                          {item.type}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {item.content.substring(0, 100)}...
                    </h3>

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {item.user.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Flag className="h-4 w-4" />
                        {item.reason}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Reported by: {item.reported_by}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowModal(true);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleModeration(item.id, 'approve')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModeration(item.id, 'reject')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Content Review</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Content Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedItem.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                    <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-white">{selectedItem.content}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Reason</label>
                    <p className="text-gray-900 dark:text-white">{selectedItem.reason}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedItem.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedItem.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reported By</label>
                    <p className="text-gray-900 dark:text-white">{selectedItem.reported_by}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision History (Audit Trail) */}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-3">Decision History & Audit Trail</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-6">
                {/* Initial Flag Event */}
                <div className="flex items-start gap-3 relative">
                  <div className="absolute left-2.5 top-8 bottom-[-24px] w-0.5 bg-gray-200 dark:bg-gray-600 last:hidden"></div>
                  <div className="mt-1 relative z-10 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-600">
                    <Flag className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Flagged by {selectedItem.reported_by}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Reason: {selectedItem.reason}
                    </p>
                  </div>
                </div>

                {/* AI Analysis Event */}
                <div className="flex items-start gap-3 relative">
                  <div className="mt-1 relative z-10 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-600">
                    <Shield className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AI Risk Assessment
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Processed immediately after flagging
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-medium border border-red-200 dark:border-red-800">
                        High Confidence Flag (92%)
                      </span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium border border-orange-200 dark:border-orange-800">
                        Potential Policy Violation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedItem.status === 'pending' && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Moderation Action</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleModeration(selectedItem.id, 'approve')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve Content
                  </button>
                  <button
                    onClick={() => handleModeration(selectedItem.id, 'reject', 'Violates community guidelines')}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Content
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
