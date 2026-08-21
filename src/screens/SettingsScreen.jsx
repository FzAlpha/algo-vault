import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { settings, user, updateUserSettings, resetDatabase, addToast } = useApp();

  const [formState, setFormState] = useState({
    theme: settings?.theme || 'dark',
    font_family: settings?.font_family || 'JetBrains Mono',
    font_size: settings?.font_size || '14px',
    vim_mode: settings?.vim_mode ? true : false,
    leetcode_auto_sync: settings?.leetcode_auto_sync ? true : false,
    sync_frequency: settings?.sync_frequency || 'Every 6 hours',
    ai_model: settings?.ai_model || 'vault-v2-optimized',
    complexity_threshold: settings?.complexity_threshold || 'O(N^2)',
    ai_severity: settings?.ai_severity || 'Strict (Flag sub-optimal heuristics)',
    sound_effects: settings?.sound_effects ? true : false,
  });

  const [apiToken, setApiToken] = useState(user?.api_token || 'av_live_9f8a72b1049c81e7d32e49f2');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserSettings({
      ...formState,
      vim_mode: formState.vim_mode ? 1 : 0,
      leetcode_auto_sync: formState.leetcode_auto_sync ? 1 : 0,
      sound_effects: formState.sound_effects ? 1 : 0
    });
  };

  const regenerateToken = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newToken = `av_live_${randomHex}`;
    setApiToken(newToken);
    addToast('New API access token generated.', 'success');
  };

  const exportDB = () => {
    window.open('/api/db/export', '_blank');
    addToast('Exporting SQLite database backup...', 'info');
  };

  return (
    <div className="p-md md:p-lg max-w-5xl mx-auto w-full screen-enter space-y-lg">
      {/* Header Title */}
      <div>
        <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface mb-1 font-bold">
          Configuration
        </h2>
        <p className="text-xs text-on-surface-variant font-code-sm">
          Manage your terminal environment, security protocols, and AI integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-lg">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
          {/* Left Column (Account & Security) - 7 cols */}
          <div className="xl:col-span-7 space-y-gutter">
            {/* Account Settings Panel */}
            <section className="bg-[#121212] rounded-lg p-lg border-t border-outline-variant/30 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">Account Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block">
                      Operator Handle
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.username || 'Vault_Architect'}
                      className="w-full bg-[#080808] border border-outline-variant text-on-surface font-code-sm text-xs rounded px-3 py-2 opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block">
                      Primary Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'sysadmin@algo-vault.net'}
                      className="w-full bg-[#080808] border border-outline-variant text-on-surface font-code-sm text-xs rounded px-3 py-2 opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-1.5">
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block">
                    API Access Token
                  </label>
                  <div className="flex items-center gap-2 bg-[#080808] border border-outline-variant p-2 rounded">
                    <span className="font-code-sm text-xs text-on-surface-variant truncate flex-1 pl-2 font-mono">
                      {apiToken}
                    </span>
                    <button
                      type="button"
                      onClick={regenerateToken}
                      className="bg-transparent border border-outline-variant hover:border-primary text-on-surface font-label-caps text-[11px] py-1 px-3 rounded transition-all hover:text-primary flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* LeetCode Sync & Automation Panel */}
            <section className="bg-[#121212] rounded-lg p-lg border-t border-yellow-500/30">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-yellow-400 text-xl">code</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">LeetCode Integration</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-code-sm text-xs text-on-surface font-bold block">
                      Automated Profile Background Sync
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-code-sm">
                      Periodically fetch updated submissions & contest rating
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formState.leetcode_auto_sync}
                    onChange={(e) => setFormState({ ...formState, leetcode_auto_sync: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
                    Sync Interval
                  </label>
                  <select
                    value={formState.sync_frequency}
                    onChange={(e) => setFormState({ ...formState, sync_frequency: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Realtime on commit">Realtime on commit</option>
                    <option value="Every hour">Every hour</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SQLite Database Operations */}
            <section className="bg-[#121212] rounded-lg p-lg border-t border-outline-variant/30">
              <div className="flex items-center gap-2 mb-3 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-primary text-xl">database</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">Local SQLite Persistence</h3>
              </div>
              <p className="text-xs text-on-surface-variant font-code-sm mb-4">
                All algorithmic solutions, heatmaps, and metrics are stored locally in SQLite (`algovault.db`).
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportDB}
                  className="px-3.5 py-2 rounded bg-[#080808] border border-outline-variant hover:border-primary text-xs font-label-caps text-on-surface hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  EXPORT DATABASE (JSON)
                </button>
                <button
                  type="button"
                  onClick={resetDatabase}
                  className="px-3.5 py-2 rounded bg-error/10 border border-error/40 hover:bg-error/20 text-xs font-label-caps text-error flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  RESET TO FACTORY SEEDS
                </button>
              </div>
            </section>
          </div>

          {/* Right Column (Editor & AI) - 5 cols */}
          <div className="xl:col-span-5 space-y-gutter">
            {/* Editor Preferences */}
            <section className="bg-[#121212] rounded-lg p-lg border-t border-outline-variant/30">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-secondary text-xl">terminal</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">Terminal Preferences</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
                    Font Family
                  </label>
                  <select
                    value={formState.font_family}
                    onChange={(e) => setFormState({ ...formState, font_family: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Roboto Mono">Roboto Mono</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
                    Font Size
                  </label>
                  <select
                    value={formState.font_size}
                    onChange={(e) => setFormState({ ...formState, font_size: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="12px">12px - Dense</option>
                    <option value="14px">14px - Default</option>
                    <option value="16px">16px - Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-code-sm text-xs text-on-surface font-bold block">
                      Vim Keybindings
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-code-sm">
                      Enable modal navigation in snippet editor
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formState.vim_mode}
                    onChange={(e) => setFormState({ ...formState, vim_mode: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              </div>
            </section>

            {/* AI Insights Settings */}
            <section className="bg-[#121212] rounded-lg p-lg border-t border-secondary/40">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">AI Heuristic Controls</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
                    Complexity Alert Threshold
                  </label>
                  <select
                    value={formState.complexity_threshold}
                    onChange={(e) => setFormState({ ...formState, complexity_threshold: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-secondary"
                  >
                    <option value="O(N^2)">O(N²) - Flag quadratic loops</option>
                    <option value="O(N log N)">O(N log N) - Flag sorting overhead</option>
                    <option value="O(2^N)">O(2^N) - Flag recursion trees</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
                    Model Architecture
                  </label>
                  <select
                    value={formState.ai_model}
                    onChange={(e) => setFormState({ ...formState, ai_model: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-secondary"
                  >
                    <option value="vault-v2-optimized">vault-v2-optimized (Fast Heuristics)</option>
                    <option value="algo-deep-probe">algo-deep-probe (Comprehensive Proofs)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Form Submission Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <button
            type="submit"
            className="px-6 py-2.5 rounded bg-primary-container text-black font-label-caps text-xs font-bold hover:bg-primary transition-all shadow-neon-glow active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm font-bold">save</span>
            <span>APPLY CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}
