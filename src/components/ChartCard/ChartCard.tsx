import type { ReactNode } from 'react';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, action, children }: ChartCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
