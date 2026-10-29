import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { PasswordRecoveryScreen } from '../screens/auth/password-recovery';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import AuthStackNav from "./AuthStackNav";
import RootNavigator from "./RootNavigator";
import { CollectionProvider } from "../context/CollectionContext";
import ExpiredProductAlertModal from "../components/collection/ExpiredProductAlertModal";
import { AppText } from "../components/common/AppText";
import { Button } from "../components/common/Button";
import { Snackbar } from "../components/common/Snackbar";
import { AUTH_MESSAGES as COPY } from "../constants/auth";
import { COLORS as C } from "../constants/colors";
import { SPACING } from "../constants/theme";

const Root = createNativeStackNavigator();

function BootstrapScreen() {
  const auth = useAuth();
  return (
    <View style={styles.loading}>
      {auth.bootstrapError ? (
        <>
          <AppText align="center" color={C.textMain}>
            {auth.bootstrapError}
          </AppText>
          <Button title={COPY.retry} onPress={auth.restore} />
        </>
      ) : (
        <>
          <ActivityIndicator color={C.primary} />
          <AppText color={C.textSecondary}>{COPY.restoring}</AppText>
        </>
      )}
    </View>
  );
}

function AuthenticatedApp() {
  return (
    <CollectionProvider>
      <RootNavigator />
      <ExpiredProductAlertModal />
    </CollectionProvider>
  );
}

export default function AppNavigator() {
  const auth = useAuth();
  const [recovery, setRecovery] = useState(null);
  useEffect(() => {
    let active = true;
    let received = false;
    const receive = (url) => {
      if (!active || !url) return;
      try {
        const parsed = new URL(url);
        const path = `${parsed.hostname}/${parsed.pathname}`.replace(/\/+$/, '');
        if (!['exp:', 'exps:', 'https:', 'skinmate:'].includes(parsed.protocol) ||
            !/(^|\/)reset-password$/.test(path)) return;
        setRecovery({ token: parsed.searchParams.get('token') || '', id: Date.now() });
      } catch { /* Ignore unrelated or malformed links. */ }
    };
    const subscription = Linking.addEventListener('url', ({ url }) => { received = true; receive(url); });
    Linking.getInitialURL().then(url => { if (!received) receive(url); }).catch(() => {});
    return () => { active = false; subscription.remove(); };
  }, []);
  if (recovery) return <PasswordRecoveryScreen key={recovery.id} token={recovery.token} onDone={() => setRecovery(null)} />;
  return (
    <>
      <Root.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.background },
        }}
      >
        {auth.booting || auth.bootstrapError ? (
          <Root.Screen name="Bootstrap" component={BootstrapScreen} />
        ) : auth.isAuthenticated ? (
          <Root.Screen name="MainTabs" component={AuthenticatedApp} />
        ) : (
          <Root.Screen name="Auth" component={AuthStackNav} />
        )}
      </Root.Navigator>
      {auth.notice && (
        <Snackbar
          id={auth.notice.id}
          visible
          message={auth.notice.message}
          tone={auth.isAuthenticated ? "success" : "info"}
          onDismiss={auth.dismissNotice}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: C.background,
  },
});
