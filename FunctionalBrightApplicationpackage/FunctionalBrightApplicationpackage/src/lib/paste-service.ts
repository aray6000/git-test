"use client";

import { nanoid } from 'nanoid';
import type { Paste, CreatePasteInput, ExpirationOption } from './types';
import { addDays, addHours, addMinutes, addMonths, addWeeks } from 'date-fns';
import { incrementPasteCount, incrementViewCount, getCurrentUser, updateUserInDatabase } from './auth';
import { updateUserStats, triggerStatsUpdate, updateRealTimeStats } from './stats-service';

const STORAGE_KEY = 'crazy-paste-data';

export const getExpirationTimestamp = (option: ExpirationOption): number | null => {
  const now = new Date();

  switch (option) {
    case 'never':
      return null;
    case '10m':
      return addMinutes(now, 10).getTime();
    case '1h':
      return addHours(now, 1).getTime();
    case '1d':
      return addDays(now, 1).getTime();
    case '1w':
      return addWeeks(now, 1).getTime();
    case '1m':
      return addMonths(now, 1).getTime();
    case 'burn':
      return null; // Burn after reading has special handling
    default:
      return null;
  }
};

export const createPaste = (input: CreatePasteInput): Paste => {
  try {
    // Validate input first
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input data');
    }

    if (!input.content || typeof input.content !== 'string' || input.content.trim() === '') {
      throw new Error('Content cannot be empty');
    }

    // Check if user is authenticated (only in browser environment)
    let currentUser = null;
    if (typeof window !== 'undefined') {
      currentUser = getCurrentUser();
      if (!currentUser) {
        // Try to get from localStorage directly as fallback
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      }
    }

    if (!currentUser) {
      throw new Error('Authentication required to create pastes');
    }

    // Generate a unique ID
    const id = nanoid(10);

    // Calculate expiration timestamp
    let expires: number | null = null;
    try {
      expires = getExpirationTimestamp(input.expiration || 'never');
    } catch (expError) {
      console.warn('Failed to calculate expiration, using never:', expError);
      expires = null;
    }

    // Create the paste object with safe defaults
    const paste: Paste = {
      id,
      title: (input.title && input.title.trim()) || 'Untitled Paste',
      content: input.content.trim(),
      language: input.language || 'text',
      created: Date.now(),
      expires,
      password: (input.password && input.password.trim()) || null,
      burnAfterReading: Boolean(input.burnAfterReading),
      views: 0,
      userId: currentUser.id,
    };

    // Store in localStorage with better error handling
    try {
      // Check if localStorage is available
      if (typeof Storage === 'undefined') {
        throw new Error('Local storage is not available');
      }

      const existingData = getAllPastes();
      const updatedData = [paste, ...existingData];

      // Try to stringify first to catch any serialization errors
      const dataString = JSON.stringify(updatedData);
      localStorage.setItem(STORAGE_KEY, dataString);

      console.log('Paste created successfully:', paste.id);
    } catch (storageError) {
      console.error('Failed to store paste:', storageError);
      if (storageError instanceof Error) {
        if (storageError.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Please clear some old pastes.');
        }
        throw new Error(`Failed to save paste: ${storageError.message}`);
      }
      throw new Error('Failed to save paste. Please try again.');
    }

    // Increment user stats with error handling
    try {
      incrementPasteCount(currentUser.id, !paste.password); // Public if no password
    } catch (statsError) {
      console.warn('Failed to update user stats:', statsError);
      // Don't fail the paste creation for stats errors
    }

    // Update user stats and save contact info
    if (currentUser) {
      incrementPasteCount(currentUser.id, !paste.password);

      // Also update the total pastes count in localStorage for immediate UI updates
      const userStatsKey = `user-stats-${currentUser.id}`;
      const currentStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');
      const updatedStats = {
        ...currentStats,
        totalPastes: (currentStats.totalPastes || 0) + 1,
        publicPastes: !paste.password ? (currentStats.publicPastes || 0) + 1 : (currentStats.publicPastes || 0),
        privatePastes: paste.password ? (currentStats.privatePastes || 0) + 1 : (currentStats.privatePastes || 0)
      };
      localStorage.setItem(userStatsKey, JSON.stringify(updatedStats));

      // Save user contact info automatically when they create a paste
      const contactInfo = {
        lastPasteCreated: new Date().toISOString(),
        totalPastesCreated: (currentUser.totalPastesCreated || 0) + 1,
        email: currentUser.email,
        username: currentUser.username
      };

      // Store contact info in localStorage for easy access
      const userContactKey = `user-contact-${currentUser.id}`;
      const existingContact = JSON.parse(localStorage.getItem(userContactKey) || '{}');
      const updatedContact = {
        ...existingContact,
        ...contactInfo,
        contactHistory: [
          ...(existingContact.contactHistory || []),
          {
            action: 'paste_created',
            timestamp: new Date().toISOString(),
            pasteId: paste.id,
            pasteTitle: paste.title
          }
        ].slice(-50) // Keep last 50 contact events
      };

      localStorage.setItem(userContactKey, JSON.stringify(updatedContact));

      // If it's a guest user, also update the current user data with contact info
      if (currentUser.isGuest) {
        const updatedUser = {
          ...currentUser,
          website: contactInfo.website || currentUser.website || '',
          github: contactInfo.github || currentUser.github || '',
          discord: contactInfo.discord || currentUser.discord || '',
          telegram: contactInfo.telegram || currentUser.telegram || '',
          twitter: contactInfo.twitter || currentUser.twitter || '',
          profile: {
            ...currentUser.profile,
            website: contactInfo.website || currentUser.profile?.website || '',
            github: contactInfo.github || currentUser.profile?.github || ''
          }
        };
        localStorage.setItem('crazy-paste-current-user', JSON.stringify(updatedUser));
      }

      // Also update user database with contact save timestamp
      updateUserInDatabase(currentUser.id, {
        lastContactSave: new Date().toISOString(),
        totalPastesCreated: contactInfo.totalPastesCreated
      });
    }

    // Trigger stats update for the user
    if (currentUser) {
      triggerStatsUpdate(currentUser.id);
    }

    return paste;
  } catch (error) {
    console.error('Error creating paste:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create paste: ${error.message}`);
    }
    throw new Error('Failed to create paste. Please try again.');
  }
};

