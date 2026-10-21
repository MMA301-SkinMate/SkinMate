import { useState } from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectField } from './SelectField';
import { AppModal } from './AppModal';
import { Button } from './Button';

const formatDate = value => value instanceof Date && !Number.isNaN(value.getTime())
  ? [value.getDate(), value.getMonth() + 1, value.getFullYear()].map((part, index) => index < 2 ? String(part).padStart(2, '0') : part).join('/') : '';

/** @param {{label?: string, value?: Date|null, onChange?: Function, minimumDate?: Date, maximumDate?: Date, disabled?: boolean}} props */
export const DateField = ({ label, value = null, onChange, minimumDate, maximumDate, disabled = false, ...props }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const day = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const valid = date => date instanceof Date && !Number.isNaN(date.getTime())
    && (!minimumDate || day(date) >= day(minimumDate)) && (!maximumDate || day(date) <= day(maximumDate));
  const showPicker = () => {
    let initial = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
    if (minimumDate && initial < minimumDate) initial = minimumDate;
    if (maximumDate && initial > maximumDate) initial = maximumDate;
    setDraft(initial); setOpen(true);
  };
  const picker = <DateTimePicker value={draft} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    minimumDate={minimumDate} maximumDate={maximumDate}
    onDismiss={() => setOpen(false)}
    onValueChange={(event, date) => {
      if (Platform.OS === 'android') {
        setOpen(false);
        if (valid(date)) onChange?.(date);
      } else if (date) setDraft(date);
    }} />;
  return <>
    <SelectField {...props} label={label} valueLabel={formatDate(value)} placeholder={props.placeholder || 'dd/MM/yyyy'}
      onPress={showPicker} disabled={disabled} />
    {open && Platform.OS === 'android' && picker}
    {Platform.OS === 'ios' && <AppModal visible={open} title={label || 'Chọn ngày'} onClose={() => setOpen(false)}
      footer={<Button title="Chọn ngày" fullWidth onPress={() => { if (valid(draft)) onChange?.(draft); setOpen(false); }} />}>
      {picker}
    </AppModal>}
  </>;
};
