
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  isBranded: boolean;
  status: 'draft' | 'scheduled' | 'posted';
  aspectRatio?: string;
  originalRefs?: string[];
}

export interface BrandingConfig {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  fontFamily: string;
  fontSize: number;
}

export type SubscriptionLevel = 'none' | 'basic' | 'pro';

export interface User {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  isDriveConnected: boolean;
}

export interface CreditState {
  freeGenerationsRemaining: number;
  subscriptionLevel: SubscriptionLevel;
  creditsRemaining: number;
  apiKeySet: boolean;
}

export interface BlotatoAccount {
  id: string; // The Blotato/Platform User ID
  platform: 'instagram' | 'tiktok' | 'facebook' | 'threads' | 'youtube' | 'twitter' | 'bluesky';
  name: string;
  handle: string;
}

export interface AppConfig {
  stripePublicKey: string;
  canvaApiKey: string;
  blotatoApiKey: string;
  blotatoAccounts: BlotatoAccount[];
}

export type BatchSize = 3 | 5 | 8 | 10;
export type AppTab = 'studio' | 'branding' | 'distribution' | 'landing' | 'features' | 'settings' | 'motion';

// Defined AIStudio interface to match the environment's expected type for window.aistudio
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Add global type definitions for window.google and window.aistudio to fix TS property access errors
declare global {
  interface Window {
    google: any;
    // Fix: Using any for aistudio to avoid "subsequent property declarations" error when it's already defined in the environment
    aistudio: any;
  }
}
