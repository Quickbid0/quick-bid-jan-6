import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Video, Users, Shield, Play, Pause, Settings, MessageSquare, Gavel, Clock, DollarSign, Eye, Heart, Share2, Star, TrendingUp, Zap, Award, Search, MapPin, Calendar, Wallet, ArrowRight } from 'lucide-react';
import LiveChat from './LiveChat';
import RealTimeBidding from '../components/RealTimeBidding';
import LiveStreamPlayer from '../components/LiveStreamPlayer';
import { useRealTimeAuction } from '../hooks/useRealTimeAuction';
import LiveWinnerReveal from '../components/live/LiveWinnerReveal';
import { setupBidVoiceEvents } from '../components/live/BidVoiceEvents';
import { useLiveAds } from '../hooks/useLiveAds';
import { auctionService } from '../services/auctionService';
import { paymentService } from '../services/paymentService';
import SellerInfoCard from '../components/auctions/SellerInfoCard';
import SellerTrustSummary from '../components/auctions/SellerTrustSummary';
import LiveScoreboard from '../components/auctions/LiveScoreboard';
import BidHistoryList from '../components/auctions/BidHistoryList';
import AuctionTypeBadge from '../components/auctions/AuctionTypeBadge';
import { AuctionCard } from '@/components/AuctionCard';
import { StatusStrip } from '@/components';
import { auctionSocket } from '../services/auctionSocket';

const YARD_TOKEN_AMOUNT = 5000; // ₹5,000 token deposit per yard

interface LiveAuction {
  id: string;
  productId?: string;
  eventId?: string | null;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  increment_amount: number;
  stream_url: string;
  end_time: string;
  status: 'active' | 'ended';
  viewer_count: number;
  watchers?: number;
  seller_verified: boolean;
  image_url: string;
  seller: {
    name: string;
    type: 'individual' | 'company' | 'third_party';
    avatar_url: string;
    rating: number;
    total_sales: number;
  };
  category: string;
  location: string;
  condition?: string;
  views: number;
  bid_count: number;
  reserve_price?: number;
  auto_extend: boolean;
  extension_time: number;
  quality: string;
  features: string[];
  sellerProfileId?: string;
}

const LiveAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const replayReveal = searchParams.get('replay') === '1';
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<LiveAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [streamQuality, setStreamQuality] = useState('1080p');
  const [bidError, setBidError] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [watchersCount, setWatchersCount] = useState(0);
  const [highlightMessage, setHighlightMessage] = useState('');
  const [adminHighlightDraft, setAdminHighlightDraft] = useState('');
  const [lobbyFilter, setLobbyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [selectedLocationId, setSelectedLocationId] = useState<string | 'all'>('all');
  const [eventDayFilter, setEventDayFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [yardTokenMap, setYardTokenMap] = useState<Record<string, boolean>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [showWinnerReveal, setShowWinnerReveal] = useState(false);
  const [winnerRevealShownForId, setWinnerRevealShownForId] = useState<string | null>(null);

  const loadBidHistory = async (auctionId: string) => {
    try {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('bids')
          .select('amount, created_at, user_id')
          .eq('auction_id', auctionId)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const bids = data || [];
      if (bids.length === 0) {
        setBidHistory([]);
        return;
      }

      const highest = bids.reduce((acc: any, b: any) => (b.amount > acc.amount ? b : acc), bids[0]);

      const history = bids.map((b: any) => {
        const isYou = user && b.user_id === user.id;
        const bidderLabel = isYou ? 'You' : `Bidder ${b.user_id.slice(-4)}`;
        const time = new Date(b.created_at).toLocaleTimeString();
        return {
          bidder: bidderLabel,
          amount: b.amount,
          time,
          isWinning: b.user_id === highest.user_id,
        };
      });

      setBidHistory(history);
    } catch (e) {
      console.error('Error loading bid history for live auction', e);
    }
  };

  const getTimeLeft = (endTimeIso?: string) => {
    if (!endTimeIso) return '-';
    const end = new Date(endTimeIso).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours <= 0) return `${remainingMinutes}m`;
    return `${hours}h ${remainingMinutes}m`;
  };

  type EventDayFilter = 'today' | 'tomorrow' | 'week';

  interface LocationGroup {
    id: string;
    cityLabel: string;
    address: string;
    auctions: LiveAuction[];
  }

  const groupAuctionsByCity = (list: LiveAuction[]): LocationGroup[] => {
    const map: Record<string, LocationGroup> = {};

    list.forEach((auction) => {
      const key = auction.location || 'Online';

      if (!map[key]) {
        let cityLabel = key;
        let address = key;

        // Try to derive normalized city/address from event + locations when available,
        // but keep the grouping id based on the existing location key to avoid breaking yard tokens.
        const eventForAuction = events.find((evt) => evt.id === auction.eventId);
        const locationId = eventForAuction?.location_id as string | undefined;
        const loc = locationId ? locations.find((l) => l.id === locationId) : undefined;

        if (loc) {
          cityLabel = loc.city || loc.name || key;
          address = loc.address_line1 || cityLabel;
        }

        map[key] = {
          id: key,
          cityLabel,
          address,
          auctions: [],
        };
      }

      map[key].auctions.push(auction);
    });

    return Object.values(map);
  };

  const getVehiclesSummaryForLocation = (group?: LocationGroup) => {
    if (!group) return { total: 0, types: [] as string[] };
    const typesSet = new Set<string>();
    group.auctions.forEach((a) => {
      if (a.category) {
        typesSet.add(a.category);
      }
    });
    return {
      total: group.auctions.length,
      types: Array.from(typesSet),
    };
  };

  const eventSlotsByDay: Record<EventDayFilter, { label: string; time: string; tag: string }[]> = {
    today: [
      { label: 'Morning vehicle lane', time: '10:00 AM – 12:00 PM', tag: 'Cars, SUVs' },
      { label: 'Two-wheeler lane', time: '1:00 PM – 2:30 PM', tag: 'Bikes & scooters' },
      { label: 'Evening clearance lots', time: '4:00 PM – 6:00 PM', tag: 'No-reserve stock' },
    ],
    tomorrow: [
      { label: 'Fleet & commercial sale', time: '11:00 AM – 1:00 PM', tag: 'Fleet, LCVs' },
      { label: 'Premium segment', time: '3:00 PM – 5:00 PM', tag: 'Luxury & premium' },
    ],
    week: [
      { label: 'Weekly bank recovery auction', time: 'Wed • 3:00 PM – 6:00 PM', tag: 'Bank-seized vehicles' },
      { label: 'Weekend mega yard', time: 'Sat • 11:00 AM – 5:00 PM', tag: 'Mixed inventory' },
      { label: 'Art & collectibles lane', time: 'Sun • 2:00 PM – 4:00 PM', tag: 'Art, antiques' },
    ],
  };

  const handleShareLocation = (group?: LocationGroup) => {
    if (!group) return;
    const text = `QuickMela Live Yard Location\n${group.cityLabel}\n${group.address}`;
    const url = window.location.origin + '/live-auction';
    if (navigator.share) {
      navigator.share({ title: 'QuickMela Live Location', text, url }).catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
    }
  };

  useEffect(() => {
    // Check if user is admin
    const checkUserRole = async () => {
      const demoRole = localStorage.getItem('demo-user-role');
      setIsAdmin(['admin', 'superadmin'].includes(demoRole || ''));
    };

    const loadLiveAuctions = async () => {
      try {
        const forceMock = (typeof window !== 'undefined' && localStorage.getItem('test-mock-live') === 'true') || (import.meta as any)?.env?.VITE_TEST_MOCK_LIVE === 'true';
        let source: any[] = [];
        if (!forceMock) {
          try {
            const res: any = await Promise.race([
              supabase
                .from('auctions')
                .select(`
                  id,
                  product_id,
                  event_id,
                  auction_type,
                  status,
                  current_price,
                  starting_price,
                  increment_amount,
                  stream_url,
                  end_date,
                  product:products(title, description, image_url, category, location, view_count),
                  seller:profiles(id, full_name, avatar_url, kyc_status),
                  seller_metrics: seller_metrics(total_auctions, total_sales)
                `)
                .eq('auction_type', 'live')
                .in('status', ['active', 'live'])
                .then((r: any) => r),
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
              id: 'mock-live-1',
              product_id: 'p1',
              event_id: null,
              auction_type: 'live',
              status: 'active',
              current_price: 250000,
              starting_price: 200000,
              increment_amount: 5000,
              stream_url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
              end_date: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
              product: {
                title: 'Live: Vintage Motorcycle Lot',
                description: 'Curated vintage motorcycles in excellent condition.',
                image_url: 'https://images.unsplash.com/photo-1517940310602-2635cef8fd17?auto=format&fit=crop&w=800&q=80',
                category: 'Vehicles',
                location: 'Mumbai, Maharashtra',
                view_count: 0
              },
              seller: {
                id: 's1',
                full_name: 'Verified Seller',
                avatar_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80',
                kyc_status: 'verified'
              },
              seller_metrics: { total_auctions: 20, total_sales: 75 }
            }
          ];
        }
        const mapped: LiveAuction[] = (source || []).map((a: any) => ({
          id: a.id,
          productId: a.product_id,
          eventId: a.event_id ?? null,
          title: a.product?.title || 'Live auction',
          description: a.product?.description || '',
          current_price: a.current_price || a.starting_price || 0,
          starting_price: a.starting_price || a.current_price || 0,
          increment_amount: a.increment_amount || 1000,
          stream_url: a.stream_url || 'https://www.youtube.com/embed/jfKfPfyJRdk',
          end_time: a.end_date || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: (a.status === 'active' || a.status === 'live') ? 'active' : 'ended',
          viewer_count: 0,
          seller_verified: (a.seller as any)?.kyc_status === 'verified',
          image_url: a.product?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80',
          seller: {
            name: (a.seller as any)?.full_name || 'Verified seller',
            type: 'individual',
            avatar_url: (a.seller as any)?.avatar_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80',
            rating: 4.7,
            total_sales: (a.seller_metrics as any)?.total_sales != null ? Number((a.seller_metrics as any).total_sales) : 0,
          },
          category: a.product?.category || 'General',
          location: a.product?.location || 'Online',
          condition: a.product?.condition || 'Verified',
          views: a.product?.view_count || 0,
          bid_count: 0,
          reserve_price: undefined,
          auto_extend: true,
          extension_time: 5,
          quality: 'HD',
          features: [],
          watchers: 0,
          sellerProfileId: a.seller?.id ?? undefined,
        }));
        setAuctions(mapped);
      } catch (e) {
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    const loadMeta = async () => {
      try {
        const resEvents: any = await Promise.race([
          supabase.from('auction_events').select('id, name, status, location_id').then((r: any) => r),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ]).catch(() => ({ data: [], error: true }));
        setEvents((resEvents && !resEvents.error && (resEvents.data || [])) || []);
        const resLocations: any = await Promise.race([
          supabase.from('locations').select('id, name, city, state').then((r: any) => r),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ]).catch(() => ({ data: [], error: true }));
        setLocations((resLocations && !resLocations.error && (resLocations.data || [])) || []);
      } catch (e) {
        setEvents([]);
        setLocations([]);
      }
    };

    checkUserRole();
    loadLiveAuctions();
    loadMeta();

  }, []);

  useEffect(() => {
    // Whenever auctions change (or user changes), refresh which yards are token-paid
    refreshYardTokenMap();
  }, [auctions.length]);

  useEffect(() => {
    const source = auctions.length > 0 ? auctions : [];

    // If no id in URL, stay in lobby view (don't auto-select)
    if (!id) {
      setSelectedAuction(null);
      return;
    }

    // Try to find the auction matching the URL id; if not found, gracefully fall back
    const selected = source.find((a) => a.id === id) || (source.length > 0 ? source[0] : null);
    if (selected) {
      // Normalize the URL to always use the selected auction's real id.
      // This avoids cases where older links or UI send /live-auction/1 while
      // the actual auction id is a UUID like 2ed59a07-....
      if (id !== selected.id) {
        navigate(`/live-auction/${selected.id}`, { replace: true });
      }

      setSelectedAuction(selected);
      setViewerCount(selected.viewer_count);
      loadBidHistory(selected.id);
    }
  }, [id, auctions, navigate]);

  useEffect(() => {
    // Initialize auction socket for real-time bidding
    const initAuctionSocket = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const demoSession = localStorage.getItem('demo-session');
        
        if (user || demoSession) {
          const userId = user?.id || 'demo-user';
          const userName = user?.user_metadata?.name || user?.email || 'Demo User';
          
          // Connect to auction socket
          console.log('🔌 Initializing auction socket connection...');
          // Note: The auction socket is already initialized as a singleton
          // We'll set up event listeners in the next useEffect
        }
      } catch (error) {
        console.error('❌ Failed to initialize auction socket:', error);
      }
    };

    initAuctionSocket();

    // Cleanup function
    return () => {
      // Note: We don't disconnect the global socket instance
    };
  }, []);

  useEffect(() => {
    if (!selectedAuction) return;

    const auctionId = selectedAuction.id;
    const userId = 'current-user'; // This should come from auth context
    const userName = 'Current User'; // This should come from auth context

    // Join the auction room
    auctionSocket.joinAuction(auctionId, userId);

    // Set up event listeners for this auction
    const unsubscribeBidUpdate = auctionSocket.onBidUpdate((bidData) => {
      if (bidData.auctionId === auctionId) {
        console.log('💰 Real-time bid update:', bidData);
        setSelectedAuction(prev => prev ? {
          ...prev,
          current_price: bidData.amount,
          bid_count: prev.bid_count + 1,
        } : prev);
        loadBidHistory(auctionId);
        toast.success(`New bid: ₹${bidData.amount.toLocaleString()}`);
      }
    });

    const unsubscribeAuctionEnd = auctionSocket.onAuctionEnd((winnerData) => {
      if (winnerData.auctionId === auctionId) {
        console.log('🏆 Auction ended:', winnerData);
        setSelectedAuction(prev => prev ? {
          ...prev,
          status: 'ended'
        } : prev);
        setShowWinnerReveal(true);
        setWinnerRevealShownForId(auctionId);
        toast.success(`Auction ended! Winner: ${winnerData.winnerName}`);
      }
    });

    const unsubscribeCountdown = auctionSocket.onCountdownUpdate((countdownData) => {
      if (countdownData.auctionId === auctionId) {
        // Update countdown timer
        const minutes = Math.floor(countdownData.timeLeft / 60);
        const seconds = countdownData.timeLeft % 60;
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    });

    // Cleanup event listeners
    return () => {
      auctionSocket.leaveAuction(auctionId, userId);
      unsubscribeBidUpdate();
      unsubscribeAuctionEnd();
      unsubscribeCountdown();
    };
  }, [selectedAuction]);

  useEffect(() => {
    const loadWatchlistState = async () => {
      if (!selectedAuction?.productId) return;

      try {
        const [{ data: { user } }, { data: userWishlist }, { count }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from('wishlist')
            .select('id')
            .eq('product_id', selectedAuction.productId),
          supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', selectedAuction.productId),
        ]);

        if (!user) {
          setIsWatching(false);
          setWatchersCount(count || 0 || 0);
          return;
        }

        const isUserWatching = (userWishlist || []).some((w: any) => w.user_id === user.id);
        setIsWatching(isUserWatching);
        setWatchersCount(count || 0);
      } catch (e) {
        console.error('Error loading watchlist state for live auction', e);
      }
    };

    loadWatchlistState();
  }, [selectedAuction]);

  useEffect(() => {
    if (!selectedAuction) return;

    const cleanup = setupBidVoiceEvents({ auctionId: selectedAuction.id });

    return () => {
      cleanup();
    };
  }, [selectedAuction]);

  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!selectedAuction) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(selectedAuction.end_time).getTime();
      const distance = endTime - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Mark as urgent if less than 5 minutes remaining
        setIsUrgent(distance < 5 * 60 * 1000);
        
        if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
            setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
            setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft('Auction Ended');
        setIsUrgent(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAuction]);

  useEffect(() => {
    if (!selectedAuction) return;
    if (timeLeft === 'Auction Ended' && winnerRevealShownForId !== selectedAuction.id) {
      setShowWinnerReveal(true);
      setWinnerRevealShownForId(selectedAuction.id);
    }
  }, [timeLeft, selectedAuction, winnerRevealShownForId]);

  useEffect(() => {
    if (!selectedAuction) return;

    const channel = supabase
      .channel(`auction-bids-live:${selectedAuction.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${selectedAuction.id}`,
        },
        (payload) => {
          const newBid: any = payload.new;
          setSelectedAuction((prev) => {
            if (!prev) return prev;
            const amount = newBid.amount || prev.current_price;
            return {
              ...prev,
              current_price: amount,
              bid_count: prev.bid_count + 1,
            };
          });
          loadBidHistory(selectedAuction.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedAuction]);

  const handleJoinLiveAuction = (auction: LiveAuction) => {
    const yardId = auction.location || 'Online';
    const hasToken = !!yardTokenMap[yardId];
    const demo = localStorage.getItem('demo-session');
    if (!hasToken && !demo) {
      const yardsSection = document.getElementById('live-yards');
      yardsSection?.scrollIntoView({ behavior: 'smooth' });
      toast.error('Pay the yard token deposit for this location to join the live auction.');
      return;
    }
    navigate(`/live-auction/${auction.id}`);
  };

  const handlePlaceBidAction = async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!selectedAuction) return { success: false, error: 'No auction selected' };
    setBidError('');

    const minAllowed = selectedAuction.current_price + selectedAuction.increment_amount;
    if (amount < minAllowed) {
      const msg = `Minimum bid is ₹${minAllowed.toLocaleString()}`;
      setBidError(msg);
      return { success: false, error: msg };
    }

    try {
      setPlacingBid(true);
      const { data: { user } } = await supabase.auth.getUser();
      const demo = localStorage.getItem('demo-session');
      if (!user && !demo) {
        setBidError('You need to be logged in to place a bid');
        return { success: false, error: 'You need to be logged in to place a bid' };
      }

      const userId = user?.id || 'demo-user';
      const userName = user?.user_metadata?.name || user?.email || 'Demo User';

      // Check socket connection status
      const socketStatus = auctionSocket.getConnectionStatus();
      if (!socketStatus.connected) {
        console.warn('⚠️ Socket not connected, falling back to API call');
        // Fall back to regular API call if socket is not connected
        const result = await auctionService.placeBid({
          auctionId: selectedAuction.id,
          userId,
          amount,
        });

        if (!result.success) {
          const msg = result.error || 'Failed to place bid. Please try again.';
          setBidError(msg);
          return { success: false, error: msg };
        }
      } else {
        // Use real-time socket for bidding
        console.log('🎯 Placing bid via socket:', { auctionId: selectedAuction.id, userId, amount });
        auctionSocket.placeBid(selectedAuction.id, userId, amount);
        
        // Optimistically update UI immediately
        setSelectedAuction(prev => prev ? {
          ...prev,
          current_price: amount,
          bid_count: prev.bid_count + 1,
        } : prev);
      }

      await loadBidHistory(selectedAuction.id);
      toast.success(`Bid of ₹${amount.toLocaleString()} placed successfully!`);
      return { success: true };
    } catch (e) {
      console.error('Error placing live bid', e);
      const msg = 'Something went wrong while placing your bid. Please try again.';
      setBidError(msg);
      return { success: false, error: msg };
    } finally {
      setPlacingBid(false);
    }
  };

  const toggleWatchlist = async (auctionId?: string) => {
    const targetProductId = auctionId ?? selectedAuction?.productId;
    if (!targetProductId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to manage your watchlist');
        return;
      }

      if (isWatching) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', selectedAuction.productId);

        if (error) {
          console.error('Error removing from watchlist', error);
          toast.error('Failed to remove from watchlist. Please try again.');
          return;
        }

        setIsWatching(false);
        setWatchersCount(prev => Math.max(prev - 1, 0));
        toast.success('Removed from watchlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: targetProductId });

        if (error) {
          console.error('Error adding to watchlist', error);
          toast.error('Failed to add to watchlist. Please try again.');
          return;
        }

        setIsWatching(true);
        setWatchersCount(prev => prev + 1);
        toast.success('Added to watchlist');
      }
    } catch (e) {
      console.error('toggleWatchlist live auction error', e);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const filteredLobbyAuctions = auctions.filter((auction) => {
    if (lobbyFilter === 'ending_soon') {
      const end = new Date(auction.end_time).getTime();
      const now = Date.now();
      if (end - now >= 2 * 60 * 60 * 1000) {
        return false;
      }
    }

    if (categoryFilter !== 'all') {
      if (!auction.category || !auction.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
    }

    if (locationFilter) {
      if (!auction.location || !auction.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = Number(minStr) || 0;
      const max = maxStr ? Number(maxStr) : null;
      if (max !== null) {
        if (auction.current_price < min || auction.current_price > max) return false;
      } else {
        if (auction.current_price < min) return false;
      }
    }

    return true;
  });

  const sortedLobbyAuctions = [...filteredLobbyAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'ending_soon':
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      case 'price_low':
        return a.current_price - b.current_price;
      case 'price_high':
        return b.current_price - a.current_price;
      case 'most_bids':
        return (b.bid_count || 0) - (a.bid_count || 0);
      case 'most_viewed':
        return (b.views || 0) - (a.views || 0);
      case 'most_viewers':
        return (b.viewer_count || 0) - (a.viewer_count || 0);
      default:
        return 0;
    }
  });

  const locationGroups = groupAuctionsByCity(auctions);
  const effectiveSelectedLocationId = selectedLocationId === 'all' && locationGroups.length > 0
    ? locationGroups[0].id
    : selectedLocationId;
  const selectedLocation = locationGroups.find((loc) => loc.id === effectiveSelectedLocationId) || locationGroups[0];

  const unlockedYards = locationGroups.filter((loc) => yardTokenMap[loc.id]);

  const { ad: bottomBannerAd, visible: bottomBannerVisible, handleClick: handleBottomBannerClick } = useLiveAds({
    eventId: selectedAuction?.eventId || undefined,
    slotType: 'banner_bottom',
  });

  const { ad: popupAd, visible: popupVisible, handleClick: handlePopupClick } = useLiveAds({
    eventId: selectedAuction?.eventId || undefined,
    slotType: 'popup_card',
  });

  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setWalletBalance(null);
          return;
        }

        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading wallet balance for live lobby', error);
          setWalletBalance(null);
          return;
        }

        setWalletBalance(data?.balance ?? null);
      } catch (e) {
        console.error('Error loading wallet balance for live lobby', e);
        setWalletBalance(null);
      }
    };

    loadWalletBalance();
  }, []);

  const handlePayTokenForLocation = async (yardId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to pay the yard token');
        return;
      }

      const { error } = await supabase
        .from('wallet_transactions')
        .insert([
          {
            user_id: user.id,
            amount: YARD_TOKEN_AMOUNT,
            transaction_type: 'yard_token',
            status: 'completed',
            yard_id: yardId,
            description: 'Yard token deposit for live auction access',
          },
        ]);

      if (error) {
        console.error('Error recording yard token transaction', error);
        toast.error('Failed to process yard token. Please try again.');
        return;
      }

      await refreshYardTokenMap();
      toast.success('Yard token paid. This location is now unlocked.');
    } catch (e) {
      console.error('handlePayTokenForLocation error', e);
      toast.error('Something went wrong while processing your yard token.');
    }
  };

  const refreshYardTokenMap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setYardTokenMap({});
        return;
      }

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('yard_id')
        .eq('user_id', user.id)
        .eq('transaction_type', 'yard_token');

      if (error) {
        console.error('Error loading yard token map for live lobby', error);
        setYardTokenMap({});
        return;
      }

      const yardTokenMap: Record<string, boolean> = {};
      (data || []).forEach((t: any) => {
        yardTokenMap[t.yard_id] = true;
      });
      setYardTokenMap(yardTokenMap);
    } catch (e) {
      console.error('Error loading yard token map for live lobby', e);
      setYardTokenMap({});
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
      {/* Back to Lobby & Title Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => {
            setSelectedAuction(null);
            navigate('/live-auction');
          }}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="font-medium">Back to Lobby</span>
        </button>
        
        {isUrgent && (
           <motion.div 
             initial={{ opacity: 0.5 }}
             animate={{ opacity: 1 }}
             transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
             className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-bold"
           >
             <Clock className="h-4 w-4" />
             CLOSING SOON
           </motion.div>
        )}
      </div>

      {selectedAuction && (
        <div className="mb-4">
          <AuctionCard
            id={selectedAuction.id}
            image={selectedAuction.image_url}
            title={selectedAuction.title}
            price={selectedAuction.starting_price}
            currentBid={selectedAuction.current_price}
            watchers={selectedAuction.watchers ?? watchersCount}
            views={selectedAuction.views}
            sellerName={selectedAuction.seller?.name}
            location={selectedAuction.location}
            condition={selectedAuction.condition}
            timeRemaining={getTimeLeft(selectedAuction.end_time)}
            isLive
            variant="live"
            watched={false}
            onWatchToggle={() => toggleWatchlist(selectedAuction.productId)}
            onPrimaryAction={() => handleJoinLiveAuction(selectedAuction)}
            onClick={() => handleJoinLiveAuction(selectedAuction)}
          />
        </div>
      )}

      {selectedAuction && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="bg-gray-900 text-white rounded-lg px-3 py-2 flex flex-col justify-between">
            <span className="opacity-70 flex items-center gap-1">
              <Gavel className="h-3 w-3" />
              Total Bids
            </span>
            <span className="text-lg sm:text-xl font-bold">{selectedAuction.bid_count || 0}</span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 rounded-lg px-3 py-2 flex flex-col justify-between">
            <span className="opacity-70 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Viewers Now
            </span>
            <span className="text-base sm:text-lg font-semibold">{viewerCount}</span>
          </div>
          <div className="hidden sm:flex bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 flex-col justify-between">
            <span className="opacity-70 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Total Views
            </span>
            <span className="text-base sm:text-lg font-semibold">{selectedAuction.views || 0}</span>
          </div>
          <div className="hidden sm:flex bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-lg px-3 py-2 flex-col justify-between">
            <span className="opacity-70 flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Wallet Balance
            </span>
            <span className="text-base sm:text-lg font-semibold">
              {walletBalance !== null ? `₹${walletBalance.toLocaleString()}` : 'Sign in to view'}
            </span>
          </div>
        </div>
      )}

      {selectedAuction ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={selectedAuction.stream_url}
                className="w-full aspect-video"
                allowFullScreen
                title="Live Auction Stream"
              />
              
              {/* Stream Overlay */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center shadow-lg z-10"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </motion.div>
              
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {viewerCount} watching
              </div>

              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Video className="h-4 w-4 mr-2" />
                {selectedAuction.quality} Quality
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <select
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value)}
                  className="bg-black/70 text-white text-sm rounded px-2 py-1 border-none"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>

              {isAdmin && (
                <div className="absolute bottom-4 center flex gap-2">
                  <button className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                    <Play className="h-5 w-5" />
                  </button>
                  <button className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                    <Pause className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/live-control/${selectedAuction.id}`)}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Live "scoreboard" strip under the player */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-gray-900 text-white rounded-lg px-3 py-2 flex flex-col justify-between">
                <span className="opacity-70">Current Bid</span>
                <span className="text-lg sm:text-xl font-bold">
                  ₹{selectedAuction.current_price.toLocaleString()}
                </span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-lg px-3 py-2 flex flex-col justify-between">
                <span className="opacity-70">Next Min Bid</span>
                <span className="text-base sm:text-lg font-semibold">
                  ₹{(selectedAuction.current_price + selectedAuction.increment_amount).toLocaleString()}
                </span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100 rounded-lg px-3 py-2 flex flex-col justify-between">
                <span className="opacity-70">Time Left</span>
                <span className="text-base sm:text-lg font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeLeft}
                </span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 rounded-lg px-3 py-2 flex flex-col justify-between">
                <span className="opacity-70">Live Activity</span>
                <span className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Gavel className="h-3 w-3" />
                    {selectedAuction.bid_count || 0} bids
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {watchersCount} watching
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {selectedAuction.views || 0} views
                  </span>
                </span>
              </div>
            </div>

            {/* Highlight banner (admin controlled) */}
            {highlightMessage && (
              <div className="mt-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 px-4 py-3 flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wide">Live Highlight</p>
                  <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{highlightMessage}</p>
                </div>
              </div>
            )}

            {/* Unified Real-Time Bidding Interface */}
            <div className="mt-6">
              <RealTimeBidding
                auctionId={selectedAuction.id}
                currentPrice={selectedAuction.current_price}
                incrementAmount={selectedAuction.increment_amount}
                placeBidAction={handlePlaceBidAction}
                sellerId={selectedAuction.sellerProfileId}
              />
            </div>

            {/* Bid activity feed */}
            <div className="mt-4">
              <BidHistoryList auctionId={selectedAuction.id} />
            </div>

          {/* Auction Details & Seller */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedAuction.title}</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">{selectedAuction.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedAuction.features.map((feature, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <img
                  src={selectedAuction.image_url}
                  alt={selectedAuction.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg sm:ml-4 shadow-md flex-shrink-0"
                />
              </div>

              {/* Seller Info from unified API */}
              {selectedAuction.sellerProfileId && (
                <div className="space-y-4">
                  <SellerInfoCard sellerId={selectedAuction.sellerProfileId} />
                  <SellerTrustSummary
                    name={selectedAuction.seller.name}
                    avatarUrl={selectedAuction.seller.avatar_url}
                    verified={selectedAuction.seller_verified}
                    rating={selectedAuction.seller.rating}
                    totalSales={selectedAuction.seller.total_sales}
                    profileHref={selectedAuction.sellerProfileId ? `/seller/${selectedAuction.sellerProfileId}` : null}
                  />
                </div>
              )}

              {/* Live scoreboard panel (cricket-style) */}
              <LiveScoreboard auctionId={selectedAuction.id} />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                <button
                  onClick={() => toggleWatchlist(selectedAuction?.productId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isWatching ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  {isWatching ? 'Watching' : 'Watch'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <Eye className="h-4 w-4" />
                  {selectedAuction.views} views
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Award className="h-4 w-4" />
                  Premium Item
                </button>
              </div>

              {/* Time Remaining - Critical for Decision Speed */}
              <motion.div 
                animate={isUrgent ? { scale: [1, 1.02, 1], borderColor: ["#fee2e2", "#ef4444", "#fee2e2"] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={`mb-6 p-4 rounded-lg border ${
                  isUrgent 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full shadow-sm ${
                      isUrgent ? 'bg-white dark:bg-red-900/50' : 'bg-white dark:bg-gray-700'
                    }`}>
                      <Clock className={`h-6 w-6 ${isUrgent ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {isUrgent ? 'Hurry! Ending Soon' : 'Time Remaining'}
                      </p>
                      <p className={`text-xl font-bold ${isUrgent ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {timeLeft}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isUrgent && (
                      <p className="text-xs text-red-600/70 font-medium uppercase tracking-wider animate-pulse">Closing Soon</p>
                    )}
                  </div>
                </div>
              </motion.div>



              {bidError && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">{bidError}</p>
              )}

              {/* Reserve Price Info */}
              {selectedAuction.reserve_price && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-200">Reserve Price:</span>
                    <span className="font-medium text-blue-600">₹{selectedAuction.reserve_price.toLocaleString()}</span>
                  </div>
                  {selectedAuction.current_price >= selectedAuction.reserve_price && (
                    <p className="text-xs text-green-600 mt-1">✓ Reserve price met</p>
                  )}
                </div>
              )}
            </div>


          </div>

          {/* Chat Sidebar + controls */}
          <div className="space-y-6">
            <LiveChat auctionId={selectedAuction.id} />

            {/* Admin-only highlight controls */}
            {isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Broadcast Highlight
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Set a short message that appears as a highlight banner for all viewers (e.g. "Final 5 minutes", "Reserve met", "New top bid").
                </p>
                <textarea
                  value={adminHighlightDraft}
                  onChange={(e) => setAdminHighlightDraft(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type your live highlight message here"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightMessage(adminHighlightDraft.trim());
                    }}
                    className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Update Highlight
                  </button>
                  {highlightMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        setHighlightMessage('');
                        setAdminHighlightDraft('');
                      }}
                      className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Auction Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Auction Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening Bid (minimum amount required to enter the auction):</span>
                  <span className="font-medium">₹{selectedAuction.starting_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-medium text-green-600">₹{selectedAuction.current_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Increase:</span>
                  <span className="font-medium text-green-600">
                    +{(((selectedAuction.current_price - selectedAuction.starting_price) / selectedAuction.starting_price) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Increment:</span>
                  <span className="font-medium">₹{selectedAuction.increment_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bids:</span>
                  <span className="font-medium">{selectedAuction.bid_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Viewers:</span>
                  <span className="font-medium">{viewerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Watchers:</span>
                  <span className="font-medium">{watchersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedAuction.category}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => toggleWatchlist(selectedAuction?.productId)}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isWatching ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  {isWatching ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Auction
                </button>
                <button className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  View Market Analysis
                </button>
              </div>
            </div>

            {/* Product / Item Details (context-aware) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              {selectedAuction.category === 'Vehicles' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Basic */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Basic</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Price</span><span className="font-medium">₹{selectedAuction.current_price.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Fuel type</span><span className="font-medium">Diesel</span></div>
                      <div className="flex justify-between"><span>Registration year</span><span className="font-medium">Not Available</span></div>
                      <div className="flex justify-between"><span>Manufacturing Year</span><span className="font-medium">Jun 2014</span></div>
                      <div className="flex justify-between"><span>Owners</span><span className="font-medium">Second</span></div>
                      <div className="flex justify-between"><span>Transmission</span><span className="font-medium">Manual - 5 Gears</span></div>
                      <div className="flex justify-between"><span>Color</span><span className="font-medium">White</span></div>
                      <div className="flex justify-between"><span>Location</span><span className="font-medium">University Campus, Rajkot</span></div>
                      <div className="flex justify-between"><span>Insurance</span><span className="font-medium">Expired</span></div>
                      <div className="flex justify-between"><span>Registration Type</span><span className="font-medium">Individual</span></div>
                      <div className="flex justify-between"><span>Last Updated</span><span className="font-medium">2 day(s) ago</span></div>
                    </div>
                  </details>
                  {/* Engine & Transmission */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Engine &amp; Transmission</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Engine</span><span className="font-medium">1248 cc, 4 Cyl Inline, DOHC</span></div>
                      <div className="flex justify-between"><span>Engine Type</span><span className="font-medium">DDiS Diesel Engine</span></div>
                      <div className="flex justify-between"><span>Max Power</span><span className="font-medium">74 bhp @ 4000 rpm</span></div>
                      <div className="flex justify-between"><span>Max Torque</span><span className="font-medium">190 Nm @ 2000 rpm</span></div>
                      <div className="flex justify-between"><span>Mileage (ARAI)</span><span className="font-medium">23.4 kmpl</span></div>
                      <div className="flex justify-between"><span>Drivetrain</span><span className="font-medium">FWD</span></div>
                      <div className="flex justify-between"><span>Transmission</span><span className="font-medium">Manual - 5 Gears</span></div>
                    </div>
                  </details>
                  {/* Dimensions & Weight */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Dimensions &amp; Weight</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>L×W×H</span><span className="font-medium">3995 × 1695 × 1555 mm</span></div>
                      <div className="flex justify-between"><span>Ground Clearance</span><span className="font-medium">170 mm</span></div>
                      <div className="flex justify-between"><span>Wheelbase</span><span className="font-medium">2430 mm</span></div>
                      <div className="flex justify-between"><span>Kerb Weight</span><span className="font-medium">1060 kg</span></div>
                    </div>
                  </details>
                  {/* Capacity */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Capacity</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Seating</span><span className="font-medium">5 Seats (2 Rows)</span></div>
                      <div className="flex justify-between"><span>Doors</span><span className="font-medium">4</span></div>
                      <div className="flex justify-between"><span>Bootspace</span><span className="font-medium">320 L</span></div>
                      <div className="flex justify-between"><span>Fuel Tank</span><span className="font-medium">42 L</span></div>
                    </div>
                  </details>
                  {/* Tyres & Steering */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Suspension, Brakes, Steering &amp; Tyres</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Front Suspension</span><span className="font-medium">MacPherson Strut</span></div>
                      <div className="flex justify-between"><span>Rear Suspension</span><span className="font-medium">Torsion Beam</span></div>
                      <div className="flex justify-between"><span>Tyres</span><span className="font-medium">Radial - With Tube Tyres</span></div>
                      <div className="flex justify-between"><span>Spare Wheel</span><span className="font-medium">Steel</span></div>
                      <div className="flex justify-between"><span>Turning Radius</span><span className="font-medium">4.8 m</span></div>
                      <div className="flex justify-between"><span>Steering</span><span className="font-medium">Power Steering (Tilt)</span></div>
                      <div className="flex justify-between"><span>Front Tyres</span><span className="font-medium">165/80 R14</span></div>
                      <div className="flex justify-between"><span>Rear Tyres</span><span className="font-medium">165/80 R14</span></div>
                    </div>
                  </details>
                  {/* Features (selected) */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Key Features</span>
                    </summary>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Air Conditioner (Manual), Heater</li>
                      <li>Power Windows (Front & Rear), Electrically Adjustable ORVMs</li>
                      <li>Halogen Headlights with Height Adjuster, Rear Fog Lamps</li>
                      <li>Seat Belt Warning, Child Safety Lock, Engine Immobiliser</li>
                      <li>Fabric Upholstery, Front & Rear Headrests, Rear Armrest</li>
                      <li>Audio System with 4 Speakers, USB/AUX, AM/FM</li>
                    </ul>
                  </details>
                </div>
              ) : selectedAuction.category.toLowerCase().includes('bike') ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Basic</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Price</span><span className="font-medium">₹{selectedAuction.current_price.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Fuel type</span><span className="font-medium">Petrol</span></div>
                      <div className="flex justify-between"><span>Transmission</span><span className="font-medium">Manual</span></div>
                      <div className="flex justify-between"><span>Color</span><span className="font-medium">Black</span></div>
                      <div className="flex justify-between"><span>Location</span><span className="font-medium">{selectedAuction.location}</span></div>
                    </div>
                  </details>
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Engine &amp; Performance</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Engine</span><span className="font-medium">Single-Cyl, 4-stroke</span></div>
                      <div className="flex justify-between"><span>Displacement</span><span className="font-medium">149 cc</span></div>
                      <div className="flex justify-between"><span>Max Power</span><span className="font-medium">13 bhp</span></div>
                      <div className="flex justify-between"><span>Max Torque</span><span className="font-medium">13 Nm</span></div>
                      <div className="flex justify-between"><span>Mileage</span><span className="font-medium">45 kmpl (claimed)</span></div>
                    </div>
                  </details>
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Chassis &amp; Tyres</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Front Brake</span><span className="font-medium">Disc</span></div>
                      <div className="flex justify-between"><span>Rear Brake</span><span className="font-medium">Drum</span></div>
                      <div className="flex justify-between"><span>Front Tyre</span><span className="font-medium">80/100-17</span></div>
                      <div className="flex justify-between"><span>Rear Tyre</span><span className="font-medium">100/90-17</span></div>
                    </div>
                  </details>
                </div>
              ) : selectedAuction.category === 'Art & Paintings' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Artwork Info</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Artist</span><span className="font-medium">Maya Patel</span></div>
                      <div className="flex justify-between"><span>Medium</span><span className="font-medium">Acrylic on Canvas</span></div>
                      <div className="flex justify-between"><span>Style</span><span className="font-medium">Abstract</span></div>
                      <div className="flex justify-between"><span>Dimensions</span><span className="font-medium">48" × 36"</span></div>
                      <div className="flex justify-between"><span>Certificate</span><span className="font-medium">Authenticity Included</span></div>
                    </div>
                  </details>
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Provenance &amp; Condition</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Provenance</span><span className="font-medium">Gallery Featured</span></div>
                      <div className="flex justify-between"><span>Condition</span><span className="font-medium">Excellent</span></div>
                    </div>
                  </details>
                </div>
              ) : selectedAuction.category === 'Handmade & Creative' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Craft Details</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Materials</span><span className="font-medium">Wood</span></div>
                      <div className="flex justify-between"><span>Technique</span><span className="font-medium">Hand-carved</span></div>
                      <div className="flex justify-between"><span>Dimensions</span><span className="font-medium">Medium</span></div>
                      <div className="flex justify-between"><span>Finish</span><span className="font-medium">Natural Polish</span></div>
                    </div>
                  </details>
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Care</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Cleaning</span><span className="font-medium">Dry cloth</span></div>
                      <div className="flex justify-between"><span>Warranty</span><span className="font-medium">No</span></div>
                    </div>
                  </details>
                </div>
              ) : selectedAuction.category === 'Industrial Equipment' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Machine Specs</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Power</span><span className="font-medium">3-Phase</span></div>
                      <div className="flex justify-between"><span>Operating Hours</span><span className="font-medium">Low</span></div>
                      <div className="flex justify-between"><span>Controls</span><span className="font-medium">CNC</span></div>
                      <div className="flex justify-between"><span>Condition</span><span className="font-medium">Good</span></div>
                    </div>
                  </details>
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Logistics</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Location</span><span className="font-medium">{selectedAuction.location}</span></div>
                      <div className="flex justify-between"><span>Loading</span><span className="font-medium">Assistance Available</span></div>
                    </div>
                  </details>
                </div>
              ) : selectedAuction.category === 'Jewelry & Watches' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Item Specs</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between"><span>Brand</span><span className="font-medium">Rolex</span></div>
                      <div className="flex justify-between"><span>Model</span><span className="font-medium">Submariner (1960s)</span></div>
                      <div className="flex justify-between"><span>Condition</span><span className="font-medium">Excellent</span></div>
                      <div className="flex justify-between"><span>Certificate</span><span className="font-medium">Yes</span></div>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" open>
                    <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>Overview</span>
                    </summary>
                    <div className="mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <div>Category: <span className="font-medium">{selectedAuction.category}</span></div>
                      <div>Location: <span className="font-medium">{selectedAuction.location}</span></div>
                      <div>Price: <span className="font-medium">₹{selectedAuction.current_price.toLocaleString()}</span></div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Live Auctions</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Experience the thrill of real-time bidding with live streaming
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
              {isAdmin && (
                <Link
                  to="/admin/live-setup"
                  className="self-start md:self-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-xs md:text-sm"
                >
                  <Video className="h-5 w-5" />
                  Setup Live Auction
                </Link>
              )}
            </div>
          </div>

          <div className="mb-6">
            <StatusStrip
              phoneVerified={false}
              kycVerified={false}
              tokenActive={false}
              depositPaid={false}
              walletBalance={walletBalance ?? 0}
              requiredDeposit={YARD_TOKEN_AMOUNT}
              yardRequiresToken
              onTopUp={() => navigate('/wallet')}
              compact={false}
              showWallet
            />
          </div>

          {/* Live Auction Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Video className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{auctions.length}</p>
              <p className="text-sm text-gray-500">Live Auctions</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{auctions.reduce((sum, a) => sum + a.viewer_count, 0)}</p>
              <p className="text-sm text-gray-500">Total Viewers</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(auctions.reduce((sum, a) => sum + a.current_price, 0) / 100000).toFixed(1)}L</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.5h</p>
              <p className="text-sm text-gray-500">Avg Duration</p>
            </div>
          </div>

          {/* My Yards */}
          {unlockedYards.length > 0 && (
            <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">My Yards</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Locations where your yard token is already paid.</p>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200">
                  {unlockedYards.length} active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {unlockedYards.map((loc) => {
                  const totalLots = loc.auctions.length;
                  const liveLots = loc.auctions.filter((a) => a.status === 'active').length;
                  return (
                    <div
                      key={loc.id}
                      className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-red-600" />
                          <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{loc.cityLabel}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200">
                          Token paid
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{loc.address}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-gray-600 dark:text-gray-300">
                          {liveLots} live • {totalLots} total lots
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedLocationId(loc.id)}
                          className="text-[11px] font-medium text-red-600 hover:text-red-700"
                        >
                          View yard
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters Row */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8 flex flex-wrap items-center gap-3 md:gap-4">
            <select
              value={lobbyFilter}
              onChange={(e) => setLobbyFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="all">All Live Auctions</option>
              <option value="ending_soon">Ending Soon (≤ 2h)</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="vehicles">Vehicles</option>
              <option value="jewelry">Jewelry & Watches</option>
              <option value="art">Art & Paintings</option>
              <option value="handmade">Handmade & Creative</option>
              <option value="industrial">Industrial Equipment</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
            >
              <option value="">All Prices</option>
              <option value="0-100000">Under ₹1,00,000</option>
              <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
              <option value="500000-2000000">₹5,00,000 - ₹20,00,000</option>
              <option value="2000000">Above ₹20,00,000</option>
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
              <option value="ending_soon">Ending Soon</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="most_bids">Most Bids</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="most_viewers">Most Viewers</option>
            </select>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Now</h2>
          </div>
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Auctions</h2>
          </div>

          {sortedLobbyAuctions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No live auctions match your filters</p>
              <p className="text-sm text-gray-400 mt-2 mb-4">Try clearing filters or browse other auctions.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900"
              >
                <Eye className="h-4 w-4" />
                No live auctions? Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLobbyAuctions.map((auction) => {
                const yardId = auction.location || 'Online';
                const isLive = auction.status === 'active';
                return (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="transition-all duration-300"
                  >
                    <AuctionCard
                      id={auction.id}
                      image={auction.image_url}
                      title={auction.title}
                      price={auction.current_price}
                      currentBid={auction.current_price}
                      views={auction.viewer_count}
                      watchers={auction.watchers}
                      location={auction.location}
                      condition={auction.condition}
                      sellerName={auction.seller.name}
                      timeRemaining={isLive ? 'Live' : 'Scheduled'}
                      isLive
                      variant="live"
                      watched={false}
                      onWatchToggle={() => toggleWatchlist(auction.id)}
                      onPrimaryAction={() => handleJoinLiveAuction(auction)}
                      onClick={() => handleJoinLiveAuction(auction)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Live Locations & Yard Events */}
          {locationGroups.length > 0 && (
            <div id="live-yards" className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 text-white rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Live Yard Locations
                    </h2>
                    <span className="text-xs bg-red-600/80 px-2 py-1 rounded-full uppercase tracking-wide">Get ready to bid</span>
                  </div>
                  <p className="text-sm text-gray-200 mb-4">
                    Choose a nearby QuickMela yard to see how many vehicles are lined up for bidding today and this week.
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {locationGroups.map((loc) => {
                      const unlocked = !!yardTokenMap[loc.id];
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setSelectedLocationId(loc.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between gap-3 border text-sm ${
                            loc.id === effectiveSelectedLocationId
                              ? 'bg-red-600/80 border-red-400 shadow-lg'
                              : 'bg-black/30 border-white/10 hover:bg-black/50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              <span>{loc.cityLabel}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 border border-white/10">{loc.auctions.length} auctions</span>
                            </div>
                            <p className="text-xs text-gray-200 mt-0.5 line-clamp-2">{loc.address}</p>
                          </div>
                          <div className="flex flex-col items-end text-xs text-gray-200 gap-1">
                            {unlocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-white text-[10px] font-semibold">
                                <Gavel className="h-3 w-3" />
                                Token paid
                              </span>
                            )}
                            <span className="font-semibold">View yard</span>
                            <span className="opacity-70">Tap to see vehicles</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-red-600" />
                      Yard Events & Vehicles
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay a small token to unlock the yard stream. Deposit is auto-refunded if you don&apos;t win.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShareLocation(selectedLocation)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Share2 className="h-3 w-3" />
                    Share address
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  {(['today', 'tomorrow', 'week'] as EventDayFilter[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEventDayFilter(key)}
                      className={`px-3 py-1 rounded-full border text-xs font-medium ${
                        eventDayFilter === key
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {key === 'today' && 'Today'}
                      {key === 'tomorrow' && 'Tomorrow'}
                      {key === 'week' && 'Next 7 days'}
                    </button>
                  ))}
                </div>

                {/* Simple schedule slots for the selected day */}
                <div className="mb-4 space-y-2">
                  {eventSlotsByDay[eventDayFilter].map((slot, idx) => (
                    <div
                      key={slot.label + idx}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{slot.label}</p>
                        <p className="text-[11px] text-gray-500">{slot.time}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-[11px] text-red-700 dark:text-red-200">
                        {slot.tag}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedLocation ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedLocation.cityLabel}</p>
                        <p className="text-xs text-gray-500">{selectedLocation.address}</p>
                      </div>
                      {(() => {
                        const summary = getVehiclesSummaryForLocation(selectedLocation);
                        return (
                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
                              <div className="text-[11px] uppercase tracking-wide opacity-80">Total vehicles</div>
                              <div className="text-lg font-bold">{summary.total}</div>
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 min-w-[140px]">
                              <div className="text-[11px] uppercase tracking-wide opacity-80">Types</div>
                              <div className="text-xs mt-1 line-clamp-3">{summary.types.join(', ') || 'Vehicles, bikes & more'}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                      <h3 className="text-sm font-semibold mb-2">Vehicles lined up for bidding</h3>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                        {selectedLocation.auctions.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {a.category} • {a.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] text-gray-500">Starting from</p>
                              <p className="text-sm font-semibold text-green-700 dark:text-green-300">₹{a.starting_price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handlePayTokenForLocation(selectedLocation.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs sm:text-sm font-semibold hover:bg-red-700 shadow-sm"
                      >
                        <Gavel className="h-4 w-4" />
                        {localStorage.getItem('demo-session') ? 'Demo Auction – No Deposit Required' : (yardTokenMap[selectedLocation.id] ? 'Token paid • Yard unlocked' : 'Pay token deposit & unlock yard')}
                      </button>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs">
                        Token is adjusted against your winning invoice. If you don&apos;t win any lot here, it is auto-refunded after the event closes.
                      </p>
                    </div>

                    <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      Pay a token deposit to unlock the full live yard view and place bids. If you don&apos;t win any lot at this location, your deposit is automatically refunded after the event closes.
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select a yard on the left to see vehicles and events.</p>
                )}
              </div>
            </div>
          )}

          {/* Live Auction Features */}
          <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Live Auction Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Video className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">HD Live Streaming</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Crystal clear video with professional auctioneers and multiple camera angles
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Bidding</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Lightning-fast bid placement with one-click options and auto-increment
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Interact with other bidders and ask questions live during the auction
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure & Verified</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All sellers verified with authentic product guarantees and secure payments
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionPage;
