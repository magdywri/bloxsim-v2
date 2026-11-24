import express from 'express';

const REQUEST_TIMEOUT_MS = 4500;
const cache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function toProxiedAvatarUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('/avatars/') || rawUrl.startsWith('/api/roblox/avatar')) return rawUrl;
  return `/api/roblox/avatar?u=${encodeURIComponent(rawUrl)}`;
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithFallback(robloxUrl: string, roproxyUrl: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetchWithTimeout(robloxUrl, init, 2500);
    if (res.ok) return res;
  } catch {}
  try {
    const res2 = await fetchWithTimeout(roproxyUrl, init, REQUEST_TIMEOUT_MS);
    if (res2.ok) return res2;
  } catch {}
  return null;
}

async function fetchAvatarMap(userIds: number[]): Promise<Record<number, string>> {
  const uniqueIds = Array.from(new Set(userIds.filter((id) => Number.isFinite(id) && id > 0)));
  if (uniqueIds.length === 0) return {};

  const result: Record<number, string> = {};
  const missing: number[] = [];

  for (const id of uniqueIds) {
    const cached = getCached<string>(`avatar:${id}`);
    if (cached !== null) result[id] = cached;
    else missing.push(id);
  }

  if (missing.length === 0) return result;

  try {
    const chunk = missing.slice(0, 50);
    const qs = `userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`;
    const resp = await fetchJsonWithFallback(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?${qs}`,
      `https://thumbnails.roproxy.com/v1/users/avatar-headshot?${qs}`
    );
    if (resp) {
      const payload = (await resp.json()) as { data?: Array<{ targetId: number; state: string; imageUrl?: string }> };
      for (const item of payload.data ?? []) {
        if (item.imageUrl && item.state === 'Completed') {
          const proxied = toProxiedAvatarUrl(item.imageUrl);
          if (proxied) {
            result[item.targetId] = proxied;
            setCached(`avatar:${item.targetId}`, proxied);
          }
        }
      }
    }
  } catch {}

  return result;
}

const app = express();
app.use(express.json());

app.get('/api/roblox/avatar', async (req, res) => {
  const rawUrl = String(req.query.u ?? '').trim();
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    res.status(400).end();
    return;
  }
  if (parsed.protocol !== 'https:' || (!parsed.hostname.endsWith('.rbxcdn.com') && parsed.hostname !== 'rbxcdn.com')) {
    res.status(403).end();
    return;
  }
  try {
    const upstream = await fetch(rawUrl);
    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.status(504).end();
  }
});

app.get('/api/roblox/user/:username', async (req, res) => {
  const rawUsername = String(req.params.username ?? '').trim().replace(/^@/, '');
  if (!rawUsername || rawUsername.length > 32 || !/^[A-Za-z0-9_]+$/.test(rawUsername)) {
    res.status(400).json({ error: 'Invalid Roblox username.' });
    return;
  }
  try {
    const lookupRes = await fetchJsonWithFallback(
      'https://users.roblox.com/v1/usernames/users',
      'https://users.roproxy.com/v1/usernames/users',
      { method: 'POST', body: JSON.stringify({ usernames: [rawUsername], excludeBannedUsers: false }) }
    );
    if (!lookupRes?.ok) {
      res.status(502).json({ error: 'Roblox user service unavailable.' });
      return;
    }
    const lookupJson = (await lookupRes.json()) as { data?: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> };
    const match = lookupJson.data?.[0];
    if (!match) {
      res.status(404).json({ error: `No public Roblox account found for "@${rawUsername}".` });
      return;
    }
    const [profileRes, followersRes, followingsRes, friendsRes, avatars] = await Promise.all([
      fetchJsonWithFallback(`https://users.roblox.com/v1/users/${match.id}`, `https://users.roproxy.com/v1/users/${match.id}`),
      fetchJsonWithFallback(`https://friends.roblox.com/v1/users/${match.id}/followers/count`, `https://friends.roproxy.com/v1/users/${match.id}/followers/count`).catch(() => null),
      fetchJsonWithFallback(`https://friends.roblox.com/v1/users/${match.id}/followings/count`, `https://friends.roproxy.com/v1/users/${match.id}/followings/count`).catch(() => null),
      fetchJsonWithFallback(`https://friends.roblox.com/v1/users/${match.id}/friends/count`, `https://friends.roproxy.com/v1/users/${match.id}/friends/count`).catch(() => null),
      fetchAvatarMap([match.id]),
    ]);
    const profile = profileRes?.ok ? await profileRes.json() : match;
    const followers = followersRes?.ok ? (await followersRes.json()).count ?? null : null;
    const followings = followingsRes?.ok ? (await followingsRes.json()).count ?? null : null;
    const friends = friendsRes?.ok ? (await friendsRes.json()).count ?? null : null;

    res.json({
      user: {
        id: profile.id,
        name: profile.name,
        displayName: profile.displayName,
        description: profile.description ?? '',
        created: profile.created ?? null,
        isBanned: Boolean(profile.isBanned),
        hasVerifiedBadge: Boolean(profile.hasVerifiedBadge),
        avatarUrl: avatars[profile.id] ?? null,
        followersCount: followers,
        followingsCount: followings,
        friendsCount: friends,
      },
    });
  } catch {
    res.status(502).json({ error: 'Unable to reach Roblox services.' });
  }
});

app.get('/api/roblox/search', async (req, res) => {
  const query = String(req.query.q ?? '').trim().replace(/^@/, '');
  if (!query || query.length < 2) {
    res.status(400).json({ error: 'Enter at least 2 characters.' });
    return;
  }
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) {
    res.json({ users: cached });
    return;
  }
  try {
    const isExact = /^[A-Za-z0-9_]{3,20}$/.test(query);
    const [searchRes, exactRes] = await Promise.all([
      fetchJsonWithFallback(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=25`,
        `https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=25`
      ),
      isExact
        ? fetchJsonWithFallback(
            'https://users.roblox.com/v1/usernames/users',
            'https://users.roproxy.com/v1/usernames/users',
            { method: 'POST', body: JSON.stringify({ usernames: [query], excludeBannedUsers: false }) }
          )
        : Promise.resolve(null),
    ]);

    const searchUsers = searchRes?.ok ? (await searchRes.json()).data ?? [] : [];
    const exactUsers = exactRes?.ok ? (await exactRes.json()).data ?? [] : [];
    const seen = new Set<number>();
    const rawUsers: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> = [];
    for (const u of [...exactUsers, ...searchUsers]) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        rawUsers.push(u);
      }
    }
    const avatars = await fetchAvatarMap(rawUsers.map((u) => u.id));
    const enriched = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      displayName: u.displayName,
      hasVerifiedBadge: Boolean(u.hasVerifiedBadge),
      avatarUrl: avatars[u.id] ?? null,
    }));
    setCached(cacheKey, enriched);
    res.json({ users: enriched });
  } catch {
    res.status(502).json({ error: 'Unable to search Roblox accounts right now.' });
  }
});

app.post('/api/roblox/resolve-usernames', async (req, res) => {
  const usernames: string[] = Array.isArray(req.body?.usernames)
    ? req.body.usernames.map((u: unknown) => String(u ?? '').trim().replace(/^@/, '')).filter((u: string) => /^[A-Za-z0-9_]{2,20}$/.test(u)).slice(0, 20)
    : [];
  if (usernames.length === 0) {
    res.json({ users: [] });
    return;
  }
  try {
    const lookupRes = await fetchJsonWithFallback(
      'https://users.roblox.com/v1/usernames/users',
      'https://users.roproxy.com/v1/usernames/users',
      { method: 'POST', body: JSON.stringify({ usernames, excludeBannedUsers: false }) }
    );
    if (!lookupRes?.ok) {
      res.json({ users: [] });
      return;
    }
    const items = (await lookupRes.json()).data ?? [];
    const avatars = await fetchAvatarMap(items.map((i: { id: number }) => i.id));
    res.json({
      users: items.map((i: { id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }) => ({
        id: i.id,
        name: i.name,
        displayName: i.displayName,
        hasVerifiedBadge: Boolean(i.hasVerifiedBadge),
        avatarUrl: avatars[i.id] ?? null,
      })),
    });
  } catch {
    res.json({ users: [] });
  }
});

export default app;
