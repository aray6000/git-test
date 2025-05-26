export type ExpirationOption =
  | 'never'
  | '10m'
  | '1h'
  | '1d'
  | '1w'
  | '1m'
  | 'burn';

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
}

export interface CreatePasteInput {
  title: string;
  content: string;
  language: string;
  expiration: ExpirationOption;
  password?: string;
  burnAfterReading: boolean;
}

export type PasteVisibility = 'public' | 'unlisted' | 'private';

export interface PasteWithVisibility extends Paste {
  visibility: PasteVisibility;
}
