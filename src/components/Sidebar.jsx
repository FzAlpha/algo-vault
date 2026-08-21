import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentScreen, setCurrentScreen, setIsSnippetModalOpen, user } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'vault', label: 'The Vault', icon: 'lock' },
    { id: 'statistics', label: 'Statistics', icon: 'bar_chart' },
    { id: 'ai_insights', label: 'AI Insights', icon: 'psychology' },
  ];

  return (
    <aside className="bg-background text-primary font-body-md h-screen w-64 fixed left-0 top-0 border-r border-outline-variant flex flex-col py-lg z-50 select-none">
      {/* Brand Header */}
      <div 
        onClick={() => setCurrentScreen('dashboard')}
        className="px-lg mb-8 flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center group-hover:border-primary group-hover:shadow-neon-glow transition-all">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            terminal
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Algo-Vault</h1>
          <p className="text-xs text-on-surface-variant font-code-sm">Terminal v2.4.0</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-lg mb-6">
        <button
          onClick={() => setIsSnippetModalOpen(true)}
          className="w-full bg-[#4ADE80] text-black font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-neon-glow active:scale-95 duration-100 font-label-caps text-xs tracking-wider cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          NEW SNIPPET
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center gap-md px-lg py-md transition-all duration-150 active:scale-95 text-left border-l-4 ${
                    isActive
                      ? 'bg-surface-container-highest text-primary border-primary font-semibold shadow-[inset_0_0_12px_rgba(74,222,128,0.1)]'
                      : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span 
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-md text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Footer Navigation */}
      <div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
        <ul>
          <li>
            <button
              onClick={() => setCurrentScreen('profile')}
              className={`w-full flex items-center gap-md px-lg py-2.5 transition-all duration-150 active:scale-95 text-left border-l-4 ${
                currentScreen === 'profile'
                  ? 'bg-surface-container-highest text-primary border-primary font-semibold'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              <span className="font-body-md text-sm">Profile</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentScreen('settings')}
              className={`w-full flex items-center gap-md px-lg py-2.5 transition-all duration-150 active:scale-95 text-left border-l-4 ${
                currentScreen === 'settings'
                  ? 'bg-surface-container-highest text-primary border-primary font-semibold'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-body-md text-sm">Settings</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentScreen('signin')}
              className={`w-full flex items-center gap-md px-lg py-2.5 transition-all duration-150 active:scale-95 text-left border-l-4 ${
                currentScreen === 'signin'
                  ? 'bg-surface-container-highest text-error border-error font-semibold'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-error'
              }`}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="font-body-md text-sm">Auth / Sign In</span>
            </button>
          </li>
        </ul>

        {/* User Card */}
        {user && (
          <div 
            onClick={() => setCurrentScreen('profile')}
            className="mx-lg mt-3 p-2 bg-surface-container rounded-lg border border-outline-variant/60 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/50 flex-shrink-0">
              <img 
                src={user.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7E9mvXx4MWHwgfDbCOhqKaFCl60NYeI7TewN8zH3VQlDyXnlmZnubWr4WGmxnNKhc0TggDcv_3EjXdIalwuEcRKig12dNeYJd6FVvt3OOsqLF_GnU66nen_ba3ODvZ2lYOSVP-uU4UN63czTpNKGWdtmeHgkv5Q-AsOYn2YxN5YJqM4MB82KEhpbDnHuI8Gix-htbSgOuMUTRXJ6EgyZATv_bzYB-su4hbjAtV2-SHelLNSm6ueTS'} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <div className="font-label-caps text-xs text-on-surface truncate">{user.username}</div>
              <div className="font-code-sm text-[10px] text-primary truncate">{user.title || 'Senior Optimizer'}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
