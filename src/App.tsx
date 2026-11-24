import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import type {
  ActivePage,
  AutoGiftConfig,
  AutoGiftLogEntry,
  FriendEntry,
  RobuxPackage,
  SimulatorSettings,
  SimulatorState,
  UserProfile,
} from './types/simulator';
import {
  applySimulatedPackagePurchase,
  applySimulatedSend,
  buildCombinedUsernamePool,
  formatRobux,
  isFunctionHotkey,
  isTextInputFocused,
  normalizeHotkeyLabel,
  redeemSimulatedGiftCode,
} from './utils/simulatorLogic';
import {
  clearSimulatorStorage,
  loadAutoGiftProgress,
  loadSimulatorState,
  resetAutoGiftProgress,
  saveAutoGiftProgress,
  saveSimulatorState,
} from './utils/storage';
import { resolvePublicRobloxUsernames } from './services/robloxApi';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { RobuxShopView } from './components/RobuxShopView';
import { DashboardView } from './components/DashboardView';
import { UserSearchView } from './components/UserSearchView';
import { ActivityConsoleView } from './components/ActivityConsoleView';
import {
  AutoGiftView,
  AvatarView,
  DisclaimerView,
  FriendsView,
  GiftCardsView,
  InventoryView,
  MessagesView,
} from './components/SecondaryViews';
import { SendRobuxModal } from './components/SendRobuxModal';
import { EditProfileModal, type EditProfileTab } from './components/EditProfileModal';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickChatDrawer } from './components/QuickChatDrawer';
import { playSendRobuxSound } from './utils/sounds';

export default function App() {
  const [state, setState] = useState<SimulatorState>(() => loadSimulatorState());
  const [activePage, setActivePage] = useState<ActivePage>('robux-shop');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendInitialRecipient, setSendInitialRecipient] = useState<FriendEntry | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState<EditProfileTab>('profile');
  const [checkoutPkg, setCheckoutPkg] = useState<RobuxPackage | null>(null);

  // Top-center dark pill toast (matches screenshots)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto Gift state (progress persists across stop/start and page reloads)
  const [autoGiftRunning, setAutoGiftRunning] = useState(false);
  const [autoGiftLogs, setAutoGiftLogs] = useState<AutoGiftLogEntry[]>([]);
  const [recentlyGiftedUsernames, setRecentlyGiftedUsernames] = useState<string[]>(
    () => loadAutoGiftProgress().recentlyGiftedUsernames
  );
  const [autoGiftGiftedCount, setAutoGiftGiftedCount] = useState<number>(
    () => loadAutoGiftProgress().giftedCount
  );
  const [sidebarAvatarFlash, setSidebarAvatarFlash] = useState<'start' | 'stop' | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const autoGiftRunningRef = useRef(autoGiftRunning);
  autoGiftRunningRef.current = autoGiftRunning;
  const isHotkeyRecordingRef = useRef(false);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
  }, [state.settings.theme]);

  // Persist to localStorage
  useEffect(() => {
    saveSimulatorState(state);
  }, [state]);

  // Persist Auto Gift queue progress so Stop -> Start or reload continues seamlessly
  useEffect(() => {
    saveAutoGiftProgress(recentlyGiftedUsernames, autoGiftGiftedCount);
  }, [recentlyGiftedUsernames, autoGiftGiftedCount]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Optionally resolve live Roblox avatars for default friends once on mount
  useEffect(() => {
    let cancelled = false;
    const usernames = state.friends.map((f) => f.username);
    resolvePublicRobloxUsernames(usernames).then((resolved) => {
      if (cancelled || resolved.length === 0) return;
      const byName = new Map(resolved.map((u) => [u.name.toLowerCase(), u]));
      setState((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => {
          const match = byName.get(f.username.toLowerCase());
          if (!match || !match.avatarUrl) return f;
          return {
            ...f,
            robloxId: match.id,
            avatarUrl: match.avatarUrl,
            verified: match.hasVerifiedBadge,
          };
        }),
      }));
    });
    return () => {
      cancelled = true;
    };
    // Only run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const appendAutoGiftLog = useCallback(
    (message: string, kind: 'info' | 'success' | 'warn' = 'info') => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setAutoGiftLogs((prev) =>
        [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp,
            message,
            kind,
          },
          ...prev,
        ].slice(0, 60)
      );
    },
    []
  );

  const clearCycleTimer = useCallback(() => {
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const triggerSidebarAvatarFlash = useCallback((kind: 'start' | 'stop') => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setSidebarAvatarFlash(kind);
    flashTimerRef.current = setTimeout(() => {
      setSidebarAvatarFlash(null);
      flashTimerRef.current = null;
    }, 1000);
  }, []);

  const stopAutoGift = useCallback(
    (reason?: string) => {
      clearCycleTimer();
      setAutoGiftRunning(false);
      setSendModalOpen(false);
      triggerSidebarAvatarFlash('stop');
      const msg = reason || 'Auto Gift stopped';
      appendAutoGiftLog(msg, reason ? 'warn' : 'info');
    },
    [appendAutoGiftLog, clearCycleTimer, triggerSidebarAvatarFlash]
  );

  const startAutoGift = useCallback(() => {
    const current = stateRef.current;
    if (current.profile.balance < 1) {
      appendAutoGiftLog('Insufficient simulated balance to start Auto Gift', 'warn');
      triggerSidebarAvatarFlash('stop');
      return;
    }
    clearCycleTimer();
    setEditModalOpen(false);
    setCheckoutPkg(null);
    setSendModalOpen(false);
    setAutoGiftRunning(true);
    triggerSidebarAvatarFlash('start');
    const hotkey = current.settings.autoGift.hotkey;
    appendAutoGiftLog(`Auto Gift started (shortcut: ${hotkey})`, 'info');
    const waitMs = Math.max(100, current.settings.autoGift.homeWaitSec * 1000);
    cycleTimerRef.current = setTimeout(() => {
      if (!autoGiftRunningRef.current) return;
      setSendInitialRecipient(null);
      setSendModalOpen(true);
    }, waitMs);
  }, [appendAutoGiftLog, clearCycleTimer, triggerSidebarAvatarFlash]);

  const toggleAutoGift = useCallback(() => {
    if (autoGiftRunningRef.current) {
      stopAutoGift();
    } else {
      startAutoGift();
    }
  }, [startAutoGift, stopAutoGift]);

  // Clean up cycle and flash timers on unmount
  useEffect(() => {
    return () => {
      clearCycleTimer();
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, [clearCycleTimer]);

  // Global PC keyboard shortcut listener for toggling Auto Gift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isHotkeyRecordingRef.current) return;
      const pressed = normalizeHotkeyLabel(e.key);
      const targetKey = normalizeHotkeyLabel(stateRef.current.settings.autoGift.hotkey);
      if (!pressed || pressed !== targetKey) return;
      if (isTextInputFocused(e.target) && !isFunctionHotkey(pressed)) return;
      e.preventDefault();
      toggleAutoGift();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAutoGift]);

  const handleAutoGiftCycleComplete = useCallback(
    (sentUsername: string, amount: number) => {
      const poolSize = buildCombinedUsernamePool(
        stateRef.current.settings.autoGift.customUsernames
      ).length;
      setRecentlyGiftedUsernames((prev) => {
        const filtered = prev.filter((u) => u.toLowerCase() !== sentUsername.toLowerCase());
        const next = [sentUsername, ...filtered];
        if (next.length >= Math.max(1, poolSize)) {
          return [sentUsername];
        }
        return next;
      });
      setAutoGiftGiftedCount((c) => c + 1);
      appendAutoGiftLog(`Sent ${formatRobux(amount)} Robux to @${sentUsername}`, 'success');
      setSendModalOpen(false);

      if (!autoGiftRunningRef.current) return;
      clearCycleTimer();
      const delayMs = Math.max(100, stateRef.current.settings.autoGift.cycleDelaySec * 1000);
      cycleTimerRef.current = setTimeout(() => {
        if (!autoGiftRunningRef.current) return;
        setSendInitialRecipient(null);
        setSendModalOpen(true);
      }, delayMs);
    },
    [appendAutoGiftLog, clearCycleTimer]
  );

  const handleOpenSendModal = (preselectedFriend?: FriendEntry) => {
    setSendInitialRecipient(preselectedFriend ?? null);
    setSendModalOpen(true);
  };

  const handleOpenEditProfile = (tab: EditProfileTab = 'profile') => {
    setEditInitialTab(tab);
    setEditModalOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    setUserSearchQuery(query);
    setActivePage('user-search');
  };

  const handleConfirmSend = (
    recipient: { displayName: string; username: string; avatarUrl: string },
    amount: number
  ): boolean => {
    const current = stateRef.current;
    const { nextState, error } = applySimulatedSend(current, recipient, amount);
    if (error) {
      return false;
    }
    stateRef.current = nextState;
    setState(nextState);
    if (current.settings.soundEnabled) {
      playSendRobuxSound();
    }
    if (current.settings.notificationStyle === 'toast') {
      showToast(`You sent ${formatRobux(amount)} Robux`);
    }
    return true;
  };

  const handleConfirmPurchase = (pkg: RobuxPackage) => {
    setState((prev) => {
      const base = applySimulatedPackagePurchase(prev, pkg).nextState;
      if (pkg.id.startsWith('sub-')) {
        return {
          ...base,
          settings: {
            ...base.settings,
            robloxPlusSubscribed: true,
          },
        };
      }
      return base;
    });
    showToast(`Added ${formatRobux(pkg.totalRobux)} Robux`);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setState((prev) => {
      const balanceChanged = prev.profile.balance !== updated.balance;
      const extraTx = balanceChanged
        ? [
            {
              id: `tx-${Date.now()}`,
              type: 'balance-set' as const,
              amount: updated.balance,
              targetName: 'Balance Updated (Sim)',
              status: 'Completed (Sim)' as const,
              createdAt: new Date().toISOString(),
            },
            ...prev.transactions,
          ].slice(0, 100)
        : prev.transactions;

      return {
        ...prev,
        profile: updated,
        transactions: extraTx,
      };
    });
    showToast('Changes saved successfully');
  };

  const handleUpdateFriends = (friends: FriendEntry[]) => {
    setState((prev) => ({ ...prev, friends }));
    showToast('Changes saved successfully');
  };

  const handleAddFriend = (friend: FriendEntry) => {
    setState((prev) => {
      if (prev.friends.some((f) => f.username.toLowerCase() === friend.username.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        friends: [friend, ...prev.friends],
      };
    });
    showToast(`Added @${friend.username} to simulator friends`);
  };

  const handleRemoveFriend = (id: string) => {
    setState((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f.id !== id),
    }));
  };

  const handleUpdateSettings = (partial: Partial<SimulatorSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
    if (partial.notificationStyle) {
      showToast('Changes saved successfully');
    }
  };

  const handleSubscribePlus = () => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        robloxPlusSubscribed: !prev.settings.robloxPlusSubscribed,
      },
    }));
    showToast(
      state.settings.robloxPlusSubscribed
        ? 'Roblox Plus subscription paused'
        : 'Subscribed to Roblox Plus'
    );
  };

  const handleRedeemCode = (code: string) => {
    const res = redeemSimulatedGiftCode(state, code);
    if (!res.error) {
      setState(res.nextState);
      showToast(`Redeemed ${formatRobux(res.amountAdded)} simulated Robux`);
    }
    return { amountAdded: res.amountAdded, error: res.error };
  };

  const handleClearHistory = () => {
    setState((prev) => ({ ...prev, transactions: [] }));
    showToast('Local activity history cleared');
  };

  const handleAddFeedback = (kind: 'bug' | 'feature', message: string) => {
    setState((prev) => ({
      ...prev,
      feedbacks: [
        {
          id: `fb-${Date.now()}`,
          kind,
          message,
          createdAt: new Date().toISOString(),
        },
        ...prev.feedbacks,
      ],
    }));
    showToast('Feedback saved locally');
  };

  const handleResetSimulator = () => {
    const fresh = clearSimulatorStorage();
    resetAutoGiftProgress();
    setState(fresh);
    setRecentlyGiftedUsernames([]);
    setAutoGiftGiftedCount(0);
    setEditModalOpen(false);
    showToast('Simulator reset to defaults');
  };

  useEffect(() => {
    if (!autoGiftRunning) return;
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) {
      document.activeElement.blur();
    }
  }, [autoGiftRunning]);

  return (
    <div
      className={`min-h-screen bg-white dark:bg-[#121315] text-[#111315] dark:text-[#F3F4F6] transition-colors flex flex-col select-none ${
        autoGiftRunning ? 'auto-gift-no-caret' : ''
      }`}
    >
      {/* Top-Center Floating Pill Toast (matches screenshots) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="simulator-toast"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#191B1F] dark:bg-[#23262C] text-white shadow-xl border border-white/10"
        >
          <span className="w-5 h-5 rounded-full bg-white text-[#191B1F] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
          <span className="text-[13.5px] font-semibold whitespace-nowrap">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <TopNav
        profile={state.profile}
        activePage={activePage}
        searchQuery={userSearchQuery}
        transactions={state.transactions}
        mobileMenuOpen={mobileMenuOpen}
        onNavigate={setActivePage}
        onSearchSubmit={handleSearchSubmit}
        onOpenSendModal={() => handleOpenSendModal()}
        onOpenEditProfile={handleOpenEditProfile}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          profile={state.profile}
          friendsCount={state.friends.length}
          showFriendsInSidebar={state.settings.showFriendsInSidebar}
          activePage={activePage}
          mobileOpen={mobileMenuOpen}
          robloxPlusSubscribed={state.settings.robloxPlusSubscribed}
          avatarFlash={sidebarAvatarFlash}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onNavigate={setActivePage}
          onOpenEditProfile={handleOpenEditProfile}
          onSubscribePlus={handleSubscribePlus}
        />

        <main className="flex-1 min-w-0">
          {activePage === 'robux-shop' && (
            <RobuxShopView
              profile={state.profile}
              robloxPlusSubscribed={state.settings.robloxPlusSubscribed}
              onOpenSendModal={() => handleOpenSendModal()}
              onSelectPackage={(pkg) => setCheckoutPkg(pkg)}
              onOpenEditProfile={handleOpenEditProfile}
            />
          )}

          {activePage === 'dashboard' && (
            <DashboardView
              profile={state.profile}
              friends={state.friends}
              transactions={state.transactions}
              onNavigate={setActivePage}
              onOpenSendModal={handleOpenSendModal}
              onOpenEditProfile={handleOpenEditProfile}
            />
          )}

          {activePage === 'user-search' && (
            <UserSearchView
              initialQuery={userSearchQuery}
              friends={state.friends}
              onSendToUser={(friend) => handleOpenSendModal(friend)}
              onAddFriend={handleAddFriend}
            />
          )}

          {activePage === 'activity' && (
            <ActivityConsoleView
              transactions={state.transactions}
              onClearHistory={handleClearHistory}
            />
          )}

          {activePage === 'friends' && (
            <FriendsView
              friends={state.friends}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
              onSendToFriend={(friend) => handleOpenSendModal(friend)}
            />
          )}

          {activePage === 'avatar' && (
            <AvatarView
              profile={state.profile}
              onUpdateAvatar={(avatarUrl) =>
                handleSaveProfile({ ...state.profile, avatarUrl })
              }
              onOpenEditProfile={() => handleOpenEditProfile('profile')}
            />
          )}

          {activePage === 'messages' && <MessagesView onNavigate={setActivePage} />}

          {activePage === 'inventory' && (
            <InventoryView items={state.ownedBonusItems} onNavigate={setActivePage} />
          )}

          {activePage === 'auto-gift' && (
            <AutoGiftView
              config={state.settings.autoGift}
              running={autoGiftRunning}
              balance={state.profile.balance}
              logs={autoGiftLogs}
              giftedCount={autoGiftGiftedCount}
              onToggleRunning={toggleAutoGift}
              onUpdateConfig={(next: AutoGiftConfig) => handleUpdateSettings({ autoGift: next })}
              onClearLogs={() => setAutoGiftLogs([])}
              onHotkeyRecordingChange={(recording) => {
                isHotkeyRecordingRef.current = recording;
              }}
            />
          )}

          {activePage === 'gift-cards' && <GiftCardsView onRedeemCode={handleRedeemCode} />}

          {activePage === 'disclaimer' && <DisclaimerView />}
        </main>
      </div>

      <QuickChatDrawer
        friends={state.friends}
        onSendRobuxToFriend={(friend) => handleOpenSendModal(friend)}
      />

      <SendRobuxModal
        open={sendModalOpen}
        balance={state.profile.balance}
        friends={state.friends}
        showFriendsInSend={state.settings.showFriendsInSend}
        notificationStyle={state.settings.notificationStyle}
        initialRecipient={sendInitialRecipient}
        autoGiftActive={autoGiftRunning}
        autoGiftConfig={state.settings.autoGift}
        profileUsername={state.profile.username}
        recentlyGiftedUsernames={recentlyGiftedUsernames}
        onAutoGiftLog={appendAutoGiftLog}
        onAutoGiftCycleComplete={handleAutoGiftCycleComplete}
        onAutoGiftStopWithReason={stopAutoGift}
        onClose={() => {
          if (autoGiftRunningRef.current) {
            stopAutoGift('Auto Gift stopped (modal closed)');
          } else {
            setSendModalOpen(false);
          }
        }}
        onConfirmSend={handleConfirmSend}
      />

      <EditProfileModal
        open={editModalOpen}
        initialTab={editInitialTab}
        profile={state.profile}
        friends={state.friends}
        settings={state.settings}
        feedbacks={state.feedbacks}
        autoGiftRunning={autoGiftRunning}
        autoGiftLogs={autoGiftLogs}
        autoGiftGiftedCount={autoGiftGiftedCount}
        onToggleAutoGift={toggleAutoGift}
        onClearAutoGiftLogs={() => setAutoGiftLogs([])}
        onHotkeyRecordingChange={(recording) => {
          isHotkeyRecordingRef.current = recording;
        }}
        onClose={() => setEditModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        onUpdateFriends={handleUpdateFriends}
        onUpdateSettings={handleUpdateSettings}
        onAddFeedback={handleAddFeedback}
        onResetSimulator={handleResetSimulator}
      />

      <CheckoutModal
        pkg={checkoutPkg}
        soundEnabled={state.settings.soundEnabled}
        onClose={() => setCheckoutPkg(null)}
        onConfirmSimulatedPurchase={handleConfirmPurchase}
        onOpenDisclaimer={() => {
          setCheckoutPkg(null);
          handleOpenEditProfile('disclaimer');
        }}
      />
    </div>
  );
}
