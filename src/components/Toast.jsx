import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderColor = 'border-primary';
        let textColor = 'text-primary';
        let icon = 'info';

        if (toast.type === 'success') {
          borderColor = 'border-primary';
          textColor = 'text-primary';
          icon = 'check_circle';
        } else if (toast.type === 'error') {
          borderColor = 'border-error';
          textColor = 'text-error';
          icon = 'error';
        }

        return (
          <div
            key={toast.id}
            className={`card-surface border ${borderColor} rounded-lg p-3 shadow-2xl flex items-center gap-3 animate-fadeIn pointer-events-auto bg-[#121212]/95 backdrop-blur-md glow-primary`}
          >
            <span className={`material-symbols-outlined text-lg ${textColor}`}>
              {icon}
            </span>
            <span className="font-code-sm text-xs text-on-surface flex-1">
              {toast.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
