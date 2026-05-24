import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { auth as firebaseAuth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

export type ProfileRole = 'general_user' | 'super_user';

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  role: ProfileRole;
}

export interface AppUser {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  rawUser: SupabaseUser | null;
  profile: AuthProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperUser: boolean;
  refreshProfile: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_SELECT = 'id, email, full_name, role';
const PROFILE_REFRESH_INTERVAL_MS = 30000;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function getDisplayName(user: SupabaseUser, profile: AuthProfile | null) {
  const metadata = user.user_metadata || {};

  return (
    profile?.full_name ||
    metadata.full_name ||
    metadata.display_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    null
  );
}

function getPhotoUrl(user: SupabaseUser) {
  const metadata = user.user_metadata || {};
  return metadata.avatar_url || metadata.picture || null;
}

function normalizeUser(user: SupabaseUser | null, profile: AuthProfile | null): AppUser | null {
  if (!user) return null;

  return {
    uid: user.id,
    id: user.id,
    email: user.email || null,
    displayName: getDisplayName(user, profile),
    photoURL: getPhotoUrl(user),
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
      tenantId: firebaseAuth.currentUser?.tenantId,
      providerInfo: firebaseAuth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rawUser, setRawUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: SupabaseUser | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Could not load profile', error.message);
      setProfile(null);
      return;
    }

    setProfile((data as AuthProfile | null) || null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const currentUser = data.user || null;
    setRawUser(currentUser);
    await loadProfile(currentUser);
  }, [loadProfile]);

  useEffect(() => {
    let active = true;

    async function loadInitialSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      const sessionUser = data.session?.user || null;
      setRawUser(sessionUser);
      await loadProfile(sessionUser);
      if (active) setLoading(false);
    }

    loadInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setRawUser(sessionUser);
      loadProfile(sessionUser).finally(() => setLoading(false));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!rawUser) return;

    const refreshCurrentProfile = () => {
      void loadProfile(rawUser);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshCurrentProfile();
    };

    window.addEventListener('focus', refreshCurrentProfile);
    window.addEventListener('online', refreshCurrentProfile);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const refreshTimer = window.setInterval(refreshCurrentProfile, PROFILE_REFRESH_INTERVAL_MS);
    const channel = supabase
      .channel(`profile-sync-${rawUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${rawUser.id}`,
        },
        refreshCurrentProfile
      )
      .subscribe();

    refreshCurrentProfile();

    return () => {
      window.removeEventListener('focus', refreshCurrentProfile);
      window.removeEventListener('online', refreshCurrentProfile);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [rawUser?.id, loadProfile]);

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    setRawUser(data.user);
    await loadProfile(data.user);
  };

  const signUpWithPassword = async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          display_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'general_user',
      });
      setRawUser(data.user);
      await loadProfile(data.user);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setRawUser(null);
    setProfile(null);
  };

  const user = useMemo(() => normalizeUser(rawUser, profile), [rawUser, profile]);
  const isSuperUser = profile?.role === 'super_user';

  const value = useMemo(
    () => ({
      user,
      rawUser,
      profile,
      loading,
      isAdmin: isSuperUser,
      isSuperUser,
      refreshProfile,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [user, rawUser, profile, loading, isSuperUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
