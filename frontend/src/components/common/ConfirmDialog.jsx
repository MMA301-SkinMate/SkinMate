import { AppModal } from "./AppModal";
import { AppText } from "./AppText";
import { Button } from "./Button";

/** @param {{visible?: boolean, title: string, description?: string, confirmLabel?: string, cancelLabel?: string, onConfirm?: Function, onCancel?: Function, loading?: boolean, variant?: string}} props */
export const ConfirmDialog = ({
  visible,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
  children,
  ...props
}) => (
  <AppModal
    {...props}
    visible={visible}
    title={title}
    onClose={onCancel}
    loading={loading}
    footer={
      <>
        {variant === "danger" && (
          <Button
            title={cancelLabel}
            onPress={onCancel}
            disabled={loading}
            fullWidth
          />
        )}
        <Button
          title={confirmLabel}
          variant={variant === "danger" ? "danger" : "primary"}
          onPress={onConfirm}
          loading={loading}
          fullWidth
        />
        {variant !== "danger" && (
          <Button
            title={cancelLabel}
            variant="secondary"
            onPress={onCancel}
            disabled={loading}
            fullWidth
          />
        )}
      </>
    }
  >
    {!!description && <AppText>{description}</AppText>}
    {children}
  </AppModal>
);
