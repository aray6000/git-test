export type ExpirationOption = 'never' | '10m' | '1h' | '1d' | '1w' | '1m' | 'burn';

export interface Paste {
  id: string;
  title: string;
  content: string;
  language: string;
  created: number; // timestamp
  expires: number | null; // timestamp or null if never
  password: string | null;
  burnAfterReading: boolean;
  views: number;
  userId?: string; // ID of the user who created the paste
}

export interface CreatePasteInput {
  title: string;
  content: string;
  language: string;
  expiration: ExpirationOption;
  password?: string;
  burnAfterReading?: boolean;
}

export type PasteVisibility = 'public' | 'unlisted' | 'private';

export interface PasteWithVisibility extends Paste {
  visibility: PasteVisibility;
}

export type UserRole = 'Guest' | 'User' | 'Crazy' | 'Vip+' | 'Vip' | 'Owner' | 'Admin' | 'Mod';

export interface RoleFeatures {
  role: UserRole;
  color: string;
  icon: string;
  features: {
    maxPasteSize: number; // in KB
    maxPastesPerDay: number;
    canSetCustomExpiration: boolean;
    canCreatePrivatePastes: boolean;
    canModifyOthersPastes: boolean;
    canDeleteOthersPastes: boolean;
    canBanUsers: boolean;
    canPromoteUsers: boolean;
    canAccessAdminPanel: boolean;
    prioritySupport: boolean;
    customBadge: boolean;
    unlimitedStorage: boolean;
  };
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Owner': 6,
  'Admin': 5,
  'Mod': 4,
  'Vip+': 3,
  'Vip': 2,
  'Crazy': 1,
  'User': 0,
  'Guest': -1
};

export const ROLE_FEATURES: Record<UserRole, RoleFeatures> = {
  'Guest': {
    role: 'Guest',
    color: '#888888',
    icon: '👤',
    features: {
      maxPasteSize: 256, // 256KB
      maxPastesPerDay: 0,
      canSetCustomExpiration: false,
      canCreatePrivatePastes: false,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: false,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: false,
      customBadge: false,
      unlimitedStorage: false,
    }
  },
  'User': {
    role: 'User',
    color: '#888888',
    icon: '👤',
    features: {
      maxPasteSize: 512, // 512KB
      maxPastesPerDay: 50,
      canSetCustomExpiration: false,
      canCreatePrivatePastes: false,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: false,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: false,
      customBadge: false,
      unlimitedStorage: false,
    }
  },
  'Crazy': {
    role: 'Crazy',
    color: '#ff6b35',
    icon: '🤪',
    features: {
      maxPasteSize: 768, // 768KB
      maxPastesPerDay: 75,
      canSetCustomExpiration: false,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: false,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: false,
      customBadge: true,
      unlimitedStorage: false,
    }
  },
  'Vip': {
    role: 'Vip',
    color: '#00aaff',
    icon: '💎',
    features: {
      maxPasteSize: 1024, // 1MB
      maxPastesPerDay: 100,
      canSetCustomExpiration: true,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: false,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: false,
      customBadge: true,
      unlimitedStorage: false,
    }
  },
  'Vip+': {
    role: 'Vip+',
    color: '#ffaa00',
    icon: '⭐',
    features: {
      maxPasteSize: 2048, // 2MB
      maxPastesPerDay: 200,
      canSetCustomExpiration: true,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: false,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: true,
      customBadge: true,
      unlimitedStorage: false,
    }
  },
  'Mod': {
    role: 'Mod',
    color: '#00ff88',
    icon: '🛡️',
    features: {
      maxPasteSize: 5120, // 5MB
      maxPastesPerDay: 500,
      canSetCustomExpiration: true,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: false,
      canDeleteOthersPastes: true,
      canBanUsers: false,
      canPromoteUsers: false,
      canAccessAdminPanel: false,
      prioritySupport: true,
      customBadge: true,
      unlimitedStorage: false,
    }
  },
  'Admin': {
    role: 'Admin',
    color: '#ff3366',
    icon: '⚡',
    features: {
      maxPasteSize: 10240, // 10MB
      maxPastesPerDay: -1, // unlimited
      canSetCustomExpiration: true,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: true,
      canDeleteOthersPastes: true,
      canBanUsers: true,
      canPromoteUsers: false,
      canAccessAdminPanel: true,
      prioritySupport: true,
      customBadge: true,
      unlimitedStorage: true,
    }
  },
  'Owner': {
    role: 'Owner',
    color: '#ff0066',
    icon: '👑',
    features: {
      maxPasteSize: -1, // unlimited
      maxPastesPerDay: -1, // unlimited
      canSetCustomExpiration: true,
      canCreatePrivatePastes: true,
      canModifyOthersPastes: true,
      canDeleteOthersPastes: true,
      canBanUsers: true,
      canPromoteUsers: true,
      canAccessAdminPanel: true,
      prioritySupport: true,
      customBadge: true,
      unlimitedStorage: true,
    }
  }
};

export interface UserStats {
  pastes: number;
  views: number;
  upvotes: number;
  downvotes: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  joinDate: string;
  lastActive: string;
  stats: UserStats;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  discord?: string;
  telegram?: string;
  twitter?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
  };
}