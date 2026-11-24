import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, Settings, X, ArrowUpRight, History } from 'lucide-react';
import type { ActivePage, Transaction, UserProfile } from '../types/simulator';
import { formatRobux } from '../utils/simulatorLogic';
import { BrandWordmark, RobloxSquareMark, RobuxIcon } from './Icons';

interface TopNavProps {
  profile: UserProfile;
  activePage: ActivePage;
  searchQuery: string;
  transactions: Transaction[];
  mobileMenuOpen: boolean;
  onNavigate: (page: ActivePage) => void;
  onSearchSubmit: (query: string) => void;
  onOpenSendModal: () => void;
  onOpenEditProfile: (tab?: 'profile' | 'auto-gift' | 'friends' | 'notification' | 'settings' | 'disclaimer') => void;
  onToggleMobileMenu: () => void;
}

export function TopNav({
  profile,
  activePage,
  searchQuery,
  transactions,
  mobileMenuOpen,
  onNavigate,
  onSearchSubmit,
  onOpenSendModal,
  onOpenEditProfile,
  onToggleMobileMenu,
}: TopNavProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  const desktopNavLinks: Array<{ label: string; page: ActivePage; title: string }> = [
    { label: 'Home', page: 'dashboard', title: 'Dashboard Overview' },
    { label: 'Charts', page: 'activity', title: 'Activity Console & History' },
    { label: 'Marketplace', page: 'robux-shop', title: 'Robux Shop & Packages' },
    { label: 'Create', page: 'auto-gift', title: 'Auto Gift Preview' },
  ];

  const mobileSubLinks: Array<{ label: string; page: ActivePage }> = [
    { label: 'Charts', page: 'activity' },
    { label: 'Marketplace', page: 'dashboard' },
    { label: 'Create', page: 'auto-gift' },
    { label: 'Robux', page: 'robux-shop' },
  ];

  const recentNotifs = transactions.slice(0, 4);

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#191B1D] border-b border-[#E4E6E8] dark:border-[#2C2F33] transition-colors">
      {/* Row 1: Main Top Header */}
      <div className="h-[52px] px-3 lg:px-5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Menu + Logo + Desktop Primary Nav */}
        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            data-testid="mobile-menu-toggle"
            className="lg:hidden w-9 h-8 rounded-lg border border-[#D4D7DC] dark:border-[#3A3E45] bg-[#F5F6F8] dark:bg-[#22252A] text-[#1F2328] dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2C3037] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('robux-shop')}
            aria-label="Go to Robux Shop"
            className="text-[#111315] dark:text-white hover:opacity-85 transition-opacity cursor-pointer flex items-center"
          >
            <span className="md:hidden inline-flex items-center">
              <RobloxSquareMark className="w-[26px] h-[26px]" />
            </span>
            <span className="hidden md:inline-flex items-center">
              <BrandWordmark />
            </span>
          </button>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {desktopNavLinks.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  type="button"
                  title={item.title}
                  onClick={() => onNavigate(item.page)}
                  className={`px-3 py-1.5 text-[14.5px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#111315] dark:text-white font-bold'
                      : 'text-[#393B3D] dark:text-gray-300 hover:text-[#111315] dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Global Roblox User Search */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="flex-1 max-w-[375px] hidden sm:flex items-center relative"
        >
          <Search className="w-4 h-4 text-[#606264] dark:text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search Roblox users"
            className="w-full h-[32px] pl-9 pr-8 rounded-lg bg-[#EBEDEF] dark:bg-[#25272A] border border-transparent focus:border-[#0066FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1E2023] text-[13.5px] text-[#111315] dark:text-gray-100 placeholder-[#757779] dark:placeholder-gray-400 outline-none transition-all"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => setLocalQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Bell + User Avatar Thumbnail + Robux Balance + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notifications Bell */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="View simulated notifications"
              className="relative p-1.5 rounded-lg text-[#1F2328] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2D31] transition-colors cursor-pointer"
            >
              <Bell className="w-[19px] h-[19px]" />
              {transactions.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {Math.min(9, transactions.length)}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#323539] shadow-xl overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-[#EAECEF] dark:border-[#2C2F33] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111315] dark:text-white">
                    Recent Activity
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate('activity');
                    }}
                    className="text-[12px] font-semibold text-[#0066FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Console <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2C2F33]">
                  {recentNotifs.length === 0 ? (
                    <p className="p-4 text-[13px] text-gray-500 dark:text-gray-400 text-center">
                      No recent activity yet.
                    </p>
                  ) : (
                    recentNotifs.map((tx) => (
                      <div key={tx.id} className="px-4 py-2.5 flex items-center justify-between gap-2 text-[12px]">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111315] dark:text-gray-100 truncate">
                            {tx.type === 'send'
                              ? `Sent to ${tx.targetName}`
                              : tx.targetName}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            • {tx.status}
                          </p>
                        </div>
                        <span
                          className={`font-bold shrink-0 ${
                            tx.type === 'send'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {tx.type === 'send' ? '-' : '+'}
                          {formatRobux(tx.amount)} R$
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    onNavigate('activity');
                  }}
                  className="w-full py-2 text-[12px] font-semibold text-center bg-gray-50 dark:bg-[#25272A] text-[#393B3D] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2E3136] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" /> Open Full Activity Console
                </button>
              </div>
            )}
          </div>

          {/* User Avatar Thumbnail right next to Robux / Search */}
          <button
            type="button"
            onClick={() => onOpenEditProfile('profile')}
            title={`${profile.displayName} — Click to edit profile & avatar`}
            aria-label={`Edit profile and avatar for ${profile.displayName}`}
            data-testid="topbar-avatar"
            className="p-0.5 rounded-full hover:ring-2 hover:ring-[#2563EB]/60 transition-all cursor-pointer shrink-0"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-7 h-7 rounded-full object-cover bg-gray-200 dark:bg-[#2C2F33] border border-black/15 dark:border-white/25 block"
            />
          </button>

          {/* Mobile Search shortcut (positioned between Avatar and Robux like official mobile header) */}
          <button
            type="button"
            onClick={() => onNavigate('user-search')}
            aria-label="Search Roblox Users"
            className="sm:hidden p-1.5 rounded-lg text-[#1F2328] dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2A2D31] cursor-pointer"
          >
            <Search className="w-[20px] h-[20px]" />
          </button>

          {/* Robux Balance Pill */}
          <button
            type="button"
            onClick={onOpenSendModal}
            title={`Robux balance: ${formatRobux(profile.balance)} — Click to send Robux`}
            aria-label={`Simulated Robux balance ${formatRobux(profile.balance)}. Click to send Robux.`}
            className="flex items-center gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2D31] text-[#111315] dark:text-white font-bold text-[14px] transition-colors cursor-pointer"
          >
            <RobuxIcon className="w-[20px] h-[20px] sm:w-[18px] sm:h-[18px]" />
            <span data-testid="topbar-balance" className="hidden sm:inline tabular-nums">
              {formatRobux(profile.balance)}
            </span>
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={() => onOpenEditProfile('settings')}
            aria-label="Open Settings"
            title="Simulator Settings & Appearance"
            className="p-1.5 rounded-lg text-[#1F2328] dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2A2D31] transition-colors cursor-pointer"
          >
            <Settings className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px]" />
          </button>
        </div>
      </div>

      {/* Row 2: Mobile Sub-Navigation Bar (matches official Roblox mobile header) */}
      <nav
        aria-label="Mobile navigation bar"
        className="md:hidden h-[38px] px-4 border-t border-[#EAECEF] dark:border-[#26292D] flex items-center justify-between text-[13.5px] font-semibold"
      >
        {mobileSubLinks.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.page)}
              className={`h-full px-1 inline-flex items-center border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#111315] dark:border-white text-[#111315] dark:text-white font-bold'
                  : 'border-transparent text-[#393B3D] dark:text-gray-300 hover:text-[#111315] dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
