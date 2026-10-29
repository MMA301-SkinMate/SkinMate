import { Pressable, StyleSheet, View } from "react-native";
import { Controller } from "react-hook-form";
import { AppText } from "../common/AppText";
import { Icon } from "../common/Icon";
import { AppModal } from "../common/AppModal";
import { COLORS as C } from "../../constants/colors";
import { REGISTER_COPY as COPY, POLICIES } from "../../constants/register";
import { SPACING } from "../../constants/theme";
import { TONES } from "../common/commonTheme";

export default function TermsConsent({
  control,
  disabled,
  policy,
  onOpenPolicy,
  onClosePolicy,
}) {
  return (
    <>
      <Controller
        control={control}
        name="acceptedTerms"
        render={({ field, fieldState }) => (
          <View style={styles.group}>
            <View style={styles.row}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={COPY.consent}
                accessibilityState={{
                  checked: field.value,
                  disabled,
                }}
                disabled={disabled}
                onPress={() => {
                  field.onChange(!field.value);
                  field.onBlur();
                }}
                style={styles.checkbox}
              >
                <Icon
                  icon={field.value ? "checkbox" : "square-outline"}
                  color={C.primary}
                  size={26}
                />
              </Pressable>
              <View style={styles.text}>
                <AppText variant="bodySmall" color={C.textSecondary}>
                  {COPY.consentPrefix}{" "}
                  <AppText
                    variant="bodySmall"
                    style={styles.link}
                    color={C.primary}
                    accessibilityRole="link"
                    onPress={disabled ? undefined : () => onOpenPolicy("terms")}
                  >
                    {COPY.terms}
                  </AppText>{" "}
                  {COPY.and}{" "}
                  <AppText
                    variant="bodySmall"
                    style={styles.link}
                    color={C.primary}
                    accessibilityRole="link"
                    onPress={
                      disabled ? undefined : () => onOpenPolicy("privacy")
                    }
                  >
                    {COPY.privacy}
                  </AppText>
                </AppText>
              </View>
            </View>
            {!!fieldState.error && (
              <AppText
                variant="caption"
                color={TONES.error.foreground}
                accessibilityLiveRegion="polite"
              >
                {fieldState.error.message}
              </AppText>
            )}
          </View>
        )}
      />
      <AppModal
        visible={Boolean(policy)}
        title={policy ? POLICIES[policy].title : COPY.terms}
        onClose={onClosePolicy}
      >
        <View style={styles.group}>
          {policy &&
            POLICIES[policy].paragraphs.map((paragraph) => (
              <AppText key={paragraph} color={C.textSecondary}>
                {paragraph}
              </AppText>
            ))}
        </View>
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACING.xs },
  row: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.xxs },
  checkbox: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, paddingTop: SPACING.xs },
  link: { textDecorationLine: "underline" },
});
