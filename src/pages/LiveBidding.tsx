import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import RealTimeBidding from '../components/RealTimeBidding';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Gavel } from 'lucide-react';

const LiveBidding: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAuction = async () => {
      try {
        const { data, error } = await supabase
          .from('auctions')
          .select('*, product:products(seller_id)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setAuction(data);
      } catch (error) {
        console.error('Error fetching auction:', error);
        toast.error('Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Gavel className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Auction Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          The auction you are looking for does not exist, has ended, or may have been removed.
        </p>
        <Link 
          to="/live-auction" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Browse Active Auctions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RealTimeBidding
        auctionId={id || ''}
        currentPrice={auction.current_price || auction.starting_price || 0}
        incrementAmount={auction.increment_amount || 1000}
        sellerId={auction.product?.seller_id || ''}
      />
    </div>
  );
};

export default LiveBidding;
