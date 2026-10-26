import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { backend } from './lib/backend';

const AuthContext = createContext(null);

// The server confirms the stored session on load. Nothing here grants access on its own,
// and the database must enforce the same rules (row level security) for every write.
const withRole = (u) => (u ? { ...u, role: u.app_metadata?.role } : null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    const u = withRole(await backend.getUser());
    setUser(u);
    setChecking(false);
    return u;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const res = await backend.signIn(email, password);
    if (res.status !== 'success') return { ok: false, error: res.error };
    setUser(withRole(res.data));
    return { ok: true };
  };

  const logout = async () => {
    await backend.signOut();
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
