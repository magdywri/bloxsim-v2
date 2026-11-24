import type {
  AutoGiftConfig,
  FriendEntry,
  RobuxPackage,
  SimulatorState,
  Transaction,
  UserProfile,
} from '../types/simulator';

export const PRESET_AVATARS = [
  {
    id: 'avatar-classic',
    label: 'Classic Cap',
    url: 'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#181b20"/><circle cx="60" cy="48" r="22" fill="#f5d0b5"/><path d="M34 44c3-19 49-19 52 0H34z" fill="#334155"/><rect x="34" y="39" width="56" height="7" rx="3.5" fill="#1e293b"/><circle cx="52" cy="49" r="2.5" fill="#111827"/><circle cx="68" cy="49" r="2.5" fill="#111827"/><path d="M53 58c4 3 10 3 14 0" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M26 116c4-24 22-34 34-34s30 10 34 34" fill="#475569"/></svg>`
      ),
  },
  {
    id: 'avatar-red-hero',
    label: 'Crimson Blazer',
    url: 'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#1e293b"/><circle cx="60" cy="48" r="22" fill="#f3c6a5"/><path d="M36 44c2-18 46-18 48 0-8-10-40-10-48 0z" fill="#b91c1c"/><circle cx="52" cy="48" r="2.5" fill="#111827"/><circle cx="68" cy="48" r="2.5" fill="#111827"/><path d="M53 58c4 4 10 4 14 0" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M26 116c4-24 22-34 34-34s30 10 34 34" fill="#dc2626"/></svg>`
      ),
  },
  {
    id: 'avatar-cobalt',
    label: 'Cobalt Dev',
    url: 'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#0f172a"/><circle cx="60" cy="48" r="22" fill="#fde68a"/><rect x="38" y="25" width="44" height="12" rx="6" fill="#2563eb"/><circle cx="52" cy="48" r="2.5" fill="#111827"/><circle cx="68" cy="48" r="2.5" fill="#111827"/><path d="M52 57h16" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M26 116c4-24 22-34 34-34s30 10 34 34" fill="#1d4ed8"/></svg>`
      ),
  },
  {
    id: 'avatar-emerald',
    label: 'Emerald Builder',
    url: 'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#14532d"/><circle cx="60" cy="48" r="22" fill="#fed7aa"/><path d="M36 42c4-20 44-20 48 0H36z" fill="#10b981"/><circle cx="52" cy="49" r="2.5" fill="#111827"/><circle cx="68" cy="49" r="2.5" fill="#111827"/><path d="M53 58c4 3 10 3 14 0" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M26 116c4-24 22-34 34-34s30 10 34 34" fill="#059669"/></svg>`
      ),
  },
];

export function makeFallbackAvatar(_label?: string): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#2B2E35"/><circle cx="60" cy="44" r="20" fill="#9CA3AF"/><path d="M26 114c4-24 20-36 34-36s30 12 34 36" fill="#9CA3AF"/></svg>`
    )
  );
}

export const FEATURED_ROBUX_PACKAGES: RobuxPackage[] = [
  {
    id: 'pkg-24005',
    totalRobux: 24005,
    originalRobux: 22500,
    bonusRobux: 1500,
    priceUsd: '$199.99',
    group: 'featured',
  },
  {
    id: 'pkg-11000',
    totalRobux: 11000,
    originalRobux: 10000,
    bonusRobux: 1000,
    priceUsd: '$99.99',
    group: 'featured',
  },
  {
    id: 'pkg-5250',
    totalRobux: 5250,
    originalRobux: 4500,
    bonusRobux: 750,
    priceUsd: '$49.99',
    group: 'featured',
  },
  {
    id: 'pkg-3625',
    totalRobux: 3625,
    originalRobux: 3150,
    bonusRobux: 475,
    priceUsd: '$34.99',
    group: 'featured',
  },
  {
    id: 'pkg-2000',
    totalRobux: 2000,
    originalRobux: 1700,
    bonusRobux: 300,
    priceUsd: '$19.99',
    group: 'featured',
  },
];

