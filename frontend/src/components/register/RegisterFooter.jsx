import { StyleSheet, View } from "react-native";
import { AppText } from "../common/AppText";
import { Button } from "../common/Button";
import { COLORS } from "../../constants/colors";
import { SPACING } from "../../constants/theme";
import { REGISTER_COPY as COPY } from "../../constants/register";

export default function RegisterFooter({ busy, onLogin }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color={COLORS.textSecondary}>
        {COPY.hasAccount}
      </AppText>
      <Button
        title={COPY.loginAction}
        variant="ghost"
        disabled={busy}
        onPress={onLogin}
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: SPACING.xxs,
  },
});
