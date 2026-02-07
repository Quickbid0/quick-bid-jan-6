import { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket/socket';

interface CountdownData {
  auctionId: string;
  timeRemaining: number;
  endTime: Date;
  isActive: boolean;
  lastMinuteExtension?: boolean;
}

interface CountdownWarning {
  type: 'one-minute' | 'thirty-seconds' | 'ten-seconds' | 'five-seconds';
  message: string;
}

interface CountdownExtended {
  newEndTime: Date;
  extensionMinutes: number;
  reason: string;
}

export function useLiveCountdown(auctionId: string) {
  const [countdown, setCountdown] = useState<CountdownData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [warnings, setWarnings] = useState<CountdownWarning[]>([]);
  const [extension, setExtension] = useState<CountdownExtended | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time remaining
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Get time components
  const getTimeComponents = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  }, []);

  // Check if time is running out
  const isEndingSoon = useCallback((timeRemaining: number): boolean => {
    return timeRemaining <= 60000; // Less than 1 minute
  }, []);

  // Check if time is critical
  const isCritical = useCallback((timeRemaining: number): boolean => {
    return timeRemaining <= 10000; // Less than 10 seconds
  }, []);

  // Get urgency level
  const getUrgencyLevel = useCallback((timeRemaining: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (timeRemaining <= 10000) return 'critical';
    if (timeRemaining <= 60000) return 'high';
    if (timeRemaining <= 300000) return 'medium';
    return 'low';
  }, []);

  // Get urgency color
  const getUrgencyColor = useCallback((timeRemaining: number): string => {
    const level = getUrgencyLevel(timeRemaining);
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  }, [getUrgencyLevel]);

  // Clear old warnings
  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  useEffect(() => {
    if (!auctionId) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('join-auction', { auctionId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleCountdownUpdate = (data: CountdownData) => {
      setCountdown(data);
      
      // Clear extension notification after 3 seconds
      if (extension) {
        setTimeout(() => setExtension(null), 3000);
      }
    };

    const handleCountdownWarning = (warning: CountdownWarning) => {
      setWarnings(prev => [...prev, warning]);
      
      // Auto-remove warning after 5 seconds
      setTimeout(() => {
        setWarnings(prev => prev.filter(w => w !== warning));
      }, 5000);
    };

    const handleCountdownExtended = (data: CountdownExtended) => {
      setExtension(data);
    };

    const handleAuctionEnded = () => {
      // Clear countdown when auction ends
      setCountdown(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Set up socket listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('countdown-update', handleCountdownUpdate);
    socket.on('countdown-warning', handleCountdownWarning);
    socket.on('countdown-extended', handleCountdownExtended);
    socket.on('auction-ended', handleAuctionEnded);

    // Connect if not already connected
    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('countdown-update', handleCountdownUpdate);
      socket.off('countdown-warning', handleCountdownWarning);
      socket.off('countdown-extended', handleCountdownExtended);
      socket.off('auction-ended', handleAuctionEnded);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [auctionId, extension]);

  return {
    // State
    countdown,
    isConnected,
    warnings,
    extension,
    
    // Computed values
    timeRemaining: countdown?.timeRemaining || 0,
    isActive: countdown?.isActive || false,
    endTime: countdown?.endTime,
    lastMinuteExtension: countdown?.lastMinuteExtension || false,
    
    // Formatted values
    formattedTime: countdown ? formatTime(countdown.timeRemaining) : 'Loading...',
    timeComponents: countdown ? getTimeComponents(countdown.timeRemaining) : { days: 0, hours: 0, minutes: 0, seconds: 0 },
    
    // Status helpers
    isEndingSoon: countdown ? isEndingSoon(countdown.timeRemaining) : false,
    isCritical: countdown ? isCritical(countdown.timeRemaining) : false,
    urgencyLevel: countdown ? getUrgencyLevel(countdown.timeRemaining) : 'low',
    urgencyColor: countdown ? getUrgencyColor(countdown.timeRemaining) : '',
    
    // Actions
    clearWarnings,
    
    // Loading state
    isLoading: !countdown && isConnected,
    hasError: !isConnected && !countdown
  };
}

