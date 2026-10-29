import * as SecureStore from "expo-secure-store";

export const SESSION_KEY = "skinmate.auth.session";

export const normalizeSession = (value) => {
  if (
    !value ||
    !value.user ||
    !["id", "fullName", "email"].every(
      (key) =>
        typeof value.user[key] === "string" && value.user[key].length > 0,
    ) ||
    !["accessToken", "refreshToken"].every(
      (key) => typeof value[key] === "string" && value[key].length > 0,
    ) ||
    !["accessTokenExpiresAt", "refreshTokenExpiresAt"].every(
      (key) =>
        typeof value[key] === "string" &&
        Number.isFinite(Date.parse(value[key])),
    )
  ) {
    return null;
  }
  return {
    user: {
      id: value.user.id,
      fullName: value.user.fullName,
      email: value.user.email,
    },
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    accessTokenExpiresAt: value.accessTokenExpiresAt,
    refreshTokenExpiresAt: value.refreshTokenExpiresAt,
  };
};

export const isSessionActive = (session) =>
  Boolean(
    session &&
    Date.parse(session.accessTokenExpiresAt) > Date.now() &&
    Date.parse(session.refreshTokenExpiresAt) > Date.now(),
  );

export const clearStoredSession = () =>
  SecureStore.deleteItemAsync(SESSION_KEY);

export const loadAuthentication = async () => {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return { session: null };
  let session;
  try {
    session = normalizeSession(JSON.parse(raw));
  } catch {
    session = null;
  }
  if (!isSessionActive(session)) {
    await clearStoredSession();
    session = null;
  }
  return { session };
};

export const saveSession = async (value) => {
  const session = normalizeSession(value);
  if (!isSessionActive(session)) throw new Error("INVALID_SESSION");
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return session;
};
