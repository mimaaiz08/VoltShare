import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role, User } from '@/types';
import { getUsers, EV_USER_ID, OWNER_ID } from '@/services/db';

interface AuthState {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    const id = role === 'ev' ? EV_USER_ID : OWNER_ID;
    const u = getUsers().find((x) => x.id === id) ?? null;
    setUser(u);
  };

  const logout = () => setUser(null);

  const switchRole = (role: Role) => login(role);

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
