import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser } from './auth-context';

type StoredUser = AuthUser & { password: string };
const USERS_KEY = 'techstore-demo-users';
const SESSION_KEY = 'techstore-demo-session';

const readUsers = (): StoredUser[] => {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = (email: string, password: string) => {
    const storedUser = readUsers().find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!storedUser || storedUser.password !== password) {
      return { ok: false, message: 'Email or password is incorrect.' };
    }
    const sessionUser: AuthUser = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
    };
    setUser(sessionUser);
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}
