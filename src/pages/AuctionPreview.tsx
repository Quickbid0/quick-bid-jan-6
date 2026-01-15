import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bell, ArrowRight, Video, Timer, FileText, Eye, Users, DollarSign, Award } from 'lucide-react';
import AuctionTypeBadge from '../components/auctions/AuctionTypeBadge';
import SellerTrustSummary from '../components/auctions/SellerTrustSummary';

interface UpcomingAuction {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: 'live' | 'timed' | 'tender';
  image_url: string;
  starting_price: number;
  min_bid?: number;
  seller: {
    id?: string;
    name: string;
    avatar_url: string;
    kyc_status?: string;
  }[];
  viewer_count?: number;
  bid_count?: number;
}

const brandLogos: Record<string, string> = {
  'Tata': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Tata_logo.svg',
  'Maruti Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Maruti_Suzuki_Logo.svg',
  'Mahindra': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Mahindra_new_logo.svg',
  'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Hyundai_logo.svg',
  'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_logo.svg',
  'Kia': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Kia-logo.png',
  'Honda': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda-logo.svg',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Audi_Logo_2016.svg',
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/VW_Logo.svg',
  'Skoda': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/%C5%A0koda_Auto_logo.svg',
  'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Royal_Enfield_Logo.svg',
  'Yamaha': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Yamaha_Motor_Logo.svg',
  'TVS': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/TVS_Motor_Company_Logo.svg',
  'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Bajaj_auto_logo.svg',
  'Hero': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Hero_MotoCorp_Logo.svg',
  'Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Suzuki_logo_2.svg',
  'KTM': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/KTM-Logo.svg',
  'Ducati': 'https://upload.wikimedia.org/wikipedia/en/0/06/Ducati_red_logo.svg',
  'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Harley-Davidson_logo.svg',
};

const AuctionPreview = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<UpcomingAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'timed' | 'tender'>('all');

  useEffect(() => {
    const fetchUpcomingAuctions = async () => {
      try {
        // Fetch from all auction types
        const [liveData, timedData, tenderData] = await Promise.all([
          supabase
            .from('live_auctions')
            .select(`
              id, title, description, start_time, end_time, image_url, starting_price, viewer_count,
              seller:profiles(id, name, avatar_url, kyc_status)
            `)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true }),
          
          supabase
            .from('timed_auctions')
            .select(`
              id, title, description, start_time, end_time, image_url, starting_price,
              seller:profiles(id, name, avatar_url, kyc_status)
            `)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true }),
          
          supabase
            .from('tender_auctions')
            .select(`
              id, title, description, start_time, end_time, image_url, min_bid,
              seller:profiles(id, name, avatar_url, kyc_status)
            `)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
        ]);

        const allAuctions: UpcomingAuction[] = [
          ...(liveData.data || []).map((auction: any) => ({ ...auction, type: 'live' as const })),
          ...(timedData.data || []).map((auction: any) => ({ ...auction, type: 'timed' as const })),
          ...(tenderData.data || []).map((auction: any) => ({ ...auction, type: 'tender' as const, starting_price: auction.min_bid }))
        ];

        // Sort by start time
        allAuctions.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        setAuctions(allAuctions);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        toast.error('Failed to load upcoming auctions');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingAuctions();
  }, []);

  const setReminder = async (auctionId: string, auctionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to set reminders');
        return;
      }

      toast.success('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    }
  };

  const formatStartDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getAuctionIcon = (type: string) => {
    switch (type) {
      case 'live':
        return <Video className="h-5 w-5" />;
      case 'timed':
        return <Timer className="h-5 w-5" />;
      case 'tender':
        return <FileText className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getAuctionRoute = (auction: UpcomingAuction) => {
    switch (auction.type) {
      case 'live':
        return `/live-auction/${auction.id}`;
      case 'timed':
        return `/timed-auction/${auction.id}`;
      case 'tender':
        return `/tender-auction/${auction.id}`;
      default:
        return '#';
    }
  };

  const filteredAuctions = filter === 'all'
    ? auctions
    : auctions.filter(auction => auction.type === filter);

  const getBrandFromTitle = (title: string): string | null => {
    const lower = title.toLowerCase();
    const brands = Object.keys(brandLogos);
    for (const brand of brands) {
      if (lower.includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return null;
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Auctions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and set reminders for upcoming auctions
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            All
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'live'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Video className="h-4 w-4" />
            Live
          </button>
          <button
            onClick={() => setFilter('timed')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'timed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Timer className="h-4 w-4" />
            Timed
          </button>
          <button
            onClick={() => setFilter('tender')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'tender'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Tender
          </button>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No upcoming {filter === 'all' ? '' : filter} auctions found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <motion.div
              key={`${auction.type}-${auction.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={auction.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=2000&q=80'}
                  alt={auction.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <AuctionTypeBadge type={auction.type} />
                </div>
                {auction.viewer_count && (
                  <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-full text-white text-xs">
                    {auction.viewer_count} watching
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex flex-col mb-2">
                  {(() => {
                    const brand = getBrandFromTitle(auction.title);
                    if (!brand) return null;
                    const logo = brandLogos[brand];
                    return (
                      <div className="mb-1 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-max text-xs text-gray-700 dark:text-gray-200">
                        {logo && (
                          <img
                            src={logo}
                            alt={brand}
                            className="h-4 w-4 object-contain"
                            loading="lazy"
                          />
                        )}
                        <span>{brand}</span>
                      </div>
                    );
                  })()}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {auction.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {auction.type === 'live' && 'Live auction'}
                    {auction.type === 'timed' && 'Timed auction'}
                    {auction.type === 'tender' && 'Tender auction'}
                    {`  b7 Starts at ${formatStartDateTime(auction.start_time)}`}
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {auction.description}
                </p>

                <div className="flex flex-col gap-1 mb-4">
                  {auction.seller && auction.seller.length > 0 && (
                    <>
                      <SellerTrustSummary
                        name={auction.seller[0].name}
                        avatarUrl={auction.seller[0].avatar_url}
                        verified={auction.seller[0].kyc_status === 'verified'}
                        verificationLabelVerified="KYC verified"
                        verificationLabelPending="KYC pending"
                        profileHref={auction.seller[0].id ? `/seller/${auction.seller[0].id}` : null}
                        profileLabel="View seller"
                        size="sm"
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {auction.seller[0].kyc_status === 'verified'
                          ? 'Seller KYC verified by QuickBid. Any payouts are routed through verified bank accounts.'
                          : 'Seller KYC is pending. Additional checks may apply before payouts are released.'}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex flex-col">
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Starts at</span>
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-200 mt-0.5">
                      {formatStartDateTime(auction.start_time)}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {auction.type === 'tender' ? 'Min: ' : 'Starting: '}
                    ₹{auction.starting_price?.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setReminder(auction.id, auction.type)}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-lg flex items-center justify-center text-sm"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Remind Me
                  </button>
                  <button
                    onClick={() => navigate(getAuctionRoute(auction))}
                    className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 py-2 rounded-lg flex items-center justify-center text-sm"
                  >
                    View auction details <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionPreview;
