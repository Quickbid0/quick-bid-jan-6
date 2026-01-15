import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, PlayCircle, Wallet, User, Phone } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const SocialLinks: React.FC = () => {
  useEffect(() => {
    const logEvent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('marketing_events').insert({
          path: '/links',
          source: 'links',
          event_type: 'landing_view',
          user_id: user?.id || null,
        });
      } catch (e) {
        console.warn('Failed to log marketing event', e);
      }
    };
    logEvent();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-indigo-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Quickmela</p>
            <p className="text-base font-semibold">Official Links</p>
          </div>
        </div>

        <p className="text-xs text-gray-300">
          India’s realtime auction marketplace for seized and pre-owned vehicles. Tap a button below to jump into the app.
        </p>

        <div className="space-y-3 text-sm">
          <Link
            to="/timed-auction"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Browse live & timed auctions</span>
          </Link>

          <Link
            to="/advanced-search"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Gavel className="h-4 w-4" />
            <span>Search vehicles by city, price & type</span>
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100"
          >
            <User className="h-4 w-4" />
            <span>Create free buyer/seller account</span>
          </Link>

          <Link
            to="/marketing"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Gavel className="h-4 w-4" />
            <span>Marketing & Visibility</span>
          </Link>

          <Link
            to="/sales"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Gavel className="h-4 w-4" />
            <span>Sales Support</span>
          </Link>

          <Link
            to="/campaigns/launch"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Gavel className="h-4 w-4" />
            <span>Launch Campaign</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Wallet className="h-4 w-4" />
            <span>View wallet & deposits</span>
          </Link>

          <Link
            to="/help"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
          >
            <Phone className="h-4 w-4" />
            <span>Help & support</span>
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          For ad links use <span className="font-mono">/links</span> or <span className="font-mono">/campaign/&lt;source&gt;</span> as your final URL.
        </p>
      </div>
    </div>
  );
};

export default SocialLinks;
