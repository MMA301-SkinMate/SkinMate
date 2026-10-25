import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import AuthStackNav from "./AuthStackNav";
import BottomTabNav from "./BottomTabNav";
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

export default function AppNavigator() {
  const auth = useAuth();
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
          <Root.Screen name="MainTabs" component={BottomTabNav} />
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
