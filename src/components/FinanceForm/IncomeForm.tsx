import { FormEvent, useEffect, useState } from 'react';
import type { Income } from '../../types/finance';
import { AmountInput } from '../FormField/AmountInput';
import { DateInput } from '../FormField/DateInput';
import { FormField } from '../FormField/FormField';
import styles from './FinanceForm.module.css';

interface IncomeFormProps {
  initial?: Income | null;
  onCancel: () => void;
  onSubmit: (payload: { title: string; amount: number; source: string; date: string; description: string | null }) => Promise<void>;
}

export function IncomeForm({ initial, onCancel, onSubmit }: IncomeFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salario');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setAmount(String(initial.amount));
    setSource(initial.source);
    setDate(initial.date);
    setDescription(initial.description ?? '');
  }, [initial]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit({ title, amount: Number(amount), source, date, description: description || null });
    setSaving(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Titulo" name="title" value={title} required onChange={setTitle} />
      <AmountInput label="Monto" name="amount" value={amount} onChange={setAmount} />
      <FormField label="Fuente" name="source" value={source} required onChange={setSource} />
      <DateInput label="Fecha" name="date" value={date} onChange={setDate} />
      <FormField label="Descripcion" name="description" value={description} onChange={setDescription} />
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button disabled={saving}>{saving ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
}
