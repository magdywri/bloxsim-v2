import React from 'react';
import {
  Send,
  Search,
  UserCog,
  ShoppingBag,
  History,
  Settings,
  ArrowUpRight,
  Users,
  ShieldAlert,
} from 'lucide-react';
import type { ActivePage, FriendEntry, Transaction, UserProfile } from '../types/simulator';
import { formatRobux } from '../utils/simulatorLogic';
import { RobuxIcon, VerifiedBadge } from './Icons';

interface DashboardViewProps {
  profile: UserProfile;
  friends: FriendEntry[];
  transactions: Transaction[];
  onNavigate: (page: ActivePage) => void;
  onOpenSendModal: (preselectedFriend?: FriendEntry) => void;
  onOpenEditProfile: (tab?: 'profile' | 'auto-gift' | 'friends' | 'notification' | 'settings' | 'disclaimer') => void;
}

export function DashboardView({
  profile,
  friends,
  transactions,
  onNavigate,
  onOpenSendModal,
  onOpenEditProfile,
}: DashboardViewProps) {
  const recentActivity = transactions.slice(0, 5);

  const quickActions = [
    {
      label: 'Send Robux',
      desc: 'Simulate sending Robux to a user',
      icon: <Send className="w-4 h-4" />,
      primary: true,
      onClick: () => onOpenSendModal(),
    },
    {
      label: 'Roblox User Search',
      desc: 'Look up public accounts & avatars',
      icon: <Search className="w-4 h-4" />,
      onClick: () => onNavigate('user-search'),
    },
    {
      label: 'Profile Editor',
      desc: 'Edit name, avatar & balance',
      icon: <UserCog className="w-4 h-4" />,
      onClick: () => onOpenEditProfile('profile'),
    },
    {
      label: 'Robux Shop',
      desc: 'Preview packages & checkout',
      icon: <ShoppingBag className="w-4 h-4" />,
      onClick: () => onNavigate('robux-shop'),
    },
    {
      label: 'Activity Console',
      desc: 'View & manage simulated history',
      icon: <History className="w-4 h-4" />,
      onClick: () => onNavigate('activity'),
    },
    {
      label: 'Settings',
      desc: 'Theme, friends & notifications',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => onOpenEditProfile('settings'),
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Title & Unofficial Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[#111315] dark:text-white">
            Simulator Dashboard
          </h1>
          <p className="text-[13px] text-[#606264] dark:text-gray-400">
            Unofficial Roblox-themed Robux simulator overview. All actions are local and simulated.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenEditProfile('disclaimer')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[12px] font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          Unofficial Simulator Info
        </button>
      </div>

      {/* Top Grid: User Profile Summary + Robux Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Profile Summary */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-16 h-16 rounded-full object-cover bg-gray-100 dark:bg-[#2A2D32] border border-black/10 dark:border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[20px] font-extrabold text-[#111315] dark:text-white truncate">
                  {profile.displayName}
                </h2>
                {profile.verified && <VerifiedBadge className="w-5 h-5 shrink-0" />}
              </div>
              <p className="text-[13px] text-[#606264] dark:text-gray-400 font-medium">
                @{profile.username} • Joined {profile.joinedDate}
              </p>
              <p className="text-[12.5px] text-[#757779] dark:text-gray-400 mt-1 line-clamp-1">
                {profile.bio}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenEditProfile('profile')}
            className="px-4 py-2 rounded-xl bg-[#F0F2F5] dark:bg-[#2A2D32] hover:bg-[#E4E6EA] dark:hover:bg-[#34383E] text-[13px] font-semibold text-[#111315] dark:text-white transition-colors shrink-0 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* Simulated Robux Balance Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#606264] dark:text-gray-400">
              Simulated Balance
            </span>
            <div className="mt-2 flex items-center gap-2 text-[#111315] dark:text-white">
              <RobuxIcon className="w-7 h-7" />
              <span className="text-[28px] font-black tracking-tight tabular-nums">
                {formatRobux(profile.balance)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenSendModal()}
              className="flex-1 py-2 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Send Robux
            </button>
            <button
              type="button"
              onClick={() => onNavigate('robux-shop')}
              className="py-2 px-3 rounded-xl bg-[#F0F2F5] dark:bg-[#2A2D32] hover:bg-[#E4E6EA] dark:hover:bg-[#34383E] text-[#111315] dark:text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Shop
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="text-[16px] font-bold text-[#111315] dark:text-white mb-3"
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                action.primary
                  ? 'bg-[#2563EB]/6 dark:bg-[#2563EB]/15 border-[#2563EB]/30 hover:border-[#2563EB]'
                  : 'bg-white dark:bg-[#1B1D20] border-[#E4E6E8] dark:border-[#2E3136] hover:border-[#0066FF] dark:hover:border-blue-500'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  action.primary
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F0F2F5] dark:bg-[#2A2D32] text-[#111315] dark:text-white'
                }`}
              >
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#111315] dark:text-white">
                  {action.label}
                </p>
                <p className="text-[12px] text-[#606264] dark:text-gray-400 mt-0.5">
                  {action.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Split: Recent Activity + Friends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <section
          aria-labelledby="recent-activity-heading"
          className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-[#EAECEF] dark:border-[#2C2F33] flex items-center justify-between">
            <h2
              id="recent-activity-heading"
              className="text-[15px] font-bold text-[#111315] dark:text-white"
            >
              Recent Activity
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="text-[12.5px] font-semibold text-[#0066FF] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              View Console <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#606264] dark:text-gray-400">
              No simulated activity yet. Try sending Robux or simulating a package purchase.
            </div>
          ) : (
            <div className="divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
              {recentActivity.map((tx) => (
                <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#111315] dark:text-white truncate">
                      {tx.type === 'send'
                        ? `Sent to ${tx.targetName}`
                        : tx.type === 'purchase'
                          ? `Shop: ${tx.targetName}`
                          : tx.targetName}
                    </p>
                    <p className="text-[11.5px] text-[#757779] dark:text-gray-400">
                      {new Date(tx.createdAt).toLocaleString('en-US')} • {tx.status}
                    </p>
                  </div>
                  <span
                    className={`text-[13.5px] font-bold tabular-nums shrink-0 ${
                      tx.type === 'send'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {tx.type === 'send' ? '-' : '+'}
                    {formatRobux(tx.amount)} R$
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Friends Snapshot */}
        <section
          aria-labelledby="dashboard-friends-heading"
          className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-[#EAECEF] dark:border-[#2C2F33] flex items-center justify-between">
            <h2
              id="dashboard-friends-heading"
              className="text-[15px] font-bold text-[#111315] dark:text-white flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Friends ({friends.length})
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('friends')}
              className="text-[12.5px] font-semibold text-[#0066FF] hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>
          <div className="divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
            {friends.slice(0, 4).map((friend) => (
              <div key={friend.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    className="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-[#2A2D32] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#111315] dark:text-white truncate">
                      {friend.displayName}
                    </p>
                    <p className="text-[11px] text-[#757779] dark:text-gray-400 truncate">
                      @{friend.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSendModal(friend)}
                  className="px-2.5 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#2A2D32] hover:bg-[#E4E6EA] dark:hover:bg-[#353940] text-[11.5px] font-semibold text-[#111315] dark:text-white cursor-pointer shrink-0"
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
