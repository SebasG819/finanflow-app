import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <div className={styles.head}>
      <h2>{title}</h2>
      {action ? <button onClick={onAction}>{action}</button> : null}
    </div>
  );
}
