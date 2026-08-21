import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SignInScreen() {
  const { loginManual, setIsLeetCodeModalOpen, setCurrentScreen, user } = useApp();
  const [terminalId, setTerminalId] = useState(user?.username || 'Vault_Architect');
  const [accessKey, setAccessKey] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginManual(terminalId);
      setLoading(false);
      setCurrentScreen('dashboard');
    }, 600);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center relative overflow-hidden terminal-grid p-4 screen-enter">
      {/* Scanline effect for terminal feel */}
      <div className="scanline absolute inset-0 w-full h-full"></div>

      <main className="w-full max-w-md px-lg relative z-10">
        {/* Terminal Window Container */}
        <div className="bg-surface-container-low border border-outline-variant rounded-DEFAULT overflow-hidden shadow-2xl relative glow-primary">
          {/* Terminal Header */}
          <div className="bg-surface-container flex items-center justify-between px-md py-sm border-b border-outline-variant">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
              <div className="w-3 h-3 rounded-full bg-primary-container"></div>
            </div>
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              ALGO-VAULT: AUTH
            </span>
            <span className="font-label-caps text-xs text-outline-variant">v2.4.0</span>
          </div>

          {/* Terminal Body */}
          <div className="p-lg bg-surface flex flex-col items-center">
            {/* Logo / Branding */}
            <div className="mb-lg flex flex-col items-center">
              <span
                className="material-symbols-outlined text-5xl text-primary mb-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                terminal
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary text-center font-bold tracking-tight">
                ALGO-VAULT
              </h1>
              <p className="font-code-sm text-xs text-on-surface-variant mt-1 text-center">
                Initialize connection sequence...
              </p>
            </div>

            {/* Primary Auth Action: LeetCode */}
            <button
              onClick={() => setIsLeetCodeModalOpen(true)}
              className="w-full bg-primary-container text-black font-label-caps text-xs font-bold py-3.5 rounded-DEFAULT mb-lg hover:bg-primary transition-colors flex items-center justify-center space-x-2 glow-primary cursor-pointer active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-lg">code</span>
              <span>AUTHENTICATE VIA LEETCODE</span>
            </button>

            {/* Divider */}
            <div className="w-full flex items-center space-x-md mb-lg">
              <div className="flex-1 h-px bg-outline-variant"></div>
              <span className="font-code-sm text-[11px] text-outline-variant uppercase">
                OR MANUAL OVERRIDE
              </span>
              <div className="flex-1 h-px bg-outline-variant"></div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-md">
              <div className="flex flex-col space-y-1">
                <label className="font-code-sm text-xs text-on-surface" htmlFor="terminal-id">
                  Terminal ID <span className="text-primary">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">
                    person
                  </span>
                  <input
                    id="terminal-id"
                    type="text"
                    required
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    placeholder="Enter operator handle..."
                    className="w-full bg-surface-container border border-outline-variant rounded pl-9 pr-3 py-2 font-code-sm text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-code-sm text-xs text-on-surface flex justify-between" htmlFor="access-key">
                  <span>Access Key <span className="text-primary">*</span></span>
                  <span className="text-primary text-[10px] hover:underline cursor-pointer">Default Key Active</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">
                    key
                  </span>
                  <input
                    id="access-key"
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container border border-outline-variant rounded pl-9 pr-3 py-2 font-code-sm text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 border border-outline-variant bg-transparent text-on-surface hover:text-primary hover:border-primary font-label-caps text-xs font-bold py-3 rounded transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 duration-150"
              >
                <span>{loading ? 'AUTHENTICATING...' : 'EXECUTE LOGIN'}</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
            </form>
          </div>

          {/* Terminal Footer Status */}
          <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant flex justify-between items-center text-xs font-code-sm">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-primary">Connection Secure</span>
            </div>
            <span className="text-outline-variant">Latency: 12ms</span>
          </div>
        </div>
      </main>
    </div>
  );
}
