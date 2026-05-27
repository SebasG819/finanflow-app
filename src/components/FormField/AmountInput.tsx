import { FormField } from './FormField';

interface AmountInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function AmountInput({ label, name, value, onChange }: AmountInputProps) {
  return <FormField label={label} name={name} type="number" min="0.01" step="0.01" value={value} required onChange={onChange} />;
}
