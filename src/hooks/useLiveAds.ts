import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket/socket';

export type AdSlotType =
  | 'pre_roll'
  | 'mid_roll'
  | 'post_roll'
  | 'banner_left'
  | 'banner_bottom'
  | 'banner_right'
  | 'ticker'
  | 'popup_card'
  | 'timer_extension';

export interface LiveAdPayload {
  slotType: AdSlotType;
  creativeUrl: string;
  durationSec: number;
  campaignId: string;
  slotId: string;
  sponsorId: string;
}

interface UseLiveAdsOptions {
  eventId?: string;
  slotType: AdSlotType;
  userId?: string;
}

export function useLiveAds({ eventId, slotType, userId }: UseLiveAdsOptions) {
  const [currentAd, setCurrentAd] = useState<LiveAdPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const visibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleAdInject = (payload: LiveAdPayload) => {
      if (payload.slotType !== slotType) return;
      setCurrentAd(payload);
      setVisible(true);
      visibleSinceRef.current = Date.now();

      const timeout = setTimeout(() => {
        finishImpression(false);
      }, (payload.durationSec || 10) * 1000);

      return () => {
        clearTimeout(timeout);
      };
    };

    socket.on('ad_inject', handleAdInject);

    socket.emit('ad_request', { eventId, slotType, userId });

    return () => {
      socket.off('ad_inject', handleAdInject);
    };
  }, [eventId, slotType, userId]);

  const finishImpression = (clicked: boolean) => {
    if (!currentAd) {
      setVisible(false);
      return;
    }
    const startedAt = visibleSinceRef.current;
    const durationMs = startedAt ? Date.now() - startedAt : currentAd.durationSec * 1000;

    const payload = {
      sponsorId: currentAd.sponsorId,
      slotId: currentAd.slotId,
      campaignId: currentAd.campaignId,
      eventId,
      userId,
      durationMs,
    };

    socket.emit(clicked ? 'ad_click' : 'ad_impression', payload);
    setVisible(false);
    setCurrentAd(null);
    visibleSinceRef.current = null;
  };

  const handleClick = () => {
    finishImpression(true);
  };

  return {
    ad: currentAd,
    visible,
    handleClick,
  };
}
