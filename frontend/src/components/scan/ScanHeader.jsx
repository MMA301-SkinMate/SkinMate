import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, withOpacity } from "../../constants/colors";
import { SIZES } from "../../constants/theme";

const ScanHeader = ({ insets, flash, toggleFlash, toggleFacing }) => {
  return (
    <View style={[styles.header, { paddingTop: insets.top + SIZES.base }]}>
      <Text style={styles.headerTitle}>AI Ingredient Scan</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={toggleFlash}
          activeOpacity={0.7}
        >
          <Ionicons
            name={flash === "off" ? "flash-off" : "flash"}
            size={SIZES.title}
            color={flash === "on" ? COLORS.warning : COLORS.textLight}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={toggleFacing}
          activeOpacity={0.7}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={SIZES.title}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScanHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.small,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: SIZES.small,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(COLORS.textLight, 0.15),
    justifyContent: "center",
    alignItems: "center",
  },
});
