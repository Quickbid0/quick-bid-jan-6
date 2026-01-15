import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Shield, 
  FileText, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Eye,
  RefreshCw,
  Building,
  Scale,
  Award,
  TrendingUp,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComplianceItem {
  id: string;
  type: 'license' | 'gst' | 'audit' | 'certification' | 'registration' | 'insurance' | 'tax';
  title: string;
  description: string;
  status: 'compliant' | 'expiring' | 'expired' | 'pending' | 'not_applicable';
  due_date: string;
  last_updated: string;
  documents: string[];
  responsible_person: string;
  priority: 'high' | 'medium' | 'low';
  compliance_score: number;
  regulatory_body: string;
  penalty_amount?: number;
  renewal_cost?: number;
}

const ComplianceTracking = () => {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [complianceScore, setComplianceScore] = useState(0);

  // Mock compliance data for Sriman Finance Ltd.
  const mockComplianceData: ComplianceItem[] = [
    {
      id: '1',
      type: 'license',
      title: 'NBFC License',
      description: 'Non-Banking Financial Company License from RBI',
      status: 'compliant',
      due_date: '2024-12-31',
      last_updated: '2024-01-15',
      documents: ['NBFC_License_2024.pdf', 'RBI_Approval_Letter.pdf'],
      responsible_person: 'Legal Team',
      priority: 'high',
      compliance_score: 95,
      regulatory_body: 'Reserve Bank of India (RBI)',
      renewal_cost: 500000
    },
    {
      id: '2',
      type: 'gst',
      title: 'GST Registration',
      description: 'Goods and Services Tax Registration',
      status: 'expiring',
      due_date: '2024-03-31',
      last_updated: '2024-01-10',
      documents: ['GST_Certificate.pdf', 'GST_Returns_Q3.pdf'],
      responsible_person: 'Finance Team',
      priority: 'high',
      compliance_score: 85,
      regulatory_body: 'GST Council',
      penalty_amount: 25000,
      renewal_cost: 15000
    },
    {
      id: '3',
      type: 'audit',
      title: 'Annual Statutory Audit',
      description: 'Mandatory annual audit as per Companies Act',
      status: 'pending',
      due_date: '2024-04-30',
      last_updated: '2024-01-01',
      documents: [],
      responsible_person: 'M/s Chartered Accountants',
      priority: 'medium',
      compliance_score: 70,
      regulatory_body: 'Ministry of Corporate Affairs',
      penalty_amount: 100000
    },
    {
      id: '4',
      type: 'certification',
      title: 'ISO 27001:2013',
      description: 'Information Security Management System Certification',
      status: 'compliant',
      due_date: '2025-06-15',
      last_updated: '2024-01-20',
      documents: ['ISO_27001_Certificate.pdf', 'Surveillance_Audit_Report.pdf'],
      responsible_person: 'IT Security Team',
      priority: 'medium',
      compliance_score: 92,
      regulatory_body: 'International Organization for Standardization',
      renewal_cost: 200000
    },
    {
      id: '5',
      type: 'insurance',
      title: 'Professional Indemnity Insurance',
      description: 'Professional liability insurance for financial services',
      status: 'expiring',
      due_date: '2024-02-28',
      last_updated: '2024-01-05',
      documents: ['PI_Insurance_Policy.pdf'],
      responsible_person: 'Risk Management',
      priority: 'high',
      compliance_score: 88,
      regulatory_body: 'Insurance Regulatory Authority',
      renewal_cost: 750000
    },
    {
      id: '6',
      type: 'tax',
      title: 'Income Tax Returns',
      description: 'Annual income tax filing for AY 2023-24',
      status: 'compliant',
      due_date: '2024-03-31',
      last_updated: '2024-01-25',
      documents: ['ITR_AY2023-24.pdf', 'Tax_Audit_Report.pdf'],
      responsible_person: 'Tax Consultant',
      priority: 'high',
      compliance_score: 98,
      regulatory_body: 'Income Tax Department',
      penalty_amount: 50000
    }
  ];

  useEffect(() => {
    setComplianceItems(mockComplianceData);
    calculateComplianceScore(mockComplianceData);
    setLoading(false);
  }, []);

  const calculateComplianceScore = (items: ComplianceItem[]) => {
    const totalScore = items.reduce((sum, item) => sum + item.compliance_score, 0);
    const avgScore = items.length > 0 ? totalScore / items.length : 0;
    setComplianceScore(Math.round(avgScore));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expiring':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <Shield className="h-5 w-5" />;
      case 'gst':
        return <FileText className="h-5 w-5" />;
      case 'audit':
        return <Eye className="h-5 w-5" />;
      case 'certification':
        return <Award className="h-5 w-5" />;
      case 'insurance':
        return <Shield className="h-5 w-5" />;
      case 'tax':
        return <Scale className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredItems = filter === 'all' 
    ? complianceItems 
    : complianceItems.filter(item => item.status === filter);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor regulatory compliance and certifications</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Upload Document
        </button>
      </div>

      {/* Compliance Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Compliance Score</p>
              <p className="text-3xl font-bold text-green-600">{complianceScore}%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{complianceItems.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-600">
                {complianceItems.filter(item => item.status === 'expiring').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Action Required</p>
              <p className="text-3xl font-bold text-red-600">
                {complianceItems.filter(item => ['expired', 'pending'].includes(item.status)).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'all', label: 'All Items', count: complianceItems.length },
          { id: 'compliant', label: 'Compliant', count: complianceItems.filter(i => i.status === 'compliant').length },
          { id: 'expiring', label: 'Expiring', count: complianceItems.filter(i => i.status === 'expiring').length },
          { id: 'expired', label: 'Expired', count: complianceItems.filter(i => i.status === 'expired').length },
          { id: 'pending', label: 'Pending', count: complianceItems.filter(i => i.status === 'pending').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Compliance Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Regulatory Body:</span>
                        <p className="font-medium">{item.regulatory_body}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">{new Date(item.due_date).toLocaleDateString()}</p>
                        <p className={`text-xs ${getDaysUntilDue(item.due_date) < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                          {getDaysUntilDue(item.due_date)} days remaining
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Responsible:</span>
                        <p className="font-medium">{item.responsible_person}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Compliance Score:</span>
                        <p className="font-medium text-green-600">{item.compliance_score}%</p>
                      </div>
                    </div>
                    
                    {item.documents.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Documents:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.documents.map((doc, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full cursor-pointer hover:bg-blue-200"
                            >
                              <FileText className="h-3 w-3" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Impact */}
                    {(item.penalty_amount || item.renewal_cost) && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {item.penalty_amount && (
                            <div>
                              <span className="text-gray-500">Penalty Risk:</span>
                              <p className="font-medium text-red-600">₹{item.penalty_amount.toLocaleString()}</p>
                            </div>
                          )}
                          {item.renewal_cost && (
                            <div>
                              <span className="text-gray-500">Renewal Cost:</span>
                              <p className="font-medium text-blue-600">₹{item.renewal_cost.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Compliance Calendar */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Upcoming Compliance Deadlines</h2>
        <div className="space-y-4">
          {complianceItems
            .filter(item => new Date(item.due_date) > new Date())
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 5)
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.responsible_person}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(item.due_date).toLocaleDateString()}</p>
                  <p className={`text-sm ${getDaysUntilDue(item.due_date) < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                    {getDaysUntilDue(item.due_date)} days remaining
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Compliance Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Compliance Trends
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-medium text-green-600">+5% improvement</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Risk Score</span>
              <span className="font-medium text-yellow-600">Medium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Next Review</span>
              <span className="font-medium">March 15, 2024</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Regulatory Bodies
          </h3>
          <div className="space-y-2">
            {[...new Set(complianceItems.map(item => item.regulatory_body))].slice(0, 3).map((body, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-300">{body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-500" />
            Financial Impact
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Total Renewal Costs</span>
              <p className="font-bold text-blue-600">
                ₹{complianceItems.reduce((sum, item) => sum + (item.renewal_cost || 0), 0).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Potential Penalties</span>
              <p className="font-bold text-red-600">
                ₹{complianceItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTracking;