import React from 'react';
import { useApp } from '../context/AppContext';

export default function TopHeader({ title = 'Dashboard', path = '~/vault/dashboard' }) {
  const { currentScreen, setCurrentScreen, searchTerm, setSearchTerm, user, setIsLeetCodeModalOpen, addToast } = useApp();

  return (
    <header className="bg-background/80 backdrop-blur-md text-primary fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 border-b border-outline-variant flex justify-between items-center px-lg h-16 transition-all">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-md">
        <button 
          onClick={() => setCurrentScreen(currentScreen === 'dashboard' ? 'vault' : 'dashboard')}
          className="md:hidden p-1.5 rounded-lg border border-outline-variant text-primary"
        >
          <span className="material-symbols-outlined text-lg">menu</span>
        </button>
        <div>
          <h2 className="font-headline-md text-lg md:text-xl font-bold text-primary tracking-tight">
            {title}
          </h2>
          <span className="font-code-sm text-xs text-on-surface-variant hidden lg:inline-block opacity-75">
            {path}
          </span>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-md">
        {/* Search Input */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Algo-Vault..."
            className="bg-[#121212] border border-[#1F2937] rounded-lg px-4 py-1.5 pl-9 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 md:w-64 text-xs font-code-sm transition-all"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-sm">
            search
          </span>
        </div>

        {/* LeetCode Sync Quick Action */}
        <button
          onClick={() => setIsLeetCodeModalOpen(true)}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded bg-[#121212] border border-outline-variant text-xs font-label-caps text-on-surface hover:text-primary hover:border-primary transition-all cursor-pointer"
          title="Sync with LeetCode"
        >
          <span className="material-symbols-outlined text-sm text-yellow-400">code</span>
          <span>LC SYNC</span>
          {user?.leetcode_username && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => addToast('System status: All telemetry and heuristics operational.', 'info')}
          aria-label="notifications"
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={() => addToast('Terminal stream active: 142.3 ops/sec', 'info')}
          aria-label="terminal"
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">terminal</span>
        </button>

        {/* User Avatar -> Profile */}
        <div
          onClick={() => setCurrentScreen('profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-primary/50 ml-1 cursor-pointer hover:shadow-neon-glow transition-all"
          title="Open Developer Profile"
        >
          <img
            src={user?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu42cHYJm65FBuFHjrsUVcVQZFOkf5bmE0xSsiRYGqPfDweWMEczB51uo5AX-736XQrFJnitTYB0cGv25kw5KwGAuQzQAjfT92AdYm9RUVFHmDcwsHiI_7vLUd32l0A1EFsgr4CV-SP8MhOZQTA78w3oobooDDHXXWcRLsscAvx8h-3D6Us6gGg9mjl-P-ghAqtst4dddnHNbzcXPCcWiKEPdDol0doLl2zOxl3Rf-80MiQhUQ0XMe'}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
