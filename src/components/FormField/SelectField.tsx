import styles from './FormField.module.css';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function SelectField({ label, name, value, options, onChange }: SelectFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select name={name} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