export const STANDARD_ROBUX_PACKAGES: RobuxPackage[] = [
  {
    id: 'pkg-1500',
    totalRobux: 1500,
    originalRobux: 1200,
    bonusRobux: 0,
    priceUsd: '$14.99',
    group: 'standard',
  },
  {
    id: 'pkg-1000',
    totalRobux: 1000,
    originalRobux: 800,
    bonusRobux: 0,
    priceUsd: '$9.99',
    group: 'standard',
  },
  {
    id: 'pkg-500',
    totalRobux: 500,
    originalRobux: 400,
    bonusRobux: 100,
    priceUsd: '$4.99',
    highlight: true,
    forYouTag: true,
    group: 'standard',
  },
];

export const ALL_ROBUX_PACKAGES: RobuxPackage[] = [
  ...FEATURED_ROBUX_PACKAGES,
  ...STANDARD_ROBUX_PACKAGES,
];

export const DEFAULT_FRIENDS: FriendEntry[] = [
  {
    id: 'friend-altof_ygt',
    robloxId: 11576238166,
    displayName: 'altof_ygt',
    username: 'TRYNRUNVZ',
    avatarUrl: makeFallbackAvatar('TRYNRUNVZ'),
    joinedYear: '2021',
    connectedLabel: 'Connected 2 years',
  },
  {
    id: 'friend-stevethegreat616',
    robloxId: 11485404831,
    displayName: 'stevethegreat616',
    username: '67_679713',
    avatarUrl: makeFallbackAvatar('67_679713'),
    joinedYear: '2022',
    connectedLabel: 'Connected 1 year',
  },
  {
    id: 'friend-t_t',
    robloxId: 10584602381,
    displayName: 'T_T',
    username: 'peanut_butter21279',
    avatarUrl: makeFallbackAvatar('peanut_butter21279'),
    joinedYear: '2020',
    connectedLabel: 'Connected 3 years',
  },
  {
    id: 'friend-bloxy_cola',
    robloxId: 4583098159,
    displayName: 'Bloxy_cola',
    username: 'Blesswest',
    avatarUrl: makeFallbackAvatar('Blesswest'),
    joinedYear: '2019',
    connectedLabel: 'Connected 4 years',
  },
  {
    id: 'friend-roblox',
    robloxId: 1,
    displayName: 'Roblox',
    username: 'Roblox',
    avatarUrl: makeFallbackAvatar('Roblox'),
    verified: true,
    joinedYear: '2006',
    connectedLabel: 'Connected 20 years',
  },
];

export const DEFAULT_AUTO_GIFT_CONFIG: AutoGiftConfig = {
  hotkey: 'F4',
  usernameInputMode: 'type',
  homeWaitSec: 1,
  modalOpenWaitSec: 1.2,
  typingSpeedWpm: 55,
  afterResultWaitSec: 2,
  afterSelectWaitSec: 1,
  beforeNextWaitSec: 1.5,
  beforeSendWaitSec: 2,
  successMinSec: 4,
  successMaxSec: 8,
  minRobux: 50,
  maxRobux: 500,
  cycleDelaySec: 2,
  customUsernames: [],
};

export function createInitialState(): SimulatorState {
  const now = new Date().toISOString();
  return {
    profile: {
      displayName: 'Sufiii',
      username: 'Sufiii',
      verified: true,
      avatarUrl: PRESET_AVATARS[1].url,
      balance: 9700,
      joinedDate: 'November 29, 2014',
      bio: 'Demo streamer profile inside the unofficial Robux simulator.',
    },
    friends: DEFAULT_FRIENDS,
    transactions: [
      {
        id: 'tx-seed-1',
        type: 'send',
        amount: 200,
        targetName: 'Roblox',
        targetUsername: 'Roblox',
        targetAvatarUrl: PRESET_AVATARS[0].url,
        status: 'Simulated',
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: 'tx-seed-2',
        type: 'send',
        amount: 100,
        targetName: 'altof_ygt',
        targetUsername: 'TRYNRUNVZ',
        targetAvatarUrl: makeFallbackAvatar('TRYNRUNVZ'),
        status: 'Simulated',
        createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      },
      {
        id: 'tx-seed-3',
        type: 'balance-set',
        amount: 10000,
        targetName: 'Simulator Preset',
        status: 'Completed (Sim)',
        createdAt: now,
      },
    ],
    ownedBonusItems: ['[🏅] Ink Game — Custom Player Tag (Sim)'],
    settings: {
      theme: 'light',
      notificationStyle: 'toast',
      showFriendsInSend: true,
      showFriendsInSidebar: true,
      robloxPlusSubscribed: false,
      soundEnabled: true,
      autoGift: { ...DEFAULT_AUTO_GIFT_CONFIG },
    },
    feedbacks: [],
  };
}

