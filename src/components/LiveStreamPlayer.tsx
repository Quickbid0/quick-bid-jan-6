import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Users,
  Wifi,
  WifiOff,
  Monitor,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveStreamPlayerProps {
  streamUrl: string;
  title: string;
  viewerCount?: number;
  isLive?: boolean;
  onViewerJoin?: () => void;
  onViewerLeave?: () => void;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  streamUrl,
  title,
  viewerCount = 0,
  isLive = true,
  onViewerJoin,
  onViewerLeave
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [iframeError, setIframeError] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackStreamUrl = 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1';

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setConnectionStatus('connecting');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 10000);

    // Notify parent component
    onViewerJoin?.();

    return () => {
      clearInterval(interval);
      onViewerLeave?.();
    };
  }, [onViewerJoin, onViewerLeave]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the video player
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control audio
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500"></div>;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      <div className="relative aspect-video">
        <iframe
          ref={videoRef}
          src={iframeError ? fallbackStreamUrl : streamUrl || fallbackStreamUrl}
          className="w-full h-full"
          allowFullScreen
          title={title}
          onError={() => setIframeError(true)}
        />

        {/* Live Indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <Users className="h-4 w-4 mr-2" />
          {viewerCount} watching
        </div>

        {/* Connection Status */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
          {getConnectionIcon()}
          <span className="ml-2 capitalize">{connectionStatus}</span>
        </div>

        {/* Quality Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <Monitor className="h-4 w-4 mr-2" />
          {quality}
        </div>

        {/* Player Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white" />
                  )}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Maximize className="h-6 w-6 text-white" />
                </button>

                <div className="relative">
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="bg-white/20 backdrop-blur-sm text-white border-none rounded px-3 py-2 text-sm"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stream Info Bar */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-300">Live Auction Stream</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span>HD Quality</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>Low Latency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPlayer;