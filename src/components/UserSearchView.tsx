import React, { useEffect, useState } from 'react';
import {
  Search,
  Loader2,
  Calendar,
  UserPlus,
  Send,
  AlertCircle,
  Users,
  Hash,
  Check,
} from 'lucide-react';
import type { FriendEntry, RobloxPublicUser } from '../types/simulator';
import { fetchPublicRobloxUser } from '../services/robloxApi';
import { formatJoinYear, formatReadableDate, makeFallbackAvatar } from '../utils/simulatorLogic';
import { VerifiedBadge } from './Icons';

interface UserSearchViewProps {
  initialQuery: string;
  friends: FriendEntry[];
  onSendToUser: (target: FriendEntry) => void;
  onAddFriend: (friend: FriendEntry) => void;
}

const EXAMPLE_USERNAMES = ['Roblox', 'Builderman', 'Stickmasterluke', 'Shedletsky'];

export function UserSearchView({
  initialQuery,
  friends,
  onSendToUser,
  onAddFriend,
}: UserSearchViewProps) {
  const [usernameInput, setUsernameInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RobloxPublicUser | null>(null);

  const runLookup = async (name: string) => {
    const trimmed = name.trim().replace(/^@/, '');
    if (!trimmed) {
      setError('Please enter a Roblox username to search.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    const res = await fetchPublicRobloxUser(trimmed, { full: true });
    setLoading(false);

    if (!res.user) {
      setResult(null);
      setError(res.error || `No public Roblox account found for "@${trimmed}".`);
      return;
    }
    setResult(res.user);
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      setUsernameInput(initialQuery);
      void runLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runLookup(usernameInput);
  };

  const isAlreadyFriend = result
    ? friends.some((f) => f.username.toLowerCase() === result.name.toLowerCase())
    : false;

  const toFriendEntry = (u: RobloxPublicUser): FriendEntry => ({
    id: `friend-${u.id}`,
    robloxId: u.id,
    displayName: u.displayName,
    username: u.name,
    avatarUrl: u.avatarUrl || makeFallbackAvatar(u.name),
    verified: u.hasVerifiedBadge,
    joinedYear: formatJoinYear(u.created) ?? undefined,
    connectedLabel: 'Public Roblox Account',
  });

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-[#111315] dark:text-white">
          Roblox User Search
        </h1>
        <p className="text-[13px] text-[#606264] dark:text-gray-400">
          Look up publicly accessible Roblox user profiles, avatars, and account creation dates.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter exact Roblox username (e.g. Roblox)"
              aria-label="Roblox username lookup"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F5F7] dark:bg-[#15171A] border border-transparent focus:border-[#0066FF] focus:bg-white dark:focus:bg-[#191B1F] text-[14px] text-[#111315] dark:text-white outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search User</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[#606264] dark:text-gray-400 font-medium">Try public accounts:</span>
          {EXAMPLE_USERNAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setUsernameInput(name);
                void runLookup(name);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#272A2F] hover:bg-[#E4E6EA] dark:hover:bg-[#32363D] font-semibold text-[#111315] dark:text-gray-200 transition-colors cursor-pointer"
            >
              @{name}
            </button>
          ))}
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="p-10 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          <p className="text-[13.5px] font-medium text-[#606264] dark:text-gray-400">
            Fetching public Roblox account &amp; avatar...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-bold">Account Lookup Failed</p>
            <p className="text-[13px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Public User Result Card */}
      {!loading && result && (
        <div
          data-testid="user-search-result"
          className="p-6 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={result.avatarUrl || makeFallbackAvatar(result.name)}
                alt={`${result.displayName} avatar`}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallbackApplied) {
                    img.dataset.fallbackApplied = '1';
                    img.src = makeFallbackAvatar(result.name);
                  }
                }}
                className="w-20 h-20 rounded-full object-cover bg-gray-100 dark:bg-[#2A2D32] border border-black/10 dark:border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[22px] font-black text-[#111315] dark:text-white truncate">
                    {result.displayName}
                  </h2>
                  {result.hasVerifiedBadge && <VerifiedBadge className="w-5 h-5 shrink-0" />}
                </div>
                <p className="text-[14px] font-semibold text-[#606264] dark:text-gray-400">
                  @{result.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-[#52555A] dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> ID: {result.id}
                  </span>
                  {result.created && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Joined {formatReadableDate(result.created)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSendToUser(toFriendEntry(result))}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Robux
              </button>

              <button
                type="button"
                disabled={isAlreadyFriend}
                onClick={() => onAddFriend(toFriendEntry(result))}
                className="px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-[#2A2D32] hover:bg-[#E4E6EA] dark:hover:bg-[#34383E] disabled:opacity-65 text-[#111315] dark:text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isAlreadyFriend ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isAlreadyFriend ? 'In Friends' : 'Add Friend'}
              </button>
            </div>
          </div>

          {/* Public Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#23252A] border border-[#EAECEF] dark:border-[#2F3238]">
              <p className="text-[11px] font-semibold uppercase text-[#606264] dark:text-gray-400">
                Friends
              </p>
              <p className="text-[17px] font-extrabold text-[#111315] dark:text-white mt-0.5 tabular-nums flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0066FF]" />
                {typeof result.friendsCount === 'number'
                  ? result.friendsCount.toLocaleString('en-US')
                  : 'Unavailable'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#23252A] border border-[#EAECEF] dark:border-[#2F3238]">
              <p className="text-[11px] font-semibold uppercase text-[#606264] dark:text-gray-400">
                Followers
              </p>
              <p className="text-[17px] font-extrabold text-[#111315] dark:text-white mt-0.5 tabular-nums">
                {typeof result.followersCount === 'number'
                  ? result.followersCount.toLocaleString('en-US')
                  : 'Unavailable'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#23252A] border border-[#EAECEF] dark:border-[#2F3238]">
              <p className="text-[11px] font-semibold uppercase text-[#606264] dark:text-gray-400">
                Following
              </p>
              <p className="text-[17px] font-extrabold text-[#111315] dark:text-white mt-0.5 tabular-nums">
                {typeof result.followingsCount === 'number'
                  ? result.followingsCount.toLocaleString('en-US')
                  : 'Unavailable'}
              </p>
            </div>
          </div>

          {/* Public Description */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#23252A] border border-[#EAECEF] dark:border-[#2F3238]">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#606264] dark:text-gray-400 mb-1">
              Public Bio / Description
            </p>
            <p className="text-[13px] text-[#393B3D] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {result.description?.trim() ? result.description : 'No public bio provided on this account.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
