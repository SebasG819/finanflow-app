import styles from './PageIntro.module.css';

interface PageIntroProps {
  title: string;
  subtitle?: string;
}

export function PageIntro({ title, subtitle }: PageIntroProps) {
  return (
    <div className={styles.intro}>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
