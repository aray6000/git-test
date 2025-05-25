"use client";

import { nanoid } from 'nanoid';
import type { CreatePasteInput, ExpirationOption, Paste } from './types';
import { addDays, addHours, addMinutes, addMonths, addWeeks } from 'date-fns';

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
  // Generate a unique ID
  const id = nanoid(10);

  // Calculate expiration timestamp
  const expires = getExpirationTimestamp(input.expiration);

  // Create the paste object
  const paste: Paste = {
    id,
    title: input.title || 'Untitled Paste',
    content: input.content,
    language: input.language,
    created: Date.now(),
    expires,
    password: input.password || null,
    burnAfterReading: input.burnAfterReading || false,
    views: 0,
  };

  // Store in localStorage
  const existingData = getAllPastes();
  const updatedData = [paste, ...existingData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

  return paste;
};

export const getPasteById = (id: string): Paste | null => {
  try {
    const allPastes = getAllPastes();
    const paste = allPastes.find(p => p.id === id);

    if (!paste) return null;

    // Check if paste has expired
    if (paste.expires && paste.expires < Date.now()) {
      // Expired, delete it and return null
      deletePaste(id);
      return null;
    }

    // Handle burn after reading
    if (paste.burnAfterReading) {
      // Increment views
      paste.views += 1;

      // If this is the second view, delete the paste
      if (paste.views > 1) {
        deletePaste(id);
        return null;
      }

      // Update the paste with the view count
      updatePaste(paste);
    }

    return paste;
  } catch (error) {
    console.error("Error getting paste:", error);
    return null;
  }
};

export const getAllPastes = (): Paste[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const pastes: Paste[] = JSON.parse(data);

    // Filter out expired pastes
    const currentTime = Date.now();
    const validPastes = pastes.filter(paste =>
      !paste.expires || paste.expires > currentTime
    );

    // If we removed some pastes, update storage
    if (validPastes.length < pastes.length) {
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
