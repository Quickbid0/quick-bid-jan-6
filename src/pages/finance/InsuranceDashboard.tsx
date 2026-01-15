import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, AlertTriangle, Clock, DollarSign, TrendingUp, Calendar, User, Package, RefreshCw, Eye, Download, Filter, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  type: 'comprehensive' | 'third_party' | 'fire' | 'theft' | 'collision' | 'custom';
  coverage: string;
  premium: number;
  sumAssured: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  insuredItem: {
    name: string;
    category: string;
    value: number;
    description: string;
  };
  documents: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  claims: Array<{
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'settled';
    amount: number;
    date: string;
    description: string;
  }>;
}

const InsuranceDashboard: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'documents'>('policies');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      
      // Simulate loading insurance policies
      const mockPolicies: InsurancePolicy[] = [
        {
          id: '1',
          policyNumber: 'INS-2024-001',
          type: 'comprehensive',
          coverage: 'Full coverage including fire, theft, and collision',
          premium: 25000,
          sumAssured: 1500000,
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          insuredItem: {
            name: '2023 BMW X5',
            category: 'Automobile',
            value: 1500000,
            description: 'Luxury SUV with comprehensive coverage'
          },
          documents: [
            {
              id: '1',
              name: 'Policy Document',
              url: '/documents/policy-1.pdf',
              uploadedAt: '2024-01-01'
            }
          ],
          claims: []
        },
        {
          id: '2',
          policyNumber: 'INS-2024-002',
          type: 'third_party',
          coverage: 'Third party liability coverage',
          premium: 15000,
          sumAssured: 500000,
          status: 'active',
          startDate: '2024-02-01',
          endDate: '2025-02-01',
          insuredItem: {
            name: '2022 Honda Civic',
            category: 'Automobile',
            value: 500000,
            description: 'Compact car with third party coverage'
          },
          documents: [
            {
              id: '2',
              name: 'Policy Document',
              url: '/documents/policy-2.pdf',
              uploadedAt: '2024-02-01'
            }
          ],
          claims: [
            {
              id: '1',
              type: 'Minor Accident',
              status: 'settled',
              amount: 25000,
              date: '2024-03-15',
              description: 'Minor collision with another vehicle'
            }
          ]
        },
        {
          id: '3',
          policyNumber: 'INS-2024-003',
          type: 'fire',
          coverage: 'Fire and special perils coverage',
          premium: 8000,
          sumAssured: 2000000,
          status: 'pending',
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          insuredItem: {
            name: 'Commercial Building',
            category: 'Property',
            value: 2000000,
            description: 'Office building with fire coverage'
          },
          documents: [],
          claims: []
        }
      ];
      
      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Failed to load insurance policies');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    const matchesSearch = policy.insuredItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalClaims = policies.reduce((sum: number, policy) => sum + policy.claims.length, 0);
  const activeClaims = policies.reduce((sum: number, policy) => 
    sum + policy.claims.filter(claim => claim.status === 'pending' || claim.status === 'approved').length, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Insurance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your insurance policies and claims
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {policies.length}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Policies</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {policies.filter(p => p.status === 'active').length}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Active Policies</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalClaims}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Claims</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeClaims}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Active Claims</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['policies', 'claims', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'policies' && (
              <div className="space-y-4">
                {filteredPolicies.map((policy) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(policy.status)}`}>
                            {getStatusIcon(policy.status)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {policy.policyNumber}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {policy.insuredItem.name}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                          {policy.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Coverage Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {policy.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{policy.premium.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sum Assured</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{policy.sumAssured.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coverage</p>
                      <p className="text-gray-900 dark:text-white">{policy.coverage}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Valid: {policy.startDate} - {policy.endDate}</span>
                      <div className="flex gap-2">
                        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="space-y-4">
                {policies.flatMap(policy => 
                  policy.claims.map((claim) => (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${
                              claim.status === 'settled' ? 'text-green-600 bg-green-100' :
                              claim.status === 'approved' ? 'text-blue-600 bg-blue-100' :
                              claim.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                              'text-red-600 bg-red-100'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {claim.type}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Policy: {policy.policyNumber}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            claim.status === 'settled' ? 'text-green-600 bg-green-100' :
                            claim.status === 'approved' ? 'text-blue-600 bg-blue-100' :
                            claim.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {claim.status}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Claim Amount</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₹{claim.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {claim.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Insured Item</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {policy.insuredItem.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                        <p className="text-gray-900 dark:text-white">{claim.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Claim ID: {claim.id}</span>
                        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {policies.flatMap(policy => 
                  policy.documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {doc.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Policy: {policy.policyNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded on {doc.uploadedAt}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDashboard;
