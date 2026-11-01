import { createContext } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  register: (
    name: string,
    email: string,
    password: string,
  ) => { ok: boolean; message?: string };
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
