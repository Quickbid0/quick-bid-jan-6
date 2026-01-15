import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface WatchlistItem {
  id: string;
  product: {
    id: string;
    title: string;
    image_url: string;
    current_price: number;
    end_date: string;
  };
}

const WatchlistPage = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const demo = localStorage.getItem('demo-session');
      if (demo) {
        const d = JSON.parse(demo);
        const demoUserId = d?.user?.id || 'demo-user';
        const key = `watchlist:${demoUserId}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const normalized: WatchlistItem[] = (list || []).map((it: any) => ({
          id: it.id || `${demoUserId}:${it.productId}`,
          product: {
            id: it.productId,
            title: it.title,
            image_url: it.image_url,
            current_price: it.current_price,
            end_date: it.end_date
          }
        }));
        setItems(normalized);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        return;
      }
      const key = `watchlist:${user.id}`;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const normalized: WatchlistItem[] = (list || []).map((it: any) => ({
        id: it.id || `${user.id}:${it.productId}`,
        product: {
          id: it.productId,
          title: it.title,
          image_url: it.image_url,
          current_price: it.current_price,
          end_date: it.end_date
        }
      }));
      if (normalized.length > 0) {
        setItems(normalized);
        return;
      }
      try {
        const { data } = await supabase
          .from('watchlist')
          .select('product_id, products(id, title, image_url, current_price, end_date)')
          .eq('user_id', user.id);
        const rows = (data || []).map((row: any) => ({
          id: `${user.id}:${row.product_id}`,
          product: row.products || {
            id: row.product_id,
            title: 'Product',
            image_url: '',
            current_price: 0,
            end_date: new Date().toISOString()
          }
        }));
        setItems(rows);
      } catch {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (itemId: string) => {
    try {
      const demo = localStorage.getItem('demo-session');
      const { data: { user } } = await supabase.auth.getUser();
      const productId = itemId.split(':')[1];
      if (demo) {
        const d = JSON.parse(demo);
        const demoUserId = d?.user?.id || 'demo-user';
        const key = `watchlist:${demoUserId}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const filtered = (list || []).filter((it: any) => String(it.productId) !== String(productId));
        localStorage.setItem(key, JSON.stringify(filtered));
      } else if (user?.id) {
        const key = `watchlist:${user.id}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const filtered = (list || []).filter((it: any) => String(it.productId) !== String(productId));
        localStorage.setItem(key, JSON.stringify(filtered));
        try {
          await supabase.from('watchlist').delete().eq('user_id', user.id).eq('product_id', productId);
        } catch {}
      }
      setItems(items.filter(item => item.id !== itemId));
      toast.success('Item removed from watchlist');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Watchlist</h1>
        <Heart className="h-8 w-8 text-red-500" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Your watchlist is empty</p>
          <Link
            to="/products"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={item.product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                alt={item.product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.product.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Current Price: ₹{item.product.current_price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Ends: {new Date(item.product.end_date).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="flex items-center text-indigo-600 hover:text-indigo-500"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
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

export default WatchlistPage;
