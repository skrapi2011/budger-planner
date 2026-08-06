import { useState, useEffect, useRef } from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };

    const handleFocusTrap = (e) => {
      const dialog = e.currentTarget;
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    const dialogEl = document.getElementById('confirm-dialog-root');
    if (dialogEl) dialogEl.addEventListener('focus', handleFocusTrap, true);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (dialogEl) dialogEl.removeEventListener('focus', handleFocusTrap, true);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-root"
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-[scaleIn_0.2s_ease-out]"
      >
        <div className="p-6">
          <h3 id="confirm-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p id="confirm-message" className="text-sm text-gray-600 dark:text-slate-400 mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-md ${
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#32a852] hover:bg-[#1f8c42]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
