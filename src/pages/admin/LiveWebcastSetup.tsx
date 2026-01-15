import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { 
  Video, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Monitor, 
  Wifi, 
  Users, 
  Camera,
  Mic,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WebcastStream {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended' | 'paused';
  stream_url: string;
  rtmp_url: string;
  stream_key: string;
  viewer_count: number;
  start_time: string;
  end_time?: string;
  quality_settings: {
    resolution: string;
    bitrate: number;
    fps: number;
    audio_bitrate: number;
  };
  chat_enabled: boolean;
  recording_enabled: boolean;
  thumbnail_url?: string;
}

const LiveWebcastSetup = () => {
  const [streams, setStreams] = useState<WebcastStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<WebcastStream | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamStats, setStreamStats] = useState({
    totalStreams: 0,
    liveStreams: 0,
    totalViewers: 0,
    avgDuration: 0
  });

  const [newStream, setNewStream] = useState({
    title: '',
    description: '',
    scheduled_start: '',
    quality_preset: 'high',
    chat_enabled: true,
    recording_enabled: true
  });

  useEffect(() => {
    fetchStreams();
    fetchStreamStats();
    
    // Real-time updates
    const interval = setInterval(() => {
      fetchStreamStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('live_webcasts')
        .select('*')
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

  const fetchStreamStats = async () => {
    try {
      const { data: allStreams } = await supabase
        .from('live_webcasts')
        .select('status, viewer_count, start_time, end_time');

      if (allStreams) {
        const totalStreams = allStreams.length;
        const liveStreams = allStreams.filter(s => s.status === 'live').length;
        const totalViewers = allStreams.reduce((sum, s) => sum + (s.viewer_count || 0), 0);
        
        setStreamStats({
          totalStreams,
          liveStreams,
          totalViewers,
          avgDuration: 0 // Calculate based on start/end times
        });
      }
    } catch (error) {
      console.error('Error fetching stream stats:', error);
    }
  };

  const createStream = async () => {
    try {
      const streamKey = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const rtmpUrl = `rtmp://live.quickbid.com/live/${streamKey}`;
      
      const qualityPresets = {
        low: { resolution: '720p', bitrate: 2000, fps: 24, audio_bitrate: 128 },
        medium: { resolution: '1080p', bitrate: 4000, fps: 30, audio_bitrate: 192 },
        high: { resolution: '1080p', bitrate: 6000, fps: 60, audio_bitrate: 256 },
        ultra: { resolution: '4K', bitrate: 12000, fps: 60, audio_bitrate: 320 }
      };

      const { error } = await supabase
        .from('live_webcasts')
        .insert([{
          title: newStream.title,
          description: newStream.description,
          status: 'scheduled',
          stream_key: streamKey,
          rtmp_url: rtmpUrl,
          stream_url: `https://live.quickbid.com/watch/${streamKey}`,
          start_time: newStream.scheduled_start,
          quality_settings: qualityPresets[newStream.quality_preset],
          chat_enabled: newStream.chat_enabled,
          recording_enabled: newStream.recording_enabled,
          viewer_count: 0
        }]);

      if (error) throw error;
      
      toast.success('Stream created successfully');
      setShowCreateModal(false);
      setNewStream({
        title: '',
        description: '',
        scheduled_start: '',
        quality_preset: 'high',
        chat_enabled: true,
        recording_enabled: true
      });
      fetchStreams();
    } catch (error) {
      console.error('Error creating stream:', error);
      toast.error('Failed to create stream');
    }
  };

  const updateStreamStatus = async (streamId: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'live') {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'ended') {
        updates.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('live_webcasts')
        .update(updates)
        .eq('id', streamId);

      if (error) throw error;
      
      toast.success(`Stream ${status}`);
      fetchStreams();
    } catch (error) {
      console.error('Error updating stream:', error);
      toast.error('Failed to update stream');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-500 bg-red-100';
      case 'scheduled': return 'text-blue-500 bg-blue-100';
      case 'paused': return 'text-yellow-500 bg-yellow-100';
      case 'ended': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Wifi className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'ended': return <Square className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Webcast Setup</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage live streaming and webcasts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Video className="h-5 w-5" />
          Create Stream
        </button>
      </div>

      {/* Stream Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Streams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{streamStats.totalStreams}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Live Now</p>
              <p className="text-2xl font-bold text-red-500">{streamStats.liveStreams}</p>
            </div>
            <Wifi className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Viewers</p>
              <p className="text-2xl font-bold text-green-500">{streamStats.totalViewers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-500">{streamStats.avgDuration}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Streams List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Streams</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {streams.map((stream) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {stream.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(stream.status)}`}>
                      {getStatusIcon(stream.status)}
                      {stream.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{stream.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stream.viewer_count} viewers
                    </div>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-4 w-4" />
                      {stream.quality_settings?.resolution || '1080p'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {stream.quality_settings?.bitrate || 4000} kbps
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(stream.start_time).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {stream.status === 'scheduled' && (
                    <button
                      onClick={() => updateStreamStatus(stream.id, 'live')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </button>
                  )}
                  
                  {stream.status === 'live' && (
                    <>
                      <button
                        onClick={() => updateStreamStatus(stream.id, 'paused')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                      <button
                        onClick={() => updateStreamStatus(stream.id, 'ended')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Square className="h-4 w-4" />
                        End
                      </button>
                    </>
                  )}
                  
                  {stream.status === 'paused' && (
                    <button
                      onClick={() => updateStreamStatus(stream.id, 'live')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Resume
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedStream(stream)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Stream Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New Stream</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream Title
                </label>
                <input
                  type="text"
                  value={newStream.title}
                  onChange={(e) => setNewStream(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter stream title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newStream.description}
                  onChange={(e) => setNewStream(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter stream description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Start
                  </label>
                  <input
                    type="datetime-local"
                    value={newStream.scheduled_start}
                    onChange={(e) => setNewStream(prev => ({ ...prev, scheduled_start: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quality Preset
                  </label>
                  <select
                    value={newStream.quality_preset}
                    onChange={(e) => setNewStream(prev => ({ ...prev, quality_preset: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low (720p, 2Mbps)</option>
                    <option value="medium">Medium (1080p, 4Mbps)</option>
                    <option value="high">High (1080p, 6Mbps)</option>
                    <option value="ultra">Ultra (4K, 12Mbps)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newStream.chat_enabled}
                    onChange={(e) => setNewStream(prev => ({ ...prev, chat_enabled: e.target.checked }))}
                    className="mr-2"
                  />
                  Enable Chat
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newStream.recording_enabled}
                    onChange={(e) => setNewStream(prev => ({ ...prev, recording_enabled: e.target.checked }))}
                    className="mr-2"
                  />
                  Enable Recording
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createStream}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Settings Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Stream Settings</h2>
              <button
                onClick={() => setSelectedStream(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Stream Information</h3>
                  <div className="space-y-2">
                    <p><strong>Title:</strong> {selectedStream.title}</p>
                    <p><strong>Status:</strong> {selectedStream.status}</p>
                    <p><strong>Viewers:</strong> {selectedStream.viewer_count}</p>
                    <p><strong>Start Time:</strong> {new Date(selectedStream.start_time).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Quality Settings</h3>
                  <div className="space-y-2">
                    <p><strong>Resolution:</strong> {selectedStream.quality_settings?.resolution}</p>
                    <p><strong>Bitrate:</strong> {selectedStream.quality_settings?.bitrate} kbps</p>
                    <p><strong>FPS:</strong> {selectedStream.quality_settings?.fps}</p>
                    <p><strong>Audio Bitrate:</strong> {selectedStream.quality_settings?.audio_bitrate} kbps</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Stream URLs</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        RTMP URL
                      </label>
                      <input
                        type="text"
                        value={selectedStream.rtmp_url}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stream Key
                      </label>
                      <input
                        type="text"
                        value={selectedStream.stream_key}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Watch URL
                      </label>
                      <input
                        type="text"
                        value={selectedStream.stream_url}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {selectedStream.chat_enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      Chat {selectedStream.chat_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="flex items-center">
                      {selectedStream.recording_enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      Recording {selectedStream.recording_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWebcastSetup;