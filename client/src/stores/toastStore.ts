import { create } from 'zustand';

const TOAST_DURATION_MS = 3000;

type ToastType = 'success' | 'error';

type Toast = {
  // A new id for every toast, so showing the same text twice still
  // restarts the timer and React treats it as a new message.
  id: number;
  message: string;
  type: ToastType;
};

type ToastState = {
  toast: Toast | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

// One toast at a time: a new one replaces the old one.
export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    clearTimeout(hideTimer);
    set({ toast: { id: nextId++, message, type } });
    hideTimer = setTimeout(() => set({ toast: null }), TOAST_DURATION_MS);
  },
  hideToast: () => {
    clearTimeout(hideTimer);
    set({ toast: null });
  },
}));

// For code outside React components (e.g. lib/queryClient.ts), where hooks
// cannot be used. getState() reads the store directly.
export const showToast = (message: string, type?: ToastType) =>
  useToastStore.getState().showToast(message, type);
