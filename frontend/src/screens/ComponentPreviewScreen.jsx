import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ScreenWrapper from "../components/ScreenWrapper";
import {
  AppText,
  Button,
  IconButton,
  Card,
  Badge,
  Avatar,
  Divider,
  AppHeader,
  SectionHeader,
  ListRow,
  FloatingActionButton,
  TextField,
  PasswordField,
  SearchField,
  SelectField,
  DateField,
  Checkbox,
  RadioOption,
  SwitchField,
  Chip,
  ChipGroup,
  SegmentedControl,
  ProgressBar,
  PaginationDots,
  AlertBanner,
  Accordion,
  AppModal,
  AppBottomSheet,
  ConfirmDialog,
  ActionSheet,
  LoadingState,
  LoadingOverlay,
  Skeleton,
  EmptyState,
  ErrorState,
  Snackbar,
  UndoSnackbar,
} from "../components/common";

const groups = [
  { value: "base", label: "Cơ bản" },
  { value: "forms", label: "Form" },
  { value: "selection", label: "Lựa chọn" },
  { value: "overlays", label: "Modal / Sheet" },
  { value: "feedback", label: "Trạng thái" },
];
const skinOptions = [
  { value: "oily", label: "Da dầu" },
  { value: "dry", label: "Da khô" },
  { value: "mixed", label: "Da hỗn hợp" },
  { value: "sensitive", label: "Da nhạy cảm" },
];
const schema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên"),
  email: z.email("Email chưa hợp lệ"),
});

