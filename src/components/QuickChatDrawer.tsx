import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import type { FriendEntry } from '../types/simulator';

interface QuickChatDrawerProps {
  friends: FriendEntry[];
  onSendRobuxToFriend: (friend: FriendEntry) => void;
}

export function QuickChatDrawer({ friends, onSendRobuxToFriend }: QuickChatDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FriendEntry | null>(friends[0] ?? null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Record<string, Array<{ from: 'me' | 'them'; text: string }>>>({
    'friend-altof_ygt': [
      { from: 'them', text: 'Hey! Testing the simulated Robux transfer?' },
      { from: 'me', text: 'Yep, running the local demo!' },
    ],
  });

  const activeFriend = selected ?? friends[0] ?? null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFriend || !draft.trim()) return;
    const id = activeFriend.id;
    const text = draft.trim();
    setMessages((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { from: 'me', text }],
    }));
    setDraft('');
  };

  return (
    <div className="hidden sm:block fixed bottom-4 right-4 z-30">
      {open && (
        <div className="mb-2 w-[310px] rounded-2xl bg-white dark:bg-[#1E2023] border border-[#E4E6E8] dark:border-[#303338] shadow-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F4F5F7] dark:bg-[#25272C] border-b border-gray-200 dark:border-[#32353B] flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#111315] dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              Simulator Chat
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Simulator Chat"
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeFriend ? (
            <div className="p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto sim-scroll pb-1">
                {friends.slice(0, 5).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelected(f)}
                    className={`px-2 py-1 rounded-lg text-[11.5px] font-semibold whitespace-nowrap cursor-pointer ${
                      activeFriend.id === f.id
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F0F2F5] dark:bg-[#2A2D32] text-[#393B3D] dark:text-gray-300'
                    }`}
                  >
                    {f.displayName}
                  </button>
                ))}
              </div>

              <div className="h-36 overflow-y-auto sim-scroll space-y-1.5 p-2 rounded-xl bg-[#FAFAFB] dark:bg-[#16181B] border border-gray-100 dark:border-[#2A2D32]">
                {(messages[activeFriend.id] ?? [
                  { from: 'them', text: `Demo chat with @${activeFriend.username}` },
                ]).map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <span
                      className={`px-2.5 py-1.5 rounded-xl text-[12px] max-w-[85%] ${
                        m.from === 'me'
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#E9EBEE] dark:bg-[#2A2D32] text-[#111315] dark:text-gray-200'
                      }`}
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-1.5">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a demo message..."
                  className="flex-1 h-8 px-2.5 rounded-lg bg-[#F4F5F7] dark:bg-[#15171A] text-[12px] text-[#111315] dark:text-white outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send demo message"
                  className="px-2.5 h-8 rounded-lg bg-[#2563EB] text-white cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSendRobuxToFriend(activeFriend);
                }}
                className="w-full py-1.5 rounded-lg bg-[#F0F2F5] dark:bg-[#2A2D32] hover:bg-[#E4E6EA] text-[12px] font-bold text-[#111315] dark:text-white cursor-pointer"
              >
                Send Simulated Robux to {activeFriend.displayName}
              </button>
            </div>
          ) : (
            <p className="p-4 text-[12px] text-gray-500">Add friends to start a demo chat.</p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle Simulator Chat"
        className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#23252A] border border-[#DCE0E5] dark:border-[#34383F] shadow-md text-[13px] font-bold text-[#111315] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#2C2F35] transition-colors cursor-pointer"
      >
        <span>Chat</span>
      </button>
    </div>
  );
}
