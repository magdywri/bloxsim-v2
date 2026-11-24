import React, { useState } from 'react';
import { History, Search, Trash2, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import type { Transaction } from '../types/simulator';
import { filterTransactions, formatRobux } from '../utils/simulatorLogic';
import { RobuxIcon } from './Icons';

interface ActivityConsoleViewProps {
  transactions: Transaction[];
  onClearHistory: () => void;
}

export function ActivityConsoleView({
  transactions,
  onClearHistory,
}: ActivityConsoleViewProps) {
  const [filterType, setFilterType] = useState<'all' | Transaction['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = filterTransactions(transactions, filterType, searchQuery);

  const totalSent = transactions
    .filter((t) => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPurchased = transactions
    .filter((t) => t.type === 'purchase' || t.type === 'gift-card')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[#111315] dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-[#2563EB]" />
            Activity Console
          </h1>
          <p className="text-[13px] text-[#606264] dark:text-gray-400">
            Local log of all simulated Robux transfers, shop previews, and balance updates.
          </p>
        </div>

        {transactions.length > 0 && (
          <div>
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-bold cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-2 rounded-xl bg-[#E9EBEE] dark:bg-[#2E3136] text-[#111315] dark:text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136]">
          <p className="text-[12px] font-semibold text-[#606264] dark:text-gray-400">
            Total Simulated Events
          </p>
          <p className="text-[24px] font-black text-[#111315] dark:text-white mt-1 tabular-nums">
            {transactions.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136]">
          <p className="text-[12px] font-semibold text-[#606264] dark:text-gray-400">
            Simulated Robux Sent
          </p>
          <p className="text-[24px] font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums flex items-center gap-1.5">
            <RobuxIcon className="w-5 h-5" />
            {formatRobux(totalSent)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136]">
          <p className="text-[12px] font-semibold text-[#606264] dark:text-gray-400">
            Simulated Shop / Gift Credits
          </p>
          <p className="text-[24px] font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums flex items-center gap-1.5">
            <RobuxIcon className="w-5 h-5" />
            {formatRobux(totalPurchased)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'send', label: 'Sent Robux' },
              { id: 'purchase', label: 'Shop Packages' },
              { id: 'gift-card', label: 'Gift Cards' },
              { id: 'balance-set', label: 'Presets' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#111315] dark:bg-white text-white dark:text-[#111315]'
                  : 'bg-[#E9EBEE] dark:bg-[#272A2F] text-[#393B3D] dark:text-gray-300 hover:bg-[#DFE2E7]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter activity..."
            aria-label="Filter simulated activity"
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] text-[13px] text-[#111315] dark:text-white outline-none focus:border-[#0066FF]"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-white dark:bg-[#1B1D20] border border-[#E4E6E8] dark:border-[#2E3136] overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-[14px] font-bold text-[#111315] dark:text-white">
              No simulated activity found
            </p>
            <p className="text-[12.5px] text-[#606264] dark:text-gray-400">
              Send simulated Robux or test a shop package to record entries here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F1F3] dark:divide-[#272A2E]">
            {filtered.map((tx) => {
              const isOut = tx.type === 'send';
              return (
                <div
                  key={tx.id}
                  data-testid="activity-row"
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAFAFB] dark:hover:bg-[#22252A] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isOut
                          ? 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOut ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#111315] dark:text-white truncate">
                        {isOut ? `Sent to ${tx.targetName}` : tx.targetName}
                      </p>
                      <p className="text-[12px] text-[#757779] dark:text-gray-400 truncate">
                        {new Date(tx.createdAt).toLocaleString('en-US')}
                        {tx.targetUsername ? ` • @${tx.targetUsername}` : ''}
                        {tx.priceUsd ? ` • ${tx.priceUsd} (Demo)` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-[14.5px] font-extrabold tabular-nums ${
                        isOut
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOut ? '-' : '+'}
                      {formatRobux(tx.amount)} R$
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[#F0F2F5] dark:bg-[#2B2E34] text-[#52555A] dark:text-gray-300">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
