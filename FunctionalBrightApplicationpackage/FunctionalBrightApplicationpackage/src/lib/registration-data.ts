
// Registration data management
export interface RegistrationData {
  id: string;
  email: string;
  username: string;
  password: string;
  registeredAt: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    avatar: string;
  };
}

export interface RegistrationDatabase {
  registrations: RegistrationData[];
  totalRegistrations: number;
  lastUpdated: string;
}

const REG_DB_KEY = 'crazy-paste-registration-database';

// Initialize registration database
export function initializeRegistrationDatabase(): RegistrationDatabase {
  if (typeof window === 'undefined') {
    return { registrations: [], totalRegistrations: 0, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(REG_DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const initialDb: RegistrationDatabase = {
    registrations: [],
    totalRegistrations: 0,
    lastUpdated: new Date().toISOString()
  };

  localStorage.setItem(REG_DB_KEY, JSON.stringify(initialDb));
  return initialDb;
}

// Get registration database
export function getRegistrationDatabase(): RegistrationDatabase {
  if (typeof window === 'undefined') {
    return { registrations: [], totalRegistrations: 0, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(REG_DB_KEY);
  return stored ? JSON.parse(stored) : initializeRegistrationDatabase();
}

// Save registration database
export function saveRegistrationDatabase(database: RegistrationDatabase): void {
  if (typeof window === 'undefined') return;

  database.lastUpdated = new Date().toISOString();
  database.totalRegistrations = database.registrations.length;
  localStorage.setItem(REG_DB_KEY, JSON.stringify(database));
}

// Add registration to database
export function addRegistrationToDatabase(registration: RegistrationData): boolean {
  try {
    const database = getRegistrationDatabase();

    // Check if registration already exists
    const existing = database.registrations.find(r => r.email === registration.email || r.id === registration.id);
    if (existing) {
      return false;
    }

    database.registrations.push(registration);
    saveRegistrationDatabase(database);
    return true;
  } catch (error) {
    console.error('Error adding registration to database:', error);
    return false;
  }
}

// Find registration by email
export function findRegistrationByEmail(email: string): RegistrationData | null {
  const database = getRegistrationDatabase();
  return database.registrations.find(r => r.email.toLowerCase() === email.toLowerCase()) || null;
}

// Find registration by username
export function findRegistrationByUsername(username: string): RegistrationData | null {
  const database = getRegistrationDatabase();
  return database.registrations.find(r => r.username.toLowerCase() === username.toLowerCase()) || null;
}

// Find registration by ID
export function findRegistrationById(id: string): RegistrationData | null {
  const database = getRegistrationDatabase();
  return database.registrations.find(r => r.id === id) || null;
}

// Migrate registration to user database
export function migrateRegistrationToUserDatabase(registrationId: string): boolean {
  try {
    const registration = findRegistrationById(registrationId);
    if (!registration) {
      console.error('Registration not found:', registrationId);
      return false;
    }

    // Import the user database functions
    const { addUserToDatabase } = require('./auth');

    // Create user object from registration data
    const newUser = {
      id: registration.id,
      email: registration.email,
      password: registration.password,
      username: registration.username,
      role: 'Crazy',
      createdAt: registration.registeredAt,
      updatedAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true,
      profile: {
        firstName: registration.profile.firstName || '',
        lastName: registration.profile.lastName || '',
        avatar: registration.profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${registration.email}`,
        bio: registration.profile.bio || 'Welcome to the Crazy community! 🤪',
        location: '',
        website: '',
        github: ''
      }
    };

    // Add to main user database
    const added = addUserToDatabase(newUser);
    if (added) {
      console.log('Successfully migrated registration to user database:', registration.username);
      
      // Remove from registration database after successful migration
      const regDatabase = getRegistrationDatabase();
      regDatabase.registrations = regDatabase.registrations.filter(r => r.id !== registrationId);
      saveRegistrationDatabase(regDatabase);
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error migrating registration to user database:', error);
    return false;
  }
}

// Update registration verification status
export function updateRegistrationVerification(registrationId: string, status: 'verified' | 'failed'): boolean {
  try {
    const database = getRegistrationDatabase();
    const regIndex = database.registrations.findIndex(r => r.id === registrationId);

    if (regIndex === -1) {
      return false;
    }

    database.registrations[regIndex].verificationStatus = status;
    saveRegistrationDatabase(database);
    return true;
  } catch (error) {
    console.error('Error updating registration verification:', error);
    return false;
  }
}

// Clean up old registrations
export function cleanupOldRegistrations(daysOld: number = 30): number {
  try {
    const database = getRegistrationDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = database.registrations.length;
    database.registrations = database.registrations.filter(reg => {
      const regDate = new Date(reg.registeredAt);
      return regDate > cutoffDate || reg.verificationStatus === 'verified';
    });

    const cleanedCount = initialCount - database.registrations.length;
    if (cleanedCount > 0) {
      saveRegistrationDatabase(database);
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up old registrations:', error);
    return 0;
  }
}
