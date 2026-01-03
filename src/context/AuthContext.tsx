import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string | null;
}

interface Profile extends User {
  planTier: 'basic' | 'standard' | 'premium';
  issuingCardId?: string;
  issuingCardholderId?: string;
  treasuryFinancialAccountId?: string;
  cardNumber?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  cardBrand?: string;
  cardStatus?: 'active' | 'inactive' | 'canceled';
  stripeCustomerId?: string;
  fiatBalance: number;
  portfolio: { [key: string]: number };
  identityVerified?: boolean;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/profile');
      setProfile(data);
      setUser({ id: data._id, email: data.email, fullName: data.fullName });
    } catch (err) {
      console.error('Error fetching profile:', err);
      signOut();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    // Don't await - let it load in background
    fetchProfile();
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  const isAdmin = () => profile?.role === 'admin';

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    login,
    signOut,
    refreshProfile: fetchProfile,
    isAdmin,
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
