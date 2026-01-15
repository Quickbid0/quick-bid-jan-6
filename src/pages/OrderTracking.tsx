import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Download,
  Star,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

interface Order {
  id: string;
  product_title: string;
  product_image: string;
  seller_name: string;
  buyer_name: string;
  amount: number;
  order_date: string;
  estimated_delivery: string;
  tracking_number: string;
  current_status: string;
  shipping_address: string;
  carrier: string;
  carrier_phone: string;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!orderId) {
        setError('Missing order reference.');
        setOrder(null);
        setTrackingEvents([]);
        return;
      }

      const { data: authData } = await supabase.auth.getSession();
      const buyerId = authData?.session?.user?.id || null;
      const demoSession = localStorage.getItem('demo-session');
      const effectiveBuyerId = buyerId || (demoSession ? JSON.parse(demoSession).user.id : null);

      if (!effectiveBuyerId) {
        setError('You must be logged in to track an order.');
        setOrder(null);
        setTrackingEvents([]);
        return;
      }

      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          id,
          final_price,
          created_at,
          product:products(id, title, image_url),
          seller:profiles(id, name, full_name)
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (auctionError) {
        console.error('OrderTracking: auction load error', auctionError);
        setError('Unable to load order details.');
        setOrder(null);
        setTrackingEvents([]);
        return;
      }

      if (!auction) {
        setOrder(null);
        setTrackingEvents([]);
        return;
      }

      const productId = (auction as any).product?.id || null;
      const { data: delivery } = await supabase
        .from('deliveries')
        .select('status, tracking_updates, carrier, carrier_phone, tracking_number, shipping_address, updated_at, created_at')
        .eq('buyer_id', effectiveBuyerId)
        .eq('product_id', productId)
        .maybeSingle();

      const currentStatus = delivery?.status || 'Pending';
      const trackingUpdates: any[] = Array.isArray(delivery?.tracking_updates) ? delivery?.tracking_updates : [];

      const sellerName = (auction as any).seller?.name || (auction as any).seller?.full_name || 'Seller';
      const productTitle = (auction as any).product?.title || 'Won item';
      const productImage = (auction as any).product?.image_url || 'https://placehold.co/400x300?text=Product';
      const amount = (auction as any).final_price != null ? Number((auction as any).final_price) : 0;
      const orderDate = (auction as any).created_at || new Date().toISOString();

      const timelineFromTracking = trackingUpdates
        .map((u: any, idx: number) => {
          const description = typeof u === 'string' ? u : (u?.description || u?.message || 'Update');
          const status = typeof u === 'string' ? 'Update' : (u?.status || 'Update');
          const location = typeof u === 'string' ? '' : (u?.location || '');
          const timestamp = typeof u === 'string' ? '' : (u?.timestamp || u?.created_at || '');
          return {
            id: String(idx + 1),
            status,
            description,
            location,
            timestamp,
            completed: true,
          } as TrackingEvent;
        });

      const fallbackTimeline: TrackingEvent[] = [
        {
          id: '1',
          status: 'Order Confirmed',
          description: 'Your win is confirmed. Payment and delivery updates will appear here.',
          location: '',
          timestamp: orderDate,
          completed: true,
        },
        {
          id: '2',
          status: currentStatus,
          description: delivery?.status ? 'Delivery is being processed.' : 'Delivery record not yet created.',
          location: '',
          timestamp: delivery?.updated_at || delivery?.created_at || '',
          completed: false,
        },
      ];

      setOrder({
        id: orderId,
        product_title: productTitle,
        product_image: productImage,
        seller_name: sellerName,
        buyer_name: 'You',
        amount,
        order_date: orderDate,
        estimated_delivery: delivery?.updated_at || delivery?.created_at || orderDate,
        tracking_number: delivery?.tracking_number || '',
        current_status: currentStatus,
        shipping_address: delivery?.shipping_address || '',
        carrier: delivery?.carrier || 'QuickMela Logistics',
        carrier_phone: delivery?.carrier_phone || '',
      });
      setTrackingEvents(timelineFromTracking.length > 0 ? timelineFromTracking : fallbackTimeline);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Unexpected error while loading tracking.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    
    switch (status) {
      case 'In Transit':
        return <Truck className="h-6 w-6 text-blue-500" />;
      case 'Out for Delivery':
        return <Package className="h-6 w-6 text-orange-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Order Tracking</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading tracking details…</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Order Tracking</h1>
                <p className="text-sm text-red-500 dark:text-red-400 font-medium">Failed to load tracking details</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tracking unavailable</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Retry
              </button>
              <Link to="/my/won-auctions" className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                My Wins
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Order Tracking</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Delivery not started</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Delivery not started</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Delivery tracking will appear here once payment is completed and preferences are set.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/pay/${orderId}`}
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
              >
                Pay Now
              </Link>
              <Link
                to={`/delivery-preferences/${orderId}`}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Set Preferences
              </Link>
              <Link
                to="/my/won-auctions"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                My Wins
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your order #{order.id}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start gap-6">
          <img
            src={order.product_image}
            alt={order.product_title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {order.product_title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Seller: {order.seller_name}</p>
                <p className="text-gray-500">Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                <p className="text-gray-500">Tracking: {order.tracking_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount: ₹{order.amount.toLocaleString()}</p>
                <p className="text-gray-500">Carrier: {order.carrier}</p>
                <p className="text-gray-500">Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.current_status === 'Delivered' ? 'bg-green-100 text-green-800' :
              order.current_status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.current_status}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Tracking Timeline
        </h3>
        <div className="space-y-6">
          {trackingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(event.status, event.completed)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    event.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {event.status}
                  </h4>
                  {event.timestamp && (
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  event.completed ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'
                }`}>
                  {event.description}
                </p>
                <div className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{event.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Shipping Address
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">{order.buyer_name}</p>
            <p className="text-gray-600 dark:text-gray-300">{order.shipping_address}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Carrier Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">{order.carrier}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">{order.carrier_phone}</span>
            </div>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">{order.tracking_number}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Seller
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Call Support
          </button>
          {order.current_status === 'Delivered' && (
            <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rate & Review
            </button>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Need Help with Your Order?
        </h3>
        <p className="text-blue-700 dark:text-blue-200 mb-4">
          If you have any questions about your order or delivery, our support team is here to help.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Contact Support
          </button>
          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
            View FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;