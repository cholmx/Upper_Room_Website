import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { backend } from './lib/backend';

const AuthContext = createContext(null);

// The server confirms the stored session on load. Nothing here grants access on its own,
// and the database must enforce the same rules (row level security) for every write.
// The role comes from the team table in the database ('admin', 'editor', or none for a login with no access).
const withRole = (u, role) => (u ? { ...u, role: role || null } : null);
const fetchRole = async () => {
  const res = await backend.rpc('my_staff_role', {});
  return res.status === 'success' && typeof res.data === 'string' ? res.data : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    const found = await backend.getUser();
    const u = withRole(found, found ? await fetchRole() : null);
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
    const role = await fetchRole();
    if (!role) {
      await backend.signOut();
      return { ok: false, error: 'This login does not have access to the admin. Ask an admin to invite you.' };
    }
    setUser(withRole(res.data, role));
    return { ok: true };
  };

  // After an invitation or reset link: the session is already stored, so read it and the role again.
  const startSession = async () => refresh();

  const logout = async () => {
    await backend.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, startSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
