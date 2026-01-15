import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuctionCard } from '@/components/AuctionCard';
import {
  Heart,
  Clock,
  Trophy,
  Wallet,
  Eye,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Package,
  Star,
  ArrowRight,
  Bell,
  Gavel,
  Calendar,
  Info,
  CheckCircle,
  X,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { aiService, AIRecommendation } from '../services/aiService';
import { formatCurrency } from '../lib/utils';

// Types
type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
  link?: string;
  testId?: string;
};

type ActivityType = 'bid' | 'watchlist' | 'auction' | 'tender' | 'payment' | 'system' | 'won' | 'lost' | 'outbid';

interface RecentActivity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  link?: string;
  icon?: React.ComponentType<{ className?: string }>;
  read?: boolean;
}

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'bid' | 'won' | 'lost' | 'outbid' | 'accepted' | 'rejected' | 'withdrawn' | 'pending';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  created_at: string;
  read?: boolean;
  link?: string;
}

interface Product {
  id: string;
  title: string;
  image_url?: string;
  end_date?: string;
  current_price?: number;
}

interface Bid {
  id: string;
  amount: number;
  auction_id?: string;
  product_id?: string;
  product?: Product;
  title: string;
  image_url?: string;
  end_date?: string;
  status?: 'active' | 'won' | 'lost' | 'outbid';
  created_at: string;
}

interface WatchlistItem {
  id: string;
  product_id: string;
  product?: {
    id: string;
    title: string;
    image_url?: string;
    current_price?: number;
    end_date?: string;
  };
  title: string;
  image_url?: string;
  current_price?: number;
  end_date?: string;
  endDate?: string; // For backward compatibility
  auctionId?: string; // For backward compatibility
  created_at: string;
}

interface BuyerStats {
  activeBids: number;
  wonAuctions: number;
  watchlistItems: number;
  walletBalance: number;
  totalSpent: number;
  savedAmount: number;
}

