import React, { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Search, X, ArrowLeft, Calendar, Users } from 'lucide-react';
import type {
  AutoGiftConfig,
  FriendEntry,
  NotificationStyle,
  RobloxPublicUser,
} from '../types/simulator';
import {
  fetchPublicRobloxUser,
  searchPublicRobloxUsers,
} from '../services/robloxApi';
import {
  AUTO_GIFT_EXACT_USERNAMES,
  AUTO_GIFT_SEARCH_SEEDS,
  DEFAULT_AUTO_GIFT_CONFIG,
  filterUnverifiedUsers,
  formatJoinYear,
  formatRobux,
  makeFallbackAvatar,
  narrowAutoGiftResults,
  normalizeAsciiDigits,
  pickFirstMatchingAccount,
  pickNextExactUsername,
  pickNextRandomSeedQuery,
  pickRandomRobuxAmount,
  pickUniquePublicRecipient,
  typingDelayMsFromWpm,
  validateSendAmount,
} from '../utils/simulatorLogic';
import { RobloxPlusIcon, RobuxIcon, VerifiedBadge } from './Icons';
import { primeAudioContext } from '../utils/sounds';

interface RecipientTarget {
  displayName: string;
  username: string;
  avatarUrl: string;
  verified?: boolean;
  joinedYear?: string | null;
  connectedLabel?: string;
}

interface SendRobuxModalProps {
  open: boolean;
  balance: number;
  friends: FriendEntry[];
  showFriendsInSend: boolean;
  notificationStyle: NotificationStyle;
  initialRecipient?: FriendEntry | null;
  autoGiftActive?: boolean;
  autoGiftConfig?: AutoGiftConfig;
  profileUsername?: string;
  recentlyGiftedUsernames?: string[];
  onAutoGiftLog?: (message: string, kind?: 'info' | 'success' | 'warn') => void;
  onAutoGiftCycleComplete?: (sentUsername: string, amount: number) => void;
  onAutoGiftStopWithReason?: (reason: string) => void;
  onClose: () => void;
  onConfirmSend: (recipient: RecipientTarget, amount: number) => boolean;
}

type ModalStep = 'search' | 'amount' | 'confirm' | 'success';

const PRESET_AMOUNTS = [25, 50, 100, 200];

