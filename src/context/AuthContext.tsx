import React, { createContext, useContext, useState } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';
import { CLERK_KEY, isClerkConfigured } from '../services/supabase';

interface AuthContextType {
  isSignedIn: boolean;
  userId: string;
  userEmail: string;
  userName: string;
  isMockMode: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => void;
  signIn: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  userId: 'local-operator',
  userEmail: 'operator@ares.network',
  userName: 'Emergency Ops Commander',
  isMockMode: true,
  getToken: async () => null,
  signOut: () => {},
  signIn: () => {},
});

// Inner component when Clerk is active
const ClerkAuthBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();

  const value: AuthContextType = {
    isSignedIn: !!isSignedIn,
    userId: user?.id || 'anonymous-user',
    userEmail: user?.primaryEmailAddress?.emailAddress || 'commander@ares.local',
    userName: user?.fullName || user?.firstName || 'Operations Commander',
    isMockMode: false,
    getToken: async () => {
      try {
        return (await clerk.session?.getToken({ template: 'supabase' })) || null;
      } catch {
        return null;
      }
    },
    signOut: () => clerk.signOut(),
    signIn: () => clerk.openSignIn(),
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ares-bg text-ares-accent font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ares-accent border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING ARES SECURE AUTH LINK...</span>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Fallback Mock provider when Clerk keys are not yet configured in .env
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(true);

  const value: AuthContextType = {
    isSignedIn,
    userId: 'mock-commander-01',
    userEmail: 'ops.commander@ares.network',
    userName: 'Col. Alex Vance (Ops Director)',
    isMockMode: true,
    getToken: async () => 'mock-jwt-token',
    signOut: () => setIsSignedIn(false),
    signIn: () => setIsSignedIn(true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const ARESAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
};

export const useARESAuth = () => useContext(AuthContext);
