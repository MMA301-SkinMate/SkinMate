import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  clearStoredSession,
  isSessionActive,
  loadAuthentication,
  saveSession,
} from "../services/authStorage";
import { AUTH_MESSAGES } from "../constants/auth";
import {
  loadIntroCompleted,
  markIntroCompleted,
} from "../services/introStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [bootstrapError, setBootstrapError] = useState(null);
  const [session, setSession] = useState(null);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [notice, setNotice] = useState(null);
  const mounted = useRef(true);
  const restoreVersion = useRef(0);
  const sessionRef = useRef(null);
  const storageQueue = useRef(Promise.resolve());

  const enqueue = useCallback((task) => {
    const next = storageQueue.current.catch(() => {}).then(task);
    storageQueue.current = next;
    return next;
  }, []);

  const restore = useCallback(async () => {
    const version = ++restoreVersion.current;
    setBooting(true);
    setBootstrapError(null);
    try {
      const [restored, completed] = await Promise.all([
        enqueue(loadAuthentication),
        loadIntroCompleted(),
      ]);
      if (!mounted.current || version !== restoreVersion.current) return;
      sessionRef.current = restored.session;
      setSession(restored.session);
      setIntroCompleted(completed || Boolean(restored.session));
      if (restored.session && !completed) {
        // Existing authenticated users skip Intro even if its flag cannot be saved.
        enqueue(markIntroCompleted).catch(() => {});
      }
    } catch {
      if (mounted.current && version === restoreVersion.current) {
        setBootstrapError(AUTH_MESSAGES.restoreFailed);
      }
    } finally {
      if (mounted.current && version === restoreVersion.current)
        setBooting(false);
    }
  }, [enqueue]);

  useEffect(() => {
    mounted.current = true;
    restore();
    return () => {
      mounted.current = false;
      restoreVersion.current += 1;
    };
  }, [restore]);

  const completeIntro = useCallback(async () => {
    await enqueue(markIntroCompleted);
    if (mounted.current) setIntroCompleted(true);
  }, [enqueue]);

  const establishSession = useCallback(
    async (payload, message) => {
      const saved = await enqueue(() => saveSession(payload));
      if (!isSessionActive(saved)) throw new Error("SESSION_EXPIRED");
      if (mounted.current) {
        sessionRef.current = saved;
        setSession(saved);
        setIntroCompleted(true);
        setNotice({ id: Date.now(), message });
        enqueue(markIntroCompleted).catch(() => {});
      }
    },
    [enqueue],
  );

  useEffect(() => {
    if (!session) return undefined;
    const checkExpiry = () => {
      if (!sessionRef.current || isSessionActive(sessionRef.current)) return;
      sessionRef.current = null;
      setSession(null);
      setNotice({ id: Date.now(), message: AUTH_MESSAGES.expired });
      // The expired record is never trusted again, even if deletion must be retried.
      enqueue(clearStoredSession).catch(() => {});
    };
    const timer = setTimeout(
      checkExpiry,
      Math.max(0, Date.parse(session.accessTokenExpiresAt) - Date.now()),
    );
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") checkExpiry();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [session, enqueue]);

  return (
    <AuthContext.Provider
      value={{
        booting,
        bootstrapError,
        session,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        introCompleted,
        completeIntro,
        restore,
        establishSession,
        notice,
        dismissNotice: () => setNotice(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
