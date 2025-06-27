
"use client";

import { useState, useEffect, useCallback } from 'react';
import { LiveViewTracker } from '@/lib/websocket-server';

export interface LiveViewData {
  pasteId: string;
  liveViewCount: number;
  isConnected: boolean;
}

export function useLiveViews(pasteId?: string) {
  const [liveViewCount, setLiveViewCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [tracker] = useState(() => LiveViewTracker.getInstance());

  const handleLiveViewUpdate = useCallback((event: CustomEvent) => {
    const { pasteId: updatedPasteId, viewCount } = event.detail;
    if (updatedPasteId === pasteId) {
      setLiveViewCount(viewCount);
    }
  }, [pasteId]);

  useEffect(() => {
    let mounted = true;

    const initializeTracker = async () => {
      try {
        await tracker.connect();
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to connect to live view tracker:', error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    initializeTracker();

    // Listen for live view updates
    window.addEventListener('liveViewUpdate', handleLiveViewUpdate as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('liveViewUpdate', handleLiveViewUpdate as EventListener);
    };
  }, [tracker, handleLiveViewUpdate]);

  useEffect(() => {
    if (pasteId && isConnected) {
      tracker.joinPaste(pasteId);
      
      return () => {
        tracker.leavePaste(pasteId);
      };
    }
  }, [pasteId, isConnected, tracker]);

  return {
    liveViewCount,
    isConnected,
    tracker
  };
}
