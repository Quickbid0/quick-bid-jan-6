import React, { useEffect, useState } from 'react';
import { QuickMelaRoleGuard, DeliveryAgentLayout } from '../components/auth/QuickMelaAuth';
import { toast } from 'react-hot-toast';
import {
  Truck, MapPin, Package, Camera, Clock, CheckCircle,
  AlertCircle, Navigation, Phone, Star
} from 'lucide-react';

interface DeliveryStats {
  totalDeliveries: number;
  completedToday: number;
  pendingPickups: number;
  inTransit: number;
  averageRating: number;
  earningsToday: number;
}

interface DeliveryAssignment {
  id: string;
  auctionTitle: string;
  buyerName: string;
  buyerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered';
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  packageValue: number;
}

const DeliveryAgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedToday: 0,
    pendingPickups: 0,
    inTransit: 0,
    averageRating: 0,
    earningsToday: 0
  });

  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);

      // Fetch delivery statistics
      const statsResponse = await fetch('/api/delivery/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch('/api/delivery/assignments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      }

    } catch (error) {
      console.error('Error loading delivery dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Mock data for development
      setStats({
        totalDeliveries: 145,
        completedToday: 8,
        pendingPickups: 3,
        inTransit: 5,
        averageRating: 4.7,
        earningsToday: 1200
      });

      setAssignments([
        {
          id: '1',
          auctionTitle: 'Handmade Ceramic Vase',
          buyerName: 'Rajesh Kumar',
          buyerPhone: '+91-9876543210',
          pickupAddress: 'Seller Shop, MG Road, Hyderabad',
          deliveryAddress: '123 Main Street, Jubilee Hills, Hyderabad',
          status: 'pending_pickup',
          estimatedPickupTime: '2024-01-15T10:00:00Z',
          estimatedDeliveryTime: '2024-01-15T14:00:00Z',
          packageValue: 2500
        },
        {
          id: '2',
          auctionTitle: 'Vintage Leather Bag',
          buyerName: 'Priya Patel',
          buyerPhone: '+91-9876543211',
          pickupAddress: 'Warehouse A, Kukatpally, Hyderabad',
          deliveryAddress: '456 Park Avenue, Banjara Hills, Hyderabad',
          status: 'picked_up',
          estimatedPickupTime: '2024-01-15T09:00:00Z',
          estimatedDeliveryTime: '2024-01-15T13:00:00Z',
          actualPickupTime: '2024-01-15T09:15:00Z',
          packageValue: 1800
        },
        {
          id: '3',
          auctionTitle: 'Custom Oil Painting',
          buyerName: 'Amit Singh',
          buyerPhone: '+91-9876543212',
          pickupAddress: 'Artist Studio, Secunderabad',
          deliveryAddress: '789 Residency Road, Hyderabad',
          status: 'in_transit',
          estimatedPickupTime: '2024-01-14T16:00:00Z',
          estimatedDeliveryTime: '2024-01-15T12:00:00Z',
          actualPickupTime: '2024-01-14T16:30:00Z',
          packageValue: 8500
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (assignmentId: string, newStatus: string, proofImage?: File) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (proofImage) {
        formData.append('proofImage', proofImage);
      }

      const response = await fetch(`/api/delivery/update/${assignmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success(`Delivery status updated to ${newStatus}`);
        fetchDeliveryData(); // Refresh data
      } else {
        toast.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_pickup': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_pickup': return <Clock className="w-4 h-4" />;
      case 'picked_up': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <QuickMelaRoleGuard allowedRoles={['DELIVERY_AGENT']} requireVerification={true}>
        <DeliveryAgentLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </DeliveryAgentLayout>
      </QuickMelaRoleGuard>
    );
  }

  return (
    <QuickMelaRoleGuard allowedRoles={['DELIVERY_AGENT']} requireVerification={true}>
      <DeliveryAgentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Agent Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your deliveries and track packages</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>Start Route</span>
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>View Map</span>
              </button>
            </div>
          </div>

          {/* Delivery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
                  <p className="text-sm text-green-600">+{stats.completedToday} today</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Pickups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingPickups}</p>
                  <p className="text-sm text-yellow-600">Ready for pickup</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
                  <p className="text-sm text-purple-600">Out for delivery</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-green-600">⭐⭐⭐⭐⭐</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Earnings */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-800">Today's Earnings</h3>
                <p className="text-green-600">₹{stats.earningsToday} from {stats.completedToday} deliveries</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-800">₹{stats.earningsToday}</p>
                <p className="text-sm text-green-600">+12% vs yesterday</p>
              </div>
            </div>
          </div>

          {/* Delivery Assignments */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Assignments</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'pending' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  Pending ({assignments.filter(a => a.status === 'pending_pickup').length})
                </button>
                <button
                  onClick={() => setActiveTab('in_transit')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'in_transit' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  In Transit ({assignments.filter(a => ['picked_up', 'in_transit'].includes(a.status)).length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'completed' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  Completed ({assignments.filter(a => a.status === 'delivered').length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {assignments
                .filter(assignment => {
                  switch (activeTab) {
                    case 'pending': return assignment.status === 'pending_pickup';
                    case 'in_transit': return ['picked_up', 'in_transit'].includes(assignment.status);
                    case 'completed': return assignment.status === 'delivered';
                    default: return true;
                  }
                })
                .map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(assignment.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">{assignment.auctionTitle}</h3>
                        <p className="text-sm text-gray-600">Package Value: ₹{assignment.packageValue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{assignment.buyerName}</p>
                        <p className="text-sm text-gray-600">{assignment.buyerPhone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Pickup Address</p>
                        <p className="text-sm text-gray-600">{assignment.pickupAddress}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Est: {new Date(assignment.estimatedPickupTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                        <p className="text-sm text-gray-600">{assignment.deliveryAddress}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Est: {new Date(assignment.estimatedDeliveryTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {assignment.status === 'pending_pickup' && (
                        <>
                          <button
                            onClick={() => updateDeliveryStatus(assignment.id, 'picked_up')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Mark as Picked Up
                          </button>
                          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>Call Seller</span>
                          </button>
                        </>
                      )}

                      {assignment.status === 'picked_up' && (
                        <button
                          onClick={() => updateDeliveryStatus(assignment.id, 'in_transit')}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        >
                          Start Delivery
                        </button>
                      )}

                      {assignment.status === 'in_transit' && (
                        <>
                          <button
                            onClick={() => updateDeliveryStatus(assignment.id, 'delivered')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Mark as Delivered
                          </button>
                          <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 flex items-center space-x-1">
                            <Camera className="w-3 h-3" />
                            <span>Upload Proof</span>
                          </button>
                        </>
                      )}

                      {assignment.status === 'delivered' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Delivered Successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Performance & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">On-Time Delivery</span>
                  <span className="text-sm font-bold text-green-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Delivery Time</span>
                  <span className="text-sm font-bold text-gray-900">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-blue-600">4.8/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Efficiency Score</span>
                  <span className="text-sm font-bold text-purple-600">87%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Navigation className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Optimize Route</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">View Map</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Upload Proofs</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Rate Customers</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DeliveryAgentLayout>
    </QuickMelaRoleGuard>
  );
};

export default DeliveryAgentDashboard;
