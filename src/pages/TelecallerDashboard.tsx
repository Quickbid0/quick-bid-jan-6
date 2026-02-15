import React, { useEffect, useState } from 'react';
import { QuickMelaRoleGuard, TelecallerLayout } from '../components/auth/QuickMelaAuth';
import { toast } from 'react-hot-toast';
import {
  Phone, Users, TrendingUp, Target, Clock, CheckCircle,
  AlertCircle, MessageSquare, DollarSign, Star, Calendar
} from 'lucide-react';

interface TelecallerStats {
  totalLeads: number;
  contactedToday: number;
  conversionsToday: number;
  subscriptionRevenue: number;
  averageCallDuration: number;
  successRate: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'seller' | 'buyer' | 'business';
  status: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested';
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes: string;
  potentialValue: number;
  priority: 'high' | 'medium' | 'low';
}

interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'missed';
  notes: string;
  outcome?: string;
}

const TelecallerDashboard: React.FC = () => {
  const [stats, setStats] = useState<TelecallerStats>({
    totalLeads: 0,
    contactedToday: 0,
    conversionsToday: 0,
    subscriptionRevenue: 0,
    averageCallDuration: 0,
    successRate: 0
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchTelecallerData();
  }, []);

  const fetchTelecallerData = async () => {
    try {
      setLoading(true);

      // Fetch telecaller statistics
      const statsResponse = await fetch('/api/telecaller/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch leads
      const leadsResponse = await fetch('/api/telecaller/leads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData);
      }

      // Fetch follow-ups
      const followUpsResponse = await fetch('/api/telecaller/follow-ups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (followUpsResponse.ok) {
        const followUpsData = await followUpsResponse.json();
        setFollowUps(followUpsData);
      }

    } catch (error) {
      console.error('Error loading telecaller dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Mock data for development
      setStats({
        totalLeads: 156,
        contactedToday: 24,
        conversionsToday: 3,
        subscriptionRevenue: 1500,
        averageCallDuration: 4.2,
        successRate: 12.5
      });

      setLeads([
        {
          id: '1',
          name: 'Rajesh Kumar',
          phone: '+91-9876543210',
          email: 'rajesh@example.com',
          type: 'seller',
          status: 'new',
          lastContactDate: '2024-01-14',
          nextFollowUpDate: '2024-01-16',
          notes: 'Interested in selling handmade crafts',
          potentialValue: 2500,
          priority: 'high'
        },
        {
          id: '2',
          name: 'Priya Patel',
          phone: '+91-9876543211',
          email: 'priya@example.com',
          type: 'buyer',
          status: 'contacted',
          lastContactDate: '2024-01-13',
          nextFollowUpDate: '2024-01-15',
          notes: 'Looking for antique items',
          potentialValue: 5000,
          priority: 'medium'
        },
        {
          id: '3',
          name: 'Amit Singh',
          phone: '+91-9876543212',
          type: 'business',
          status: 'interested',
          lastContactDate: '2024-01-12',
          nextFollowUpDate: '2024-01-14',
          notes: 'Corporate client interested in bulk sales',
          potentialValue: 15000,
          priority: 'high'
        }
      ]);

      setFollowUps([
        {
          id: '1',
          leadId: '2',
          leadName: 'Priya Patel',
          scheduledDate: '2024-01-15T10:00:00Z',
          status: 'pending',
          notes: 'Follow up on antique collection interest'
        },
        {
          id: '2',
          leadId: '1',
          leadName: 'Rajesh Kumar',
          scheduledDate: '2024-01-16T14:00:00Z',
          status: 'pending',
          notes: 'Discuss subscription plans'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string, notes: string) => {
    try {
      const response = await fetch(`/api/telecaller/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        toast.success('Lead status updated');
        fetchTelecallerData(); // Refresh data
      } else {
        toast.error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const scheduleFollowUp = async (leadId: string, followUpDate: string, notes: string) => {
    try {
      const response = await fetch('/api/telecaller/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ leadId, followUpDate, notes })
      });

      if (response.ok) {
        toast.success('Follow-up scheduled');
        fetchTelecallerData(); // Refresh data
      } else {
        toast.error('Failed to schedule follow-up');
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast.error('Failed to schedule follow-up');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'contacted': return 'text-yellow-600 bg-yellow-100';
      case 'interested': return 'text-orange-600 bg-orange-100';
      case 'follow_up': return 'text-purple-600 bg-purple-100';
      case 'converted': return 'text-green-600 bg-green-100';
      case 'not_interested': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <QuickMelaRoleGuard allowedRoles={['TELECALLER']} requireVerification={true}>
        <TelecallerLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </TelecallerLayout>
      </QuickMelaRoleGuard>
    );
  }

  return (
    <QuickMelaRoleGuard allowedRoles={['TELECALLER']} requireVerification={true}>
      <TelecallerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Telecaller Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage leads and drive subscription growth</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Start Calling</span>
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* Telecaller Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-sm text-green-600">+8 this week</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contacted Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.contactedToday}</p>
                  <p className="text-sm text-green-600">Target: 25 calls</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionsToday}</p>
                  <p className="text-sm text-purple-600">{stats.successRate}% success rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.subscriptionRevenue}</p>
                  <p className="text-sm text-green-600">+₹500 vs yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-800">Today's Progress</h3>
                <p className="text-blue-600">Average call duration: {stats.averageCallDuration} minutes</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(stats.contactedToday / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{stats.contactedToday}/25</span>
                </div>
                <p className="text-sm text-gray-600">Calls completed</p>
              </div>
            </div>
          </div>

          {/* Tabs for Leads and Follow-ups */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'leads', label: 'My Leads', count: leads.length },
                  { id: 'followups', label: 'Follow-ups', count: followUps.filter(f => f.status === 'pending').length },
                  { id: 'performance', label: 'Performance' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        tab.count > 10 ? 'bg-red-100 text-red-800' :
                        tab.count > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{lead.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{lead.phone} • {lead.type}</p>
                          {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">₹{lead.potentialValue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Potential value</p>
                        </div>
                      </div>

                      {lead.notes && (
                        <p className="text-sm text-gray-600 mb-3">{lead.notes}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {lead.lastContactDate && (
                            <span>Last contact: {new Date(lead.lastContactDate).toLocaleDateString()}</span>
                          )}
                          {lead.nextFollowUpDate && (
                            <span>Next follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Call Now
                          </button>
                          <select
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value, lead.notes)}
                            className="text-sm border rounded px-2 py-1"
                            defaultValue={lead.status}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="interested">Interested</option>
                            <option value="follow_up">Follow-up</option>
                            <option value="converted">Converted</option>
                            <option value="not_interested">Not Interested</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'followups' && (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div key={followUp.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{followUp.leadName}</h3>
                          <p className="text-sm text-gray-600">{followUp.notes}</p>
                          <p className="text-xs text-gray-500">
                            Scheduled: {new Date(followUp.scheduledDate).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            followUp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            followUp.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {followUp.status}
                          </span>
                          {followUp.status === 'pending' && (
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Weekly Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Calls Made</span>
                        <span className="text-sm font-medium">147</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversions</span>
                        <span className="text-sm font-medium">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-sm font-medium">12.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Revenue Generated</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Week</span>
                        <span className="text-sm font-medium">₹8,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="text-sm font-medium">₹34,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Commission</span>
                        <span className="text-sm font-medium">₹2,520</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Lead Quality</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="text-sm font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Qualified Leads</span>
                        <span className="text-sm font-medium">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hot Leads</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Call Script</p>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Send SMS</p>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Schedule Call</p>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">View Reports</p>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Today's Priorities</p>
                <ul className="mt-1 space-y-1">
                  <li>• 5 follow-up calls scheduled for this afternoon</li>
                  <li>• Review 3 high-priority leads before end of day</li>
                  <li>• Target: 25 calls and 3 conversions today</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </TelecallerLayout>
    </QuickMelaRoleGuard>
  );
};

export default TelecallerDashboard;