export function formatRobux(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
  return safe.toLocaleString('en-US');
}

export function normalizeAsciiDigits(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/\u066B/g, '.')
    .replace(/\u066C/g, ',');
}

export function validateSendAmount(
  rawAmount: number | string,
  currentBalance: number
): { valid: boolean; amount: number; error: string | null } {
  const normalized =
    typeof rawAmount === 'number'
      ? rawAmount
      : Number(normalizeAsciiDigits(String(rawAmount)).replace(/,/g, '').trim());
  const parsed = normalized;
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return { valid: false, amount: 0, error: 'Please enter a valid Robux amount.' };
  }
  const amount = Math.floor(parsed);
  if (amount <= 0) {
    return { valid: false, amount: 0, error: 'Amount must be at least 1 Robux.' };
  }
  if (amount > 10_000_000) {
    return { valid: false, amount, error: 'Maximum simulated single transfer is 10,000,000 Robux.' };
  }
  if (amount > currentBalance) {
    return {
      valid: false,
      amount,
      error: `Insufficient simulated balance (${formatRobux(currentBalance)} Robux available).`,
    };
  }
  return { valid: true, amount, error: null };
}

export function applySimulatedSend(
  state: SimulatorState,
  recipient: {
    displayName: string;
    username: string;
    avatarUrl?: string;
  },
  rawAmount: number | string
): { nextState: SimulatorState; transaction: Transaction | null; error: string | null } {
  const check = validateSendAmount(rawAmount, state.profile.balance);
  if (!check.valid) {
    return { nextState: state, transaction: null, error: check.error };
  }

  const tx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'send',
    amount: check.amount,
    targetName: recipient.displayName,
    targetUsername: recipient.username,
    targetAvatarUrl: recipient.avatarUrl,
    status: 'Simulated',
    createdAt: new Date().toISOString(),
  };

  const nextState: SimulatorState = {
    ...state,
    profile: {
      ...state.profile,
      balance: state.profile.balance - check.amount,
    },
    transactions: [tx, ...state.transactions].slice(0, 100),
  };

  return { nextState, transaction: tx, error: null };
}

export function applySimulatedPackagePurchase(
  state: SimulatorState,
  pkg: RobuxPackage
): { nextState: SimulatorState; transaction: Transaction } {
  const tx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'purchase',
    amount: pkg.totalRobux,
    targetName: `${formatRobux(pkg.totalRobux)} Robux Pack`,
    packageLabel: pkg.group === 'featured' ? 'Bonus Pack (Simulated)' : 'Standard Pack (Simulated)',
    priceUsd: pkg.priceUsd,
    status: 'Simulated',
    createdAt: new Date().toISOString(),
  };

  const bonusItem =
    pkg.group === 'featured' ? '[🏅] Ink Game — Custom Player Tag (Sim)' : null;

  const ownedBonusItems =
    bonusItem && !state.ownedBonusItems.includes(bonusItem)
      ? [bonusItem, ...state.ownedBonusItems]
      : state.ownedBonusItems;

  const nextState: SimulatorState = {
    ...state,
    profile: {
      ...state.profile,
      balance: state.profile.balance + pkg.totalRobux,
    },
    ownedBonusItems,
    transactions: [tx, ...state.transactions].slice(0, 100),
  };

  return { nextState, transaction: tx };
}

export function validateProfileDraft(draft: Partial<UserProfile>): {
  valid: boolean;
  error: string | null;
  cleanedBalance: number;
} {
  const displayName = (draft.displayName ?? '').trim();
  const username = (draft.username ?? '').trim();
  if (!displayName) {
    return { valid: false, error: 'Display Name cannot be empty.', cleanedBalance: 0 };
  }
  if (!username || !/^[A-Za-z0-9_]{2,32}$/.test(username)) {
    return {
      valid: false,
      error: 'Username must be 2–32 characters using letters, numbers, or underscores.',
      cleanedBalance: 0,
    };
  }
  const balance = Number(draft.balance ?? 0);
  if (!Number.isFinite(balance) || balance < 0 || balance > 999_999_999) {
    return {
      valid: false,
      error: 'Robux balance must be between 0 and 999,999,999.',
      cleanedBalance: 0,
    };
  }
  return { valid: true, error: null, cleanedBalance: Math.floor(balance) };
}

