import type { ReactNode } from 'react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  title: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ title, open, children, onClose }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.handle} />
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Cerrar">
            Cerrar
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  );
}
