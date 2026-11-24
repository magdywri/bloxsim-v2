import React, { useEffect, useState } from 'react';
import { ChevronDown, Info, Loader2, X } from 'lucide-react';
import type { RobuxPackage } from '../types/simulator';
import { formatRobux } from '../utils/simulatorLogic';
import { RobloxPlusIcon, RobuxIcon } from './Icons';
import { playVisaPurchaseSound, primeAudioContext } from '../utils/sounds';

interface CheckoutModalProps {
  pkg: RobuxPackage | null;
  soundEnabled: boolean;
  onClose: () => void;
  onConfirmSimulatedPurchase: (pkg: RobuxPackage) => void;
  onOpenDisclaimer: () => void;
}

interface PaymentPreset {
  id: 'visa' | 'mastercard' | 'paypal' | 'discover' | 'amex';
  label: string;
  last4: string;
  exp: string;
  badgeText: string;
  badgeBg: string;
}

const PAYMENT_PRESETS: PaymentPreset[] = [
  {
    id: 'visa',
    label: 'Visa',
    last4: '7235',
    exp: '06/28',
    badgeText: 'VISA',
    badgeBg: 'text-[#1A1F71] border-[#D7DCE5] bg-white',
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    last4: '5412',
    exp: '06/28',
    badgeText: 'MC',
    badgeBg: 'text-[#EB001B] border-[#D7DCE5] bg-white',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    last4: '4091',
    exp: '09/27',
    badgeText: 'PayPal',
    badgeBg: 'text-[#003087] border-[#D7DCE5] bg-white',
  },
  {
    id: 'discover',
    label: 'Discover',
    last4: '9014',
    exp: '11/28',
    badgeText: 'DISC',
    badgeBg: 'text-[#FF6000] border-[#D7DCE5] bg-white',
  },
  {
    id: 'amex',
    label: 'American Express',
    last4: '3001',
    exp: '04/29',
    badgeText: 'AMEX',
    badgeBg: 'text-white border-[#006FCF] bg-[#006FCF]',
  },
];

type CheckoutStage = 'review' | 'working' | 'done';