interface TenderBidSummary {
  id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  title: string;
  tender_id?: string;
  updated_at?: string;
  product?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

const getTimeLeft = (endDate?: string) => {
  if (!endDate) return '-';
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours <= 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString).getTime();
  if (Number.isNaN(date)) return '';
  const now = Date.now();
  const diff = now - date;
  if (diff < 0) return 'Just now';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

const getStatusColor = (status: string) => {
  if (status === 'bid' || status === 'tender') return 'bg-blue-100 text-blue-800';
  if (status === 'won' || status === 'accepted') return 'bg-green-100 text-green-800';
  if (status === 'lost' || status === 'rejected' || status === 'withdrawn') return 'bg-red-100 text-red-800';
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const sectionWrapperClass = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden';
const sectionHeaderClass = 'px-6 sm:px-8 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between';
const sectionBodyClass = 'px-6 sm:px-8 py-6 space-y-4';

const BuyerDashboard = () => {
  console.log('BuyerDashboard: Component rendering');

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<BuyerStats>({
    activeBids: 0,
    wonAuctions: 0,
    watchlistItems: 0,
    walletBalance: 0,
    totalSpent: 0,
    savedAmount: 0
  });
  
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tenderBids, setTenderBids] = useState<TenderBidSummary[]>([]);
  const [tenderSummaries, setTenderSummaries] = useState<TenderBidSummary[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [winsAwaitingPayment, setWinsAwaitingPayment] = useState(0);
  const [deliveriesInTransit, setDeliveriesInTransit] = useState(0);
  const [deliveriesDelivered, setDeliveriesDelivered] = useState(0);
  const [remindersSoon, setRemindersSoon] = useState(0);
  const [mappedWatchlist, setMappedWatchlist] = useState<WatchlistItem[]>([]);
  const navigate = useNavigate();
  const { session } = useSession();

  const fetchBuyerData = async () => {
    console.log('BuyerDashboard: fetchBuyerData start');
    try {
      const user = session?.user;
      if (!user) {
        console.log('BuyerDashboard: no user found');
        return;
      }
      setUser(user);
      console.log('BuyerDashboard: user set', user.id);

      // Fetch active bids
      console.log('BuyerDashboard: fetching bids');
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          amount_cents,
          status,
          created_at,
          auction:auctions(
            id,
            product:products(id, title, image_url, end_date)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (bidsError) console.error('BuyerDashboard: bids error', bidsError);
      else console.log('BuyerDashboard: bids fetched', bids?.length);

      // Fetch won auctions
      console.log('BuyerDashboard: fetching won bids');
      const { data: wonBids, error: wonError } = await supabase
        .from('bids')
        .select(`
          amount_cents,
          status,
          created_at,
          auction:auctions(
            id,
            product:products(id, title, image_url, end_date)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'won');
      
      if (wonError) console.error('BuyerDashboard: won error', wonError);

      // Fetch watchlist
      console.log('BuyerDashboard: fetching watchlist');
      const { data: watchlist, error: watchlistError } = await supabase
        .from('wishlist')
        .select(`
          id,
          product:products(id, title, image_url, end_date),
          product_id
        `)
        .eq('user_id', user.id);
      
      if (watchlistError) console.error('BuyerDashboard: watchlist error', watchlistError);

      // Fetch wallet
      console.log('BuyerDashboard: fetching wallet');
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (walletError) console.error('BuyerDashboard: wallet error', walletError);

      const { data: recentBids, error: recentError } = await supabase
        .from('bids')
        .select(`
          amount_cents,
          status,
          created_at,
          auction:auctions(
            product:products(title)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) console.error('BuyerDashboard: recent bids error', recentError);

      // Tender bids table currently missing in schema, mocking empty for now to prevent 500 error
      const tenderBidRows: any[] = [];
      /*
      const { data: tenderBidRows } = await supabase
        .from('tender_bids')
        .select(`
          id,
          amount,
          status,
          created_at,
          tender:tenders(
            id,
            title,
            product:products(id, title, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      */

      let mappedWatchlist: WatchlistItem[] = [];
      if (watchlist && watchlist.length > 0) {
        const productIds = watchlist
          .map((w: any) => w.product_id)
          .filter((id: string | null | undefined) => !!id);

        const auctionsByProduct: Record<string, { id: string; end_date?: string | null }> = {};
        if (productIds.length > 0) {
          const { data: productAuctions } = await supabase
            .from('auctions')
            .select('id, product_id, end_date, status')
            .in('product_id', productIds)
            .in('status', ['active', 'live']);

          (productAuctions || []).forEach((a: any) => {
            auctionsByProduct[a.product_id] = { id: a.id, end_date: a.end_date };
          });
        }

        mappedWatchlist = (watchlist || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id || item.product?.id || '',
          product: item.product ? {
            id: item.product.id,
            title: item.product.title,
            image_url: item.product.image_url,
            current_price: item.product.current_price,
            end_date: item.product.end_date
          } : undefined,
          title: item.product?.title || 'Untitled Item',
          image_url: item.product?.image_url,
          current_price: item.product?.current_price,
          end_date: item.product?.end_date || item.end_date,
          created_at: item.created_at || new Date().toISOString(),
          // Backward compatibility
          auctionId: item.auction_id,
          endDate: item.end_date || item.product?.end_date
        }));
      }

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Wins awaiting payment: auctions won by this user where auction status indicates payment is still due
      try {
        if (wonBids && wonBids.length > 0) {
          const auctionIdsForWins = (wonBids as any[])
            .map((b) => b.auction_id)
            .filter((id: string | null | undefined) => !!id);
          if (auctionIdsForWins.length > 0) {
            const { data: winAuctions } = await supabase
              .from('auctions')
              .select('id, status')
              .in('id', auctionIdsForWins);

            const awaiting = (winAuctions || []).filter((a: any) => {
              const s = (a.status || '').toLowerCase();
              return s === 'payment_pending' || s === 'payment_under_review';
            }).length;
            setWinsAwaitingPayment(awaiting);
          } else {
            setWinsAwaitingPayment(0);
          }
        } else {
          setWinsAwaitingPayment(0);
        }
      } catch (e) {
        console.warn('Failed to compute winsAwaitingPayment for buyer', e);
        setWinsAwaitingPayment(0);
      }

      // Deliveries status for this buyer
      try {
        const { data: deliveries } = await supabase
          .from('deliveries')
          .select('status')
          .eq('buyer_id', user.id);

        let inTransit = 0;
        let delivered = 0;
        (deliveries || []).forEach((d: any) => {
          const s = (d.status || '').toLowerCase();
          if (s === 'in_transit' || s === 'out_for_delivery') inTransit += 1;
          if (s === 'delivered' || s === 'picked_up') delivered += 1;
        });
        setDeliveriesInTransit(inTransit);
        setDeliveriesDelivered(delivered);
      } catch (e) {
        console.warn('Failed to load deliveries summary for buyer', e);
        setDeliveriesInTransit(0);
        setDeliveriesDelivered(0);
      }

      setStats({
        activeBids: bids?.length || 0,
        wonAuctions: wonBids?.length || 0,
        watchlistItems: watchlist?.length || 0,
        walletBalance: wallet?.balance || 0,
        totalSpent: wonBids?.reduce((sum, bid: any) => sum + (bid.amount_cents ? bid.amount_cents / 100 : bid.amount || 0), 0) || 0,
        savedAmount: 15000 // Mock data
      });

      const mappedBids = (bids || []).map((bid: any) => ({
        ...bid,
        amount: bid.amount_cents ? bid.amount_cents / 100 : bid.amount,
        product: bid.product || bid.auction?.product,
        product_id: bid.product_id || bid.auction?.product?.id
      }));
      setActiveBids(mappedBids.slice(0, 5));
      setWatchlistItems(mappedWatchlist.slice(0, 5));
      
      const mappedActivity: RecentActivity[] = (recentBids || []).map((b: any) => {
        const title = b.auction?.product?.title || 'this item';
        const amount = b.amount_cents ? b.amount_cents / 100 : b.amount || 0;
        const time = formatRelativeTime(b.created_at);
        if (b.status === 'won') {
          return {
            id: b.id,
            type: 'won',
            message: `You won the auction for ${title}`,
            time,
            link: `/auctions/${title}`,
            icon: Trophy
          };
        }
        return {
          id: b.id,
          type: 'bid',
          message: `You placed a bid of ₹${amount.toLocaleString()} on ${title}`,
          time,
          link: `/auctions/${title}`,
          icon: Gavel
        };
      });

      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'won',
          message: 'You won the auction for iPhone 13 Pro',
          time: '2 hours ago',
          link: '/auctions/iphone-13-pro',
          icon: Trophy
        },
        {
          id: '2',
          type: 'bid',
          message: 'You placed a bid on MacBook Pro 16"',
          time: '5 hours ago',
          link: '/auctions/macbook-pro-16',
          icon: Gavel
        }
      ];

      setRecentActivity(mockRecentActivity);

      const mappedNotifications: NotificationItem[] = (notifData || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        created_at: n.created_at,
        read: n.read,
      }));

      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.filter((n) => !n.read).length);

      const tenderSummaries: TenderBidSummary[] = (tenderBidRows || []).map((b: any) => ({
        id: b.id || '',
        amount: b.amount || 0,
        status: (b.status || 'pending') as 'pending' | 'accepted' | 'rejected' | 'withdrawn',
        created_at: b.created_at || new Date().toISOString(),
        title: b.tender?.product?.title || b.tender?.title || b.title || 'Tender',
        tender_id: b.tender_id || b.tender?.id || b.id,
        updated_at: b.updated_at || b.created_at || new Date().toISOString(),
        product: b.tender?.product ? {
          id: b.tender.product.id || '',
          title: b.tender.product.title || 'Untitled Product',
          image_url: b.tender.product.image_url
        } : b.product ? {
          id: b.product.id || '',
          title: b.product.title || 'Untitled Product',
          image_url: b.product.image_url
        } : undefined
      }));

      setTenderBids(tenderSummaries);

      // AI recommendations based on user behaviour
      try {
        const recs = await aiService.getPersonalizedRecommendations(user.id);
        setRecommendations(recs.slice(0, 6));
      } catch (e) {
        console.warn('Failed to load AI recommendations', e);
      }

      // Reminders: watchlist items with active auctions ending soon
      try {
        const soonCount = mappedWatchlist.filter((item) => {
          if (!item.endDate) return false;
          const end = new Date(item.endDate).getTime();
          if (Number.isNaN(end)) return false;
          const nowTs = Date.now();
          const diff = end - nowTs;
          const oneDay = 24 * 60 * 60 * 1000;
          return diff > 0 && diff <= oneDay;
        }).length;
        setRemindersSoon(soonCount);
      } catch (e) {
        console.warn('Failed to compute remindersSoon for buyer', e);
        setRemindersSoon(0);
      }

    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      console.log('BuyerDashboard: fetchBuyerData done, setting loading false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('BuyerDashboard: useEffect mounting');
    fetchBuyerData();
    return () => console.log('BuyerDashboard: useEffect unmounting');
  }, []);

  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => {
        const wasUnread = notifications.find((n) => n.id === id && !n.read);
        return wasUnread ? Math.max(prev - 1, 0) : prev;
      });
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-gray-900', trend, link, testId }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">+{trend}% this month</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      {/* Wins / Deliveries / Reminders strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Wins awaiting payment</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {winsAwaitingPayment}
            </p>
          </div>
          <Link
            to="/my/wins"
            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View wins
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Deliveries</p>
            <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-200">
              In transit: <span className="font-semibold">{deliveriesInTransit}</span>
            </p>
            <p className="text-[11px] text-gray-700 dark:text-gray-200">
              Delivered / picked up: <span className="font-semibold">{deliveriesDelivered}</span>
            </p>
          </div>
          <Link
            to="/my/orders"
            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Track orders
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Reminders (ending in 24h)</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {remindersSoon}
            </p>
          </div>
          <Link
            to="/watchlist"
            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View watchlist
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      {link && (
        <Link to={link} data-testid={testId} className="mt-3 btn btn-ghost btn-sm inline-flex items-center">
          View details <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </motion.div>
  );

  // Update tender bids and load recommendations when component mounts or user changes
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        if (user?.id) {
          const recs = await aiService.getPersonalizedRecommendations(user.id);
          setRecommendations(recs.slice(0, 6));
        }
      } catch (e) {
        console.warn('Failed to load AI recommendations', e);
      }
    };

    setTenderBids(tenderSummaries);
    loadRecommendations();
  }, [user, tenderSummaries]);

  // Calculate watchlist items ending soon
  const soonCount = useMemo(() => {
    return mappedWatchlist.filter((item) => {
      if (!item.endDate) return false;
      const end = new Date(item.endDate).getTime();
      if (Number.isNaN(end)) return false;
      const nowTs = Date.now();
      const diff = end - nowTs;
      return diff > 0 && diff < 24 * 60 * 60 * 1000; // Ending in next 24 hours
    }).length;
  }, [mappedWatchlist]);

  const watchlistProductIds = useMemo(
    () => new Set(mappedWatchlist.map((item) => item.product_id)),
    [mappedWatchlist]
  );

  const createNavigateHandler = (auctionId?: string, productId?: string, fallback = '/products') => () => {
    if (auctionId) {
      navigate(`/timed-auction/${auctionId}`);
      return;
    }
    if (productId) {
      navigate(`/product/${productId}`);
      return;
    }
    navigate(fallback);
  };

  const toggleWatchlist = async (productId?: string) => {
    if (!productId) return;

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to manage your watchlist');
        return;
      }

      const alreadyWatched = watchlistProductIds.has(productId);

      if (alreadyWatched) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        toast.success('Removed from watchlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;
        toast.success('Added to watchlist');
      }

      await fetchBuyerData();
    } catch (e) {
      console.error('Error updating watchlist', e);
      toast.error('Could not update watchlist. Please try again.');
    }
  };

  // Update reminders count when soonCount changes
  useEffect(() => {
    setRemindersSoon(soonCount);
  }, [soonCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div data-testid="dashboard-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Buyer Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Welcome back, {user?.user_metadata?.full_name || 'User'}
                </p>
              </div>
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={async () => {
                    localStorage.removeItem('demo-session');
                    localStorage.removeItem('demo-user-role');
                    localStorage.removeItem('demo-user-id');
                    localStorage.removeItem('demo-user-name');
                    window.dispatchEvent(new CustomEvent('demo-logout'));
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                      toast.error('Logout failed');
                    } else {
                      toast.success('Logged out successfully');
                      navigate('/');
                    }
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          aria-label="Close notifications"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => {
                            let Icon = Info;
                            let iconClass = 'bg-blue-100 text-blue-600';
                            if (notification.type === 'success' || notification.type === 'accepted') {
                              Icon = CheckCircle;
                              iconClass = 'bg-green-100 text-green-600';
                            } else if (notification.type === 'error' || notification.type === 'rejected' || notification.type === 'withdrawn') {
                              Icon = X;
                              iconClass = 'bg-red-100 text-red-600';
                            } else if (notification.type === 'warning' || notification.type === 'pending') {
                              Icon = AlertTriangle;
                              iconClass = 'bg-yellow-100 text-yellow-600';
                            }
                            return (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                                onClick={() => {
                                  if (notification.link) {
                                    window.location.href = notification.link;
                                  }
                                  if (!notification.read) {
                                    setNotifications(notifications.map((n) => 
                                      n.id === notification.id ? { ...n, read: true } : n
                                    ));
                                    setUnreadCount((prev) => Math.max(0, prev - 1));
                                  }
                                }}
                              >
                                <div className="flex items-start">
                                  <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${iconClass}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatRelativeTime(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No new notifications
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                          <button
                            onClick={() => {
                              setNotifications(notifications.map((n) => ({ ...n, read: true })));
                              setUnreadCount(0);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Won Auctions"
            value={stats.wonAuctions}
            icon={Trophy}
            color="text-yellow-600"
            trend={12}
            link="/my/won-auctions"
          />
          <StatCard
            title="Watchlist"
            value={stats.watchlistItems}
            icon={Heart}
            color="text-red-600"
            link="/watchlist"
          />
          <StatCard
            title="Wallet Balance"
            value={`₹${stats.walletBalance.toLocaleString()}`}
            icon={Wallet}
            color="text-green-600"
            link="/wallet"
          />
          <StatCard
            title="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            icon={TrendingUp}
            color="text-purple-600"
          />
          <StatCard
            title="Amount Saved"
            value={`₹${stats.savedAmount.toLocaleString()}`}
            icon={Star}
            color="text-orange-600"
            trend={25}
          />
          <StatCard
            title="Market Analytics"
            value="View Insights"
            icon={BarChart3}
            color="text-indigo-600"
            link="/market-analytics"
          />
          <StatCard
            title="Reports"
            value="Performance"
            icon={TrendingUp}
            color="text-teal-600"
            link="/reports"
          />
          <StatCard
            title="Security Center"
            value="Protection"
            icon={ShieldCheck}
            color="text-emerald-600"
            link="/security-center"
          />
          <StatCard
            title="My Inspections"
            value="Reports & Visits"
            icon={Eye}
            color="text-pink-600"
            link="/my/inspections"
            testId="statcard-my-inspections"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <Link
            to="/products"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-indigo-100 rounded-lg inline-block mb-3">
                <Eye className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Auctions</h3>
              <p className="text-sm text-gray-500">Discover new items</p>
            </div>
          </Link>

          <Link
            to="/watchlist"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-red-100 rounded-lg inline-block mb-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Watchlist</h3>
              <p className="text-sm text-gray-500">Saved items</p>
            </div>
          </Link>

          <Link
            to="/wallet"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add Funds</h3>
              <p className="text-sm text-gray-500">Top up wallet</p>
            </div>
          </Link>

          <Link
            to="/live-auction"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Auctions</h3>
              <p className="text-sm text-gray-500">Join live bidding</p>
            </div>
          </Link>

          <Link
            to="/auction-calendar"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Auction Calendar</h3>
              <p className="text-sm text-gray-500">Plan upcoming auctions</p>
            </div>
          </Link>

          <Link
            to="/tender-auction"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-3">
                <Gavel className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Tender Auctions</h3>
              <p className="text-sm text-gray-500">Submit sealed bids</p>
            </div>
          </Link>

          <Link
            to="/my/won-auctions"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="text-center">
              <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Won Auctions</h3>
              <p className="text-sm text-gray-500">View all wins & next steps</p>
            </div>
            {winsAwaitingPayment > 0 && (
              <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-semibold">
                {winsAwaitingPayment} unpaid
              </span>
            )}
          </Link>
          <Link
            to="/events"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Events</h3>
              <p className="text-sm text-gray-500">Upcoming and past events</p>
            </div>
          </Link>
          <Link
            to="/invest/dashboard"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Invest Dashboard</h3>
              <p className="text-sm text-gray-500">Track investments & returns</p>
            </div>
          </Link>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended for you</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on your bids, watchlist and popular auctions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.productId}
                  to={`/product/${rec.productId}`}
                  className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-indigo-500 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{rec.type}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">#{rec.productId.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Match score</p>
                      <p className="text-sm font-semibold text-indigo-600">{Math.round(rec.score)}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{rec.reason}</p>
                  <div className="flex items-center justify-between text-xs text-indigo-600 group-hover:text-indigo-700">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      View details
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Bids</h2>
              <Link 
                to="/bidding-history" 
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="p-6 space-y-3">
              {activeBids.length > 0 ? (
                activeBids.map((bid) => {
                  const productId = bid.product?.id || bid.product_id;
                  const navHandler = createNavigateHandler(bid.auction_id, productId, '/products');

                  return (
                    <AuctionCard
                      key={bid.id}
                      id={bid.id}
                      image={bid.product?.image_url}
                      title={bid.product?.title || bid.title}
                      price={bid.product?.current_price}
                      currentBid={bid.amount}
                      timeRemaining={getTimeLeft(bid.product?.end_date)}
                      variant="compact"
                      watched={Boolean(productId && watchlistProductIds.has(productId))}
                      onWatchToggle={() => productId && toggleWatchlist(productId)}
                      onPrimaryAction={navHandler}
                      onClick={navHandler}
                    />
                  );
                })
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                  <p className="text-sm">You don't have any active bids yet.</p>
                  <Link
                    to="/products"
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Browse auctions
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'won' ? 'bg-green-100' :
                        activity.type === 'bid' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {activity.type === 'won' ? (
                          <Trophy className="h-4 w-4 text-green-600" />
                        ) : activity.type === 'bid' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</h2>
            <Link to="/watchlist" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {watchlistItems.length > 0 ? (
              watchlistItems.map((item) => {
                const productId = item.product?.id || item.product_id;
                const hasAuction = Boolean(item.auctionId);
                const itemHandler = createNavigateHandler(item.auctionId, productId, '/products');

                return (
                  <AuctionCard
                    key={item.id}
                    id={item.id}
                    image={item.product?.image_url}
                    title={item.product?.title || item.title}
                    price={item.product?.current_price}
                    timeRemaining={hasAuction ? getTimeLeft(item.endDate || item.end_date) : undefined}
                    location={item.product ? 'Watchlist' : undefined}
                    variant="compact"
                    watched={Boolean(productId && watchlistProductIds.has(productId))}
                    onWatchToggle={() => productId && toggleWatchlist(productId)}
                    onPrimaryAction={itemHandler}
                    onClick={itemHandler}
                  />
                );
              })
            ) : (
              <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                <p className="text-sm">Your watchlist is empty.</p>
                <Link
                  to="/products"
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Browse auctions to watch
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Tender Bids</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenderBids.length > 0 ? (
              tenderBids.map((tb) => (
                <div key={tb.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{tb.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted {formatRelativeTime(tb.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{tb.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Status: {tb.status}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                You don&apos;t have any tender bids yet.
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
// Export as both named and default for backward compatibility
export { BuyerDashboard };
export default BuyerDashboard;
