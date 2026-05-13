import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type ProviderProfile = {
  id: string;
  businessName: string;
  status: string;
  category: string;
  serviceTitle: string;
} | null;

type SessionUser = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  providerProfile: ProviderProfile;
  permissions: {
    canBook: boolean;
    canProvide: boolean;
    hasProviderProfile: boolean;
  };
};

type Session = {
  token: string;
  user: SessionUser;
} | null;

type AuthContextValue = {
  session: Session;
  setSession: (session: Session) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);

  const value = useMemo(
    () => ({
      session,
      setSession,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
