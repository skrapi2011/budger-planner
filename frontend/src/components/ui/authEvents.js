// Global event bus for auth-related toast notifications
// Used by AuthContext to communicate with ToastProvider

const AUTH_EVENT_PREFIX = 'auth-toast-';

export function dispatchAuthToast(message, type = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_PREFIX + type, {
    detail: { message },
  }));
}

export function onAuthToast(type, callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail?.message || '');
  window.addEventListener(AUTH_EVENT_PREFIX + type, handler);
  return () => window.removeEventListener(AUTH_EVENT_PREFIX + type, handler);
}