export function redeemSimulatedGiftCode(
  state: SimulatorState,
  rawCode: string
): { nextState: SimulatorState; amountAdded: number; error: string | null } {
  const code = rawCode.trim().toUpperCase();
  const codes: Record<string, number> = {
    'SIM-500': 500,
    'SIM-1000': 1000,
    'SIM-5000': 5000,
    'BLOXSIM': 2500,
  };

  if (!code) {
    return { nextState: state, amountAdded: 0, error: 'Enter a demo gift card code (e.g. SIM-1000).' };
  }
  const amountAdded = codes[code];
  if (!amountAdded) {
    return {
      nextState: state,
      amountAdded: 0,
      error: 'Invalid demo code. Try SIM-500, SIM-1000, SIM-5000, or BLOXSIM.',
    };
  }

  const tx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'gift-card',
    amount: amountAdded,
    targetName: `Gift Code ${code}`,
    status: 'Simulated',
    createdAt: new Date().toISOString(),
  };

  return {
    nextState: {
      ...state,
      profile: {
        ...state.profile,
        balance: state.profile.balance + amountAdded,
      },
      transactions: [tx, ...state.transactions].slice(0, 100),
    },
    amountAdded,
    error: null,
  };
}

export function filterTransactions(
  transactions: Transaction[],
  filterType: 'all' | Transaction['type'],
  query: string
): Transaction[] {
  const q = query.trim().toLowerCase();
  return transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (!q) return true;
    return (
      tx.targetName.toLowerCase().includes(q) ||
      (tx.targetUsername ?? '').toLowerCase().includes(q) ||
      (tx.packageLabel ?? '').toLowerCase().includes(q)
    );
  });
}

export function formatJoinYear(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return String(parsed.getUTCFullYear());
}

export function formatReadableDate(isoDate?: string | null): string {
  if (!isoDate) return 'Unknown';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const AUTO_GIFT_SEARCH_SEEDS: string[] = [
  'blox',
  'shadow',
  'dragon',
  'ninja',
  'king',
  'star',
  'alex',
  'lucas',
  'luna',
  'nova',
  'kai',
  'max',
  'leo',
  'zoe',
  'pro',
  'noob',
  'epic',
  'cool',
  'gamer',
  'builder',
  'knight',
  'wolf',
  'tiger',
  'ghost',
  'frost',
  'blaze',
  'storm',
  'sky',
  'ace',
  'jay',
  'sam',
  'ryan',
  'emma',
  'mia',
  'liam',
  'noah',
  'ethan',
  'mason',
  'chloe',
  'ruby',
  'aqua',
  'pixel',
  'turbo',
  'sonic',
  'hyper',
  'dark',
  'gold',
  'diamond',
  'silver',
  'royal',
  'legend',
  'kitty',
  'sunny',
  'cosmic',
];

export const RELIABLE_PUBLIC_SEEDS: string[] = [
  'noob',
  'noob_fromDOOM',
  'noob8547781',
  'Bacon177909',
  'ahmed',
  'Ahmed829208',
  'Omar',
  'Omar1999665',
];

const DISALLOWED_HOTKEYS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'Escape',
  'Tab',
  'CapsLock',
  'Dead',
  'Unidentified',
]);

export function isSupportedHotkey(key: string): boolean {
  if (!key || DISALLOWED_HOTKEYS.has(key)) return false;
  return normalizeHotkeyLabel(key).length > 0;
}

