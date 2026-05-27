import { FormField } from './FormField';

interface DateInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export function DateInput({ label, name, value, required = true, onChange }: DateInputProps) {
  return <FormField label={label} name={name} type="date" value={value} required={required} onChange={onChange} />;
}
