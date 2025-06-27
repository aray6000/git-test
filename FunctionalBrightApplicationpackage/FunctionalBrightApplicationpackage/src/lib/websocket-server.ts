
"use client";

// Simple in-memory store for tracking live viewers
const liveViewers = new Map<string, Set<string>>(); // pasteId -> Set of clientIds
const clientSockets = new Map<string, WebSocket>(); // clientId -> WebSocket

export interface LiveViewMessage {
  type: 'join' | 'leave' | 'view_count_update';
  pasteId?: string;
  clientId?: string;
  viewCount?: number;
}

export class LiveViewTracker {
  private static instance: LiveViewTracker;
  private ws: WebSocket | null = null;
  private clientId: string;
  private currentPasteId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.clientId = this.generateClientId();
  }

  static getInstance(): LiveViewTracker {
    if (!LiveViewTracker.instance) {
      LiveViewTracker.instance = new LiveViewTracker();
    }
    return LiveViewTracker.instance;
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For development, we'll use a mock WebSocket implementation
        // In production, you would connect to a real WebSocket server
        this.ws = this.createMockWebSocket();
        
        this.ws.onopen = () => {
          console.log('Connected to live view tracker');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message: LiveViewMessage = JSON.parse(event.data);
          this.handleMessage(message);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from live view tracker');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private createMockWebSocket(): WebSocket {
    // Mock WebSocket for development
    const mockWS = {
      readyState: 1, // OPEN
      send: (data: string) => {
        const message: LiveViewMessage = JSON.parse(data);
        setTimeout(() => {
          // Simulate server response
          if (message.type === 'join' && message.pasteId) {
            const viewers = liveViewers.get(message.pasteId) || new Set();
            viewers.add(this.clientId);
            liveViewers.set(message.pasteId, viewers);
            
            // Broadcast updated count
            this.broadcastViewCount(message.pasteId, viewers.size);
          } else if (message.type === 'leave' && message.pasteId) {
            const viewers = liveViewers.get(message.pasteId);
            if (viewers) {
              viewers.delete(this.clientId);
              this.broadcastViewCount(message.pasteId, viewers.size);
            }
          }
        }, 10);
      },
      close: () => {},
      onopen: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
    } as unknown as WebSocket;

    return mockWS;
  }

  private broadcastViewCount(pasteId: string, count: number) {
    if (this.ws && this.ws.onmessage) {
      const message: LiveViewMessage = {
        type: 'view_count_update',
        pasteId,
        viewCount: count
      };
      
      const event = new MessageEvent('message', {
        data: JSON.stringify(message)
      });
      
      setTimeout(() => {
        if (this.ws && this.ws.onmessage) {
          this.ws.onmessage(event);
        }
      }, 50);
    }
  }

  private handleMessage(message: LiveViewMessage) {
    if (message.type === 'view_count_update' && message.pasteId && message.viewCount !== undefined) {
      // Dispatch custom event for components to listen to
      const event = new CustomEvent('liveViewUpdate', {
        detail: {
          pasteId: message.pasteId,
          viewCount: message.viewCount
        }
      });
      window.dispatchEvent(event);
    }
  }

  joinPaste(pasteId: string) {
    if (this.currentPasteId === pasteId) return;
    
    if (this.currentPasteId) {
      this.leavePaste(this.currentPasteId);
    }
    
    this.currentPasteId = pasteId;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: LiveViewMessage = {
        type: 'join',
        pasteId,
        clientId: this.clientId
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  leavePaste(pasteId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: LiveViewMessage = {
        type: 'leave',
        pasteId,
        clientId: this.clientId
      };
      this.ws.send(JSON.stringify(message));
    }
    
    if (this.currentPasteId === pasteId) {
      this.currentPasteId = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(() => {
          // Retry failed, will try again if under limit
        });
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.currentPasteId) {
      this.leavePaste(this.currentPasteId);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
