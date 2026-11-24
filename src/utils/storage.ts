import type { SimulatorState } from '../types/simulator';
import {
  PRESET_AVATARS,
  createInitialState,
  makeFallbackAvatar,
  sanitizeAutoGiftConfig,
} from './simulatorLogic';

const STORAGE_KEY = 'bloxsim_unofficial_simulator_v1';
const AUTO_GIFT_PROGRESS_KEY = 'bloxsim_autogift_progress_v1';

function upgradeLegacyAvatarUrl(url: string | undefined, username?: string): string | undefined {
  if (!url) return url;
  if (url.startsWith('/api/roblox/avatar?u=')) {
    try {
      const u = new URL(`http://local${url}`).searchParams.get('u');
      if (u) return u;
    } catch {
      return makeFallbackAvatar(username);
    }
  }
  if (url === '/avatars/1.png') {
    return PRESET_AVATARS[0].url;
  }
  if (url.startsWith('/avatars/')) {
    return makeFallbackAvatar(username);
  }
  return url;
}

export function loadSimulatorState(): SimulatorState {
  const fallback = createInitialState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SimulatorState>;
    const rawFriends = Array.isArray(parsed.friends) ? parsed.friends : fallback.friends;
    const upgradedFriends = rawFriends.map((f) => ({
      ...f,
      avatarUrl: upgradeLegacyAvatarUrl(f.avatarUrl, f.username) || f.avatarUrl,
    }));
    const rawTransactions = Array.isArray(parsed.transactions)
      ? parsed.transactions
      : fallback.transactions;
    const upgradedTransactions = rawTransactions.map((tx) => ({
      ...tx,
      targetAvatarUrl: upgradeLegacyAvatarUrl(tx.targetAvatarUrl, tx.targetUsername),
    }));

    return {
      profile: {
        ...fallback.profile,
        ...(parsed.profile ?? {}),
        avatarUrl:
          upgradeLegacyAvatarUrl(parsed.profile?.avatarUrl, parsed.profile?.username) ||
          fallback.profile.avatarUrl,
      },
      friends: upgradedFriends,
      transactions: upgradedTransactions,
      ownedBonusItems: Array.isArray(parsed.ownedBonusItems)
        ? parsed.ownedBonusItems
        : fallback.ownedBonusItems,
      settings: {
        ...fallback.settings,
        ...(parsed.settings ?? {}),
        autoGift: sanitizeAutoGiftConfig(parsed.settings?.autoGift),
      },
      feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : fallback.feedbacks,
    };
  } catch {
    return fallback;
  }
}

export function saveSimulatorState(state: SimulatorState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadAutoGiftProgress(): {
  recentlyGiftedUsernames: string[];
  giftedCount: number;
} {
  if (typeof window === 'undefined') {
    return { recentlyGiftedUsernames: [], giftedCount: 0 };
  }
  try {
    const raw = window.localStorage.getItem(AUTO_GIFT_PROGRESS_KEY);
    if (!raw) return { recentlyGiftedUsernames: [], giftedCount: 0 };
    const parsed = JSON.parse(raw) as {
      recentlyGiftedUsernames?: unknown;
      giftedCount?: unknown;
    };
    const list = Array.isArray(parsed.recentlyGiftedUsernames)
      ? parsed.recentlyGiftedUsernames.filter((u): u is string => typeof u === 'string' && u.length > 0)
      : [];
    const count =
      typeof parsed.giftedCount === 'number' && Number.isFinite(parsed.giftedCount)
        ? Math.max(0, Math.floor(parsed.giftedCount))
        : list.length;
    return { recentlyGiftedUsernames: list, giftedCount: count };
  } catch {
    return { recentlyGiftedUsernames: [], giftedCount: 0 };
  }
}

export function saveAutoGiftProgress(
  recentlyGiftedUsernames: string[],
  giftedCount: number
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      AUTO_GIFT_PROGRESS_KEY,
      JSON.stringify({
        recentlyGiftedUsernames,
        giftedCount: Math.max(0, Math.floor(giftedCount)),
      })
    );
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetAutoGiftProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTO_GIFT_PROGRESS_KEY);
  } catch {
    // Ignore
  }
}

export function clearSimulatorStorage(): SimulatorState {
  const fresh = createInitialState();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(AUTO_GIFT_PROGRESS_KEY);
    } catch {
      // Ignore
    }
  }
  return fresh;
}
