import React, { useEffect, useState } from 'react';
import {
  X,
  Search,
  Check,
  Sun,
  Moon,
  Bug,
  Lightbulb,
  Loader2,
  ShieldAlert,
  RotateCcw,
  Users,
  Volume2,
} from 'lucide-react';
import type {
  AutoGiftConfig,
  AutoGiftLogEntry,
  FeedbackSubmission,
  FriendEntry,
  NotificationStyle,
  SimulatorSettings,
  ThemeMode,
  UserProfile,
} from '../types/simulator';
import { fetchPublicRobloxUser } from '../services/robloxApi';
import {
  PRESET_AVATARS,
  formatJoinYear,
  formatReadableDate,
  formatRobux,
  makeFallbackAvatar,
  normalizeAsciiDigits,
  validateProfileDraft,
} from '../utils/simulatorLogic';
import { RobloxPlusIcon, RobuxIcon, VerifiedBadge } from './Icons';
import { AutoGiftPanel } from './AutoGiftPanel';

export type EditProfileTab =
  | 'profile'
  | 'auto-gift'
  | 'friends'
  | 'notification'
  | 'settings'
  | 'disclaimer';

interface EditProfileModalProps {
  open: boolean;
  initialTab: EditProfileTab;
  profile: UserProfile;
  friends: FriendEntry[];
  settings: SimulatorSettings;
  feedbacks: FeedbackSubmission[];
  autoGiftRunning: boolean;
  autoGiftLogs: AutoGiftLogEntry[];
  autoGiftGiftedCount: number;
  onToggleAutoGift: () => void;
  onClearAutoGiftLogs: () => void;
  onHotkeyRecordingChange?: (recording: boolean) => void;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
  onUpdateFriends: (friends: FriendEntry[]) => void;
  onUpdateSettings: (partial: Partial<SimulatorSettings>) => void;
  onAddFeedback: (kind: 'bug' | 'feature', message: string) => void;
  onResetSimulator: () => void;
}

const BALANCE_PRESETS = [0, 170, 1000, 10000, 49400, 100000];

