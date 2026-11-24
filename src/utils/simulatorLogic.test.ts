import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ROBUX_PACKAGES,
  AUTO_GIFT_EXACT_USERNAMES,
  DEFAULT_AUTO_GIFT_CONFIG,
  DEFAULT_FRIENDS,
  applySimulatedPackagePurchase,
  applySimulatedSend,
  buildCombinedUsernamePool,
  createInitialState,
  filterTransactions,
  filterUnverifiedUsers,
  formatJoinYear,
  formatRobux,
  isFunctionHotkey,
  isSupportedHotkey,
  makeFallbackAvatar,
  mergePublicUserResults,
  narrowAutoGiftResults,
  normalizeAsciiDigits,
  normalizeHotkeyLabel,
  parseCustomUsernamesList,
  pickFirstMatchingAccount,
  pickNextExactUsername,
  pickNextRandomSeedQuery,
  pickRandomRobuxAmount,
  pickUniquePublicRecipient,
  redeemSimulatedGiftCode,
  sanitizeAutoGiftConfig,
  typingDelayMsFromWpm,
  validateProfileDraft,
  validateSendAmount,
} from './simulatorLogic';

test('formatRobux formats positive integers and clamps negatives', () => {
  assert.equal(formatRobux(9700), '9,700');
  assert.equal(formatRobux(0), '0');
  assert.equal(formatRobux(-50), '0');
});

test('validateSendAmount rejects invalid, zero, and over-balance amounts', () => {
  assert.equal(validateSendAmount(0, 1000).valid, false);
  assert.equal(validateSendAmount(-10, 1000).valid, false);
  assert.equal(validateSendAmount('abc', 1000).valid, false);
  assert.equal(validateSendAmount(1500, 1000).valid, false);
  assert.deepEqual(validateSendAmount('200', 1000), {
    valid: true,
    amount: 200,
    error: null,
  });
});

test('applySimulatedSend deducts balance and prepends transaction', () => {
  const initial = createInitialState();
  const prevBalance = initial.profile.balance;
  const { nextState, transaction, error } = applySimulatedSend(
    initial,
    { displayName: 'Roblox', username: 'Roblox' },
    200
  );
  assert.equal(error, null);
  assert.ok(transaction);
  assert.equal(nextState.profile.balance, prevBalance - 200);
  assert.equal(nextState.transactions[0].id, transaction.id);
  assert.equal(nextState.transactions[0].amount, 200);
  assert.equal(nextState.transactions[0].status, 'Simulated');
});

test('applySimulatedPackagePurchase credits simulated Robux and logs history', () => {
  const initial = createInitialState();
  const pkg = ALL_ROBUX_PACKAGES.find((p) => p.id === 'pkg-500')!;
  const { nextState, transaction } = applySimulatedPackagePurchase(initial, pkg);
  assert.equal(nextState.profile.balance, initial.profile.balance + 500);
  assert.equal(transaction.type, 'purchase');
  assert.equal(nextState.transactions[0].priceUsd, '$4.99');
});

test('validateProfileDraft enforces displayName, username, and balance range', () => {
  assert.equal(validateProfileDraft({ displayName: '', username: 'Test', balance: 100 }).valid, false);
  assert.equal(validateProfileDraft({ displayName: 'Test', username: 'bad name!', balance: 100 }).valid, false);
  assert.equal(validateProfileDraft({ displayName: 'Test', username: 'Sufiii', balance: -1 }).valid, false);
  assert.equal(validateProfileDraft({ displayName: 'Sufiii', username: 'Sufiii', balance: 10000 }).valid, true);
});

test('redeemSimulatedGiftCode handles valid and invalid demo codes', () => {
  const initial = createInitialState();
  const bad = redeemSimulatedGiftCode(initial, 'INVALID');
  assert.ok(bad.error);
  assert.equal(bad.amountAdded, 0);

  const good = redeemSimulatedGiftCode(initial, 'sim-1000');
  assert.equal(good.error, null);
  assert.equal(good.amountAdded, 1000);
  assert.equal(good.nextState.profile.balance, initial.profile.balance + 1000);
});

