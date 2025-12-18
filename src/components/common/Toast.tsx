'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, type === 'error' ? 6000 : 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md w-full sm:w-auto pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md
            animate-slide-in-right
            backdrop-blur-sm border
            pointer-events-auto
            transform transition-all duration-300 ease-out
            ${
              toast.type === 'success'
                ? 'bg-green-500/95 border-green-400 text-white'
                : toast.type === 'error'
                ? 'bg-red-500/95 border-red-400 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500/95 border-yellow-400 text-white'
                : 'bg-blue-500/95 border-blue-400 text-white'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6" />}
              {toast.type === 'error' && <XCircleIcon className="w-6 h-6" />}
              {(toast.type === 'info' || toast.type === 'warning') && (
                <InformationCircleIcon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors rounded p-1 hover:bg-white/10"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

