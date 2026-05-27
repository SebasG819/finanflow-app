import styles from './SummaryStrip.module.css';

interface SummaryStripProps {
  label: string;
  value: string;
}

export function SummaryStrip({ label, value }: SummaryStripProps) {
  return (
    <article className={styles.strip}>
      <span>{label}</span>
      <strong>{value}</strong>
      <div className={styles.avatars}>
        <span />
        <span />
        <span />
        <b>+2</b>
      </div>
    </article>
  );
}
