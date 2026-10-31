export const SKIN_TYPES = [
  { value: 'da_dau', label: 'Da dầu mụn' },
  { value: 'da_kho', label: 'Da khô' },
  { value: 'da_hon_hop', label: 'Da hỗn hợp' },
  { value: 'da_nhay_cam', label: 'Da nhạy cảm' },
  { value: 'da_thuong', label: 'Da thường' },
];

export const skinTypeLabel = (value) => (
  SKIN_TYPES.find((item) => item.value === value)?.label || value || 'Chưa thiết lập'
);
