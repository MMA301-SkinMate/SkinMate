import { Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";

/** @param {{count?: number, activeIndex?: number, onSelect?: Function}} props */
export const PaginationDots = ({
  count = 0,
  activeIndex = 0,
  onSelect,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: onSelect ? 0 : 8,
      },
      style,
    ]}
  >
    {Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => {
      const dot = (
        <View
          style={{
            width: index === activeIndex ? 20 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: index === activeIndex ? COLORS.primary : "#C5CEC0",
          }}
        />
      );
      return onSelect ? (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={`Trang ${index + 1} trên ${count}`}
          accessibilityState={{ selected: index === activeIndex }}
          onPress={() => onSelect(index)}
          style={{
            minWidth: 48,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dot}
        </Pressable>
      ) : (
        <View
          key={index}
          accessibilityLabel={`Trang ${index + 1}`}
          accessibilityState={{ selected: index === activeIndex }}
        >
          {dot}
        </View>
      );
    })}
  </View>
);
