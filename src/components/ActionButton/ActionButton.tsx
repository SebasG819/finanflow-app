import type { LucideIcon } from 'lucide-react';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  children: string;
  icon: LucideIcon;
  variant?: 'primary' | 'outline';
  type?: 'button' | 'submit';
  onClick?: () => void;
}

export function ActionButton({ children, icon: Icon, variant = 'primary', type = 'button', onClick }: ActionButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} type={type} onClick={onClick}>
      <Icon size={19} />
      {children}
    </button>
  );
}
