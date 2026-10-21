import { useEffect, useRef } from "react";
import { AppBottomSheet } from "./AppBottomSheet";
import { AppText } from "./AppText";
import { ListRow } from "./ListRow";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { COLORS } from "../../constants/colors";
import { TONES } from "./commonTheme";

/** @param {{visible?: boolean, title: string, items?: object[], header?: import('react').ReactNode, description?: string, onClose?: Function, onDismiss?: Function}} props */
export const ActionSheet = ({
  visible,
  title,
  description,
  header,
  items = [],
  onClose,
  onDismiss,
  ...props
}) => {
  const pendingAction = useRef(null);
  useEffect(() => {
    if (visible) pendingAction.current = null;
  }, [visible]);
  return (
    <AppBottomSheet
      {...props}
      visible={visible}
      title={title}
      onClose={onClose}
      onDismiss={(reason) => {
        const action = pendingAction.current;
        pendingAction.current = null;
        onDismiss?.(reason);
        action?.();
      }}
      footer={
        <Button
          title="Hủy"
          variant="secondary"
          fullWidth
          disabled={props.loading}
          onPress={() => onClose?.("cancel")}
        />
      }
    >
      {header}
      {!!description && (
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      )}
      {items.map((item) => (
        <ListRow
          key={item.id}
          title={item.label}
          description={item.description}
          leading={
            <Icon
              icon={item.icon}
              color={item.destructive ? TONES.error.foreground : COLORS.primary}
            />
          }
          destructive={item.destructive}
          disabled={item.disabled || props.loading}
          onPress={() => {
            pendingAction.current = item.onPress;
            onClose?.("action");
          }}
        />
      ))}
    </AppBottomSheet>
  );
};