export const getPasteById = (id: string): Paste | null => {
  try {
    // Validate input
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.log('getPasteById: Invalid ID provided:', id);
      return null;
    }

    const cleanId = id.trim();
    console.log('getPasteById: Looking for paste with ID:', cleanId);

    const allPastes = getAllPastes();
    console.log('getPasteById: Total pastes available:', allPastes.length);
    console.log('getPasteById: Available paste IDs:', allPastes.map(p => p.id));

    const paste = allPastes.find(p => p.id === cleanId);

    if (!paste) {
      console.log('getPasteById: Paste not found with ID:', cleanId);
      return null;
    }

    console.log('getPasteById: Found paste:', paste.title);

    // Check if paste has expired
    if (paste.expires && paste.expires < Date.now()) {
      console.log('getPasteById: Paste has expired, deleting...');
      // Expired, delete it and return null
      deletePaste(cleanId);
      return null;
    }

    // Create a copy to avoid mutating the original
    const pasteClone = { ...paste };

    // Only increment view count when actually viewing (not just loading)
    // This will be called from the view paste component, not here

    // Handle burn after reading
    if (pasteClone.burnAfterReading && pasteClone.views > 0) {
      console.log('getPasteById: Burn after reading - deleting paste');
      deletePaste(cleanId);
      return null;
    }

    // Increment user view stats (only if user is logged in)
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        incrementViewCount(currentUser.id);
      }
    } catch (statsError) {
      console.warn('Failed to update view stats:', statsError);
      // Don't fail the paste retrieval for stats errors
    }

    return pasteClone;
  } catch (error) {
    console.error("Error getting paste:", error);
    return null;
  }
};

export const getAllPastes = (): Paste[] => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.log('getAllPastes: Not in browser environment');
      return [];
    }

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('getAllPastes: No data found in localStorage');
      return [];
    }

    let pastes: Paste[];
    try {
      pastes = JSON.parse(data);
    } catch (parseError) {
      console.error('getAllPastes: Failed to parse stored data:', parseError);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Ensure pastes is an array
    if (!Array.isArray(pastes)) {
      console.error('getAllPastes: Stored data is not an array');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    console.log('getAllPastes: Retrieved', pastes.length, 'pastes from storage');

    // Filter out expired pastes
    const currentTime = Date.now();
    const validPastes = pastes.filter(paste => {
      if (!paste || typeof paste !== 'object' || !paste.id) {
        return false;
      }
      return !paste.expires || paste.expires > currentTime;
    });

    // If we removed some pastes, update storage
    if (validPastes.length < pastes.length) {
      console.log('getAllPastes: Removed', pastes.length - validPastes.length, 'expired pastes');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validPastes));
    }

    return validPastes;
  } catch (error) {
    console.error("Error retrieving pastes:", error);
    return [];
  }
};

export const getRecentPastes = (limit = 10): Paste[] => {
  const allPastes = getAllPastes();

  // Filter out password-protected and burn-after-reading pastes
  const publicPastes = allPastes.filter(
    paste => !paste.password && !paste.burnAfterReading
  );

  // Sort by creation time (newest first) and limit the results
  return publicPastes
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
};

export const deletePaste = (id: string): boolean => {
  try {
    const allPastes = getAllPastes();
    const filteredPastes = allPastes.filter(paste => paste.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPastes));
    return true;
  } catch (error) {
    console.error("Error deleting paste:", error);
    return false;
  }
};

export const updatePaste = (paste: Paste): boolean => {
  try {
    const allPastes = getAllPastes();
    const index = allPastes.findIndex(p => p.id === paste.id);

    if (index === -1) return false;

    allPastes[index] = paste;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPastes));
    if (paste.userId) {
      triggerStatsUpdate(paste.userId);
    }
    return true;
  } catch (error) {
    console.error("Error updating paste:", error);
    return false;
  }
};

export const verifyPastePassword = (id: string, password: string): boolean => {
  const paste = getPasteById(id);

  if (!paste || !paste.password) return false;

  return paste.password === password;
};

export const incrementPasteViews = (id: string): boolean => {
  try {
    const allPastes = getAllPastes();
    const pasteIndex = allPastes.findIndex(p => p.id === id);

    if (pasteIndex === -1) return false;

    allPastes[pasteIndex].views = (allPastes[pasteIndex].views || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPastes));

    return true;
  } catch (error) {
    console.error("Error incrementing paste views:", error);
    return false;
  }
};

export const clearExpiredPastes = (): number => {
  const allPastes = getAllPastes();
  const currentTime = Date.now();

  const validPastes = allPastes.filter(paste =>
    !paste.expires || paste.expires > currentTime
  );

  const removedCount = allPastes.length - validPastes.length;

  if (removedCount > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPastes));
  }

  return removedCount;
};