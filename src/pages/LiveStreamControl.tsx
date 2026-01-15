import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Users, 
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface StreamControl {
  id: string;
  title: string;
  status: 'scheduled' | 'live' | 'paused' | 'ended';
  viewer_count: number;
  stream_url: string;
  rtmp_url: string;
  stream_key: string;
  chat_enabled: boolean;
  recording_enabled: boolean;
  quality_settings: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
  auction: {
    id: string;
    title: string;
    current_price: number;
    bid_count: number;
  };
}

const LiveStreamControl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState<StreamControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    peakViewers: 0,
    totalWatchTime: 0,
    chatMessages: 0,
    bidsPlaced: 0
  });
  const [controls, setControls] = useState({
    isLive: false,
    audioEnabled: true,
    videoEnabled: true,
    chatEnabled: true,
    recordingEnabled: false
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchStreamDetails();
      startStatsUpdates();
    }
  }, [id]);

  const fetchStreamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          auction:auctions(
            id,
            title,
            current_price,
            products(title)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setStream(data);
      setControls({
        isLive: data.status === 'live',
        audioEnabled: true,
        videoEnabled: true,
        chatEnabled: data.chat_enabled,
        recordingEnabled: data.recording_enabled
      });

      // Mock chat messages
      setChatMessages([
        { id: 1, user: 'John D.', message: 'Great auction!', timestamp: new Date() },
        { id: 2, user: 'Sarah M.', message: 'What\'s the reserve price?', timestamp: new Date() },
        { id: 3, user: 'Mike R.', message: 'Bidding now!', timestamp: new Date() }
      ]);

    } catch (error) {
      console.error('Error fetching stream:', error);
      toast.error('Failed to load stream details');
    } finally {
      setLoading(false);
    }
  };

  const startStatsUpdates = () => {
    const interval = setInterval(() => {
      setStreamStats(prev => ({
        viewers: Math.max(0, prev.viewers + Math.floor(Math.random() * 10) - 5),
        peakViewers: Math.max(prev.peakViewers, prev.viewers),
        totalWatchTime: prev.totalWatchTime + Math.floor(Math.random() * 60),
        chatMessages: prev.chatMessages + Math.floor(Math.random() * 3),
        bidsPlaced: prev.bidsPlaced + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  };

  const handleStreamControl = async (action: 'start' | 'pause' | 'stop') => {
    try {
      let newStatus = 'scheduled';
      switch (action) {
        case 'start':
          newStatus = 'live';
          break;
        case 'pause':
          newStatus = 'paused';
          break;
        case 'stop':
          newStatus = 'ended';
          break;
      }

      const { error } = await supabase
        .from('live_streams')
        .update({ 
          status: newStatus,
          actual_start_time: action === 'start' ? new Date().toISOString() : undefined,
          end_time: action === 'stop' ? new Date().toISOString() : undefined
        })
        .eq('id', id);

      if (error) throw error;

      setControls(prev => ({ ...prev, isLive: action === 'start' }));
      toast.success(`Stream ${action}ed successfully`);
      
      if (action === 'stop') {
        navigate('/admin/live-setup');
      }
    } catch (error) {
      console.error('Error controlling stream:', error);
      toast.error('Failed to control stream');
    }
  };

  const toggleControl = (controlType: string) => {
    setControls(prev => ({
      ...prev,
      [controlType]: !prev[controlType]
    }));
    toast.success(`${controlType} ${controls[controlType] ? 'disabled' : 'enabled'}`);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: 'Admin',
      message: newMessage,
      timestamp: new Date(),
      isAdmin: true
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stream Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">The stream you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Stream Control</h1>
          <p className="text-gray-600 dark:text-gray-400">{stream.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${controls.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="font-medium">{controls.isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stream Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream Preview */}
          <div className="bg-black rounded-lg overflow-hidden relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Stream Preview</p>
                <p className="text-sm opacity-75">RTMP: {stream.rtmp_url}</p>
              </div>
            </div>
            
            {/* Stream Overlay */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {streamStats.viewers} viewers
            </div>
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              {controls.isLive ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          {/* Stream Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Stream Controls</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => handleStreamControl('start')}
                disabled={controls.isLive}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </button>
              
              <button
                onClick={() => handleStreamControl('pause')}
                disabled={!controls.isLive}
                className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </button>
              
              <button
                onClick={() => handleStreamControl('stop')}
                className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </button>
              
              <button
                onClick={() => navigate(`/admin/live-setup/${id}/settings`)}
                className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </button>
            </div>

            {/* Audio/Video Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => toggleControl('audioEnabled')}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  controls.audioEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {controls.audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => toggleControl('videoEnabled')}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  controls.videoEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {controls.videoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => toggleControl('chatEnabled')}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  controls.chatEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => toggleControl('recordingEnabled')}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  controls.recordingEnabled ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Monitor className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stream Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Live Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{streamStats.viewers}</div>
                <div className="text-sm text-gray-500">Current Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{streamStats.peakViewers}</div>
                <div className="text-sm text-gray-500">Peak Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.floor(streamStats.totalWatchTime / 60)}m</div>
                <div className="text-sm text-gray-500">Watch Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{streamStats.chatMessages}</div>
                <div className="text-sm text-gray-500">Chat Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{streamStats.bidsPlaced}</div>
                <div className="text-sm text-gray-500">Bids Placed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Auction Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Auction Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Product</label>
                <p className="font-medium">{stream.auction?.title}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Current Price</label>
                <p className="text-xl font-bold text-green-600">
                  ₹{stream.auction?.current_price?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Bids</label>
                <p className="font-medium">{stream.auction?.bid_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Stream Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Stream Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolution</span>
                <span className="font-medium">{stream.quality_settings?.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bitrate</span>
                <span className="font-medium">{stream.quality_settings?.bitrate} kbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">FPS</span>
                <span className="font-medium">{stream.quality_settings?.fps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chat</span>
                <span className={`text-sm ${controls.chatEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {controls.chatEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Live Chat</h3>
            
            <div className="h-64 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map(message => (
                <div key={message.id} className="text-sm">
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${message.isAdmin ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {message.user}
                      {message.isAdmin && <span className="text-xs bg-red-100 text-red-800 px-1 rounded ml-1">ADMIN</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{message.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send admin message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={!controls.chatEnabled}
              />
              <button
                type="submit"
                disabled={!controls.chatEnabled}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>

          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Stream Connection</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm">Stream Health</span>
                </div>
                <span className="text-sm text-green-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Monitor className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm">Latency</span>
                </div>
                <span className="text-sm text-green-600">2.3s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamControl;
