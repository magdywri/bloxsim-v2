import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Send,
  CreditCard,
  ShieldAlert,
  MessageSquare,
  Package,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type {
  ActivePage,
  AutoGiftConfig,
  AutoGiftLogEntry,
  FriendEntry,
  UserProfile,
} from '../types/simulator';
import { fetchPublicRobloxUser } from '../services/robloxApi';
import {
  PRESET_AVATARS,
  formatJoinYear,
  formatRobux,
  makeFallbackAvatar,
} from '../utils/simulatorLogic';
import { VerifiedBadge } from './Icons';
import { AutoGiftPanel } from './AutoGiftPanel';

export function FriendsView({
  friends,
  onAddFriend,
  onRemoveFriend,
  onSendToFriend,
}: {
  friends: FriendEntry[];
  onAddFriend: (friend: FriendEntry) => void;
  onRemoveFriend: (id: string) => void;
  onSendToFriend: (friend: FriendEntry) => void;
}) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = username.trim().replace(/^@/, '');
    if (!cleaned || !/^[A-Za-z0-9_]{2,32}$/.test(cleaned)) {
      setError('Enter a valid Roblox username.');
      return;
    }
    if (friends.some((f) => f.username.toLowerCase() === cleaned.toLowerCase())) {
      setError(`@${cleaned} is already in your friends list.`);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetchPublicRobloxUser(cleaned);
    setLoading(false);
    if (!res.user) {
      setError(res.error || `Could not find "@${cleaned}".`);
      return;
    }
    onAddFriend({
      id: `friend-${res.user.id}-${Date.now()}`,
      robloxId: res.user.id,
      displayName: res.user.displayName,
      username: res.user.name,
      avatarUrl: res.user.avatarUrl || makeFallbackAvatar(res.user.name),
      verified: res.user.hasVerifiedBadge,
      joinedYear: formatJoinYear(res.user.created) ?? undefined,
      connectedLabel: 'Public Roblox Account',
    });
    setUsername('');
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2563EB]" /> Friends ({friends.length})
        </h1>
        <p className="text-[13px] text-[#606264] dark:text-gray-400">
          Manage your simulator friends list for quick simulated Robux transfers.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] flex flex-col sm:flex-row gap-2.5"
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add public Roblox username..."
          aria-label="Friend username"
          className="flex-1 h-10 px-3.5 rounded-xl bg-[#F4F5F7] dark:bg-[#15171A] border border-transparent focus:border-[#0066FF] text-[13.5px] text-[#111315] dark:text-white outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Add Friend
        </button>
      </form>
      {error && <p className="text-[12.5px] text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={friend.avatarUrl}
                alt={friend.displayName}
                className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-[#2C2F34] shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[14.5px] font-bold text-[#111315] dark:text-white truncate">
                    {friend.displayName}
                  </p>
                  {friend.verified && <VerifiedBadge className="w-4 h-4 shrink-0" />}
                </div>
                <p className="text-[12px] text-[#757779] dark:text-gray-400 truncate">
                  @{friend.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSendToFriend(friend)}
                className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" /> Send
              </button>
              <button
                type="button"
                onClick={() => onRemoveFriend(friend.id)}
                aria-label={`Remove ${friend.displayName}`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AvatarView({
  profile,
  onUpdateAvatar,
  onOpenEditProfile,
}: {
  profile: UserProfile;
  onUpdateAvatar: (url: string) => void;
  onOpenEditProfile: () => void;
}) {
  const [customUrl, setCustomUrl] = useState(profile.avatarUrl);

  React.useEffect(() => {
    setCustomUrl(profile.avatarUrl);
  }, [profile.avatarUrl]);

  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white">
            Avatar Customizer
          </h1>
          <p className="text-[13px] text-[#606264] dark:text-gray-400">
            Choose a preset avatar or paste a custom avatar URL for your simulator profile.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEditProfile}
          className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-bold cursor-pointer"
        >
          Full Profile Editor
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] flex flex-col sm:flex-row items-center gap-6">
        <img
          src={profile.avatarUrl}
          alt={profile.displayName}
          className="w-28 h-28 rounded-full object-cover border-2 border-[#2563EB]/30 bg-gray-100 dark:bg-[#2C2F34]"
        />
        <div className="flex-1 w-full space-y-3">
          <p className="text-[13px] font-bold text-[#111315] dark:text-white">
            Quick Preset Avatars
          </p>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_AVATARS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCustomUrl(item.url);
                  onUpdateAvatar(item.url);
                }}
                className={`p-1.5 pr-3 rounded-xl border inline-flex items-center gap-2 text-[12.5px] font-semibold cursor-pointer ${
                  profile.avatarUrl === item.url
                    ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 text-[#111315] dark:text-white'
                    : 'border-[#E4E6E8] dark:border-[#2E3136] text-[#393B3D] dark:text-gray-300'
                }`}
              >
                <img src={item.url} alt={item.label} className="w-7 h-7 rounded-full object-cover" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customUrl.trim()) onUpdateAvatar(customUrl.trim());
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Custom avatar image URL"
              className="flex-1 h-9 px-3 rounded-xl bg-[#F4F5F7] dark:bg-[#15171A] border border-transparent focus:border-[#0066FF] text-[13px] text-[#111315] dark:text-white outline-none"
            />
            <button
              type="submit"
              className="px-4 h-9 rounded-xl bg-[#111315] dark:bg-white text-white dark:text-[#111315] text-[12.5px] font-bold cursor-pointer"
            >
              Apply URL
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AutoGiftView({
  config,
  running,
  balance,
  logs,
  giftedCount,
  onToggleRunning,
  onUpdateConfig,
  onClearLogs,
  onHotkeyRecordingChange,
}: {
  config: AutoGiftConfig;
  running: boolean;
  balance: number;
  logs: AutoGiftLogEntry[];
  giftedCount: number;
  onToggleRunning: () => void;
  onUpdateConfig: (next: AutoGiftConfig) => void;
  onClearLogs: () => void;
  onHotkeyRecordingChange?: (recording: boolean) => void;
}) {
  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div dir="rtl" className="text-right">
        <h1 className="text-[22px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2563EB]" />
          <span>بوت الإرسال التلقائي (Auto Gift)</span>
        </h1>
        <p className="mt-1 text-[13px] text-[#606264] dark:text-gray-400">
          بيفتح نافذة الإرسال تلقائي، ويكتب يوزر نيم لاعب عادي (غير موثق) كل مرة، ويختار رقم روبوكس عشوائي ويبعت لحد ما توقفه.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-xs">
        <AutoGiftPanel
          config={config}
          running={running}
          balance={balance}
          logs={logs}
          giftedCount={giftedCount}
          onToggleRunning={onToggleRunning}
          onUpdateConfig={onUpdateConfig}
          onClearLogs={onClearLogs}
          onHotkeyRecordingChange={onHotkeyRecordingChange}
        />
      </div>
    </div>
  );
}

