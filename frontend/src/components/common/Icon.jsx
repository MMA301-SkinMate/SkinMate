import { Ionicons } from "@expo/vector-icons";

// Internal helper: accept an Ionicons name or a caller-owned React node.
export const Icon = ({ icon, size = 20, color }) =>
  typeof icon === "string" ? (
    <Ionicons name={icon} size={size} color={color} accessible={false} />
  ) : (
    icon || null
  );
