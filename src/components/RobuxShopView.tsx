import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  Tag,
  Gamepad2,
  PiggyBank,
  ChevronRight,
  ChevronDown,
  Loader2,
  Info,
} from 'lucide-react';
import type { RobuxPackage, UserProfile } from '../types/simulator';
import {
  FEATURED_ROBUX_PACKAGES,
  STANDARD_ROBUX_PACKAGES,
  formatRobux,
} from '../utils/simulatorLogic';
import { RobloxPlusIcon, RobuxIcon } from './Icons';
import inkGameBannerHd from '../assets/images/ink_game_banner_hd_1795293245077.jpg';

interface RobuxShopViewProps {
  profile: UserProfile;
  robloxPlusSubscribed: boolean;
  onOpenSendModal: () => void;
  onSelectPackage: (pkg: RobuxPackage) => void;
  onOpenEditProfile: (
    tab?: 'profile' | 'auto-gift' | 'friends' | 'notification' | 'settings' | 'disclaimer'
  ) => void;
}

const FAQ_ITEMS = [
  {
    q: 'What are Robux?',
    a: 'Robux are the virtual currency shown across this interface for buying virtual items, passes, and avatar accessories. All balances and transactions shown here run locally in demonstration mode.',
  },
  {
    q: 'Where are my Robux?',
    a: 'Your current balance always appears in the top navigation bar and in the top-right pill above the Robux store. You can adjust it anytime from the Profile & Robux editor.',
  },
  {
    q: 'Do Robux expire?',
    a: 'No. Any balance added via Quick Pay or redeemed from demo gift codes remains stored locally in your browser across page refreshes.',
  },
  {
    q: 'How do I send Robux or inspect the disclaimer?',
    a: 'Click the Send button next to your balance to pick a friend or search any public Roblox username. Click the Info icon in the top bar or the link below to open the full Unofficial Simulator Disclaimer.',
  },
];

const PLUS_PLANS: Array<{
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  buttonText: string;
  pkg: RobuxPackage;
  perks: Array<{ icon: 'tag' | 'gamepad' | 'robux' | 'plus' | 'piggy'; text: string }>;
}> = [
  {
    id: 'plus-base',
    title: 'Roblox Plus',
    price: '$4.99',
    buttonText: '$4.99/month',
    pkg: {
      id: 'sub-roblox-plus',
      totalRobux: 250,
      originalRobux: 250,
      bonusRobux: 0,
      priceUsd: '$4.99',
      group: 'standard',
    },
    perks: [
      { icon: 'tag', text: '10% off in-game items, avatars, and more' },
      { icon: 'gamepad', text: 'Free private servers' },
      { icon: 'robux', text: 'Send Robux for free' },
    ],
  },
  {
    id: 'plus-500',
    title: 'Plus 500',
    price: '$8.99',
    oldPrice: '$9.98',
    buttonText: '$8.99/month',
    pkg: {
      id: 'sub-plus-500',
      totalRobux: 500,
      originalRobux: 500,
      bonusRobux: 0,
      priceUsd: '$8.99',
      group: 'standard',
    },
    perks: [
      { icon: 'plus', text: 'Everything in Plus' },
      { icon: 'robux', text: '+500 Robux every month' },
      { icon: 'piggy', text: '$9.98 total value' },
    ],
  },
  {
    id: 'plus-1000',
    title: 'Plus 1000',
    price: '$12.99',
    oldPrice: '$14.98',
    buttonText: '$12.99/month',
    pkg: {
      id: 'sub-plus-1000',
      totalRobux: 1000,
      originalRobux: 1000,
      bonusRobux: 0,
      priceUsd: '$12.99',
      group: 'standard',
    },
    perks: [
      { icon: 'plus', text: 'Everything in Plus' },
      { icon: 'robux', text: '+1,000 Robux every month' },
      { icon: 'piggy', text: '$14.98 total value' },
    ],
  },
];

