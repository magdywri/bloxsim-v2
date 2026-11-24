import React, { useEffect, useState } from 'react';
import {
  Play,
  Square,
  Keyboard,
  Sliders,
  RotateCcw,
  Check,
  Terminal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { AutoGiftConfig, AutoGiftLogEntry } from '../types/simulator';
import {
  AUTO_GIFT_EXACT_USERNAMES,
  DEFAULT_AUTO_GIFT_CONFIG,
  buildCombinedUsernamePool,
  isSupportedHotkey,
  normalizeAsciiDigits,
  normalizeHotkeyLabel,
  parseCustomUsernamesList,
  sanitizeAutoGiftConfig,
} from '../utils/simulatorLogic';

interface AutoGiftPanelProps {
  config: AutoGiftConfig;
  running: boolean;
  balance: number;
  logs: AutoGiftLogEntry[];
  giftedCount: number;
  onToggleRunning: () => void;
  onUpdateConfig: (next: AutoGiftConfig) => void;
  onClearLogs: () => void;
  onHotkeyRecordingChange?: (recording: boolean) => void;
}

const PRESET_HOTKEYS = ['F4', 'F6', 'F8', 'F9', 'G'];

export function AutoGiftPanel({
  config,
  running,
  balance,
  logs,
  giftedCount,
  onToggleRunning,
  onUpdateConfig,
  onClearLogs,
  onHotkeyRecordingChange,
}: AutoGiftPanelProps) {
  const [draft, setDraft] = useState<AutoGiftConfig>(config);
  const [customUsernamesText, setCustomUsernamesText] = useState<string>(
    config.customUsernames.join('\n')
  );
  const [editingTiming, setEditingTiming] = useState(false);
  const [recordingHotkey, setRecordingHotkey] = useState(false);
  const [guidedStep, setGuidedStep] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [numInputs, setNumInputs] = useState<Record<string, string>>(() => ({
    homeWaitSec: String(config.homeWaitSec),
    modalOpenWaitSec: String(config.modalOpenWaitSec),
    typingSpeedWpm: String(config.typingSpeedWpm),
    afterResultWaitSec: String(config.afterResultWaitSec),
    afterSelectWaitSec: String(config.afterSelectWaitSec),
    beforeNextWaitSec: String(config.beforeNextWaitSec),
    beforeSendWaitSec: String(config.beforeSendWaitSec),
    cycleDelaySec: String(config.cycleDelaySec),
    minRobux: String(config.minRobux),
    maxRobux: String(config.maxRobux),
    successMinSec: String(config.successMinSec),
    successMaxSec: String(config.successMaxSec),
  }));

  const prevSyncedJsonRef = React.useRef<string>('');

  useEffect(() => {
    onHotkeyRecordingChange?.(recordingHotkey);
    return () => onHotkeyRecordingChange?.(false);
  }, [recordingHotkey, onHotkeyRecordingChange]);

  useEffect(() => {
    if (!recordingHotkey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        setRecordingHotkey(false);
        return;
      }
      if (!isSupportedHotkey(e.key)) {
        return;
      }
      const nextKey = normalizeHotkeyLabel(e.key);
      const updated = sanitizeAutoGiftConfig({ ...config, hotkey: nextKey });
      setDraft((prev) => ({ ...prev, hotkey: nextKey }));
      onUpdateConfig(updated);
      setRecordingHotkey(false);
      setSavedNotice(`تم تحديد الزرار: ${nextKey}`);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingHotkey, config, onUpdateConfig]);

  useEffect(() => {
    if (!savedNotice) return;
    const t = setTimeout(() => setSavedNotice(null), 2500);
    return () => clearTimeout(t);
  }, [savedNotice]);

  const syncInputsFromConfig = (c: AutoGiftConfig) => {
    setDraft(c);
    setCustomUsernamesText(c.customUsernames.join('\n'));
    setNumInputs({
      homeWaitSec: String(c.homeWaitSec),
      modalOpenWaitSec: String(c.modalOpenWaitSec),
      typingSpeedWpm: String(c.typingSpeedWpm),
      afterResultWaitSec: String(c.afterResultWaitSec),
      afterSelectWaitSec: String(c.afterSelectWaitSec),
      beforeNextWaitSec: String(c.beforeNextWaitSec),
      beforeSendWaitSec: String(c.beforeSendWaitSec),
      cycleDelaySec: String(c.cycleDelaySec),
      minRobux: String(c.minRobux),
      maxRobux: String(c.maxRobux),
      successMinSec: String(c.successMinSec),
      successMaxSec: String(c.successMaxSec),
    });
  };

  useEffect(() => {
    const coreJson = JSON.stringify({
      homeWaitSec: config.homeWaitSec,
      modalOpenWaitSec: config.modalOpenWaitSec,
      typingSpeedWpm: config.typingSpeedWpm,
      afterResultWaitSec: config.afterResultWaitSec,
      afterSelectWaitSec: config.afterSelectWaitSec,
      beforeNextWaitSec: config.beforeNextWaitSec,
      beforeSendWaitSec: config.beforeSendWaitSec,
      cycleDelaySec: config.cycleDelaySec,
      minRobux: config.minRobux,
      maxRobux: config.maxRobux,
      successMinSec: config.successMinSec,
      successMaxSec: config.successMaxSec,
      customUsernames: config.customUsernames,
    });
    if (prevSyncedJsonRef.current && prevSyncedJsonRef.current === coreJson) {
      setDraft((prev) => ({
        ...prev,
        hotkey: config.hotkey,
        usernameInputMode: config.usernameInputMode,
      }));
      return;
    }
    prevSyncedJsonRef.current = coreJson;
    syncInputsFromConfig(config);
  }, [config]);

  const handleSaveTiming = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = sanitizeAutoGiftConfig({
      ...draft,
      customUsernames: parseCustomUsernamesList(customUsernamesText),
    });
    syncInputsFromConfig(cleaned);
    onUpdateConfig(cleaned);
    setEditingTiming(false);
    setGuidedStep(null);
    setSavedNotice('تم حفظ إعدادات Auto Gift بنجاح');
  };

  const handleResetDefaults = () => {
    const cleaned = { ...DEFAULT_AUTO_GIFT_CONFIG };
    syncInputsFromConfig(cleaned);
    onUpdateConfig(cleaned);
    setSavedNotice('تم إرجاع الإعدادات الافتراضية');
  };

  const handleSelectPresetHotkey = (hotkey: string) => {
    const cleaned = sanitizeAutoGiftConfig({ ...config, hotkey });
    setDraft((prev) => ({ ...prev, hotkey }));
    onUpdateConfig(cleaned);
    setRecordingHotkey(false);
    setSavedNotice(`تم تحديد الزرار: ${hotkey}`);
  };

  const handleSelectInputMode = (mode: 'type' | 'paste') => {
    const cleaned = sanitizeAutoGiftConfig({ ...config, usernameInputMode: mode });
    setDraft((prev) => ({ ...prev, usernameInputMode: mode }));
    onUpdateConfig(cleaned);
    setSavedNotice(
      mode === 'paste'
        ? 'تم التبديل إلى اللصق المباشر (Paste)'
        : 'تم التبديل إلى الكتابة بالحروف'
    );
  };

  const updateNumField = (field: keyof AutoGiftConfig, value: string, allowDecimal = true) => {
    const normalized = normalizeAsciiDigits(value);
    const cleanedText = allowDecimal
      ? normalized.replace(/[^0-9.]/g, '')
      : normalized.replace(/[^\d]/g, '');
    setNumInputs((prev) => ({ ...prev, [field]: cleanedText }));
    const parsed = Number(cleanedText);
    if (cleanedText !== '' && Number.isFinite(parsed)) {
      setDraft((prev) => ({
        ...prev,
        [field]: parsed,
      }));
    }
  };

  const totalPoolSize = buildCombinedUsernamePool(config.customUsernames).length;

  return (
    <div dir="rtl" className="space-y-4 text-right">
      {/* BOT STATUS Card */}
      <div className="p-3.5 rounded-xl border border-[#E4E6E8] dark:border-[#2E3136] bg-[#FAFAFB] dark:bg-[#181A1D] flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            حالة Auto Gift
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                running ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span
              data-testid="auto-gift-status"
              className={`text-[14px] font-extrabold ${
                running
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[#111315] dark:text-white'
              }`}
            >
              {running ? 'شغّال الآن' : 'متوقف'}
            </span>
          </div>
        </div>

        <div className="text-left">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            حسابات الإرسال (غير موثقة)
          </p>
          <p lang="en" className="text-[12.5px] font-bold text-[#111315] dark:text-white mt-0.5 tabular-nums">
            <span dir="ltr">{totalPoolSize}</span> حساب{config.customUsernames.length > 0 ? ` (+${config.customUsernames.length} مضاف)` : ''} • تم إرسال <span dir="ltr">{giftedCount}</span>
          </p>
        </div>
      </div>

      {/* Main Start / Stop Auto Gift Button */}
      <button
        type="button"
        onClick={onToggleRunning}
        data-testid="auto-gift-toggle-button"
        disabled={!running && balance < 1}
        className={`w-full py-3 px-4 rounded-xl font-extrabold text-[14.5px] text-white flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
          running
            ? 'bg-rose-600 hover:bg-rose-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {running ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            <span>إيقاف Auto Gift ({config.hotkey})</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>تشغيل Auto Gift ({config.hotkey})</span>
          </>
        )}
      </button>

      {!running && balance < 1 && (
        <p className="text-[12px] text-rose-600 dark:text-rose-400 font-medium text-center">
          رصيد الروبوكس الحالي 0. زوّد الرصيد الأول قبل تشغيل Auto Gift.
        </p>
      )}

      {/* PC Shortcut Key Binder */}
      <div className="p-3.5 rounded-xl border border-[#E4E6E8] dark:border-[#2E3136] bg-white dark:bg-[#191B1F] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12.5px] font-bold text-[#111315] dark:text-white flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-[#2563EB]" />
              زرار الكيبورد (تشغيل / إيقاف)
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              اضغط الزرار ده من أي مكان للتشغيل أو الإيقاف الفوري
            </p>
          </div>
          <button
            type="button"
            data-testid="auto-gift-hotkey-binder"
            onClick={() => setRecordingHotkey((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer shrink-0 ${
              recordingHotkey
                ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] animate-pulse'
                : 'border-[#D4D7DC] dark:border-[#34373D] bg-[#F4F5F7] dark:bg-[#24272B] text-[#111315] dark:text-white hover:border-[#2563EB]'
            }`}
          >
            {recordingHotkey ? 'دوس على أي زرار...' : `الزرار: ${config.hotkey}`}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-1">اختيار سريع:</span>
          {PRESET_HOTKEYS.map((key) => {
            const active = config.hotkey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPresetHotkey(key)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E4E6E8] dark:border-[#32353B] bg-[#FAFAFB] dark:bg-[#222428] text-[#393B3D] dark:text-gray-300 hover:border-[#2563EB]'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Username Input Mode Toggle (Type vs Paste) */}
      <div className="p-3.5 rounded-xl border border-[#E4E6E8] dark:border-[#2E3136] bg-white dark:bg-[#191B1F] space-y-2">
        <div>
          <p className="text-[12.5px] font-bold text-[#111315] dark:text-white">
            طريقة كتابة اسم اللاعب
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            اختار يكتب الاسم حرف بحرف ولا يلصقه مرة واحدة (Paste)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="input-mode-type"
            onClick={() => handleSelectInputMode('type')}
            className={`py-2 px-3 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
              config.usernameInputMode === 'type'
                ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-xs'
                : 'border-[#D4D7DC] dark:border-[#34373D] bg-[#FAFAFB] dark:bg-[#222428] text-[#111315] dark:text-gray-200 hover:border-[#2563EB]'
            }`}
          >
            كتابة بالحروف
          </button>
          <button
            type="button"
            data-testid="input-mode-paste"
            onClick={() => handleSelectInputMode('paste')}
            className={`py-2 px-3 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
              config.usernameInputMode === 'paste'
                ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-xs'
                : 'border-[#D4D7DC] dark:border-[#34373D] bg-[#FAFAFB] dark:bg-[#222428] text-[#111315] dark:text-gray-200 hover:border-[#2563EB]'
            }`}
          >
            لصق مباشر (Paste)
          </button>
        </div>
      </div>

      {/* Step-by-Step Guided Edit Trigger */}
      <button
        type="button"
        onClick={() => {
          setGuidedStep(guidedStep === null ? 0 : null);
          setEditingTiming(false);
        }}
        className="w-full py-2 px-3.5 rounded-xl border border-[#2563EB]/30 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/35 text-[#2563EB] dark:text-blue-400 text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>{guidedStep === null ? 'ضبط سريع خطوة بخطوة' : 'إغلاق الضبط السريع'}</span>
      </button>

      {/* Step-by-Step Guided Wizard */}
      {guidedStep !== null && (
        <div className="p-4 rounded-xl border-2 border-[#2563EB]/40 bg-[#FAFAFB] dark:bg-[#17191C] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-extrabold text-[#2563EB]">
              خطوة {guidedStep + 1} من 3
            </span>
            <span className="text-[11px] text-gray-500">إعداد Auto Gift السريع</span>
          </div>

          {guidedStep === 0 && (
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-[#111315] dark:text-white">
                1. اختار زرار التشغيل والإيقاف في الكيبورد
              </p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400">
                دوس على أي زرار من الأزرار دي أو حدد زرارك من المربع اللي فوق. ضغطة تشغّل وضغطة توقف.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_HOTKEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleSelectPresetHotkey(k)}
                    className={`px-3 py-1 rounded-lg text-[12px] font-bold border cursor-pointer ${
                      config.hotkey === k
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-white dark:bg-[#24272B] text-[#111315] dark:text-gray-200 border-[#D4D7DC] dark:border-[#34373D]'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {guidedStep === 1 && (
            <div className="space-y-2.5">
              <p className="text-[13px] font-bold text-[#111315] dark:text-white">
                2. مدى الروبوكس العشوائي (أرقام طبيعية بتنتهي بصفر)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="guided-min-robux" className="block text-[11px] font-semibold text-gray-500 mb-1">
                    أقل عدد روبوكس
                  </label>
                  <input
                    id="guided-min-robux"
                    type="text"
                    inputMode="numeric"
                    lang="en"
                    dir="ltr"
                    value={numInputs.minRobux ?? String(draft.minRobux)}
                    onChange={(e) => updateNumField('minRobux', e.target.value, false)}
                    className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13px] font-bold text-left tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="guided-max-robux" className="block text-[11px] font-semibold text-gray-500 mb-1">
                    أعلى عدد روبوكس
                  </label>
                  <input
                    id="guided-max-robux"
                    type="text"
                    inputMode="numeric"
                    lang="en"
                    dir="ltr"
                    value={numInputs.maxRobux ?? String(draft.maxRobux)}
                    onChange={(e) => updateNumField('maxRobux', e.target.value, false)}
                    className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13px] font-bold text-left tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {guidedStep === 2 && (
            <div className="space-y-2.5">
              <p className="text-[13px] font-bold text-[#111315] dark:text-white">
                3. سرعة الكتابة والوقت بين كل إرسال
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="guided-wpm" className="block text-[11px] font-semibold text-gray-500 mb-1">
                    سرعة الكتابة (WPM)
                  </label>
                  <input
                    id="guided-wpm"
                    type="text"
                    inputMode="numeric"
                    lang="en"
                    dir="ltr"
                    value={numInputs.typingSpeedWpm ?? String(draft.typingSpeedWpm)}
                    onChange={(e) => updateNumField('typingSpeedWpm', e.target.value, false)}
                    className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13px] font-bold text-left tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="guided-cycle-delay" className="block text-[11px] font-semibold text-gray-500 mb-1">
                    الانتظار بين كل دورة (ثانية)
                  </label>
                  <input
                    id="guided-cycle-delay"
                    type="text"
                    inputMode="decimal"
                    lang="en"
                    dir="ltr"
                    value={numInputs.cycleDelaySec ?? String(draft.cycleDelaySec)}
                    onChange={(e) => updateNumField('cycleDelaySec', e.target.value, true)}
                    className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16181B] border border-[#D4D7DC] dark:border-[#34373D] text-[13px] font-bold text-left tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={guidedStep === 0}
              onClick={() => setGuidedStep((s) => (s !== null && s > 0 ? s - 1 : 0))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" /> السابق
            </button>
            {guidedStep < 2 ? (
              <button
                type="button"
                onClick={() => setGuidedStep((s) => (s !== null ? s + 1 : 0))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-bold cursor-pointer"
              >
                التالي <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveTiming()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-bold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> حفظ وإنهاء
              </button>
            )}
          </div>
        </div>
      )}

      {/* HUMAN BEHAVIOR TIMING CONFIGURATION */}
      <form
        onSubmit={handleSaveTiming}
        className="p-3.5 rounded-xl border border-[#E4E6E8] dark:border-[#2E3136] bg-white dark:bg-[#191B1F] space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[12px] font-extrabold text-[#111315] dark:text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
            إعدادات التوقيت والسرعة (بأسلوب بشري طبيعي)
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2 py-1 rounded-md text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> افتراضي
            </button>
            <button
              type="button"
              data-testid="auto-gift-edit-timing-btn"
              onClick={() => setEditingTiming((prev) => !prev)}
              className="px-2.5 py-1 rounded-md bg-[#F0F2F5] dark:bg-[#26292E] text-[11px] font-bold text-[#111315] dark:text-white cursor-pointer"
            >
              {editingTiming ? 'إخفاء' : 'تعديل'}
            </button>
          </div>
        </div>

        {/* Summary Chips when collapsed */}
        {!editingTiming ? (
          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div className="p-2 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] flex justify-between gap-2">
              <span className="text-gray-500 dark:text-gray-400">سرعة الكتابة</span>
              <span className="font-bold text-[#111315] dark:text-white" dir="ltr">
                {config.typingSpeedWpm} WPM
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] flex justify-between gap-2">
              <span className="text-gray-500 dark:text-gray-400">مدى الروبوكس</span>
              <span className="font-bold text-[#111315] dark:text-white" dir="ltr">
                {config.minRobux}–{config.maxRobux} R$
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] flex justify-between gap-2">
              <span className="text-gray-500 dark:text-gray-400">راحة بين الدورات</span>
              <span className="font-bold text-[#111315] dark:text-white">
                {config.cycleDelaySec} ث
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] flex justify-between gap-2">
              <span className="text-gray-500 dark:text-gray-400">انتظار قبل الإرسال</span>
              <span className="font-bold text-[#111315] dark:text-white">
                {config.beforeSendWaitSec} ث
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="cfg-home-wait" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار قبل فتح Send (ثانية)
                </label>
                <input
                  id="cfg-home-wait"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.homeWaitSec ?? String(draft.homeWaitSec)}
                  onChange={(e) => updateNumField('homeWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-modal-wait" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار بعد فتح النافذة (ثانية)
                </label>
                <input
                  id="cfg-modal-wait"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.modalOpenWaitSec ?? String(draft.modalOpenWaitSec)}
                  onChange={(e) => updateNumField('modalOpenWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-typing-wpm" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  سرعة الكتابة (كلمة/دقيقة WPM)
                </label>
                <input
                  id="cfg-typing-wpm"
                  type="text"
                  inputMode="numeric"
                  lang="en"
                  dir="ltr"
                  value={numInputs.typingSpeedWpm ?? String(draft.typingSpeedWpm)}
                  onChange={(e) => updateNumField('typingSpeedWpm', e.target.value, false)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-after-result" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار بعد ظهور الحساب (ثانية)
                </label>
                <input
                  id="cfg-after-result"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.afterResultWaitSec ?? String(draft.afterResultWaitSec)}
                  onChange={(e) => updateNumField('afterResultWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-after-select" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار بعد اختيار اللاعب (ثانية)
                </label>
                <input
                  id="cfg-after-select"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.afterSelectWaitSec ?? String(draft.afterSelectWaitSec)}
                  onChange={(e) => updateNumField('afterSelectWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-before-next" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار قبل الضغط على Next (ثانية)
                </label>
                <input
                  id="cfg-before-next"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.beforeNextWaitSec ?? String(draft.beforeNextWaitSec)}
                  onChange={(e) => updateNumField('beforeNextWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-before-send" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  انتظار قبل تأكيد الإرسال Send (ثانية)
                </label>
                <input
                  id="cfg-before-send"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.beforeSendWaitSec ?? String(draft.beforeSendWaitSec)}
                  onChange={(e) => updateNumField('beforeSendWaitSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-cycle-delay" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  الراحة بين كل دورة والتانية (ثانية)
                </label>
                <input
                  id="cfg-cycle-delay"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.cycleDelaySec ?? String(draft.cycleDelaySec)}
                  onChange={(e) => updateNumField('cycleDelaySec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-min-robux" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  أقل روبوكس (ينتهي بصفر)
                </label>
                <input
                  id="cfg-min-robux"
                  type="text"
                  inputMode="numeric"
                  lang="en"
                  dir="ltr"
                  value={numInputs.minRobux ?? String(draft.minRobux)}
                  onChange={(e) => updateNumField('minRobux', e.target.value, false)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-max-robux" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  أعلى روبوكس (ينتهي بصفر)
                </label>
                <input
                  id="cfg-max-robux"
                  type="text"
                  inputMode="numeric"
                  lang="en"
                  dir="ltr"
                  value={numInputs.maxRobux ?? String(draft.maxRobux)}
                  onChange={(e) => updateNumField('maxRobux', e.target.value, false)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-success-min" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  مدة ظهور رسالة النجاح من (ثانية)
                </label>
                <input
                  id="cfg-success-min"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.successMinSec ?? String(draft.successMinSec)}
                  onChange={(e) => updateNumField('successMinSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="cfg-success-max" className="block text-[11px] font-semibold text-gray-500 mb-1">
                  مدة ظهور رسالة النجاح إلى (ثانية)
                </label>
                <input
                  id="cfg-success-max"
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  dir="ltr"
                  value={numInputs.successMaxSec ?? String(draft.successMaxSec)}
                  onChange={(e) => updateNumField('successMaxSec', e.target.value, true)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12.5px] font-bold text-left tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cfg-custom-usernames" className="block text-[11px] font-semibold text-gray-500 mb-1">
                إضافة أسماء حسابات من عندك (اختياري — اكتب اسم في كل سطر)
              </label>
              <textarea
                id="cfg-custom-usernames"
                lang="en"
                dir="ltr"
                rows={3}
                value={customUsernamesText}
                onChange={(e) => setCustomUsernamesText(e.target.value)}
                placeholder={`لو عايز تزود أسماء إضافية فوق الـ ${AUTO_GIFT_EXACT_USERNAMES.length} حساب الموجودين...`}
                className="w-full p-2.5 rounded-lg bg-[#FAFAFB] dark:bg-[#15171A] border border-[#D4D7DC] dark:border-[#34373D] text-[12px] font-mono text-[#111315] dark:text-white outline-none focus:border-[#2563EB] text-left"
              />
              <p className="mt-1 text-[10.5px] text-gray-500 dark:text-gray-400">
                أي أسماء تكتبها هنا بتتضاف فوق الـ <span lang="en" dir="ltr">{AUTO_GIFT_EXACT_USERNAMES.length}</span> حساب الموجودين، ولما يخلصوا كلهم البوت بيعيد من الأول تلقائياً.
              </p>
            </div>

            <button
              type="submit"
              data-testid="save-auto-gift-config"
              className="w-full py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-bold cursor-pointer"
            >
              حفظ الإعدادات
            </button>
          </div>
        )}

        {savedNotice && (
          <p className="text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {savedNotice}
          </p>
        )}
      </form>

      {/* Activity Log Console */}
      <div className="p-3.5 rounded-xl border border-[#E4E6E8] dark:border-[#2E3136] bg-[#141619] text-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            سجل العمليات
          </span>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="text-[11px] text-gray-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> مسح
            </button>
          )}
        </div>

        <div
          dir="ltr"
          data-testid="auto-gift-activity-log"
          className="max-h-[140px] overflow-y-auto sim-scroll space-y-1 font-mono text-[11px] leading-relaxed text-left"
        >
          {logs.length === 0 ? (
            <p className="text-gray-500 text-right" dir="rtl">
              جاهز. اضغط {config.hotkey} أو زر التشغيل لبدء الإرسال التلقائي.
            </p>
          ) : (
            logs.map((entry) => (
              <div
                key={entry.id}
                className={
                  entry.kind === 'success'
                    ? 'text-emerald-400'
                    : entry.kind === 'warn'
                      ? 'text-amber-400'
                      : 'text-gray-300'
                }
              >
                <span className="text-gray-500 mr-1.5">[{entry.timestamp}]</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
