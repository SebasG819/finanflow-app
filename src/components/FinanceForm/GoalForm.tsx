import { FormEvent, useEffect, useState } from 'react';
import type { GoalRecord } from '../../types/finance';
import { FormField } from '../FormField/FormField';
import styles from './FinanceForm.module.css';

interface GoalFormProps {
  initial?: GoalRecord | null;
  onCancel: () => void;
  onSubmit: (payload: { title: string; target: number; current: number; deadline: string | null; category: string | null }) => Promise<void>;
}

export function GoalForm({ initial, onCancel, onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Ahorro');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setTarget(String(initial.target));
    setCurrent(String(initial.current ?? 0));
    setDeadline(initial.deadline ?? '');
    setCategory(initial.category ?? 'Ahorro');
  }, [initial]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      title,
      target: Number(target),
      current: Number(current),
      deadline: deadline || null,
      category: category || null,
    });
    setSaving(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Titulo" name="title" value={title} required onChange={setTitle} />
      <FormField label="Objetivo" name="target" type="number" min="0" step="0.01" value={target} required onChange={setTarget} />
      <FormField label="Actual" name="current" type="number" min="0" step="0.01" value={current} required onChange={setCurrent} />
      <FormField label="Fecha limite" name="deadline" type="date" value={deadline} onChange={setDeadline} />
      <FormField label="Categoria" name="category" value={category} onChange={setCategory} />
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button disabled={saving}>{saving ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
}
