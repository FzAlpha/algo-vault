import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LeetCodeModal() {
  const { isLeetCodeModalOpen, setIsLeetCodeModalOpen, syncLeetCode, user } = useApp();
  const [handle, setHandle] = useState(user?.leetcode_username || 'vault_architect');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  if (!isLeetCodeModalOpen) return null;

  const handleSync = async (usernameToSync) => {
    const target = usernameToSync || handle;
    if (!target.trim()) return;

    setSyncing(true);
    setResult(null);
    const data = await syncLeetCode(target.trim());
    setSyncing(false);
    if (data) {
      setResult(data);
    }
  };

  const sampleHandles = ['vault_architect', 'neal_wu', 'yhx12243', 'algomaster'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="card-surface border border-outline-variant rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative glow-primary">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-xl">code</span>
            <h3 className="font-headline-md text-base font-bold text-on-surface tracking-tight">
              LEETCODE SYNCHRONIZATION
            </h3>
          </div>
          <button
            onClick={() => setIsLeetCodeModalOpen(false)}
            className="p-1 rounded text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Synchronize your live LeetCode stats, global contest rank, and submission calendar directly into your local SQLite store.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-label-caps text-on-surface uppercase tracking-wider">
              LeetCode Handle / Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
                person
              </span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter LeetCode username..."
                className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 pl-9 text-sm text-on-surface font-code-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Quick Test Handles:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleHandles.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setHandle(h);
                    handleSync(h);
                  }}
                  className="px-2.5 py-1 rounded bg-[#080808] border border-outline-variant text-[11px] font-code-sm text-primary hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  @{h}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Result Box */}
          {result && result.leetcodeData && (
            <div className="p-3 bg-surface-container rounded-lg border border-primary/40 text-xs font-code-sm space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-primary font-bold">
                <span>@{result.leetcodeData.username}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  {result.leetcodeData.isLive ? 'LIVE GRAPHQL' : 'SYNCHRONIZED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#080808] p-1.5 rounded border border-outline-variant">
                  <div className="text-[10px] text-on-surface-variant">Solved</div>
                  <div className="font-bold text-on-surface">{result.leetcodeData.problemsSolved}</div>
                </div>
                <div className="bg-[#080808] p-1.5 rounded border border-outline-variant">
                  <div className="text-[10px] text-on-surface-variant">Rank</div>
                  <div className="font-bold text-tertiary-container">{result.leetcodeData.globalRank}</div>
                </div>
                <div className="bg-[#080808] p-1.5 rounded border border-outline-variant">
                  <div className="text-[10px] text-on-surface-variant">Percentile</div>
                  <div className="font-bold text-secondary">{result.leetcodeData.topPercentage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsLeetCodeModalOpen(false)}
              className="px-4 py-2 rounded text-xs font-label-caps text-on-surface-variant hover:text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors"
            >
              CLOSE
            </button>
            <button
              onClick={() => handleSync()}
              disabled={syncing || !handle.trim()}
              className="px-5 py-2 rounded bg-primary-container text-black font-label-caps text-xs font-bold hover:bg-primary transition-all shadow-neon-glow active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>{syncing ? 'CONNECTING...' : 'SYNC LEETCODE'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
