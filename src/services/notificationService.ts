import { supabase } from '../config/supabaseClient';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'bid_won' | 'bid_placed' | 'bid_outbid' | 'auction_ending' | 'auction_started' | 'delivery_update' | 'payment_received' | 'verification_update' | 'system_announcement';
  auctionId?: string;
  productId?: string;
  metadata?: any;
}

class NotificationService {
  // Send notification to user
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          auction_id: data.auctionId,
          product_id: data.productId,
          metadata: data.metadata || {}
        }]);

      if (error) throw error;

      // Send real-time notification via Supabase realtime
      await this.sendRealtimeNotification(data);
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(notifications: NotificationData[]): Promise<boolean> {
    try {
      const notificationData = notifications.map(data => ({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        auction_id: data.auctionId,
        product_id: data.productId,
        metadata: data.metadata || {}
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return false;
    }
  }

  // Send auction ending notifications
  async sendAuctionEndingNotifications(): Promise<void> {
    try {
      // Find auctions ending in the next hour
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      const { data: endingAuctions } = await supabase
        .from('auctions')
        .select(`
          id,
          end_date,
          status,
          product:products(title),
          bids:user_bids(user_id, amount)
        `)
        .in('status', ['active', 'live'])
        .lte('end_date', oneHourFromNow);

      if (endingAuctions) {
        const notifications: NotificationData[] = [];
        
        endingAuctions.forEach(auction => {
          // Notify all bidders
          (auction as any).bids?.forEach((bid: any) => {
            notifications.push({
              userId: bid.user_id,
              title: 'Auction Ending Soon',
              message: `The auction for "${(auction as any).product?.title || 'your item'}" ends in less than 1 hour!`,
              type: 'auction_ending',
              auctionId: (auction as any).id,
              productId: undefined,
            });
          });
        });

        if (notifications.length > 0) {
          await this.sendBulkNotifications(notifications);
        }
      }
    } catch (error) {
      console.error('Error sending auction ending notifications:', error);
    }
  }

  // Send bid notifications
  async sendBidNotifications(auctionId: string, newBidAmount: number, newBidderId: string): Promise<void> {
    try {
      // Get auction details joined with product
      const { data: auction } = await supabase
        .from('auctions')
        .select('id, product_id, seller_id, product:products(title)')
        .eq('id', auctionId)
        .single();

      if (!auction) return;

      // Get all previous bidders on this auction
      const { data: previousBids } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('auction_id', auctionId)
        .neq('user_id', newBidderId);

      const notifications: NotificationData[] = [];

      // Notify seller
      notifications.push({
        userId: (auction as any).seller_id,
        title: 'New Bid Received',
        message: `New bid of ₹${newBidAmount.toLocaleString()} placed on "${(auction as any).product?.title || 'your item'}"`,
        type: 'bid_placed',
        auctionId: (auction as any).id,
        productId: (auction as any).product_id,
      });

      // Notify outbid users
      previousBids?.forEach(bid => {
        if (bid.amount < newBidAmount) {
          notifications.push({
            userId: bid.user_id,
            title: 'You\'ve Been Outbid',
            message: `Your bid on "${(auction as any).product?.title || 'your item'}" has been outbid. Current bid: ₹${newBidAmount.toLocaleString()}`,
            type: 'bid_outbid',
            auctionId: (auction as any).id,
            productId: (auction as any).product_id,
          });
        }
      });

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      console.error('Error sending bid notifications:', error);
    }
  }

  // Send real-time notification
  private async sendRealtimeNotification(data: NotificationData): Promise<void> {
    try {
      // Use Supabase realtime to send instant notifications
      const channel = supabase.channel(`user:${data.userId}`);
      await channel.send({
        type: 'broadcast',
        event: 'notification',
        payload: data
      });
    } catch (error) {
      console.error('Error sending realtime notification:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Consent-gated enqueue to notification_events for WhatsApp/SMS
  async enqueueOutbidEvents(productId: string, currentAmount: number, newBidderId: string): Promise<void> {
    try {
      // Resolve previous bidders except new bidder
      const { data: prevBids } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('product_id', productId)
        .neq('user_id', newBidderId);
      if (!prevBids || prevBids.length === 0) return;

      // Find eligible users who are subscribed and outbid
      const outbidUsers = prevBids.filter(b => (b as any).amount < currentAmount).map(b => (b as any).user_id);
      if (outbidUsers.length === 0) return;

      // Fetch product title for message context
      const { data: prod } = await supabase.from('products').select('title').eq('id', productId).single();
      const title = (prod as any)?.title || 'your item';

      // Load subscriptions for these users
      const { data: subs } = await supabase
        .from('notification_subscriptions')
        .select('user_id, channel, consent, destination')
        .in('user_id', outbidUsers);

      const events: any[] = [];
      (subs || []).forEach(s => {
        if (s.consent && (s.channel === 'whatsapp' || s.channel === 'sms')) {
          events.push({
            user_id: s.user_id,
            type: 'bid_outbid',
            payload: { product_id: productId, title, amount: currentAmount },
            channel: s.channel,
            status: 'queued',
          });
        }
      });
      if (events.length > 0) {
        await supabase.from('notification_events').insert(events);
      }
    } catch (e) {
      console.warn('enqueueOutbidEvents error', e);
    }
  }

  async enqueueAuctionStarting(productId: string, startsAtIso: string, userIds: string[]): Promise<void> {
    try {
      if (!userIds || userIds.length === 0) return;
      const { data: prod } = await supabase.from('products').select('title').eq('id', productId).single();
      const title = (prod as any)?.title || 'your item';
      const { data: subs } = await supabase
        .from('notification_subscriptions')
        .select('user_id, channel, consent')
        .in('user_id', userIds);
      const events: any[] = [];
      (subs || []).forEach(s => {
        if (s.consent && (s.channel === 'whatsapp' || s.channel === 'sms')) {
          events.push({
            user_id: s.user_id,
            type: 'auction_started',
            payload: { product_id: productId, title, starts_at: startsAtIso },
            channel: s.channel,
            status: 'queued',
          });
        }
      });
      if (events.length > 0) await supabase.from('notification_events').insert(events);
    } catch (e) {
      console.warn('enqueueAuctionStarting error', e);
    }
  }
}

export const notificationService = new NotificationService();