export function RobuxShopView({
  profile,
  robloxPlusSubscribed,
  onOpenSendModal,
  onSelectPackage,
  onOpenEditProfile,
}: RobuxShopViewProps) {
  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activePlanOffset, setActivePlanOffset] = useState<number | null>(null);

  const handlePackageClick = (pkg: RobuxPackage) => {
    if (loadingPkgId) return;
    setLoadingPkgId(pkg.id);
    setTimeout(() => {
      setLoadingPkgId(null);
      onSelectPackage(pkg);
    }, 600);
  };

  const renderPerkIcon = (kind: 'tag' | 'gamepad' | 'robux' | 'plus' | 'piggy') => {
    switch (kind) {
      case 'tag':
        return <Tag className="w-3.5 h-3.5 shrink-0 text-[#52555A] dark:text-gray-400" />;
      case 'gamepad':
        return <Gamepad2 className="w-3.5 h-3.5 shrink-0 text-[#52555A] dark:text-gray-400" />;
      case 'robux':
        return <RobuxIcon className="w-3.5 h-3.5 shrink-0 text-[#111315] dark:text-gray-200" />;
      case 'plus':
        return <RobloxPlusIcon className="w-3.5 h-3.5 shrink-0 text-[#52555A] dark:text-gray-400" />;
      case 'piggy':
        return <PiggyBank className="w-3.5 h-3.5 shrink-0 text-[#52555A] dark:text-gray-400" />;
    }
  };

  return (
    <div className="relative pb-20">
      {/* Hero Section with Perspective Grid Backdrop + Top-Right Balance/Send Pill */}
      <div className="relative pt-4 pb-8 px-4 sm:px-8 overflow-hidden">
        <div
          className="hero-perspective-grid absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Top-Right Balance + Send Pill (exact match to video) */}
        <div className="relative max-w-[1060px] mx-auto flex justify-end mb-2 sm:mb-0">
          <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#F0F2F4]/95 dark:bg-[#222427]/95 border border-[#E4E6E9] dark:border-[#303338] shadow-xs">
            <button
              type="button"
              onClick={() => onOpenEditProfile('profile')}
              title="Edit Profile & Balance"
              className="flex items-center gap-2 text-[#111315] dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RobuxIcon className="w-6 h-6" />
              <span
                data-testid="hero-balance"
                className="text-[20px] font-extrabold tracking-tight tabular-nums"
              >
                {formatRobux(profile.balance)}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenSendModal}
              data-testid="hero-send-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E2E5E9] dark:bg-[#313439] hover:bg-[#D5D9DF] dark:hover:bg-[#3C4046] text-[#111315] dark:text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>

        <div className="relative max-w-[540px] mx-auto text-center pt-1 sm:-mt-2">
          <h1 className="text-[32px] sm:text-[42px] font-black tracking-tight leading-[1.08] text-[#111315] dark:text-white">
            Enjoy up to 25%
            <br />
            more Robux
          </h1>
        </div>
      </div>

      {/* Main Centered Content Column (matches video desktop proportion) */}
      <div className="px-4 max-w-[576px] mx-auto space-y-8">
        {/* Section 1: Bonus item we picked for you */}
        <section aria-labelledby="bonus-item-heading">
          <h2
            id="bonus-item-heading"
            className="text-[17px] font-bold text-[#111315] dark:text-white mb-3"
          >
            Bonus item we picked for you
          </h2>

          <div className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-sm overflow-hidden">
            {/* Upgraded HD Ink Game Banner Image */}
            <div className="relative w-full aspect-[544/84] sm:aspect-auto sm:h-[84px] overflow-hidden bg-[#111827]">
              <img
                src={inkGameBannerHd}
                alt="Ink Game — Custom Player Tag"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-[1.01] block"
              />
            </div>

            {/* 5 Featured Packages */}
            <div className="divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
              {FEATURED_ROBUX_PACKAGES.map((pkg) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  loading={loadingPkgId === pkg.id}
                  onSelect={handlePackageClick}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Robux packages */}
        <section aria-labelledby="robux-packages-heading">
          <h2
            id="robux-packages-heading"
            className="text-[17px] font-bold text-[#111315] dark:text-white mb-1"
          >
            Robux packages
          </h2>
          <p className="text-[11.5px] text-[#606264] dark:text-gray-400 mb-3 leading-relaxed">
            By purchasing Robux, you agree to our{' '}
            <button
              type="button"
              onClick={() => onOpenEditProfile('disclaimer')}
              className="underline hover:text-[#111315] dark:hover:text-white cursor-pointer"
            >
              Terms of Use
            </button>
            , including the arbitration clause and revocation policy.
          </p>

          <div className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] shadow-sm overflow-hidden divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
            {STANDARD_ROBUX_PACKAGES.map((pkg) => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                loading={loadingPkgId === pkg.id}
                onSelect={handlePackageClick}
              />
            ))}
          </div>
        </section>

        {/* Section 3: New on Roblox (exact 3-column card row from video) */}
        <section aria-labelledby="new-on-roblox-heading" className="pt-1 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#111315] dark:text-white">
              <RobloxPlusIcon className="w-5 h-5" />
              <h2 id="new-on-roblox-heading" className="text-[17px] font-bold">
                New on Roblox
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenEditProfile('disclaimer')}
              className="text-[12.5px] font-semibold underline text-[#393B3D] dark:text-gray-300 hover:text-[#0066FF] cursor-pointer"
            >
              Learn more
            </button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PLUS_PLANS.map((plan, index) => {
                const isEmphasized = activePlanOffset === index;
                return (
                  <div
                    key={plan.id}
                    className={`p-3 rounded-2xl bg-white dark:bg-[#1B1D20] border flex flex-col justify-between transition-all ${
                      isEmphasized
                        ? 'border-[#0066FF] ring-1 ring-[#0066FF]/20'
                        : 'border-[#E4E6E8] dark:border-[#2E3136]'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-1 mb-3">
                        <span className="text-[12.5px] font-bold text-[#111315] dark:text-white whitespace-nowrap">
                          {plan.title}
                        </span>
                        <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
                          {plan.oldPrice && (
                            <span className="text-[10px] text-[#757779] dark:text-gray-400 line-through">
                              {plan.oldPrice}
                            </span>
                          )}
                          <span className="text-[12.5px] font-extrabold text-[#111315] dark:text-white whitespace-nowrap">
                            {plan.price}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.perks.map((perk) => (
                          <li
                            key={perk.text}
                            className="flex items-start gap-2 text-[11px] leading-snug text-[#393B3D] dark:text-gray-300"
                          >
                            <span className="mt-0.5">{renderPerkIcon(perk.icon)}</span>
                            <span>{perk.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePackageClick(plan.pkg)}
                      disabled={loadingPkgId === plan.pkg.id}
                      className="w-full h-8 rounded-lg bg-[#E9EBEE] dark:bg-[#2E3136] hover:bg-[#DCDFE4] dark:hover:bg-[#3A3E44] text-[#111315] dark:text-white text-[12px] font-semibold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {loadingPkgId === plan.pkg.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : robloxPlusSubscribed && index === 0 ? (
                        'Active'
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePlanOffset((prev) =>
                  prev === null ? 0 : (prev + 1) % PLUS_PLANS.length
                )
              }
              aria-label="Highlight next Roblox Plus tier"
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#111315] dark:bg-white text-white dark:text-[#111315] items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Section 4: FAQ Accordion */}
        <section aria-labelledby="faq-heading" className="pt-1">
          <h2
            id="faq-heading"
            className="text-[17px] font-bold text-[#111315] dark:text-white mb-3"
          >
            FAQ
          </h2>
          <div className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] divide-y divide-[#F0F1F3] dark:divide-[#272A2E] overflow-hidden">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#FAFAFB] dark:hover:bg-[#212428] transition-colors cursor-pointer"
                  >
                    <span className="text-[13.5px] font-semibold text-[#111315] dark:text-white">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#606264] dark:text-gray-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-3.5 text-[12.5px] leading-relaxed text-[#606264] dark:text-gray-400">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Single Consolidated Unofficial Info / Disclaimer Trigger */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => onOpenEditProfile('disclaimer')}
            data-testid="open-disclaimer-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#606264] dark:text-gray-400 hover:text-[#111315] dark:hover:text-white hover:bg-[#EAECEF] dark:hover:bg-[#23252A] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Unofficial Simulator Disclaimer &amp; Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageRow({
  pkg,
  loading,
  onSelect,
}: {
  pkg: RobuxPackage;
  loading: boolean;
  onSelect: (pkg: RobuxPackage) => void;
}) {
  return (
    <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAFAFB] dark:hover:bg-[#212428] transition-colors">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[#111315] dark:text-white">
          <RobuxIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[20px] sm:text-[22px] font-extrabold tracking-tight tabular-nums">
            {formatRobux(pkg.totalRobux)}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[12.5px] text-[#757779] dark:text-gray-400 line-through tabular-nums">
          <RobuxIcon className="w-3.5 h-3.5" />
          {formatRobux(pkg.originalRobux)}
        </span>

        {pkg.bonusRobux > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0F2F5] dark:bg-[#2A2D32] text-[#393B3D] dark:text-gray-300">
            + {formatRobux(pkg.bonusRobux)} more
          </span>
        )}

        {pkg.forYouTag && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0F2F5] dark:bg-[#2A2D32] text-[#111315] dark:text-gray-200">
            <Sparkles className="w-3 h-3 text-[#0066FF]" /> For you
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(pkg)}
        disabled={loading}
        aria-label={`Select ${formatRobux(pkg.totalRobux)} Robux for ${pkg.priceUsd}`}
        className={`w-[104px] sm:w-[132px] h-[36px] rounded-lg text-[13.5px] font-semibold flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
          pkg.highlight
            ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
            : 'bg-[#E9EBEE] dark:bg-[#2E3136] hover:bg-[#DCDFE4] dark:hover:bg-[#3A3E44] text-[#111315] dark:text-white'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : pkg.priceUsd}
      </button>
    </div>
  );
}
