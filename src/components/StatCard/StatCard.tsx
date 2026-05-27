import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  compact?: boolean;
}

export function StatCard({ label, value, trend, tone = 'neutral', compact = false }: StatCardProps) {
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
      {trend ? <span className={`${styles.trend} ${styles[tone]}`}>{trend}</span> : null}
    </article>
  );
}
