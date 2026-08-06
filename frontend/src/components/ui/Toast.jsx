import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { onAuthToast } from './authEvents';

const ToastContext = createContext(null);
const TOAST_DURATION = 4000;

const toastTypes = {
  success: { bg: 'bg-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  error: { bg: 'bg-red-600', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { bg: 'bg-amber-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.264 16.5c-.77.833.192 2.5 1.732 2.5z' },
  info: { bg: 'bg-blue-500', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

function Toast({ toast, onDismiss }) {
  const typeConfig = toastTypes[toast.type] || toastTypes.info;
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, TOAST_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDismiss]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${typeConfig.bg} transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeConfig.icon} />
      </svg>
      <span className="flex-1">{toast.message}</span>
      <button onClick={handleClose} className="p-1 rounded hover:bg-white/20 transition-colors shrink-0" aria-label="Zamknij powiadomienie">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  useEffect(() => {
    const unsubscribers = ['success', 'error', 'warning', 'info'].map((type) =>
      onAuthToast(type, (message) => addToast(message, type))
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [addToast]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