export function normalizeHotkeyLabel(key: string): string {
  const trimmed = key.trim();
  if (key === ' ' || trimmed.toLowerCase() === 'spacebar' || trimmed.toLowerCase() === 'space') {
    return 'Space';
  }
  if (!trimmed) return '';
  if (/^f\d{1,2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (trimmed.length === 1) {
    return trimmed.toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function isFunctionHotkey(hotkey: string): boolean {
  return /^F([1-9]|1[0-2])$/i.test(hotkey.trim());
}

export function isTextInputFocused(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  if (el.isContentEditable) return true;
  const tag = (el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function clampNum(val: unknown, fallback: number, min: number, max: number): number {
  const n = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export const AUTO_GIFT_EXACT_USERNAMES: string[] = [
  'Baconwith829',
  'Noob_yuteri',
  'Bacon_Roblox0024',
  'Ahmed902520',
  'Bacon177909',
  'noob_82664',
  'noob8547781',
  'bacontsbnoob',
  'Youssef595109',
  'AHMEDgjvccj',
  'youssef639u',
  'Noobnone8',
  'noob_1431166',
  'Ahmed_1n7',
  'noob1928',
  'Omarcr7gululu',
  'youssefAa_6',
  'ahmed_ramadan5747',
  'bacon_lolet',
  'youssefthehonoredone',
  'Ahmed17923',
  'Omar',
  'youssef_20008',
  'Ahmedimraam',
  'Noob738442',
  'Bacon2881918',
  'noob_fromDOOM',
  'omarragab2022',
  'Ahmed829208',
  'youssef_48519',
  'Youssef32797',
  'Noobs_slv',
  'Youssefmario12',
  'omar_gamer13',
  'Ahmedko099',
  'Omar_444193',
  'Omar1999665',
  'youssef',
  'noobnoatama',
  'Ahmedaliata2000',
  'Bacon_poor1947',
  'baconlover09844',
  'bacon125420p',
  'Youssef_taouil1',
  'Omar_danii',
  'omarbm619',
  'Tarek',
  'Adam_000557',
  'bacon23423455uwu',
  'Karim547814',
  'mostafa55580',
  'mostafa_lol55',
  'Karim900011',
  'Ahmedjarrar060',
  'alison43266',
  'ali2034507',
  'zaid',
  'karim_du93360',
  'AliExpressal1',
  'Alina_Capasuna11',
  'mostafa2019dx',
  'Karimsharm',
  'AlisonDembizki',
  'ZAIDBAZUL',
  'Adam_87099',
  'Hamzak1838218',
  'karim_264176',
  'alisonnnnnn289',
  'Mohamed2018788',
  'alis2025152',
  'mohamedmmsh5',
  'MohamedOhzaifar',
  'Yassinerais2',
  'mohameda_600',
  'yassine232343',
  'aliss_06216',
  'alison_09784',
  'karimpro_364',
  'karime4231',
  'adam32111urh',
  'hamza3120163',
  'tarek123456013',
  'hamzaoo668',
  'Alisadq98',
  'Yassinpopassin',
  'Mohamed_200130',
  'tarekplayzms',
  'karim19357',
  'mohamedhero12349',
  'Mohamed_Cool1702',
  'Zaid04162',
  'ZAIDGANTENG626',
  'karim761470',
  'karimahay123',
  'Mohamed019458',
  'Mohamed1267390',
  'mohamed393912',
  'zaid_12253',
  'hassan1112223332',
  'Salahdarawshy6',
  'Salahsocoocoo',
  'salahking210',
  'salah_majait22',
  'hassan56957',
  'Mahmoud_gamd',
  'mahmoud01096609',
  'mahmoud_pro052',
  'Mahmoudyouyt',
  'Hassanzweitacc',
  'Hassan111491',
  'ziad',
  'ziadthegre',
  'Noorisbetter12',
  'Ziadziadziad54321',
  'Noorappie',
  'NOORFORLIFEs',
  'Ziad20243',
  'Wolf_kind7944',
  'wolfe182',
  'Wolff_Lucifer',
  'ryanbf023',
  'RyanJoestarUchiha',
  'ryanjberg',
  'mariam',
  'salma',
  'Mariam_atarah8',
  'mazen',
  'salmahiraz',
  'seif199119',
  'seifsss75',
  'jana7charlibillie',
  'seif',
  'MAZEN15091',
  'mazen7890120',
  'Jana2008ll1',
  'Mariamlaloca902',
  'Jana_52625262',
  'salmatata3',
];

export function parseCustomUsernamesList(raw: string): string[] {
  const parts = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim().replace(/^@/, ''))
    .filter((s) => /^[A-Za-z0-9_]{3,20}$/.test(s));
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of parts) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(name);
    }
  }
  return unique;
}

export function sanitizeAutoGiftConfig(raw?: Partial<AutoGiftConfig>): AutoGiftConfig {
  const d = DEFAULT_AUTO_GIFT_CONFIG;
  const minRobux = Math.round(clampNum(raw?.minRobux, d.minRobux, 1, 10_000_000));
  const maxRobux = Math.max(minRobux, Math.round(clampNum(raw?.maxRobux, d.maxRobux, 1, 10_000_000)));
  const successMinSec = Number(clampNum(raw?.successMinSec, d.successMinSec, 0.5, 60).toFixed(1));
  const successMaxSec = Math.max(
    successMinSec,
    Number(clampNum(raw?.successMaxSec, d.successMaxSec, 0.5, 60).toFixed(1))
  );
  const hotkeyCandidate = typeof raw?.hotkey === 'string' && isSupportedHotkey(raw.hotkey)
    ? normalizeHotkeyLabel(raw.hotkey)
    : d.hotkey;

  const customUsernames = Array.isArray(raw?.customUsernames)
    ? parseCustomUsernamesList(raw.customUsernames.join('\n')).slice(0, 500)
    : [];

  return {
    hotkey: hotkeyCandidate,
    usernameInputMode: raw?.usernameInputMode === 'paste' ? 'paste' : 'type',
    homeWaitSec: Number(clampNum(raw?.homeWaitSec, d.homeWaitSec, 0.1, 30).toFixed(1)),
    modalOpenWaitSec: Number(clampNum(raw?.modalOpenWaitSec, d.modalOpenWaitSec, 0.1, 30).toFixed(1)),
    typingSpeedWpm: Math.round(clampNum(raw?.typingSpeedWpm, d.typingSpeedWpm, 15, 220)),
    afterResultWaitSec: Number(clampNum(raw?.afterResultWaitSec, d.afterResultWaitSec, 0.1, 30).toFixed(1)),
    afterSelectWaitSec: Number(clampNum(raw?.afterSelectWaitSec, d.afterSelectWaitSec, 0.1, 30).toFixed(1)),
    beforeNextWaitSec: Number(clampNum(raw?.beforeNextWaitSec, d.beforeNextWaitSec, 0.1, 30).toFixed(1)),
    beforeSendWaitSec: Number(clampNum(raw?.beforeSendWaitSec, d.beforeSendWaitSec, 0.1, 30).toFixed(1)),
    successMinSec,
    successMaxSec,
    minRobux,
    maxRobux,
    cycleDelaySec: Number(clampNum(raw?.cycleDelaySec, d.cycleDelaySec, 0.1, 60).toFixed(1)),
    customUsernames,
  };
}

export function typingDelayMsFromWpm(wpm: number): number {
  const safeWpm = Math.min(220, Math.max(15, wpm));
  // Standard typing assumption: 5 characters per word
  return Math.max(25, Math.min(350, Math.round(60000 / (safeWpm * 5))));
}

export function pickRandomRobuxAmount(
  min: number,
  max: number,
  availableBalance: number,
  rng: () => number = Math.random
): number | null {
  const safeBalance = Math.floor(availableBalance);
  if (!Number.isFinite(safeBalance) || safeBalance < 1) return null;

  const effectiveMax = Math.min(Math.max(1, Math.floor(max)), safeBalance);
  const effectiveMin = Math.min(Math.max(1, Math.floor(min)), effectiveMax);

  // Build realistic 0-ending multiples of 10 within [effectiveMin, effectiveMax]
  const firstTen = Math.ceil(effectiveMin / 10) * 10;
  const lastTen = Math.floor(effectiveMax / 10) * 10;
  if (firstTen <= lastTen) {
    const stepCount = Math.floor((lastTen - firstTen) / 10) + 1;
    const pickedIdx = Math.min(stepCount - 1, Math.floor(rng() * stepCount));
    return firstTen + pickedIdx * 10;
  }

  // Fallback when range < 10 and doesn't cross a multiple of 10
  const span = effectiveMax - effectiveMin + 1;
  return effectiveMin + Math.min(span - 1, Math.floor(rng() * span));
}

export function pickNextRandomSeedQuery(
  recentlyUsedQueries: string[],
  pool: string[] = AUTO_GIFT_SEARCH_SEEDS,
  rng: () => number = Math.random
): string {
  const usedSet = new Set(recentlyUsedQueries.map((q) => q.toLowerCase()));
  const fresh = pool.filter((seed) => !usedSet.has(seed.toLowerCase()));
  const source = fresh.length > 0 ? fresh : pool;
  const idx = Math.min(source.length - 1, Math.floor(rng() * source.length));
  return source[idx];
}

export function pickUniquePublicRecipient<
  T extends { username?: string; name?: string }
>(
  candidates: T[],
  recentlyGiftedUsernames: string[],
  ownUsername?: string,
  rng: () => number = Math.random
): T | null {
  if (!candidates.length) return null;
  const blocked = new Set(recentlyGiftedUsernames.map((u) => u.toLowerCase()));
  if (ownUsername) blocked.add(ownUsername.toLowerCase());

  const eligible = candidates.filter((c) => {
    const uname = (c.username ?? c.name ?? '').toLowerCase();
    return uname.length > 0 && !blocked.has(uname);
  });

  if (eligible.length === 0) return null;
  const idx = Math.min(eligible.length - 1, Math.floor(rng() * eligible.length));
  return eligible[idx];
}

export function buildCombinedUsernamePool(
  customUsernames: string[] = [],
  discoveredUsernames: string[] = [],
  builtInUsernames: string[] = AUTO_GIFT_EXACT_USERNAMES
): string[] {
  const basePool = [...customUsernames, ...discoveredUsernames, ...builtInUsernames];
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const name of basePool) {
    const trimmed = name.trim().replace(/^@/, '');
    const key = trimmed.toLowerCase();
    if (trimmed.length >= 2 && !seen.has(key)) {
      seen.add(key);
      deduped.push(trimmed);
    }
  }
  return deduped;
}

export function pickNextExactUsername(
  recentlyGiftedUsernames: string[],
  customUsernames: string[] = [],
  discoveredUsernames: string[] = [],
  ownUsername?: string,
  rng: () => number = Math.random,
  builtInUsernames: string[] = AUTO_GIFT_EXACT_USERNAMES
): string {
  const blocked = new Set(recentlyGiftedUsernames.map((u) => u.toLowerCase()));
  if (ownUsername) blocked.add(ownUsername.toLowerCase());

  const deduped = buildCombinedUsernamePool(customUsernames, discoveredUsernames, builtInUsernames);
  const eligible = deduped.filter((u) => u.toLowerCase() !== ownUsername?.toLowerCase());
  const pool = eligible.length > 0 ? eligible : deduped;
  if (pool.length === 0) return 'noob8547781';

  const fresh = pool.filter((u) => !blocked.has(u.toLowerCase()));
  if (fresh.length > 0) {
    const idx = Math.min(fresh.length - 1, Math.floor(rng() * fresh.length));
    return fresh[idx];
  }

  // All usernames in the pool have been gifted: wrap cleanly back to the first username again
  const lastGifted = recentlyGiftedUsernames[0]?.toLowerCase();
  if (pool[0].toLowerCase() === lastGifted && pool.length > 1) {
    return pool[1];
  }
  return pool[0];
}

export function filterUnverifiedUsers<
  T extends { hasVerifiedBadge?: boolean; verified?: boolean }
>(items: T[]): T[] {
  return items.filter((item) => !item.hasVerifiedBadge && !item.verified);
}

export function narrowAutoGiftResults<
  T extends { name?: string; username?: string; hasVerifiedBadge?: boolean; verified?: boolean }
>(
  results: T[],
  targetUsername: string,
  excludeVerified = false
): T[] {
  if (!results.length) return [];
  const pool = excludeVerified ? filterUnverifiedUsers(results) : results;
  if (!pool.length) return [];
  const lower = targetUsername.trim().toLowerCase();
  const exactIndex = pool.findIndex(
    (item) => (item.name ?? item.username ?? '').toLowerCase() === lower
  );
  if (exactIndex >= 0) {
    const exactItem = pool[exactIndex];
    const secondItem = pool.find((_, idx) => idx !== exactIndex);
    return secondItem ? [exactItem, secondItem] : [exactItem];
  }
  return pool.slice(0, 2);
}

export function pickFirstMatchingAccount<
  T extends { name?: string; username?: string; hasVerifiedBadge?: boolean; verified?: boolean }
>(
  results: T[],
  targetUsername: string,
  excludeVerified = false
): T | null {
  const narrowed = narrowAutoGiftResults(results, targetUsername, excludeVerified);
  return narrowed[0] ?? null;
}

export function mergePublicUserResults<T extends { id: number; name: string }>(
  primary: T[],
  secondary: T[],
  maxItems = 25
): T[] {
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const merged: T[] = [];

  for (const user of [...primary, ...secondary]) {
    const nameKey = user.name.toLowerCase();
    if ((user.id > 0 && seenIds.has(user.id)) || seenNames.has(nameKey)) {
      continue;
    }
    if (user.id > 0) seenIds.add(user.id);
    seenNames.add(nameKey);
    merged.push(user);
    if (merged.length >= maxItems) break;
  }

  return merged;
}

