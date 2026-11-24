import type { RobloxPublicUser } from '../types/simulator';

const searchCache = new Map<string, RobloxPublicUser[]>();
const userCache = new Map<string, RobloxPublicUser>();

export async function searchPublicRobloxUsers(query: string): Promise<{
  users: RobloxPublicUser[];
  error?: string;
}> {
  const trimmed = query.trim().replace(/^@/, '');
  if (trimmed.length < 2) {
    return { users: [], error: 'Enter at least 2 characters to search.' };
  }

  const key = trimmed.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) {
    return { users: cached };
  }

  try {
    const res = await fetch(`/api/roblox/search?q=${encodeURIComponent(trimmed)}`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json()) as { users?: RobloxPublicUser[]; error?: string };
    if (!res.ok) {
      return { users: [], error: data.error || 'Search failed.' };
    }
    const users = data.users ?? [];
    if (users.length > 0) {
      searchCache.set(key, users);
    }
    return { users };
  } catch {
    return { users: [], error: 'Network error while searching public Roblox users.' };
  }
}

export async function fetchPublicRobloxUser(
  username: string,
  options?: { full?: boolean }
): Promise<{
  user: RobloxPublicUser | null;
  error?: string;
}> {
  const trimmed = username.trim().replace(/^@/, '');
  if (!trimmed) {
    return { user: null, error: 'Please enter a username.' };
  }

  const key = trimmed.toLowerCase();
  if (!options?.full) {
    const cached = userCache.get(key);
    if (cached) return { user: cached };
  }

  try {
    const suffix = options?.full ? '?full=1' : '';
    const res = await fetch(`/api/roblox/user/${encodeURIComponent(trimmed)}${suffix}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { user?: RobloxPublicUser; error?: string };
    if (!res.ok || !data.user) {
      return { user: null, error: data.error || `No Roblox user found for "@${trimmed}".` };
    }
    userCache.set(key, data.user);
    return { user: data.user };
  } catch {
    return { user: null, error: 'Network error while fetching public Roblox user.' };
  }
}

export async function resolvePublicRobloxUsernames(usernames: string[]): Promise<RobloxPublicUser[]> {
  if (usernames.length === 0) return [];
  try {
    const res = await fetch('/api/roblox/resolve-usernames', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { users?: RobloxPublicUser[] };
    return data.users ?? [];
  } catch {
    return [];
  }
}
