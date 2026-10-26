import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authFetch } from './api';

const AuthContext = createContext(null);

// Session lives in an httpOnly cookie set by the backend; the client only
// asks the server who it is. Nothing here grants access on its own, and the
// data endpoints must enforce the same session server-side.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    const res = await authFetch('get-session');
    const session = res.status === 'success' ? res.data : null;
    setUser(session?.user ?? null);
    setChecking(false);
    return session?.user ?? null;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const res = await authFetch('sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.status !== 'success') {
      return { ok: false, error: res.httpStatus === 401 ? 'Incorrect email or password' : res.error };
    }
    const u = await refresh();
    return u ? { ok: true } : { ok: false, error: 'Sign in succeeded but no session was created' };
  };

  const logout = async () => {
    await authFetch('sign-out', { method: 'POST', body: JSON.stringify({}) });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
