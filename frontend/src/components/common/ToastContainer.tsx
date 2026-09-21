import React, { useEffect, useState } from 'react';
import { toastService } from '../../services/toastService';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toastService.subscribe((list) => {
      setToasts(list);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-[#0875B5] shrink-0 mt-0.5" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white/95 text-slate-800',
          error: 'border-rose-200 bg-white/95 text-slate-800',
          warning: 'border-amber-200 bg-white/95 text-slate-800',
          info: 'border-sky-200 bg-white/95 text-slate-800',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg backdrop-blur-md border ${borders[toast.type]} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => toastService.remove(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Dismiss toast notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
