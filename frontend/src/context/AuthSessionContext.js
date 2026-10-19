import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'skinmate.auth-session';
const AuthSessionContext = createContext(null);

let currentSession = null;
let restorePromise = null;
const listeners = new Set();

function notify() {
  listeners.forEach(listener => listener(currentSession));
}

function isValidSession(value) {
  return Boolean(
    value &&
      value.user &&
      typeof value.accessToken === 'string' &&
      typeof value.refreshToken === 'string'
  );
}

export function getAuthSession() {
  return currentSession;
}

export function getAccessToken() {
  return currentSession?.accessToken || null;
}

export function subscribeToAuthSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function restoreAuthSession() {
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    try {
      const serializedSession = await SecureStore.getItemAsync(STORAGE_KEY);
      if (!serializedSession) return null;

      const session = JSON.parse(serializedSession);
      if (!isValidSession(session)) {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        return null;
      }

      currentSession = session;
      notify();
      return session;
    } catch {
      currentSession = null;
      notify();
      return null;
    }
  })();

  try {
    return await restorePromise;
  } finally {
    restorePromise = null;
  }
}

export async function saveAuthSession(authResult) {
  const session = {
    user: authResult.user,
    accessToken: authResult.accessToken,
    refreshToken: authResult.refreshToken,
    refreshTokenExpiresAt: authResult.refreshTokenExpiresAt,
  };

  if (!isValidSession(session)) {
    throw new Error('Authentication response is incomplete');
  }

  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
  currentSession = session;
  notify();
  return session;
}

export async function clearAuthSession() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } finally {
    currentSession = null;
    notify();
  }
}

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState(currentSession);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthSession(setSession);
    restoreAuthSession().finally(() => setIsRestoring(false));
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ session, isRestoring, saveAuthSession, clearAuthSession }),
    [session, isRestoring]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider');
  }
  return context;
}
