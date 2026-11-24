import React from 'react';
import {
  Home,
  User,
  MessageSquare,
  Users,
  Shirt,
  Backpack,
  ArrowLeftRight,
  UsersRound,
  PenTool,
  Store,
  Gift,
  X,
} from 'lucide-react';
import type { ActivePage, UserProfile } from '../types/simulator';
import { RobloxPlusIcon, VerifiedBadge } from './Icons';

interface SidebarProps {
  profile: UserProfile;
  friendsCount: number;
  showFriendsInSidebar: boolean;
  activePage: ActivePage;
  mobileOpen: boolean;
  robloxPlusSubscribed: boolean;
  avatarFlash?: 'start' | 'stop' | null;
  onCloseMobile: () => void;
  onNavigate: (page: ActivePage) => void;
  onOpenEditProfile: (tab?: 'profile' | 'auto-gift' | 'friends' | 'notification' | 'settings' | 'disclaimer') => void;
  onSubscribePlus: () => void;
}

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  page?: ActivePage;
  onClick?: () => void;
  badge?: string | number;
  hidden?: boolean;
}

export function Sidebar({
  profile,
  friendsCount,
  showFriendsInSidebar,
  activePage,
  mobileOpen,
  robloxPlusSubscribed,
  avatarFlash = null,
  onCloseMobile,
  onNavigate,
  onOpenEditProfile,
  onSubscribePlus,
}: SidebarProps) {
  const navItems: SidebarNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      page: 'dashboard',
      icon: <Home className="w-[19px] h-[19px]" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-[19px] h-[19px]" />,
      onClick: () => {
        onOpenEditProfile('profile');
        onCloseMobile();
      },
    },
    {
      id: 'robux-shop',
      label: 'Roblox Plus',
      page: 'robux-shop',
      icon: <RobloxPlusIcon className="w-[19px] h-[19px]" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      page: 'messages',
      icon: <MessageSquare className="w-[19px] h-[19px]" />,
      badge: 6,
    },
    {
      id: 'friends',
      label: 'Friends',
      page: 'friends',
      icon: <Users className="w-[19px] h-[19px]" />,
      badge: friendsCount,
      hidden: !showFriendsInSidebar,
    },
    {
      id: 'avatar',
      label: 'Avatar',
      page: 'avatar',
      icon: <Shirt className="w-[19px] h-[19px]" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      page: 'inventory',
      icon: <Backpack className="w-[19px] h-[19px]" />,
    },
    {
      id: 'activity',
      label: 'Trade',
      page: 'activity',
      icon: <ArrowLeftRight className="w-[19px] h-[19px]" />,
    },
    {
      id: 'user-search',
      label: 'Communities',
      page: 'user-search',
      icon: <UsersRound className="w-[19px] h-[19px]" />,
    },
    {
      id: 'disclaimer',
      label: 'Newsroom',
      page: 'disclaimer',
      icon: <PenTool className="w-[19px] h-[19px]" />,
    },
    {
      id: 'auto-gift',
      label: 'Official Store',
      page: 'auto-gift',
      icon: <Store className="w-[19px] h-[19px]" />,
    },
    {
      id: 'gift-cards',
      label: 'Buy Gift Cards',
      page: 'gift-cards',
      icon: <Gift className="w-[19px] h-[19px]" />,
    },
  ];

  const handleSelectPage = (page: ActivePage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const renderSidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full justify-between py-3 px-3 select-none">
      <div>
        {/* User Profile Row (matches official Roblox sidebar top row) */}
        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => {
              onOpenEditProfile('profile');
              onCloseMobile();
            }}
            title="Click to Edit Simulator Profile"
            className="flex-1 min-w-0 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-[#23262B] transition-colors text-left cursor-pointer"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              data-testid={isMobileDrawer ? undefined : 'sidebar-profile-avatar'}
              data-flash={avatarFlash ?? 'none'}
              className={`w-7 h-7 rounded-full object-cover bg-gray-200 dark:bg-[#2C2F33] shrink-0 transition-all duration-200 ${
                avatarFlash === 'start'
                  ? 'ring-[3px] ring-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.95)] scale-110'
                  : avatarFlash === 'stop'
                    ? 'ring-[3px] ring-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.95)] scale-110'
                    : 'border border-black/10 dark:border-white/15'
              }`}
            />
            <span className="text-[14.5px] font-semibold text-[#111315] dark:text-white truncate">
              {profile.displayName}
            </span>
            {profile.verified && <VerifiedBadge className="w-4 h-4 shrink-0" />}
          </button>

          {isMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#26292E] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sidebar Links */}
        <nav aria-label="Sidebar navigation" className="space-y-0.5">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const isActive = item.page ? activePage === item.page : false;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.page) {
                      handleSelectPage(item.page);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 lg:py-2 rounded-xl text-[14px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EBECEE] dark:bg-[#25282D] text-[#111315] dark:text-white font-semibold'
                      : 'text-[#2B2D30] dark:text-gray-100 hover:bg-[#F4F5F6] dark:hover:bg-[#202328]'
                  }`}
                >
                  <span className="flex items-center gap-3.5 min-w-0">
                    <span className="shrink-0 opacity-90">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge !== undefined && (
                    <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#2563EB] text-white text-[11.5px] font-bold flex items-center justify-center leading-none shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Bottom Promo Box */}
      <div className="mt-4 p-3 rounded-xl border border-[#E4E6E8] dark:border-[#2C2F35] bg-[#FAFAFB] dark:bg-[#191B1F]">
        <div className="flex items-center gap-2 mb-1.5 text-[#111315] dark:text-white">
          <RobloxPlusIcon className="w-5 h-5" />
          {robloxPlusSubscribed && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          )}
        </div>
        <p className="text-[11.5px] leading-snug text-[#606264] dark:text-gray-400 mb-2">
          More fun for less Robux. Subscribe to Roblox Plus.
        </p>
        <button
          type="button"
          onClick={() => {
            onSubscribePlus();
            onCloseMobile();
          }}
          className="text-[12px] font-bold underline text-[#111315] dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 cursor-pointer"
        >
          {robloxPlusSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (optimized for PC / computer layout) */}
      <aside className="hidden lg:block w-[218px] shrink-0 bg-white dark:bg-[#141517] border-r border-[#EAECEF] dark:border-[#26292E] min-h-[calc(100vh-52px)] transition-colors">
        <div className="sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto sim-scroll">
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* Mobile Drawer (slides cleanly beneath the mobile header matching official Roblox site) */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[91px] md:top-[52px] bottom-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-x-0 top-[91px] md:top-[52px] bottom-0 bg-black/45 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            aria-label="Mobile navigation drawer"
            data-testid="mobile-drawer"
            className="relative w-[290px] max-w-[76vw] h-full bg-white dark:bg-[#121315] border-r border-[#EAECEF] dark:border-[#2A2D32] z-10 overflow-y-auto sim-scroll shadow-2xl"
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
