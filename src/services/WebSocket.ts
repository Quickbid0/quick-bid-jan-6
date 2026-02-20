/**
 * WebSocket Service with Automatic Reconnection
 * 
 * Handles real-time data updates for auctions, prices, bids.
 * Includes exponential backoff reconnection (1s → 2s → 4s → 8s → 16s → max 30s)
 * 
 * Usage:
 *   const ws = new WebSocketManager('wss://api.quickbid.com/ws');
 *   await ws.connect();
 *   ws.onMessage((data) => console.log(data));
 *   ws.send({ type: 'SUBSCRIBE', auctionId: '123' });
 *   ws.close();
 */

export interface WebSocketMessage {
  type: string;
  auctionId?: string;
  [key: string]: any;
}

export type MessageHandler = (data: WebSocketMessage) => void;

export class WebSocketManager {
  private url: string;
  private ws: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private reconnectAttempt = 0;
  private maxReconnectAttempts = 5;
  private isManuallyClosing = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   * Returns a Promise that resolves when connection is established
   */
  async connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected to server');
          this.reconnectAttempt = 0; // Reset on successful connection
          this.startHeartbeat();
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            // Notify all registered handlers
            this.messageHandlers.forEach((handler) => {
              try {
                handler(data);
              } catch (err) {
                console.error('[WebSocket] Error in message handler:', err);
              }
            });
          } catch (err) {
            console.error('[WebSocket] Failed to parse message:', err);
          }
        };

        this.ws.onerror = (event) => {
          console.error('[WebSocket] Connection error:', event);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Connection closed');
          this.stopHeartbeat();

          // Attempt reconnection if not manually closed
          if (!this.isManuallyClosing && this.reconnectAttempt < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
      } catch (err) {
        console.error('[WebSocket] Failed to create WebSocket:', err);
        reject(err);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   * Backoff: 1s → 2s → 4s → 8s → 16s → max 30s
   */
  private attemptReconnect(): void {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempt), maxDelay);

    this.reconnectAttempt++;
    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((err) => {
        console.error('[WebSocket] Reconnection attempt failed:', err);
      });
    }, delay);
  }

  /**
   * Start heartbeat to detect stale connections
   * Send PING every 30 seconds
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.send({ type: 'PING' });
        } catch (err) {
          console.warn('[WebSocket] Heartbeat failed:', err);
        }
      }
    }, 30000); // 30 second interval
  }

  /**
   * Stop heartbeat when connection closes
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Register a message handler
   * Multiple handlers can be registered
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Remove a message handler
   */
  offMessage(handler: MessageHandler): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * Send a message to the server
   */
  send(message: WebSocketMessage): void {
    if (!this.ws) {
      throw new Error('WebSocket not connected');
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`WebSocket is not open (state: ${this.ws.readyState})`);
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      console.error('[WebSocket] Failed to send message:', err);
      throw err;
    }
  }

  /**
   * Subscribe to auction updates
   */
  subscribe(auctionId: string): void {
    this.send({
      type: 'SUBSCRIBE',
      auctionId,
    });
  }

  /**
   * Unsubscribe from auction updates
   */
  unsubscribe(auctionId: string): void {
    this.send({
      type: 'UNSUBSCRIBE',
      auctionId,
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Close connection gracefully
   * Prevents automatic reconnection
   */
  close(): void {
    this.isManuallyClosing = true;

    // Clear timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopHeartbeat();

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear handlers
    this.messageHandlers = [];

    console.log('[WebSocket] Connection closed manually');
  }

  /**
   * Reconnect manually
   */
  reconnect(): void {
    this.isManuallyClosing = false;
    this.reconnectAttempt = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connect().catch((err) => {
      console.error('[WebSocket] Manual reconnection failed:', err);
    });
  }
}

/**
 * Singleton instance for application-wide WebSocket
 */
let wsInstance: WebSocketManager | null = null;

export function getWebSocketInstance(url: string = process.env.REACT_APP_WS_URL || 'wss://api.quickbid.com/ws'): WebSocketManager {
  if (!wsInstance) {
    wsInstance = new WebSocketManager(url);
  }
  return wsInstance;
}

export function closeWebSocketInstance(): void {
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
}
