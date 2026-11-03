import { StyleSheet, View } from 'react-native';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { COLORS } from '../../constants/colors';
import { PASSWORD_REQUIREMENTS } from '../../constants/register';

export default function PasswordRequirements({ value, requirements = PASSWORD_REQUIREMENTS }) {
  return (
    <View style={styles.requirements}>
      {requirements.map((requirement) => {
        const valid = requirement.test(value);
        return (
          <View key={requirement.id} style={styles.requirementRow}>
            <Icon
              icon={valid ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={17}
              color={valid ? COLORS.primary : COLORS.textMuted}
            />
            <AppText
              variant="caption"
              color={valid ? COLORS.primary : 'textSecondary'}
              style={styles.requirementText}
              accessibilityLabel={`${requirement.label}: ${valid ? 'met' : 'not met'}`}
            >
              {requirement.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  requirements: { marginTop: 6, gap: 4 },
  requirementText: { flex: 1 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