test('filterTransactions filters by type and query', () => {
  const initial = createInitialState();
  const sends = filterTransactions(initial.transactions, 'send', 'roblox');
  assert.equal(sends.length, 1);
  assert.equal(sends[0].targetName, 'Roblox');
});

test('formatJoinYear parses ISO date safely', () => {
  assert.equal(formatJoinYear('2006-02-27T21:06:40.3Z'), '2006');
  assert.equal(formatJoinYear(null), null);
});

test('createInitialState enables soundEffects by default and applySimulatedSend rejects overdraft', () => {
  const initial = createInitialState();
  assert.equal(initial.settings.soundEnabled, true);
  assert.equal(initial.settings.autoGift.hotkey, DEFAULT_AUTO_GIFT_CONFIG.hotkey);
  const res = applySimulatedSend(initial, { displayName: 'Roblox', username: 'Roblox' }, initial.profile.balance + 500);
  assert.ok(res.error);
  assert.equal(res.transaction, null);
  assert.equal(res.nextState.profile.balance, initial.profile.balance);
});

test('pickRandomRobuxAmount selects realistic 0-ending amounts within range and balance', () => {
  const low = pickRandomRobuxAmount(50, 500, 1000, () => 0);
  assert.equal(low, 50);
  const high = pickRandomRobuxAmount(50, 500, 1000, () => 0.9999);
  assert.equal(high, 500);
  const clamped = pickRandomRobuxAmount(50, 500, 135, () => 0.9999);
  assert.equal(clamped, 130);
  assert.equal(pickRandomRobuxAmount(50, 500, 0), null);
});

test('pickUniquePublicRecipient skips recently gifted users and own username', () => {
  const users = [
    { name: 'Sufiii' },
    { name: 'Builderman' },
    { name: 'Shedletsky' },
  ];
  const picked = pickUniquePublicRecipient(users, ['builderman'], 'Sufiii', () => 0);
  assert.deepEqual(picked, { name: 'Shedletsky' });

  const exhausted = pickUniquePublicRecipient(users, ['builderman', 'shedletsky'], 'Sufiii');
  assert.equal(exhausted, null);
});

test('pickNextRandomSeedQuery avoids recently used seeds when fresh options exist', () => {
  const pool = ['alpha', 'beta', 'gamma'];
  const picked = pickNextRandomSeedQuery(['alpha', 'beta'], pool, () => 0);
  assert.equal(picked, 'gamma');
});

test('hotkey normalization and config sanitization clamp invalid values safely', () => {
  assert.equal(normalizeHotkeyLabel('f4'), 'F4');
  assert.equal(normalizeHotkeyLabel(' '), 'Space');
  assert.equal(normalizeHotkeyLabel('g'), 'G');
  assert.equal(isSupportedHotkey('Shift'), false);
  assert.equal(isSupportedHotkey('F8'), true);
  assert.equal(isFunctionHotkey('F4'), true);
  assert.equal(isFunctionHotkey('G'), false);

  const sanitized = sanitizeAutoGiftConfig({
    hotkey: 'f8',
    minRobux: 600,
    maxRobux: 100,
    typingSpeedWpm: 999,
    successMinSec: 9,
    successMaxSec: 2,
    customUsernames: ['@KreekCraft', 'TanqR', 'kreekcraft', 'bad name!'],
  });
  assert.equal(sanitized.hotkey, 'F8');
  assert.equal(sanitized.minRobux, 600);
  assert.equal(sanitized.maxRobux, 600);
  assert.equal(sanitized.typingSpeedWpm, 220);
  assert.equal(sanitized.successMinSec, 9);
  assert.equal(sanitized.successMaxSec, 9);
  assert.deepEqual(sanitized.customUsernames, ['KreekCraft', 'TanqR']);
  assert.ok(typingDelayMsFromWpm(55) > 100);
});

