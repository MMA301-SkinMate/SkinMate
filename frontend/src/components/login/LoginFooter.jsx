import { StyleSheet, View } from "react-native";
import { AppText } from "../common/AppText";
import { Button } from "../common/Button";
import { COLORS } from "../../constants/colors";
import { SPACING } from "../../constants/theme";
import { LOGIN_COPY as COPY } from "../../constants/login";

export default function LoginFooter({ busy, onRegister }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color={COLORS.textSecondary}>
        {COPY.noAccount}
      </AppText>
      <Button
        title={COPY.openRegister}
        variant="ghost"
        disabled={busy}
        onPress={onRegister}
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