export function CheckoutModal({
  pkg,
  soundEnabled,
  onClose,
  onConfirmSimulatedPurchase,
  onOpenDisclaimer,
}: CheckoutModalProps) {
  const [stage, setStage] = useState<CheckoutStage>('review');
  const [processingBtn, setProcessingBtn] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PaymentPreset>(PAYMENT_PRESETS[0]);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  useEffect(() => {
    if (!pkg) return;
    setStage('review');
    setProcessingBtn(false);
    setMethodDropdownOpen(false);
  }, [pkg]);

  if (!pkg) return null;

  const isSubscription = pkg.id.startsWith('sub-');
  const itemHeading =
    pkg.id === 'sub-roblox-plus'
      ? 'Roblox Plus'
      : pkg.id === 'sub-plus-500'
        ? 'Plus 500'
        : pkg.id === 'sub-plus-1000'
          ? 'Plus 1000'
          : `${formatRobux(pkg.totalRobux)} Robux`;

  const handlePayNow = () => {
    if (processingBtn || stage !== 'review') return;
    if (soundEnabled) {
      primeAudioContext();
    }
    setProcessingBtn(true);
    setTimeout(() => {
      setProcessingBtn(false);
      setStage('working');
      setTimeout(() => {
        onConfirmSimulatedPurchase(pkg);
        if (soundEnabled) {
          playVisaPurchaseSound();
        }
        setStage('done');
      }, 2600);
    }, 950);
  };

  const handleClose = () => {
    setProcessingBtn(false);
    setStage('review');
    setMethodDropdownOpen(false);
    onClose();
  };

  const renderBadge = (preset: PaymentPreset) => {
    if (preset.id === 'mastercard') {
      return (
        <span className="inline-flex items-center justify-center w-9 h-6 rounded border border-[#D7DCE5] bg-white shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#EB001B] -mr-1.5 opacity-95" />
          <span className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-90" />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center w-9 h-6 rounded border text-[9px] font-black tracking-tight shrink-0 ${preset.badgeBg}`}
      >
        {preset.badgeText}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-pay-title"
    >
      {stage === 'working' && (
        <div
          data-testid="quickpay-working"
          className="w-full max-w-[300px] rounded-xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl p-7 text-center space-y-3.5"
        >
          <Loader2 className="w-9 h-9 animate-spin text-[#2563EB] dark:text-white mx-auto" />
          <div className="space-y-1">
            <p className="text-[15px] font-bold text-[#111315] dark:text-white">Working...</p>
            <p className="text-[12px] text-[#606264] dark:text-gray-400">
              Authorizing payment...
            </p>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="w-full max-w-[310px] rounded-xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl p-6 space-y-5">
          <p className="text-[14.5px] leading-snug font-medium text-[#111315] dark:text-white">
            Purchase successful, your product will be delivered shortly.
          </p>
          <button
            type="button"
            onClick={handleClose}
            data-testid="quickpay-ok-button"
            className="text-[14px] font-bold text-[#111315] dark:text-white hover:text-[#2563EB] cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {stage === 'review' && (
        <div className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl overflow-visible relative">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-[#2B2E33]">
            <h2 id="quick-pay-title" className="text-[18px] font-bold text-[#111315] dark:text-white">
              Quick Pay
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close Quick Pay modal"
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2F34] hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Package + Optional Bonus Virtual Item Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {isSubscription ? (
                  <RobloxPlusIcon className="w-9 h-9 text-[#111315] dark:text-white shrink-0" />
                ) : (
                  <RobuxIcon className="w-9 h-9 text-[#111315] dark:text-white shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold text-[#111315] dark:text-white truncate">
                    {itemHeading}
                  </p>
                  <p className="text-[12.5px] text-[#52555A] dark:text-gray-400">
                    {pkg.priceUsd}
                    {isSubscription ? '/month' : ''}
                  </p>
                </div>
              </div>

              {pkg.group === 'featured' && (
                <>
                  <span className="text-[#8A8D93] font-bold text-[15px] shrink-0">+</span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="/assets/ink-game-icon.png"
                      alt="Ink Game Bonus Item"
                      className="w-9 h-9 rounded-full object-cover border border-black/15 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111315] dark:text-white truncate">
                        [🏅] Ink Game
                      </p>
                      <p className="text-[11px] text-[#606264] dark:text-gray-400 truncate">
                        Bonus Virtual Item
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 text-[13px] pt-1">
              <div className="flex items-center justify-between text-[#52555A] dark:text-gray-300">
                <span>Subtotal</span>
                <span className="tabular-nums">{pkg.priceUsd}</span>
              </div>
              <div className="flex items-center justify-between text-[#52555A] dark:text-gray-300">
                <span className="inline-flex items-center gap-1">
                  Tax <Info className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <span className="tabular-nums">$0.00</span>
              </div>
              <div className="pt-2.5 border-t border-gray-200 dark:border-[#2F3238] flex items-center justify-between text-[14px] font-bold text-[#111315] dark:text-white">
                <span>Total due</span>
                <span className="tabular-nums">{pkg.priceUsd}</span>
              </div>
            </div>

            {/* Display Payment Method Selector (preset icons only, no real card input) */}
            <div className="space-y-2 relative">
              <p className="text-[12.5px] font-medium text-[#52555A] dark:text-gray-300">
                The amount will be charged to:
              </p>

              <button
                type="button"
                onClick={() => setMethodDropdownOpen((prev) => !prev)}
                className="w-full h-12 px-3.5 rounded-xl border border-[#D4D7DC] dark:border-[#363940] bg-white dark:bg-[#17191C] flex items-center justify-between gap-3 hover:border-[#9CA3AF] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#111315] dark:text-white">
                  {renderBadge(selectedPreset)}
                  <span className="tabular-nums">••••{selectedPreset.last4}</span>
                  <span className="text-[12.5px] font-normal text-[#52555A] dark:text-gray-400 tabular-nums">
                    Exp: {selectedPreset.exp}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    methodDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setMethodDropdownOpen((prev) => !prev)}
                className="text-[12.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Use a different payment method
              </button>

              {methodDropdownOpen && (
                <div className="mt-1 rounded-xl bg-white dark:bg-[#23262B] border border-[#E4E6E8] dark:border-[#363940] shadow-xl py-1.5 divide-y divide-gray-100 dark:divide-[#2E3138]">
                  {PAYMENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset);
                        setMethodDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-[13px] font-semibold hover:bg-[#F4F5F7] dark:hover:bg-[#2D3036] transition-colors cursor-pointer ${
                        selectedPreset.id === preset.id
                          ? 'text-[#2563EB]'
                          : 'text-[#111315] dark:text-white'
                      }`}
                    >
                      {renderBadge(preset)}
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fine Print */}
            <p className="text-[10.5px] leading-relaxed text-[#606264] dark:text-gray-400">
              I agree I am accessing a local demonstration checkout governed by the{' '}
              <button
                type="button"
                onClick={onOpenDisclaimer}
                className="underline font-semibold text-[#111315] dark:text-gray-200 cursor-pointer"
              >
                Simulator Disclaimer
              </button>
              . No real charges occur and no payment credentials are processed.
            </p>

            {/* Primary Actions */}
            <div className="pt-1 flex items-center justify-center gap-2.5">
              {processingBtn ? (
                <div className="py-2 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-[#111315] dark:text-white" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePayNow}
                    data-testid="quickpay-pay-now"
                    className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[13.5px] transition-colors cursor-pointer"
                  >
                    Pay Now
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2 rounded-lg bg-[#E4E6EA] dark:bg-[#2E3136] hover:bg-[#D7DAE0] dark:hover:bg-[#3A3E44] text-[#111315] dark:text-white font-bold text-[13.5px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
