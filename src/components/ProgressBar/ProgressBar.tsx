import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  color?: 'blue' | 'purple' | 'green';
}

export function ProgressBar({ value, color = 'blue' }: ProgressBarProps) {
  return (
    <div className={styles.track} aria-label={`Progreso ${value}%`}>
      <span className={`${styles.fill} ${styles[color]}`} style={{ width: `${value}%` }} />
    </div>
  );
}
