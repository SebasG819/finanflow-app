import { FormEvent, useState } from 'react';
import type { GoalRecord } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { AmountInput } from '../FormField/AmountInput';
import styles from './GoalContributionModal.module.css';

interface GoalContributionModalProps {
  goal: GoalRecord | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (goal: GoalRecord, amount: number) => Promise<void>;
}

export function GoalContributionModal({ goal, open, onClose, onSubmit }: GoalContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goal) return;

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSubmit(goal, parsedAmount);
      setAmount('');
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo guardar el aporte.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet title="Añadir dinero" open={open} onClose={onClose}>
      {goal ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.summary}>
            <strong>{goal.title}</strong>
            <span>Actual: {formatCurrency(Number(goal.current ?? 0))}</span>
            <span>Objetivo: {formatCurrency(Number(goal.target))}</span>
          </div>
          <AmountInput label="Monto a añadir" name="amount" value={amount} onChange={setAmount} />
          {error ? <p className={styles.error}>{error}</p> : null}
          <button disabled={saving}>{saving ? 'Guardando...' : 'Guardar aporte'}</button>
        </form>
      ) : null}
    </BottomSheet>
  );
}
