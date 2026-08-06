import { createContext, useContext, useState, useEffect } from 'react';
import * as api from './api';
import { dispatchAuthToast } from './components/ui/authEvents';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authReady, setAuthReady] = useState(false);

  const handleLogin = async (username, password) => {
    await api.login(username, password);
    setUser(localStorage.getItem('user'));
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    dispatchAuthToast('Wylogowano', 'info');
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setAuthReady(true);
        return;
      }
      try {
        await api.checkStatus();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  // Token expiry interceptor — wraps fetch to catch 401
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);

      if (response.status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/rejestracja')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          dispatchAuthToast('Sesja wygasła. Zaloguj się ponownie.', 'error');
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value = {
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
    authReady,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