export function SendRobuxModal({
  open,
  balance,
  friends,
  showFriendsInSend,
  notificationStyle,
  initialRecipient,
  autoGiftActive = false,
  autoGiftConfig = DEFAULT_AUTO_GIFT_CONFIG,
  profileUsername,
  recentlyGiftedUsernames = [],
  onAutoGiftLog,
  onAutoGiftCycleComplete,
  onAutoGiftStopWithReason,
  onClose,
  onConfirmSend,
}: SendRobuxModalProps) {
  const [step, setStep] = useState<ModalStep>('search');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RobloxPublicUser[]>([]);
  const [recipient, setRecipient] = useState<RecipientTarget | null>(null);
  const [amountInput, setAmountInput] = useState<string>('100');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentAmount, setSentAmount] = useState<number>(0);
  const [botTyping, setBotTyping] = useState(false);

  // Refs for cancellation-safe Auto Gift cycle without restarting mid-cycle
  const balanceRef = useRef(balance);
  const friendsRef = useRef(friends);
  const recentlyGiftedRef = useRef(recentlyGiftedUsernames);
  const configRef = useRef(autoGiftConfig);
  const notificationStyleRef = useRef(notificationStyle);
  const profileUsernameRef = useRef(profileUsername);
  const usedSeedsRef = useRef<string[]>([]);
  const discoveredUsernamesRef = useRef<string[]>([]);
  const callbacksRef = useRef({
    onAutoGiftLog,
    onAutoGiftCycleComplete,
    onAutoGiftStopWithReason,
    onConfirmSend,
  });

  balanceRef.current = balance;
  friendsRef.current = friends;
  recentlyGiftedRef.current = recentlyGiftedUsernames;
  configRef.current = autoGiftConfig;
  notificationStyleRef.current = notificationStyle;
  profileUsernameRef.current = profileUsername;
  callbacksRef.current = {
    onAutoGiftLog,
    onAutoGiftCycleComplete,
    onAutoGiftStopWithReason,
    onConfirmSend,
  };

  // Reset state whenever modal opens
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSearching(false);
    setAmountInput('100');
    setAmountError(null);
    setIsSending(false);
    setSentAmount(0);
    setBotTyping(false);
    if (initialRecipient && !autoGiftActive) {
      setRecipient({
        displayName: initialRecipient.displayName,
        username: initialRecipient.username,
        avatarUrl: initialRecipient.avatarUrl,
        verified: initialRecipient.verified,
        joinedYear: initialRecipient.joinedYear ?? null,
        connectedLabel: initialRecipient.connectedLabel,
      });
      setStep('amount');
    } else {
      setRecipient(null);
      setStep('search');
    }
  }, [open, initialRecipient, autoGiftActive]);

  // Ensure no input keeps focus or blinking caret while Auto Gift is active
  useEffect(() => {
    if (!open || !autoGiftActive) return;
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) {
      document.activeElement.blur();
    }
  }, [open, autoGiftActive, step]);

  // Debounced live Roblox user search (manual mode only; Auto Gift drives search directly)
  useEffect(() => {
    if (!open || step !== 'search' || autoGiftActive) return;
    const trimmed = query.trim().replace(/^@+/, '');
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      const res = await searchPublicRobloxUsers(trimmed);
      if (cancelled) return;
      setSearching(false);
      if (res.error && res.users.length === 0) {
        setSearchError(res.error);
        setSearchResults([]);
      } else {
        setSearchResults(res.users);
        setSearchError(null);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, step, autoGiftActive]);

  // Automated Auto Gift cycle runner inside SendRobuxModal
  useEffect(() => {
    if (!open || !autoGiftActive) return;

    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, Math.max(0, ms));
      });

    const log = (msg: string, kind: 'info' | 'success' | 'warn' = 'info') => {
      if (!cancelled) callbacksRef.current.onAutoGiftLog?.(msg, kind);
    };

    const runCycle = async () => {
      const cfg = configRef.current;

      // Wait briefly after modal opens
      await sleep(cfg.modalOpenWaitSec * 1000);
      if (cancelled) return;

      const initialCheck = pickRandomRobuxAmount(cfg.minRobux, cfg.maxRobux, balanceRef.current);
      if (initialCheck === null) {
        callbacksRef.current.onAutoGiftStopWithReason?.(
          'Insufficient simulated Robux balance to continue Auto Gift.'
        );
        return;
      }

      const charDelay = typingDelayMsFromWpm(cfg.typingSpeedWpm);
      const usePasteMode = cfg.usernameInputMode === 'paste';
      let pickedRecipient: RecipientTarget | null = null;
      let publicCandidate: RobloxPublicUser | null = null;
      const attemptedUsernames: string[] = [];

      // Silently discover extra real unverified public Roblox usernames in the background once curated pool is mostly used
      if (
        recentlyGiftedRef.current.length >= Math.floor(AUTO_GIFT_EXACT_USERNAMES.length * 0.7) &&
        discoveredUsernamesRef.current.length < 40
      ) {
        const bgSeed = pickNextRandomSeedQuery(usedSeedsRef.current, AUTO_GIFT_SEARCH_SEEDS);
        usedSeedsRef.current = [bgSeed, ...usedSeedsRef.current].slice(0, 30);
        const bgRes = await searchPublicRobloxUsers(bgSeed);
        if (cancelled) return;
        const freshNames = bgRes.users
          .filter((u) => !u.hasVerifiedBadge && /^[A-Za-z0-9_]{3,20}$/.test(u.name))
          .map((u) => u.name);
        discoveredUsernamesRef.current = Array.from(
          new Set([...freshNames, ...discoveredUsernamesRef.current])
        ).slice(0, 80);
      }

      // Pick exact username(s), either paste directly or type letter-by-letter, and choose the first matching unverified result
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        const targetUsername = pickNextExactUsername(
          [...recentlyGiftedRef.current, ...attemptedUsernames],
          cfg.customUsernames,
          discoveredUsernamesRef.current,
          profileUsernameRef.current
        );
        attemptedUsernames.push(targetUsername);

        const isExplicitCustom = cfg.customUsernames.some(
          (u) => u.toLowerCase() === targetUsername.toLowerCase()
        );
        const excludeVerified = !isExplicitCustom;

        let typed = '';
        if (usePasteMode) {
          log(`Pasting exact username @${targetUsername}...`);
          typed = targetUsername;
          setQuery(targetUsername);
          await sleep(140);
          if (cancelled) return;
        } else {
          log(`Typing exact username @${targetUsername}...`);
          setBotTyping(true);
          for (const ch of targetUsername) {
            if (cancelled) return;
            typed += ch;
            setQuery(typed);
            const jitter = 0.8 + Math.random() * 0.4;
            await sleep(charDelay * jitter);
          }
          setBotTyping(false);
          if (cancelled) return;
        }

        setSearching(true);
        setSearchError(null);
        let candidateList: RobloxPublicUser[] = [];
        let lookupError: string | undefined;

        // Try fast exact lookup first
        const exactLookup = await fetchPublicRobloxUser(targetUsername);
        if (cancelled) return;
        if (
          exactLookup.user &&
          (!excludeVerified || !exactLookup.user.hasVerifiedBadge)
        ) {
          candidateList = [exactLookup.user];
        } else {
          const res = await searchPublicRobloxUsers(targetUsername);
          if (cancelled) return;
          lookupError = res.error;
          candidateList = narrowAutoGiftResults(res.users, targetUsername, excludeVerified);
        }

        setSearching(false);
        if (lookupError && candidateList.length === 0) {
          setSearchResults([]);
          setSearchError(lookupError);
          log(`Lookup warning (${lookupError}); retrying...`, 'warn');
        } else {
          setSearchResults(candidateList);
        }

        await sleep(cfg.afterResultWaitSec * 1000);
        if (cancelled) return;

        const firstAccount = pickFirstMatchingAccount(
          candidateList,
          targetUsername,
          excludeVerified
        );
        if (firstAccount && (!excludeVerified || !firstAccount.hasVerifiedBadge)) {
          publicCandidate = firstAccount;
          pickedRecipient = {
            displayName: firstAccount.displayName,
            username: firstAccount.name,
            avatarUrl: firstAccount.avatarUrl || makeFallbackAvatar(firstAccount.name),
            verified: firstAccount.hasVerifiedBadge,
            joinedYear: formatJoinYear(firstAccount.created),
            connectedLabel: 'Public Roblox Account',
          };
          break;
        }

        // Not found or verified account skipped -> clear before trying next username
        if (attempt < 2) {
          log(`Account "@${targetUsername}" unavailable/verified, trying next username...`, 'warn');
          if (usePasteMode) {
            setQuery('');
            await sleep(90);
          } else {
            for (let len = typed.length - 1; len >= 0; len--) {
              if (cancelled) return;
              setQuery(typed.slice(0, len));
              await sleep(Math.max(25, charDelay * 0.55));
            }
          }
          setSearchResults([]);
        }
      }

      if (cancelled) return;

      // Fallback to unverified simulator friends if Roblox API is unreachable
      const eligibleFriends = filterUnverifiedUsers(friendsRef.current);
      if (!pickedRecipient && eligibleFriends.length > 0) {
        const uniqueFriend =
          pickUniquePublicRecipient(
            eligibleFriends,
            recentlyGiftedRef.current,
            profileUsernameRef.current
          ) ?? eligibleFriends[Math.floor(Math.random() * eligibleFriends.length)];

        if (uniqueFriend) {
          pickedRecipient = {
            displayName: uniqueFriend.displayName,
            username: uniqueFriend.username,
            avatarUrl: uniqueFriend.avatarUrl,
            verified: uniqueFriend.verified,
            joinedYear: uniqueFriend.joinedYear ?? null,
            connectedLabel: uniqueFriend.connectedLabel ?? 'Simulator Friend',
          };
          log(`Using fallback unverified friend @${pickedRecipient.username}`, 'warn');
        }
      }

      if (!pickedRecipient) {
        callbacksRef.current.onAutoGiftStopWithReason?.(
          'Could not find an available Roblox recipient for Auto Gift.'
        );
        return;
      }

      // Select recipient -> move to Amount step
      setRecipient(pickedRecipient);
      setAmountError(null);
      setStep('amount');
      log(`Selected player @${pickedRecipient.username}`);

      if (publicCandidate && !publicCandidate.created) {
        fetchPublicRobloxUser(publicCandidate.name).then((details) => {
          if (!cancelled && details.user?.created) {
            const year = formatJoinYear(details.user.created);
            setRecipient((prev) =>
              prev && prev.username === publicCandidate?.name ? { ...prev, joinedYear: year } : prev
            );
          }
        });
      }

      await sleep(cfg.afterSelectWaitSec * 1000);
      if (cancelled) return;

      const amount = pickRandomRobuxAmount(cfg.minRobux, cfg.maxRobux, balanceRef.current);
      if (amount === null) {
        callbacksRef.current.onAutoGiftStopWithReason?.(
          'Insufficient simulated Robux balance to send gift.'
        );
        return;
      }

      setAmountInput(String(amount));
      log(`Chosen random amount: ${formatRobux(amount)} Robux`);

      await sleep(cfg.beforeNextWaitSec * 1000);
      if (cancelled) return;

      // Advance to Confirm step
      setStep('confirm');

      await sleep(cfg.beforeSendWaitSec * 1000);
      if (cancelled) return;

      // Trigger Send with spinner
      primeAudioContext();
      setIsSending(true);
      log(`Sending ${formatRobux(amount)} Robux to @${pickedRecipient.username}...`);

      await sleep(2300);
      if (cancelled) {
        setIsSending(false);
        return;
      }

      const ok = callbacksRef.current.onConfirmSend(pickedRecipient, amount);
      setIsSending(false);
      if (!ok) {
        callbacksRef.current.onAutoGiftStopWithReason?.(
          'Send rejected due to insufficient simulated balance.'
        );
        return;
      }

      setSentAmount(amount);
      if (notificationStyleRef.current === 'modal') {
        setStep('success');
        const span = Math.max(0, cfg.successMaxSec - cfg.successMinSec);
        const holdSec = cfg.successMinSec + Math.random() * span;
        await sleep(holdSec * 1000);
        if (cancelled) return;
      }

      callbacksRef.current.onAutoGiftCycleComplete?.(pickedRecipient.username, amount);
    };

    runCycle();

    return () => {
      cancelled = true;
    };
  }, [open, autoGiftActive]);

  if (!open) return null;

  const handleSelectFriend = (friend: FriendEntry) => {
    setRecipient({
      displayName: friend.displayName,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      verified: friend.verified,
      joinedYear: friend.joinedYear ?? null,
      connectedLabel: friend.connectedLabel,
    });
    setAmountError(null);
    setStep('amount');
  };

  const handleSelectPublicUser = async (user: RobloxPublicUser) => {
    const baseRecipient: RecipientTarget = {
      displayName: user.displayName,
      username: user.name,
      avatarUrl: user.avatarUrl || makeFallbackAvatar(user.name),
      verified: user.hasVerifiedBadge,
      joinedYear: formatJoinYear(user.created),
      connectedLabel: 'Public Roblox Account',
    };
    setRecipient(baseRecipient);
    setAmountError(null);
    setStep('amount');

    // Enrich creation year asynchronously if not yet fetched
    if (!user.created && /^[A-Za-z0-9_]{3,20}$/.test(user.name)) {
      const details = await fetchPublicRobloxUser(user.name);
      if (details.user?.created) {
        const year = formatJoinYear(details.user.created);
        setRecipient((prev) =>
          prev && prev.username === user.name ? { ...prev, joinedYear: year } : prev
        );
      }
    }
  };

  const handleNextToConfirm = () => {
    const check = validateSendAmount(amountInput, balance);
    if (!check.valid) {
      setAmountError(check.error);
      return;
    }
    setAmountError(null);
    setStep('confirm');
  };

  const handleSend = () => {
    if (!recipient || isSending) return;
    const check = validateSendAmount(amountInput, balance);
    if (!check.valid) {
      setAmountError(check.error);
      setStep('amount');
      return;
    }

    primeAudioContext();
    setIsSending(true);
    setTimeout(() => {
      const ok = onConfirmSend(recipient, check.amount);
      setIsSending(false);
      if (!ok) {
        setAmountError('Insufficient simulated balance.');
        setStep('amount');
        return;
      }
      setSentAmount(check.amount);
      if (notificationStyle === 'modal') {
        setStep('success');
      } else {
        onClose();
      }
    }, 2300);
  };

  const currentParsedAmount = Number(amountInput.replace(/,/g, '')) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-robux-title"
    >
      <div className={`w-full max-w-[420px] rounded-2xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl overflow-hidden ${autoGiftActive ? 'select-none cursor-default' : ''}`}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-[#2B2E33]">
          <div className="flex items-center gap-2 text-[#111315] dark:text-white">
            <RobloxPlusIcon className="w-5 h-5" />
            <h2 id="send-robux-title" className="text-[15.5px] font-bold">
              Send Robux
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[13.5px] font-bold text-[#111315] dark:text-white tabular-nums">
              <RobuxIcon className="w-4 h-4" />
              <span>{formatRobux(balance)}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Send Robux modal"
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2F34] hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: Search / Select Friend */}
        {step === 'search' && (
          <div className="p-5">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  if (!autoGiftActive) setQuery(e.target.value);
                }}
                onFocus={(e) => {
                  if (autoGiftActive) e.currentTarget.blur();
                }}
                placeholder="Search Roblox username..."
                autoFocus={!autoGiftActive}
                readOnly={autoGiftActive}
                tabIndex={autoGiftActive ? -1 : 0}
                aria-label="Search recipient username"
                className={`w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#16181B] border-2 border-[#0066FF] text-[14px] text-[#111315] dark:text-white placeholder-gray-400 outline-none ${
                  autoGiftActive ? 'caret-transparent cursor-default select-none pointer-events-none' : ''
                }`}
              />
            </div>

            {query.trim().replace(/^@+/, '').length >= 2 ? (
              <div>
                <p className="text-[12.5px] font-bold text-[#111315] dark:text-gray-200 mb-2">
                  People ({searchResults.length})
                </p>
                {searchResults.length === 0 && (searching || botTyping) ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-[13px]">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                    <span>
                      {botTyping ? 'Typing Roblox username...' : 'Searching public Roblox accounts...'}
                    </span>
                  </div>
                ) : searchError && searchResults.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-rose-600 dark:text-rose-400">
                    {searchError}
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-gray-500 dark:text-gray-400">
                    No public Roblox accounts found for &ldquo;{query.trim()}&rdquo;.
                  </p>
                ) : (
                  <div className="max-h-[260px] overflow-y-auto sim-scroll divide-y divide-gray-100 dark:divide-[#2A2D32]">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectPublicUser(user)}
                        className="w-full py-2.5 px-2 flex items-center gap-3 hover:bg-[#F4F5F7] dark:hover:bg-[#272A2F] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <img
                          src={user.avatarUrl || makeFallbackAvatar(user.name)}
                          alt={user.displayName}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallbackApplied) {
                              img.dataset.fallbackApplied = '1';
                              img.src = makeFallbackAvatar(user.name);
                            }
                          }}
                          className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-[#2C2F34] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[14px] font-bold text-[#111315] dark:text-white truncate">
                              {user.displayName}
                            </span>
                            {user.hasVerifiedBadge && <VerifiedBadge className="w-4 h-4 shrink-0" />}
                          </div>
                          <p className="text-[12px] text-[#757779] dark:text-gray-400 truncate">
                            @{user.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : showFriendsInSend ? (
              <div>
                <p className="text-[12.5px] font-bold text-[#111315] dark:text-gray-200 mb-2">
                  My friends ({friends.length})
                </p>
                {friends.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-gray-500 dark:text-gray-400">
                    No friends added yet. Type a Roblox username above to search.
                  </p>
                ) : (
                  <div className="max-h-[260px] overflow-y-auto sim-scroll space-y-1">
                    {friends.map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => handleSelectFriend(friend)}
                        className="w-full py-2 px-2.5 flex items-center gap-3 hover:bg-[#F4F5F7] dark:hover:bg-[#272A2F] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <img
                          src={friend.avatarUrl}
                          alt={friend.displayName}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallbackApplied) {
                              img.dataset.fallbackApplied = '1';
                              img.src = makeFallbackAvatar(friend.username);
                            }
                          }}
                          className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-[#2C2F34] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[14px] font-semibold text-[#111315] dark:text-white truncate">
                              {friend.displayName}
                            </span>
                            {friend.verified && <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                          <p className="text-[12px] text-[#757779] dark:text-gray-400 truncate">
                            @{friend.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-gray-500 dark:text-gray-400">
                Type a Roblox username above to find a recipient.
              </p>
            )}
          </div>
        )}

        {/* Step 2: Select Amount */}
        {step === 'amount' && recipient && (
          <div className="p-5 text-center">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => setStep('search')}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change user
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <img
              src={recipient.avatarUrl}
              alt={recipient.displayName}
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = '1';
                  img.src = makeFallbackAvatar(recipient.username);
                }
              }}
              className="w-14 h-14 rounded-full object-cover mx-auto bg-gray-100 dark:bg-[#2C2F34] border border-black/10 dark:border-white/10"
            />
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-[15px] font-bold text-[#111315] dark:text-white">
                {recipient.displayName}
              </span>
              {recipient.verified && <VerifiedBadge className="w-4 h-4" />}
            </div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">@{recipient.username}</p>

            {/* Custom Amount Input */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <RobuxIcon className="w-6 h-6 text-[#111315] dark:text-white shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                lang="en"
                dir="ltr"
                value={amountInput}
                readOnly={autoGiftActive}
                tabIndex={autoGiftActive ? -1 : 0}
                onFocus={(e) => {
                  if (autoGiftActive) e.currentTarget.blur();
                }}
                onChange={(e) => {
                  if (autoGiftActive) return;
                  const cleaned = normalizeAsciiDigits(e.target.value).replace(/[^\d]/g, '');
                  setAmountInput(cleaned);
                  setAmountError(null);
                }}
                aria-label="Custom Robux amount"
                className={`w-36 text-center text-[32px] font-black tracking-tight bg-transparent border-b-2 border-transparent focus:border-[#0066FF] text-[#111315] dark:text-white outline-none tabular-nums ${
                  autoGiftActive ? 'caret-transparent cursor-default select-none pointer-events-none' : ''
                }`}
              />
            </div>

            {/* 4 Preset Chips */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = currentParsedAmount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(preset));
                      setAmountError(null);
                    }}
                    className={`py-2 px-2 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#111315] dark:border-white bg-white dark:bg-[#2A2D32] text-[#111315] dark:text-white'
                        : 'border border-[#E4E6E8] dark:border-[#32353B] bg-[#FAFAFB] dark:bg-[#24272B] text-[#393B3D] dark:text-gray-200 hover:bg-[#F0F2F4] dark:hover:bg-[#2D3036]'
                    }`}
                  >
                    <RobuxIcon className="w-3.5 h-3.5" />
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            {amountError && (
              <p className="mt-3 text-[12.5px] font-medium text-rose-600 dark:text-rose-400">
                {amountError}
              </p>
            )}

            <button
              type="button"
              onClick={handleNextToConfirm}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[14.5px] transition-colors cursor-pointer"
            >
              Next
            </button>

            <p className="mt-3 text-[11px] text-[#757779] dark:text-gray-400">
              Robux are sent instantly with no fees
            </p>
          </div>
        )}

        {/* Step 3: Confirm / Send / Edit */}
        {step === 'confirm' && recipient && (
          <div className="p-5">
            <div className="p-4 rounded-xl border border-[#E4E6E8] dark:border-[#2F3238] bg-[#FAFAFB] dark:bg-[#191B1E] text-center">
              <img
                src={recipient.avatarUrl}
                alt={recipient.displayName}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallbackApplied) {
                    img.dataset.fallbackApplied = '1';
                    img.src = makeFallbackAvatar(recipient.username);
                  }
                }}
                className="w-14 h-14 rounded-full object-cover mx-auto bg-gray-100 dark:bg-[#2C2F34]"
              />
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-[15.5px] font-bold text-[#111315] dark:text-white">
                  {recipient.displayName}
                </span>
                {recipient.verified && <VerifiedBadge className="w-4 h-4" />}
              </div>
              <p className="text-[12px] text-[#757779] dark:text-gray-400">@{recipient.username}</p>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11.5px] text-[#606264] dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {recipient.connectedLabel || 'Simulator Connection'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />0 mutual Connections
                </span>
              </div>
              {recipient.joinedYear && (
                <p className="mt-1 text-[11.5px] text-[#606264] dark:text-gray-400">
                  Joined in {recipient.joinedYear}
                </p>
              )}
            </div>

            <div className="mt-3 py-3.5 px-4 rounded-xl bg-[#F2F4F5] dark:bg-[#26292E] flex items-center justify-center gap-2 text-[#111315] dark:text-white">
              <RobuxIcon className="w-6 h-6" />
              <span className="text-[28px] font-black tracking-tight tabular-nums">
                {formatRobux(currentParsedAmount)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                data-testid="confirm-send-button"
                className="py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-80 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
              </button>

              <button
                type="button"
                onClick={() => setStep('amount')}
                disabled={isSending}
                className="py-2.5 px-4 rounded-xl bg-[#E8EAED] dark:bg-[#2E3136] hover:bg-[#DCDFE4] dark:hover:bg-[#383C42] text-[#111315] dark:text-white font-bold text-[14px] transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="mt-2 w-full py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>

            <p className="mt-2 text-center text-[11px] leading-relaxed text-[#757779] dark:text-gray-400">
              You need an age check or parental consent to send Robux. Once you send, you cannot cancel.
            </p>
          </div>
        )}

        {/* Step 4: Modal Success Style */}
        {step === 'success' && recipient && (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#111315] dark:border-white mx-auto flex items-center justify-center text-[#111315] dark:text-white">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <p className="mt-4 text-[15.5px] font-medium text-[#111315] dark:text-white">
              You sent {formatRobux(sentAmount)} Robux
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[14.5px] transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