export default function ComponentPreviewScreen() {
  const [group, setGroup] = useState("base");
  const [overlay, setOverlay] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [choice, setChoice] = useState("oily");
  const [chips, setChips] = useState(["dry"]);
  const [tags, setTags] = useState(["Water", "Panthenol", "Niacinamide"]);
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [date, setDate] = useState(null);
  const [period, setPeriod] = useState("am");
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(0.6);
  const [expanded, setExpanded] = useState(false);
  const [report, setReport] = useState("spam");
  const [resolved, setResolved] = useState(false);
  const [snack, setSnack] = useState({ id: 0, visible: false });
  const [undo, setUndo] = useState({ id: 0, visible: false, expiresAt: 0 });
  const [undoResult, setUndoResult] = useState("Chưa có thao tác");
  const counter = useRef(0);
  const timers = useRef(new Set());
  const sheetTrigger = useRef(null);
  const emailRef = useRef(null);
  const scrollRef = useRef(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "" },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  const later = (action, duration = 900) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      action();
    }, duration);
    timers.current.add(timer);
  };
  const notify = (message, tone = "success") =>
    setSnack({ id: ++counter.current, visible: true, message, tone });
  const close = () => setOverlay(null);
  const saveDemo = () => {
    setBusy(true);
    later(() => {
      setBusy(false);
      close();
      notify("Đã hoàn tất thao tác mẫu");
    });
  };
  const submit = handleSubmit(async () => {
    notify("Form hợp lệ — chưa gửi API");
  });
  const footer =
    group === "forms" ? (
      <Button
        title="Kiểm tra form"
        fullWidth
        loading={isSubmitting}
        onPress={submit}
      />
    ) : undefined;

  return (
    <>
      <ScreenWrapper
        ref={scrollRef}
        scroll
        keyboardAvoiding
        edges={["top", "left", "right", "bottom"]}
        paddingHorizontal={20}
        contentContainerStyle={{ gap: 20, paddingBottom: 112 }}
        footer={footer}
        header={
          <View style={{ paddingHorizontal: 20 }}>
            <AppHeader
              title="Thư viện SkinMate"
              subtitle="Development · Dữ liệu minh họa"
            />
            <ChipGroup options={groups} value={group} style={{ paddingBottom: 8 }} onChange={value => {
              setGroup(value); scrollRef.current?.scrollTo({ y: 0, animated: false });
            }} />
          </View>
        }
      >
        <AlertBanner
          title="Component Preview"
          description="Các thao tác ở đây chỉ minh họa giao diện, không gọi API và không lưu dữ liệu."
        />

        {group === "base" && (
          <>
            <SectionHeader
              title="Chữ & font"
              actionLabel="Thử thao tác"
              onAction={() => notify("Đã bấm action của section")}
            />
            <AppText variant="hero">SkinMate</AppText>
            <AppText variant="title">Tủ đồ của bạn</AppText>
            <AppText>Nội dung tiếng Việt: dưỡng ẩm, làn da, chu trình.</AppText>
            <AppText variant="caption" color="textSecondary">
              Poppins cho heading hỗ trợ; Inter cho tiếng Việt cần fallback.
            </AppText>
            <SectionHeader title="Button & IconButton" />
            <Button
              title="Thêm sản phẩm"
              leftIcon="add"
              onPress={() => notify("Đã bấm nút primary")}
            />
            <Button
              title="Nút có nhãn dài vẫn xuống dòng và giữ vùng chạm đầy đủ"
              variant="secondary"
              rightIcon="arrow-forward"
              onPress={() => notify("Nút secondary")}
            />
            <Button
              title="Để sau"
              variant="ghost"
              onPress={() => notify("Nút ghost")}
            />
            <Button
              title="Xóa bản mẫu"
              variant="danger"
              onPress={() => setOverlay("confirm")}
            />
            <Button title="Đang xử lý" loading />
            <Button title="Không khả dụng" disabled />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <IconButton
                icon="heart-outline"
                accessibilityLabel="Thích bản mẫu"
                onPress={() => notify("Đã thích bản mẫu")}
              />
              <IconButton
                icon="notifications-outline"
                variant="soft"
                accessibilityLabel="Thông báo mẫu"
                onPress={() => notify("Không có thông báo thật")}
              />
              <IconButton
                icon="close"
                disabled
                accessibilityLabel="Nút đóng vô hiệu hóa"
              />
            </View>
            <SectionHeader
              title="Card, Badge, Avatar"
              trailing={<Badge label="Mẫu" />}
            />
            {["default", "cream", "pink", "sage", "outlined"].map((variant) => (
              <Card key={variant} variant={variant}>
                <AppText variant="label">Card · {variant}</AppText>
                <AppText variant="bodySmall">
                  Nội dung co giãn theo cỡ chữ và chiều dài.
                </AppText>
              </Card>
            ))}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {["neutral", "success", "warning", "error", "info"].map(
                (tone) => (
                  <Badge
                    key={tone}
                    label={tone}
                    tone={tone}
                    icon="information-circle-outline"
                  />
                ),
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Avatar name="Nguyễn Lan Anh" />
              <Avatar
                source={require("../assets/icon.png")}
                name="SkinMate"
                size={64}
              />
            </View>
            <Divider />
            <Card padding={4}>
              <ListRow
                title="Hồ sơ da"
                description="Hàng thao tác minh họa"
                leading={<Avatar name="Da" size={36} />}
                onPress={() => notify("Hàng chỉ phát callback")}
              />
              <Divider spacing={0} inset={12} />
              <ListRow
                title="Xóa mẫu"
                destructive
                onPress={() => setOverlay("confirm")}
              />
            </Card>
          </>
        )}

        {group === "forms" && (
          <>
            <SectionHeader title="Form + React Hook Form" />
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  label="Tên của bạn"
                  required
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={fieldState.error?.message}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  label="Email"
                  required
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  ref={(node) => {
                    field.ref(node);
                    emailRef.current = node;
                  }}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                />
              )}
            />
            <PasswordField
              label="Mật khẩu mẫu"
              value={password}
              onChangeText={setPassword}
              helperText="Chỉ thử hiện/ẩn, không xác thực tài khoản."
            />
            <SearchField
              label="Tìm kiếm mẫu"
              value={search}
              onChangeText={setSearch}
              onClear={() => notify("Đã xóa nội dung tìm kiếm")}
            />
            <SelectField
              label="Loại da (mẫu)"
              valueLabel={
                skinOptions.find((item) => item.value === choice)?.label
              }
              onPress={() => setOverlay("select")}
            />
            <DateField
              label="Ngày mở nắp (mẫu)"
              value={date}
              onChange={setDate}
              maximumDate={new Date()}
            />
            <TextField
              label="Ghi chú dài"
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="Thử bàn phím và cuộn tới cuối form..."
            />
            <TextField
              label="Chỉ đọc"
              value="Không thể chỉnh sửa"
              editable={false}
            />
            <TextField label="Vô hiệu hóa" value="Disabled" disabled />
            <TextField
              label="Ví dụ lỗi"
              value=""
              error="Thông báo lỗi nằm ngay dưới input"
              onChangeText={() => {}}
            />
          </>
        )}

        {group === "selection" && (
          <>
            <SectionHeader title="Checkbox, Radio, Switch" />
            <Checkbox
              label="Tôi đồng ý với điều khoản mẫu"
              checked={checked}
              onChange={setChecked}
            />
            {skinOptions.slice(0, 2).map((item) => (
              <RadioOption
                key={item.value}
                label={item.label}
                selected={choice === item.value}
                onSelect={() => setChoice(item.value)}
              />
            ))}
            <SwitchField
              label="Nhắc skincare (mẫu)"
              description="Chỉ đổi trạng thái UI, không đăng ký notification."
              value={enabled}
              onValueChange={setEnabled}
            />
            <SectionHeader title="Chip & ChipGroup" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {tags.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onRemove={() =>
                    setTags((current) =>
                      current.filter((item) => item !== label),
                    )
                  }
                />
              ))}
            </View>
            <Button
              title="Khôi phục tag mẫu"
              variant="ghost"
              onPress={() => setTags(["Water", "Panthenol", "Niacinamide"])}
            />
            <AppText variant="caption">Chọn tối đa 2 mục:</AppText>
            <ChipGroup
              options={skinOptions}
              value={chips}
              onChange={setChips}
              multiple
              maxSelected={2}
            />
            <SectionHeader title="SegmentedControl" />
            <SegmentedControl
              options={[
                { value: "am", label: "Buổi sáng" },
                { value: "pm", label: "Buổi tối" },
              ]}
              value={period}
              onChange={setPeriod}
            />
            <SegmentedControl
              variant="underline"
              options={[
                { value: "am", label: "Đang dùng" },
                { value: "pm", label: "Đã dùng" },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </>
        )}

        {group === "overlays" && (
          <>
            <SectionHeader title="Modal & Bottom Sheet" />
            <Button
              title="A7 · Modal giới thiệu tủ đồ"
              onPress={() => setOverlay("welcome")}
            />
            <Button
              title="D5 · ConfirmDialog nguy hiểm"
              variant="danger"
              onPress={() => setOverlay("confirm")}
            />
            <Button
              ref={sheetTrigger}
              title="D4 · ActionSheet"
              variant="secondary"
              onPress={() => setOverlay("actions")}
            />
            <Button
              title="E2 · Xác nhận thành phần"
              variant="secondary"
              onPress={() => setOverlay("ingredients")}
            />
            <Button
              title="F3 · Form báo cáo trong sheet"
              variant="secondary"
              onPress={() => setOverlay("report")}
            />
            <Button
              title="G8 · Sao chép & điều kiện còn thiếu"
              variant="secondary"
              onPress={() => {
                setResolved(false);
                setOverlay("copy");
              }}
            />
            <SwitchField
              label="Loading minh họa"
              description="Khóa đóng trong 3 giây, sau đó tự mở khóa."
              value={busy}
              onValueChange={(value) => {
                setBusy(value);
                if (value) later(() => setBusy(false), 3000);
              }}
            />
          </>
        )}

        {group === "feedback" && (
          <>
            <SectionHeader title="Tiến trình & thông tin" />
            <ProgressBar value={progress} label="Tiến độ mẫu" showPercentage />
            <Button
              title="Tăng tiến độ"
              variant="secondary"
              onPress={() =>
                setProgress((value) => (value >= 1 ? 0 : value + 0.2))
              }
            />
            <PaginationDots count={3} activeIndex={page} onSelect={setPage} />
            {["info", "success", "warning", "error"].map((tone) => (
              <AlertBanner
                key={tone}
                tone={tone}
                title={`Banner ${tone}`}
                description="Nội dung minh họa có icon, chữ và viền; không chỉ phụ thuộc màu."
              />
            ))}
            <Accordion
              title="Giải thích mở rộng"
              expanded={expanded}
              onToggle={setExpanded}
            >
              <AppText variant="bodySmall">
                Khung này chỉ hiển thị nội dung do tính năng cung cấp, không tự
                sinh nhận định skincare.
              </AppText>
            </Accordion>
            <LoadingState message="Ví dụ trạng thái đang tải" />
            <Card style={{ minHeight: 160, justifyContent: "center" }}>
              <Button
                title="Thử LoadingOverlay"
                onPress={() => {
                  setBusy(true);
                  later(() => setBusy(false), 1500);
                }}
              />
              <LoadingOverlay visible={busy} />
            </Card>
            <Skeleton height={100} radius={20} />
            <Skeleton width="70%" />
            <Skeleton animated={false} width="45%" />
            <EmptyState
              title="Tủ đồ mẫu đang trống"
              description="Đây là trạng thái rỗng, không đọc tủ đồ thật."
              actionLabel="Thêm mẫu"
              onAction={() => notify("Đã bấm CTA của EmptyState")}
            />
            <ErrorState
              message="Lỗi giả lập để kiểm tra nút thử lại."
              retrying={busy}
              onRetry={() => {
                setBusy(true);
                later(() => {
                  setBusy(false);
                  notify("Đã thử lại (mẫu)");
                });
              }}
            />
            <Button
              title="Hiện Snackbar"
              onPress={() => notify("Đã lưu thông tin mẫu")}
            />
            <Button
              title="Thử Undo 10 giây"
              variant="secondary"
              disabled={undo.visible}
              onPress={() => {
                setUndoResult("Đang chờ quyết định");
                setUndo({
                  id: ++counter.current,
                  visible: true,
                  expiresAt: Date.now() + 10000,
                });
              }}
            />
            <AppText variant="caption">{undoResult}</AppText>
          </>
        )}
      </ScreenWrapper>

      <FloatingActionButton
        icon="help"
        bottomOffset={snack.visible || undo.visible ? 100 : footer ? 88 : 16}
        onPress={() => setOverlay("guide")}
      />
      <Snackbar
        {...snack}
        bottomOffset={16}
        actionLabel="Đã hiểu"
        onAction={() => {}}
        onDismiss={() =>
          setSnack((current) => ({ ...current, visible: false }))
        }
      />
      <UndoSnackbar
        {...undo}
        message="Đã ghi nhận thao tác mẫu"
        bottomOffset={16}
        onUndo={() => {
          setUndoResult("Đã hoàn tác (minh họa)");
          setUndo((current) => ({ ...current, visible: false }));
        }}
        onExpire={() => {
          setUndoResult("Đã hết 10 giây (minh họa)");
          setUndo((current) => ({ ...current, visible: false }));
        }}
      />

      <AppModal
        visible={overlay === "welcome"}
        title="Tủ đồ skincare đang trống"
        onClose={close}
        loading={busy}
        footer={
          <>
            <Button
              title="Thêm sản phẩm mẫu"
              disabled={busy}
              onPress={() => {
                close();
                notify("Chưa mở luồng Scan thật");
              }}
            />
            <Button
              title="Để sau"
              variant="ghost"
              onPress={close}
              disabled={busy}
            />
          </>
        }
      >
        <EmptyState
          title="Tủ mỹ phẩm của bạn"
          description="Composition A7: AppModal + EmptyState + Button."
        />
      </AppModal>
      <ConfirmDialog
        visible={overlay === "confirm"}
        title="Xóa sản phẩm mẫu?"
        variant="danger"
        loading={busy}
        description="Ví dụ D5: thao tác có thể ảnh hưởng các bước routine. Không có dữ liệu thật bị xóa."
        cancelLabel="Giữ sản phẩm"
        confirmLabel="Xóa mẫu"
        onCancel={close}
        onConfirm={saveDemo}
      />
      <ActionSheet
        visible={overlay === "actions"}
        title="Thao tác sản phẩm"
        triggerRef={sheetTrigger}
        onClose={close}
        header={<Badge label="D4 · Dữ liệu minh họa" />}
        items={[
          {
            id: "detail",
            label: "Xem chi tiết",
            icon: "information-circle-outline",
            onPress: () => notify("Xem chi tiết mẫu"),
          },
          {
            id: "used",
            label: "Đánh dấu đã dùng hết",
            icon: "checkmark-circle-outline",
            onPress: () => notify("Đã dùng hết (mẫu)"),
          },
          {
            id: "delete",
            label: "Xóa sản phẩm",
            icon: "trash-outline",
            destructive: true,
            onPress: () => setOverlay("confirm"),
          },
        ]}
      />
      <AppBottomSheet
        visible={["guide", "ingredients", "report", "copy", "select"].includes(
          overlay,
        )}
        onClose={close}
        loading={busy}
        title={
          overlay === "guide"
            ? "Hướng dẫn component"
            : overlay === "ingredients"
              ? "Xác nhận thành phần"
              : overlay === "report"
                ? "Báo cáo bài viết mẫu"
                : overlay === "copy"
                  ? "Sao chép chu trình mẫu"
                  : "Chọn loại da mẫu"
        }
        footer={
          overlay === "select" || overlay === "guide" ? (
            <Button title="Đã hiểu" onPress={close} />
          ) : overlay === "ingredients" ? (
            <>
              <Button
                title="Xác nhận & tiếp tục"
                onPress={saveDemo}
                loading={busy}
              />
              <Button
                title="Chỉnh sửa danh sách"
                variant="secondary"
                disabled={busy}
                onPress={() => notify("Đây là ví dụ UI, chưa mở màn chỉnh sửa")}
              />
            </>
          ) : (
            <Button
              title={
                overlay === "copy" ? "Xác nhận sao chép" : "Gửi báo cáo mẫu"
              }
              disabled={overlay === "copy" && !resolved}
              loading={busy}
              onPress={saveDemo}
            />
          )
        }
      >
        {overlay === "guide" && (
          <AppText>
            Đây là bộ component chung. Các cảnh báo và nội dung sản phẩm ở
            preview chỉ để kiểm tra bố cục, không phải tư vấn y tế.
          </AppText>
        )}
        {overlay === "ingredients" && (
          <>
            <AlertBanner
              title="Danh sách minh họa"
              description="Không có OCR hoặc phân tích ảnh trong preview."
            />
            <Card>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Water",
                  "Panthenol",
                  "Niacinamide",
                  "Glycerin",
                  "Ceramide NP",
                ].map((label) => (
                  <Chip key={label} label={label} tone="success" />
                ))}
                <Chip label="Thành phần cần kiểm tra" tone="error" />
              </View>
            </Card>
            <AppText>
              Thử cuộn và kéo đóng sheet. Các nút ở footer vẫn nằm trong vùng có
              thể chạm.
            </AppText>
          </>
        )}
        {overlay === "report" && (
          <>
            <AppText>F3: lựa chọn và nhập nội dung trong bottom sheet.</AppText>
            {[
              ["spam", "Quảng cáo hoặc spam"],
              ["wrong", "Thông tin cần kiểm chứng"],
              ["other", "Lý do khác"],
            ].map(([value, label]) => (
              <RadioOption
                key={value}
                label={label}
                selected={report === value}
                onSelect={() => setReport(value)}
              />
            ))}
            <TextField
              label="Mô tả thêm"
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="Thử nhập khi bàn phím đang mở..."
            />
            <TextField
              label="Email liên hệ (mẫu)"
              value={search}
              onChangeText={setSearch}
              keyboardType="email-address"
            />
          </>
        )}
        {overlay === "copy" && (
          <>
            <AlertBanner
              tone="warning"
              title="Chu trình đang áp dụng (mẫu)"
              description="Ví dụ trình bày hậu quả trước khi xác nhận thay thế; chưa thực hiện thay đổi dữ liệu."
            />
            {[1, 2, 3].map((index) => (
              <ListRow
                key={index}
                title={`Sản phẩm mẫu ${index}`}
                description="Đã có trong tủ mẫu"
                trailing={<Badge label="Đã có" tone="success" />}
              />
            ))}
            <AlertBanner
              tone={resolved ? "success" : "warning"}
              title={
                resolved ? "Đã xử lý bước thiếu" : "Còn thiếu một sản phẩm"
              }
            />
            <Checkbox
              label="Đã chọn sản phẩm thay thế (mô phỏng)"
              checked={resolved}
              onChange={setResolved}
            />
          </>
        )}
        {overlay === "select" &&
          skinOptions.map((item) => (
            <RadioOption
              key={item.value}
              label={item.label}
              selected={choice === item.value}
              onSelect={() => {
                setChoice(item.value);
                close();
              }}
            />
          ))}
      </AppBottomSheet>
    </>
  );
}
