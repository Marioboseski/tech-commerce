import { useToastStore } from '../../stores/toastStore';

// Shows the current toast from the store. Rendered once, in App.tsx.
export default function Toaster() {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);

  if (!toast) {
    return null;
  }

  return (
    <div
      key={toast.id}
      className={`toast show ${toast.type === 'error' ? 'toast-error' : ''}`}
      // Errors are read out loud right away by screen readers.
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      {toast.message}
      <button
        className="toast-close"
        type="button"
        aria-label="Close message"
        onClick={hideToast}
      >
        ×
      </button>
    </div>
  );
}