export function GiftCardsView({
  onRedeemCode,
}: {
  onRedeemCode: (code: string) => { amountAdded: number; error: string | null };
}) {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onRedeemCode(code);
    if (res.error) {
      setFeedback({ ok: false, text: res.error });
    } else {
      setFeedback({
        ok: true,
        text: `Redeemed ${formatRobux(res.amountAdded)} simulated Robux!`,
      });
      setCode('');
    }
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#2563EB]" /> Simulated Gift Cards
        </h1>
        <p className="text-[13px] text-[#606264] dark:text-gray-400">
          Test redeeming demo simulator codes. No real Roblox gift cards are used or accepted.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] space-y-4"
      >
        <div>
          <label
            htmlFor="demo-gift-code"
            className="block text-[12.5px] font-bold text-[#111315] dark:text-white mb-1.5"
          >
            Demo Simulator Code
          </label>
          <div className="flex gap-2">
            <input
              id="demo-gift-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Try SIM-1000"
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F4F5F7] dark:bg-[#15171A] border border-transparent focus:border-[#0066FF] text-[14px] text-[#111315] dark:text-white outline-none uppercase"
            />
            <button
              type="submit"
              className="px-5 h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[13.5px] cursor-pointer"
            >
              Redeem (Sim)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[12px]">
          <span className="text-gray-500 dark:text-gray-400">Demo codes:</span>
          {['SIM-500', 'SIM-1000', 'BLOXSIM', 'SIM-5000'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCode(c)}
              className="px-2 py-0.5 rounded bg-[#F0F2F5] dark:bg-[#2A2D32] font-mono font-bold text-[#111315] dark:text-gray-200 cursor-pointer"
            >
              {c}
            </button>
          ))}
        </div>

        {feedback && (
          <p
            className={`text-[13px] font-semibold flex items-center gap-1.5 ${
              feedback.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {feedback.ok && <CheckCircle2 className="w-4 h-4" />}
            {feedback.text}
          </p>
        )}
      </form>
    </div>
  );
}

export function MessagesView({ onNavigate }: { onNavigate: (p: ActivePage) => void }) {
  const messages = [
    {
      id: 'm1',
      sender: 'Simulator System',
      subject: 'Welcome to Unofficial Robux Simulator',
      preview: 'All Robux balances, transfers, and packages are simulated locally.',
      time: 'Just now',
    },
    {
      id: 'm2',
      sender: 'altof_ygt',
      subject: 'Stream overlay test',
      preview: 'Ready to test the simulated Robux transfer modal!',
      time: '1h ago',
    },
    {
      id: 'm3',
      sender: 'Bloxy_cola',
      subject: 'Bonus Item Preview',
      preview: 'Check out the Ink Game Custom Player Tag card in the shop.',
      time: '3h ago',
    },
  ];

  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#2563EB]" /> Simulated Messages
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('activity')}
          className="text-[13px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
        >
          View Activity Console
        </button>
      </div>
      <div className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
        {messages.map((m) => (
          <div key={m.id} className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#111315] dark:text-white">
                {m.subject}
              </span>
              <span className="text-[11.5px] text-gray-400">{m.time}</span>
            </div>
            <p className="text-[12px] font-semibold text-[#2563EB]">From: {m.sender}</p>
            <p className="text-[13px] text-[#606264] dark:text-gray-400">{m.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InventoryView({
  items,
  onNavigate,
}: {
  items: string[];
  onNavigate: (p: ActivePage) => void;
}) {
  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-[#2563EB]" /> Simulated Inventory
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('robux-shop')}
          className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-bold cursor-pointer"
        >
          Go to Shop
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black flex items-center justify-center shrink-0">
              456
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111315] dark:text-white">{item}</p>
              <p className="text-[12px] text-[#606264] dark:text-gray-400">
                Unlocked in simulator session
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DisclaimerView() {
  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      <h1 className="text-[24px] font-extrabold text-[#111315] dark:text-white flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-amber-500" /> Unofficial Simulator Disclaimer
      </h1>
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] space-y-3 text-[13.5px] leading-relaxed text-[#393B3D] dark:text-gray-300">
        <p className="font-bold text-[#111315] dark:text-white">
          This application is an unofficial Roblox-themed Robux simulator built solely for demonstration, UI showcase, and entertainment purposes.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>We are not affiliated with, sponsored by, or officially connected to Roblox Corporation.</li>
          <li>Every Robux balance, Robux transfer, package price, and checkout confirmation is simulated locally in your browser.</li>
          <li>This simulator never performs real Robux transfers and never asks for Roblox passwords, cookies, or payment details.</li>
          <li>Public Roblox User Search queries publicly available Roblox profile &amp; avatar endpoints directly without authentication.</li>
        </ul>
      </div>
    </div>
  );
}
