export type ThemeMode = 'light' | 'dark';

export type NotificationStyle = 'toast' | 'modal';

export type ActivePage =
  | 'robux-shop'
  | 'dashboard'
  | 'user-search'
  | 'activity'
  | 'friends'
  | 'avatar'
  | 'messages'
  | 'inventory'
  | 'auto-gift'
  | 'gift-cards'
  | 'disclaimer';

export interface UserProfile {
  displayName: string;
  username: string;
  verified: boolean;
  avatarUrl: string;
  balance: number;
  joinedDate: string;
  bio: string;
}

export interface FriendEntry {
  id: string;
  robloxId?: number;
  displayName: string;
  username: string;
  avatarUrl: string;
  verified?: boolean;
  joinedYear?: string;
  connectedLabel?: string;
}

export type TransactionType = 'send' | 'purchase' | 'balance-set' | 'gift-card';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  targetName: string;
  targetUsername?: string;
  targetAvatarUrl?: string;
  packageLabel?: string;
  priceUsd?: string;
  status: 'Simulated' | 'Completed (Sim)';
  createdAt: string;
}

export interface RobuxPackage {
  id: string;
  totalRobux: number;
  originalRobux: number;
  bonusRobux: number;
  priceUsd: string;
  highlight?: boolean;
  forYouTag?: boolean;
  group: 'featured' | 'standard';
}

export interface RobloxPublicUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  avatarUrl: string | null;
  created?: string | null;
  description?: string;
  isBanned?: boolean;
  followersCount?: number | null;
  followingsCount?: number | null;
  friendsCount?: number | null;
}

export interface FeedbackSubmission {
  id: string;
  kind: 'bug' | 'feature';
  message: string;
  createdAt: string;
}

export interface AutoGiftConfig {
  hotkey: string;
  usernameInputMode: 'type' | 'paste';
  homeWaitSec: number;
  modalOpenWaitSec: number;
  typingSpeedWpm: number;
  afterResultWaitSec: number;
  afterSelectWaitSec: number;
  beforeNextWaitSec: number;
  beforeSendWaitSec: number;
  successMinSec: number;
  successMaxSec: number;
  minRobux: number;
  maxRobux: number;
  cycleDelaySec: number;
  customUsernames: string[];
}

export interface AutoGiftLogEntry {
  id: string;
  timestamp: string;
  message: string;
  kind: 'info' | 'success' | 'warn';
}

export interface SimulatorSettings {
  theme: ThemeMode;
  notificationStyle: NotificationStyle;
  showFriendsInSend: boolean;
  showFriendsInSidebar: boolean;
  robloxPlusSubscribed: boolean;
  soundEnabled: boolean;
  autoGift: AutoGiftConfig;
}

export interface SimulatorState {
  profile: UserProfile;
  friends: FriendEntry[];
  transactions: Transaction[];
  ownedBonusItems: string[];
  settings: SimulatorSettings;
  feedbacks: FeedbackSubmission[];
}
