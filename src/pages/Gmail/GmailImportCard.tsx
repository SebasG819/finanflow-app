import { Check, Trash2 } from 'lucide-react';
import type { GmailImport } from '../../services/GmailImportService';
import { formatCurrency } from '../../utils/formatters';
import styles from './GmailPage.module.css';

interface GmailImportCardProps {
  item: GmailImport;
  busy: boolean;
  onReview: (item: GmailImport) => void;
  onDiscard: (item: GmailImport) => void;
}

export function GmailImportCard({ item, busy, onReview, onDiscard }: GmailImportCardProps) {
  return (
    <article className={styles.importCard}>
      <div className={styles.cardTop}><strong>{item.subject}</strong><b>{item.amount ? formatCurrency(item.amount) : 'Revisar monto'}</b></div>
      <p>{item.sender}</p>
      <div className={styles.cardMeta}><span>{item.message_date}</span><span>{item.kind === 'expense' ? 'Posible gasto' : item.kind === 'income' ? 'Posible ingreso' : 'Tipo por confirmar'}</span></div>
      <div className={styles.cardActions}>
        <button onClick={() => onReview(item)} disabled={busy}><Check size={16} /> Revisar</button>
        <button onClick={() => onDiscard(item)} disabled={busy}><Trash2 size={16} /> Descartar</button>
      </div>
    </article>
  );
}
