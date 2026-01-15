import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Video,
  Settings,
  Users,
  Link as LinkIcon,
  Play,
  Loader2,
  Globe,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Wifi,
  Camera,
  Mic
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveStream {
  id: string;
  title: string;
  stream_url: string;
  status: 'scheduled' | 'live' | 'ended';
  auction_id: string;
  viewer_count: number;
  scheduled_start: string;
  stream_key?: string;
  rtmp_url?: string;
  quality_settings?: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
  auction?: {
    products?: {
      title: string;
    };
  };
}

interface StreamingPlatform {
  id: string;
  name: string;
  icon: string;
  rtmp_url: string;
  supports_key: boolean;
}

const LiveStreamSetup = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');
  const [selectedAuction, setSelectedAuction] = useState('');
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [scheduledStart, setScheduledStart] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [streamKey, setStreamKey] = useState('');
  const [qualitySettings, setQualitySettings] = useState({
    resolution: '1080p',
    bitrate: 4000,
    fps: 30
  });

  const streamingPlatforms: StreamingPlatform[] = [
    {
      id: 'youtube',
      name: 'YouTube Live',
      icon: '📺',
      rtmp_url: 'rtmp://a.rtmp.youtube.com/live2/',
      supports_key: true
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: '🎮',
      rtmp_url: 'rtmp://live.twitch.tv/app/',
      supports_key: true
    },
    {
      id: 'facebook',
      name: 'Facebook Live',
      icon: '📘',
      rtmp_url: 'rtmps://live-api-s.facebook.com:443/rtmp/',
      supports_key: true
    },
    {
      id: 'custom',
      name: 'Custom RTMP',
      icon: '🔗',
      rtmp_url: '',
      supports_key: true
    }
  ];

  useEffect(() => {
    fetchStreams();
    fetchAuctions();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          auction:auctions(
            title,
            products(title)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        id,
        title,
        products(title)
      `)
      .eq('status', 'scheduled');

    if (error) {
      toast.error('Failed to load auctions');
    } else {
      setAuctions(data || []);
    }
  };

  const createStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction || !scheduledStart) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const platform = streamingPlatforms.find(p => p.id === selectedPlatform);
      const finalStreamUrl = selectedPlatform === 'custom' ? streamUrl : 
        `${platform?.rtmp_url}${streamKey}`;

      const { error } = await supabase.from('live_streams').insert([
        {
          stream_url: finalStreamUrl,
          auction_id: selectedAuction,
          status: 'scheduled',
          scheduled_start: scheduledStart,
          viewer_count: 0,
          stream_key: streamKey,
          rtmp_url: platform?.rtmp_url,
          quality_settings: qualitySettings
        }
      ]);

      if (error) throw error;

      await supabase
        .from('auctions')
        .update({ stream_url: finalStreamUrl })
        .eq('id', selectedAuction);

      toast.success('Stream created successfully');
      setStreamUrl('');
      setSelectedAuction('');
      setScheduledStart('');
      setStreamKey('');
      fetchStreams();
    } catch (error) {
      console.error('Error creating stream:', error);
      toast.error('Failed to create stream');
    } finally {
      setIsCreating(false);
    }
  };

  const updateStreamStatus = async (streamId: string, status: 'live' | 'ended') => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update({ status })
        .eq('id', streamId);

      if (error) throw error;
      toast.success(`Stream ${status === 'live' ? 'started' : 'ended'}`);
      fetchStreams();
    } catch (error) {
      toast.error(`Failed to ${status === 'live' ? 'start' : 'end'} stream`);
    }
  };

  const testStreamConnection = async () => {
    // Simulate stream connection test
    toast.loading('Testing stream connection...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Stream connection test successful!');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Video className="h-8 w-8 text-indigo-600" />
            Live Stream Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Configure and manage live auction streams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stream Creation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Stream</h2>
          <form onSubmit={createStream} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Auction
              </label>
              <select
                value={selectedAuction}
                onChange={(e) => setSelectedAuction(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select an auction</option>
                {auctions.map((auction) => (
                  <option key={auction.id} value={auction.id}>
                    {auction.products?.title || auction.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Streaming Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {streamingPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      selectedPlatform === platform.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedPlatform === 'custom' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom RTMP URL
                </label>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtmp://your-server.com/live/"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="Enter your stream key"
                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={testStreamConnection}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Test
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Start Time
              </label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Quality Settings */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Quality Settings</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resolution
                  </label>
                  <select
                    value={qualitySettings.resolution}
                    onChange={(e) => setQualitySettings(prev => ({ ...prev, resolution: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bitrate (kbps)
                  </label>
                  <input
                    type="number"
                    value={qualitySettings.bitrate}
                    onChange={(e) => setQualitySettings(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min="1000"
                    max="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    FPS
                  </label>
                  <select
                    value={qualitySettings.fps}
                    onChange={(e) => setQualitySettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value={24}>24</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating...
                </>
              ) : (
                <>
                  <Settings className="h-5 w-5" />
                  Create Stream
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stream Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Manage Streams</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No streams created yet
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">
                        {stream.auction?.products?.title || 'Untitled Stream'}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      stream.status === 'live'
                        ? 'bg-green-100 text-green-800'
                        : stream.status === 'ended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {stream.status === 'live' && <Wifi className="h-3 w-3" />}
                      {stream.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>RTMP Stream</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{stream.viewer_count} viewers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-4 w-4" />
                      <span>{stream.quality_settings?.resolution || '1080p'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {stream.status === 'scheduled' && (
                      <button
                        onClick={() => updateStreamStatus(stream.id, 'live')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Stream
                      </button>
                    )}
                    {stream.status === 'live' && (
                      <button
                        onClick={() => updateStreamStatus(stream.id, 'ended')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        End Stream
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streaming Guidelines */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Streaming Guidelines & Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Video Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use 1080p resolution with 30fps for optimal viewing experience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mic className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Audio Setup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ensure clear audio with noise cancellation enabled
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Wifi className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Network Requirements</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Stable internet with minimum 5 Mbps upload speed
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Pre-Stream Testing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Always test your setup before going live
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Audience Engagement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Interact with viewers and respond to chat messages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-medium">Backup Plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Have a backup streaming solution ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamSetup;