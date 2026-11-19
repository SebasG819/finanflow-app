import { useEffect, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import type { GmailImport, SaveGmailImportInput } from '../../services/GmailImportService';
import styles from './GmailPage.module.css';

interface GmailReviewSheetProps {
  item: GmailImport | null;
  onClose: () => void;
  onSave: (input: SaveGmailImportInput, autoSaveSender: boolean) => Promise<void>;
}

export function GmailReviewSheet({ item, onClose, onSave }: GmailReviewSheetProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Otros');
  const [autoSaveSender, setAutoSaveSender] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setAmount(item.amount ? String(item.amount) : '');
    setKind(item.kind ?? 'expense');
    setCategory('Otros');
    setAutoSaveSender(false);
    setError(null);
  }, [item]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!item || saving) return;
    const numericAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !category.trim()) {
      setError('Completa el nombre, la categoría y un monto mayor a cero.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({ id: item.id, title: title.trim(), amount: numericAmount, kind, category: category.trim() }, autoSaveSender);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo guardar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={Boolean(item)} title="Revisar movimiento" onClose={onClose}>
      {item ? (
        <form className={styles.reviewForm} onSubmit={submit}>
          <p className={styles.messageOrigin}>{item.sender} · {item.message_date}</p>
          <label>Nombre<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label>Monto<input type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label>Tipo
            <select value={kind} onChange={(event) => setKind(event.target.value as 'expense' | 'income')}>
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </label>
          <label>{kind === 'expense' ? 'Categoría' : 'Fuente'}<input value={category} onChange={(event) => setCategory(event.target.value)} required /></label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={autoSaveSender} onChange={(event) => setAutoSaveSender(event.target.checked)} />
            <span>Guardar los próximos mensajes claros de este remitente al sincronizar</span>
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar movimiento'}</button>
        </form>
      ) : null}
    </BottomSheet>
  );
}