test('exact username selection combines custom with built-in pool and restarts from first when exhausted', () => {
  assert.deepEqual(parseCustomUsernamesList('@Builderman, TanqR\nbuilderman\nxx'), ['Builderman', 'TanqR']);

  const combined = buildCombinedUsernamePool(['CustomOne'], [], ['BuiltInA', 'BuiltInB']);
  assert.deepEqual(combined, ['CustomOne', 'BuiltInA', 'BuiltInB']);

  // Picks remaining unused from combined custom + built-in pool (resuming without repeating gifted names)
  const picked = pickNextExactUsername(['CustomOne', 'BuiltInA'], ['CustomOne'], [], 'SXB_1', () => 0, ['BuiltInA', 'BuiltInB']);
  assert.equal(picked, 'BuiltInB');

  // When all usernames in pool are exhausted, wraps back to the very first username
  const wrapped = pickNextExactUsername(['BuiltInB', 'BuiltInA', 'CustomOne'], ['CustomOne'], [], 'SXB_1', () => 0, ['BuiltInA', 'BuiltInB']);
  assert.equal(wrapped, 'CustomOne');

  const results = [
    { name: 'kreekcraft67_677' },
    { name: 'KreekCraft' },
    { name: 'KreekCraft_TS' },
  ];
  const narrowed = narrowAutoGiftResults(results, 'KreekCraft');
  assert.equal(narrowed.length, 2);
  assert.equal(narrowed[0].name, 'KreekCraft');
  assert.equal(pickFirstMatchingAccount(results, 'KreekCraft')?.name, 'KreekCraft');
});

test('Auto Gift excludes verified accounts, expands pool to 135+, uses clean silhouette fallback, and normalizes Arabic numerals', () => {
  const mixed = [
    { name: 'Roblox', hasVerifiedBadge: true },
    { name: 'noob8547781', hasVerifiedBadge: false },
    { name: 'Ahmed829208', hasVerifiedBadge: false },
  ];
  assert.deepEqual(
    filterUnverifiedUsers(mixed).map((u) => u.name),
    ['noob8547781', 'Ahmed829208']
  );

  const pickedFromMixed = pickFirstMatchingAccount(mixed, 'Roblox', true);
  assert.notEqual(pickedFromMixed?.name, 'Roblox');
  assert.equal(pickedFromMixed?.hasVerifiedBadge, false);
  assert.equal(pickFirstMatchingAccount([{ name: 'Roblox', hasVerifiedBadge: true }], 'Roblox', true), null);
  assert.equal(pickFirstMatchingAccount(mixed, 'noob8547781', true)?.name, 'noob8547781');
  assert.equal(narrowAutoGiftResults(mixed, 'Roblox', true).some((u) => u.hasVerifiedBadge), false);

  const builtInLower = new Set(AUTO_GIFT_EXACT_USERNAMES.map((u) => u.toLowerCase()));
  assert.equal(builtInLower.has('roblox'), false);
  assert.equal(builtInLower.has('builderman'), false);
  assert.equal(builtInLower.has('kreekcraft'), false);
  assert.ok(AUTO_GIFT_EXACT_USERNAMES.length >= 135);

  for (const friend of DEFAULT_FRIENDS) {
    assert.ok(friend.avatarUrl.length > 0);
  }

  const fallbackSvg = decodeURIComponent(makeFallbackAvatar('Test'));
  assert.equal(fallbackSvg.includes('<text'), false);

  assert.equal(sanitizeAutoGiftConfig({ usernameInputMode: 'paste' }).usernameInputMode, 'paste');
  assert.equal(sanitizeAutoGiftConfig({ usernameInputMode: 'type' }).usernameInputMode, 'type');

  assert.equal(normalizeAsciiDigits('١٢٣٤٥٦٧٨٩٠'), '1234567890');
  assert.equal(normalizeAsciiDigits('٥٠٫٥'), '50.5');
  assert.deepEqual(validateSendAmount('٢٥٠', 1000), {
    valid: true,
    amount: 250,
    error: null,
  });
});

test('mergePublicUserResults deduplicates live + bundled accounts up to limit', () => {
  const merged = mergePublicUserResults(
    [
      { id: 101, name: 'OmarLive' },
      { id: 102, name: 'Omar' },
    ],
    [
      { id: 102, name: 'Omar' },
      { id: 103, name: 'OmarBundled' },
    ],
    25
  );
  assert.deepEqual(
    merged.map((u) => u.name),
    ['OmarLive', 'Omar', 'OmarBundled']
  );
});

