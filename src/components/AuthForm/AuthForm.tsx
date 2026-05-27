import type { FormEvent, ReactNode } from 'react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  submitLabel: string;
  error?: string;
  loading?: boolean;
  footer: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({ title, subtitle, children, submitLabel, error, loading, footer, onSubmit }: AuthFormProps) {
  return (
    <main className={styles.stage}>
      <section className={styles.panel}>
        <div className={styles.brand}>FinanFlow</div>
        <header className={styles.intro}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        <form className={styles.form} onSubmit={onSubmit}>
          {children}
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.submit} disabled={loading}>
            {loading ? 'Procesando...' : submitLabel}
          </button>
        </form>
        <div className={styles.footer}>{footer}</div>
      </section>
    </main>
  );
}
