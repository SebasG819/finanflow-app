import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  onChange: (value: string) => void;
}

export function FormField({ label, name, type = 'text', value, placeholder, required, min, step, onChange }: FormFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