export function EditProfileModal({
  open,
  initialTab,
  profile,
  friends,
  settings,
  feedbacks,
  autoGiftRunning,
  autoGiftLogs,
  autoGiftGiftedCount,
  onToggleAutoGift,
  onClearAutoGiftLogs,
  onHotkeyRecordingChange,
  onClose,
  onSaveProfile,
  onUpdateFriends,
  onUpdateSettings,
  onAddFeedback,
  onResetSimulator,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<EditProfileTab>(initialTab);

  // Profile Draft state
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [balanceStr, setBalanceStr] = useState<string>(String(profile.balance));
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Friends Draft state
  const [friendUsername, setFriendUsername] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendsDraft, setFriendsDraft] = useState<FriendEntry[]>(friends);

  // Notification Draft
  const [notifStyle, setNotifStyle] = useState<NotificationStyle>(settings.notificationStyle);

  // Feedback form
  const [feedbackKind, setFeedbackKind] = useState<'bug' | 'feature' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setDraft(profile);
    setBalanceStr(String(profile.balance));
    setFetchStatus(null);
    setProfileError(null);
    setFriendsDraft(friends);
    setFriendUsername('');
    setFriendError(null);
    setNotifStyle(settings.notificationStyle);
    setFeedbackKind(null);
    setFeedbackText('');
  }, [open, initialTab, profile, friends, settings.notificationStyle]);

  if (!open) return null;

  const tabs: Array<{ id: EditProfileTab; label: string }> = [
    { id: 'profile', label: 'Profile & Robux' },
    { id: 'auto-gift', label: 'Auto Gift' },
    { id: 'friends', label: 'Friends' },
    { id: 'notification', label: 'Notification' },
    { id: 'settings', label: 'Settings' },
    { id: 'disclaimer', label: 'Disclaimer' },
  ];

  const handleFetchProfile = async () => {
    setFetchingProfile(true);
    setFetchStatus(null);
    setProfileError(null);
    const res = await fetchPublicRobloxUser(draft.username);
    setFetchingProfile(false);
    if (!res.user) {
      setFetchStatus({
        type: 'err',
        text: res.error || 'Could not find that public Roblox profile.',
      });
      return;
    }

    setDraft((prev) => ({
      ...prev,
      username: res.user!.name,
      displayName: res.user!.displayName,
      avatarUrl: res.user!.avatarUrl || prev.avatarUrl,
      verified: res.user!.hasVerifiedBadge,
      joinedDate: res.user!.created ? formatReadableDate(res.user!.created) : prev.joinedDate,
    }));
    setFetchStatus({
      type: 'ok',
      text: 'Profile loaded. You can edit the name or avatar below before saving.',
    });
  };

  const handleSaveProfile = () => {
    const check = validateProfileDraft({
      ...draft,
      balance: Number(balanceStr),
    });
    if (!check.valid) {
      setProfileError(check.error);
      return;
    }
    setProfileError(null);
    onSaveProfile({
      ...draft,
      displayName: draft.displayName.trim(),
      username: draft.username.trim(),
      balance: check.cleanedBalance,
    });
    onClose();
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = friendUsername.trim().replace(/^@/, '');
    if (!cleaned || !/^[A-Za-z0-9_]{2,32}$/.test(cleaned)) {
      setFriendError('Enter a valid username (letters, numbers, underscores).');
      return;
    }
    if (friendsDraft.some((f) => f.username.toLowerCase() === cleaned.toLowerCase())) {
      setFriendError(`@${cleaned} is already in your friends list.`);
      return;
    }

    setAddingFriend(true);
    setFriendError(null);
    const res = await fetchPublicRobloxUser(cleaned);
    setAddingFriend(false);

    if (res.user) {
      const entry: FriendEntry = {
        id: `friend-${res.user.id}-${Date.now()}`,
        robloxId: res.user.id,
        displayName: res.user.displayName,
        username: res.user.name,
        avatarUrl: res.user.avatarUrl || makeFallbackAvatar(res.user.name),
        verified: res.user.hasVerifiedBadge,
        joinedYear: formatJoinYear(res.user.created) ?? undefined,
        connectedLabel: 'Public Roblox User',
      };
      setFriendsDraft((prev) => [entry, ...prev]);
      setFriendUsername('');
    } else {
      setFriendError(res.error || `Could not find public Roblox account "@${cleaned}".`);
    }
  };

  const handleRemoveFriend = (id: string) => {
    setFriendsDraft((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveFriends = () => {
    onUpdateFriends(friendsDraft);
    onClose();
  };

  const handleSaveNotification = () => {
    onUpdateSettings({ notificationStyle: notifStyle });
    onClose();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackKind || !feedbackText.trim()) return;
    onAddFeedback(feedbackKind, feedbackText.trim());
    setFeedbackText('');
    setFeedbackKind(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="w-full max-w-[470px] max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-[#2B2E33] shrink-0">
          <div className="flex items-center gap-2 text-[#111315] dark:text-white">
            <RobloxPlusIcon className="w-5 h-5" />
            <h2 id="edit-profile-title" className="text-[15.5px] font-bold">
              Edit Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Edit Profile modal"
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2F34] hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tabs Row */}
        <div
          role="tablist"
          aria-label="Edit Profile tabs"
          className="px-4 pt-2 border-b border-gray-200 dark:border-[#2C2F34] flex items-center gap-4 overflow-x-auto sim-scroll shrink-0"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-[#111315] dark:border-white text-[#111315] dark:text-white'
                    : 'border-transparent text-[#606264] dark:text-gray-400 hover:text-[#111315] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto sim-scroll flex-1">
          {/* TAB 1: Profile & Robux */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Local Session Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[12.5px] font-bold text-[#111315] dark:text-white">
                      Local Simulator Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-[#52555A] dark:text-gray-400 mt-0.5">
                    Saved automatically in browser storage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResetSimulator}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2A2D32] border border-gray-200 dark:border-gray-600 text-[11.5px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Demo
                </button>
              </div>

              {/* Live Profile Card Preview */}
              <div>
                <h3 className="text-[13.5px] font-bold text-[#111315] dark:text-white">
                  Roblox Profile
                </h3>
                <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-2">
                  My simulator profile
                </p>

                <div className="p-3 rounded-xl border border-[#E4E6E8] dark:border-[#2F3238] bg-[#FAFAFB] dark:bg-[#24272B] flex items-center gap-3 mb-3">
                  <img
                    src={draft.avatarUrl}
                    alt={draft.displayName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-[#2E3136] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold text-[#111315] dark:text-white truncate">
                        {draft.displayName || 'Display Name'}
                      </span>
                      {draft.verified && <VerifiedBadge className="w-4 h-4 shrink-0" />}
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                      @{draft.username || 'username'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Joined {draft.joinedDate}
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2.5">
                  <div>
                    <label
                      htmlFor="edit-display-name"
                      className="block text-[12px] font-semibold text-[#393B3D] dark:text-gray-300 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="edit-display-name"
                      type="text"
                      value={draft.displayName}
                      onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13.5px] text-[#111315] dark:text-white focus:border-[#0066FF] outline-none"
                    />
                  </div>

                  {/* Username + Fetch Profile */}
                  <div>
                    <label
                      htmlFor="edit-username"
                      className="block text-[12px] font-semibold text-[#393B3D] dark:text-gray-300 mb-1"
                    >
                      Username
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="edit-username"
                        type="text"
                        value={draft.username}
                        onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                        className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13.5px] text-[#111315] dark:text-white focus:border-[#0066FF] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleFetchProfile}
                        disabled={fetchingProfile}
                        className="h-9 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {fetchingProfile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                        Fetch Profile
                      </button>
                    </div>
                  </div>

                  {/* Avatar Image Picker & URL */}
                  <div>
                    <label
                      htmlFor="edit-avatar-url"
                      className="block text-[12px] font-semibold text-[#393B3D] dark:text-gray-300 mb-1"
                    >
                      Avatar Image (Presets or Custom URL)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setDraft({ ...draft, avatarUrl: preset.url })}
                          title={preset.label}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            draft.avatarUrl === preset.url
                              ? 'border-[#0066FF] scale-105'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      id="edit-avatar-url"
                      type="url"
                      value={draft.avatarUrl}
                      onChange={(e) => setDraft({ ...draft, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[12px] text-[#111315] dark:text-white focus:border-[#0066FF] outline-none"
                    />
                  </div>

                  {/* Verified Badge Checkbox */}
                  <label className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#393B3D] dark:text-gray-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={draft.verified}
                      onChange={(e) => setDraft({ ...draft, verified: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#2563EB]"
                    />
                    <span>Enable verified badge</span>
                  </label>

                  {fetchingProfile && (
                    <p className="text-[12px] text-gray-500">Fetching profile...</p>
                  )}
                  {fetchStatus && (
                    <p
                      className={`text-[12px] font-medium ${
                        fetchStatus.type === 'ok'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {fetchStatus.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Robux Balance Amount */}
              <div className="pt-2 border-t border-gray-100 dark:border-[#2B2E33]">
                <label
                  htmlFor="edit-balance"
                  className="block text-[13.5px] font-bold text-[#111315] dark:text-white"
                >
                  Robux Balance Amount
                </label>
                <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-2">
                  Enter the simulated amount of Robux you want in your balance
                </p>

                <div className="relative">
                  <RobuxIcon className="w-4 h-4 text-[#111315] dark:text-white absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="edit-balance"
                    type="text"
                    inputMode="numeric"
                    lang="en"
                    dir="ltr"
                    value={balanceStr}
                    onChange={(e) =>
                      setBalanceStr(normalizeAsciiDigits(e.target.value).replace(/[^\d]/g, ''))
                    }
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[14px] font-bold text-[#111315] dark:text-white focus:border-[#0066FF] outline-none tabular-nums"
                  />
                </div>

                {/* 6 Preset Balance Buttons */}
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {BALANCE_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBalanceStr(String(amt))}
                      className={`py-2 px-2 rounded-lg border text-[12.5px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        Number(balanceStr) === amt
                          ? 'border-[#111315] dark:border-white bg-[#F4F5F7] dark:bg-[#2A2D32] text-[#111315] dark:text-white'
                          : 'border-[#E4E6E8] dark:border-[#32353B] bg-white dark:bg-[#222428] text-[#393B3D] dark:text-gray-200 hover:bg-[#F5F6F8] dark:hover:bg-[#2C2F34]'
                      }`}
                    >
                      <RobuxIcon className="w-3.5 h-3.5" />
                      <span>{formatRobux(amt)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {profileError && (
                <p className="text-[12.5px] font-medium text-rose-600 dark:text-rose-400">
                  {profileError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[14px] transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* TAB 2: Auto Gift */}
          {activeTab === 'auto-gift' && (
            <AutoGiftPanel
              config={settings.autoGift}
              running={autoGiftRunning}
              balance={profile.balance}
              logs={autoGiftLogs}
              giftedCount={autoGiftGiftedCount}
              onToggleRunning={onToggleAutoGift}
              onUpdateConfig={(next: AutoGiftConfig) => onUpdateSettings({ autoGift: next })}
              onClearLogs={onClearAutoGiftLogs}
              onHotkeyRecordingChange={onHotkeyRecordingChange}
            />
          )}

          {/* TAB 3: Friends */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              <form onSubmit={handleAddFriend} className="space-y-2">
                <label
                  htmlFor="add-friend-input"
                  className="block text-[12.5px] font-bold text-[#111315] dark:text-white"
                >
                  Friend Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="add-friend-input"
                    type="text"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    placeholder="Enter username to add"
                    className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13.5px] text-[#111315] dark:text-white focus:border-[#0066FF] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingFriend}
                    className="h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {addingFriend && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Add Friend
                  </button>
                </div>
                {friendError && (
                  <p className="text-[12px] text-rose-600 dark:text-rose-400">{friendError}</p>
                )}
              </form>

              <p className="text-[12px] text-[#606264] dark:text-gray-400">
                {friendsDraft.length}/200 friends added
              </p>

              <div className="max-h-[240px] overflow-y-auto sim-scroll space-y-2 pr-1">
                {friendsDraft.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-2.5 rounded-xl border border-[#EAECEF] dark:border-[#2E3136] bg-[#FAFAFB] dark:bg-[#24272B] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.displayName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-[#111315] dark:text-white truncate">
                          {friend.displayName}
                        </p>
                        <p className="text-[11.5px] text-gray-500 dark:text-gray-400 truncate">
                          @{friend.username}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id)}
                      aria-label={`Remove ${friend.displayName}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveFriends}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[14px] transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* TAB 4: Notification */}
          {activeTab === 'notification' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-bold text-[#111315] dark:text-white">
                  Success Notification Style
                </h3>
                <p className="text-[12px] text-[#606264] dark:text-gray-400 mt-0.5">
                  Choose how you want to see the simulated confirmation after sending Robux.
                </p>
              </div>

              {/* Toast Option */}
              <button
                type="button"
                onClick={() => setNotifStyle('toast')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  notifStyle === 'toast'
                    ? 'border-[#2563EB] bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-[#E4E6E8] dark:border-[#32353B]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      notifStyle === 'toast'
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-gray-400'
                    }`}
                  >
                    {notifStyle === 'toast' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[13.5px] font-bold text-[#111315] dark:text-white">
                    Toast Style
                  </span>
                </div>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#191B1F] text-white text-[12.5px] font-semibold shadow">
                  <span className="w-4 h-4 rounded-full bg-white text-[#191B1F] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>You sent 100 Robux</span>
                </div>
              </button>

              {/* Modal Option */}
              <button
                type="button"
                onClick={() => setNotifStyle('modal')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  notifStyle === 'modal'
                    ? 'border-[#2563EB] bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-[#E4E6E8] dark:border-[#32353B]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      notifStyle === 'modal'
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-gray-400'
                    }`}
                  >
                    {notifStyle === 'modal' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[13.5px] font-bold text-[#111315] dark:text-white">
                    Modal Style
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#25272C] border border-gray-200 dark:border-[#35383E] shadow-xs text-center">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-2">
                    <span>Send Robux</span>
                    <span>345</span>
                  </div>
                  <div className="w-7 h-7 rounded-full border border-gray-400 mx-auto flex items-center justify-center mb-1">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11.5px] font-medium text-gray-600 dark:text-gray-300">
                    You sent 10 Robux
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSaveNotification}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[14px] transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* TAB 5: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Appearance */}
              <div>
                <h3 className="text-[14px] font-bold text-[#111315] dark:text-white">
                  Appearance
                </h3>
                <p className="text-[12px] text-[#606264] dark:text-gray-400 mb-2.5">
                  Choose how Buy Robux Simulator looks on this device.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['light', 'dark'] as ThemeMode[]).map((mode) => {
                    const active = settings.theme === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => onUpdateSettings({ theme: mode })}
                        className={`py-2.5 px-3 rounded-xl border-2 text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          active
                            ? 'border-[#111315] dark:border-white bg-[#F4F5F7] dark:bg-[#2A2D32] text-[#111315] dark:text-white'
                            : 'border-[#E4E6E8] dark:border-[#32353B] text-[#606264] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#25272B]'
                        }`}
                      >
                        {mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{mode === 'light' ? 'Light mode' : 'Dark mode'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Friends Visibility Toggles */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#2B2E33] space-y-2.5">
                <h3 className="text-[14px] font-bold text-[#111315] dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Friends Visibility
                </h3>
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#EAECEF] dark:border-[#2E3136] cursor-pointer">
                  <span className="text-[12.5px] font-medium text-[#111315] dark:text-gray-200">
                    Show Friends list in Send Robux modal
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showFriendsInSend}
                    onChange={(e) => onUpdateSettings({ showFriendsInSend: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#EAECEF] dark:border-[#2E3136] cursor-pointer">
                  <span className="text-[12.5px] font-medium text-[#111315] dark:text-gray-200">
                    Show Friends link in sidebar
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showFriendsInSidebar}
                    onChange={(e) => onUpdateSettings({ showFriendsInSidebar: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                </label>
              </div>

              {/* Sound Effects Toggle */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#2B2E33] space-y-2.5">
                <h3 className="text-[14px] font-bold text-[#111315] dark:text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" /> Sound Effects
                </h3>
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#EAECEF] dark:border-[#2E3136] cursor-pointer">
                  <span className="text-[12.5px] font-medium text-[#111315] dark:text-gray-200">
                    Play sound on Visa Quick Pay &amp; Robux Send
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                </label>
              </div>

              {/* Help & Feedback */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#2B2E33]">
                <h3 className="text-[14px] font-bold text-[#111315] dark:text-white">
                  Help &amp; Feedback
                </h3>
                <p className="text-[12px] text-[#606264] dark:text-gray-400 mb-2.5">
                  Help us improve the simulator. Send a bug report or feature idea.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFeedbackKind('bug')}
                    className="p-3 rounded-xl border border-[#E4E6E8] dark:border-[#32353B] hover:border-[#0066FF] text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-[#111315] dark:text-white">
                        Report a Bug
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Something not working?
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackKind('feature')}
                    className="p-3 rounded-xl border border-[#E4E6E8] dark:border-[#32353B] hover:border-[#0066FF] text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-[#111315] dark:text-white">
                        Suggest a Feature
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Share simulator ideas
                      </p>
                    </div>
                  </button>
                </div>

                {feedbackKind && (
                  <form onSubmit={handleSubmitFeedback} className="mt-3 space-y-2">
                    <textarea
                      rows={2}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackKind === 'bug'
                          ? 'Describe the issue...'
                          : 'Describe your feature idea...'
                      }
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] text-[#111315] dark:text-white outline-none focus:border-[#0066FF]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setFeedbackKind(null)}
                        className="px-3 py-1 rounded-lg text-[12px] font-semibold text-gray-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold cursor-pointer"
                      >
                        Submit Locally
                      </button>
                    </div>
                  </form>
                )}

                {feedbacks.length === 0 ? (
                  <p className="mt-3 text-[11.5px] text-gray-500 dark:text-gray-400">
                    No submissions yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-1.5">
                    {feedbacks.slice(0, 3).map((fb) => (
                      <div
                        key={fb.id}
                        className="px-3 py-2 rounded-lg bg-[#F4F5F7] dark:bg-[#25272B] text-[11.5px] flex items-center justify-between gap-2"
                      >
                        <span className="truncate text-[#111315] dark:text-gray-200">
                          <strong>{fb.kind === 'bug' ? 'Bug:' : 'Idea:'}</strong> {fb.message}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">Saved</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Disclaimer */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-3 text-[13px] leading-relaxed text-[#393B3D] dark:text-gray-300">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-amber-800 dark:text-amber-200">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Unofficial Simulator Notice</p>
                  <p className="text-[12px] mt-0.5">
                    This website is an unofficial Roblox-themed simulator created strictly for demonstration, content creation, and entertainment.
                  </p>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-[12.5px]">
                <li>Not affiliated with, endorsed by, or connected to Roblox Corporation.</li>
                <li>All Robux balances, transfers, packages, and checkouts are 100% simulated locally in your browser.</li>
                <li>No real Robux are sent or purchased, and no Roblox passwords or payment card details are ever requested or collected.</li>
                <li>Public username lookups only query publicly accessible Roblox user and avatar endpoints.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
