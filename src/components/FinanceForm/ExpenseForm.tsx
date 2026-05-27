import { FormEvent, useEffect, useState } from 'react';
import type { Expense, ExpenseInsert, ExpenseType, PaymentStatus } from '../../types/finance';
import { AmountInput } from '../FormField/AmountInput';
import { DateInput } from '../FormField/DateInput';
import { FormField } from '../FormField/FormField';
import { SelectField } from '../FormField/SelectField';
import styles from './FinanceForm.module.css';

interface ExpenseFormProps {
  initial?: Expense | null;
  onCancel: () => void;
  onSubmit: (payload: Omit<ExpenseInsert, 'user_id'>) => Promise<void>;
}

const expenseTypeOptions = [
  { label: 'Variable', value: 'variable' },
  { label: 'Fijo mensual', value: 'fixed' },
  { label: 'Credito / cuotas', value: 'installment' },
];

const paymentStatusOptions = [
  { label: 'Pagado', value: 'paid' },
  { label: 'Pendiente', value: 'pending' },
];

export function ExpenseForm({ initial, onCancel, onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [currentInstallment, setCurrentInstallment] = useState('');
  const [category, setCategory] = useState('Alimentacion');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<ExpenseType>('variable');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [dueDay, setDueDay] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setAmount(String(initial.amount));
    setTotalAmount(initial.total_amount ? String(initial.total_amount) : '');
    setInstallmentAmount(initial.installment_amount ? String(initial.installment_amount) : '');
    setTotalInstallments(initial.total_installments ? String(initial.total_installments) : '');
    setCurrentInstallment(initial.current_installment !== null ? String(initial.current_installment) : '');
    setCategory(initial.category);
    setDate(initial.date);
    setType(initial.type);
    setPaymentStatus(initial.payment_status);
    setDueDay(initial.due_day ? String(initial.due_day) : '');
    setDescription(initial.description ?? '');
  }, [initial]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const parsedAmount = Number(amount);
    const parsedTotalAmount = Number(totalAmount);
    const parsedInstallmentAmount = Number(installmentAmount);
    const parsedTotalInstallments = Number(totalInstallments);
    const parsedCurrentInstallment = Number(currentInstallment);
    const parsedDueDay = Number(dueDay);

    if (!title.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (!category.trim()) {
      setError('La categoria es obligatoria.');
      return;
    }

    if (type !== 'installment' && parsedAmount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    if (type !== 'variable' && (parsedDueDay < 1 || parsedDueDay > 31)) {
      setError('El dia de pago debe estar entre 1 y 31.');
      return;
    }

    if (type === 'installment') {
      if (parsedTotalAmount <= 0 || parsedInstallmentAmount <= 0) {
        setError('El valor total y la cuota deben ser mayores a 0.');
        return;
      }

      if (parsedTotalInstallments <= 0) {
        setError('El total de cuotas debe ser mayor a 0.');
        return;
      }

      if (parsedCurrentInstallment < 0 || parsedCurrentInstallment > parsedTotalInstallments) {
        setError('La cuota actual no puede ser mayor al total de cuotas.');
        return;
      }
    }

    setSaving(true);

    try {
      await onSubmit({
        title: title.trim(),
        amount: type === 'installment' ? parsedInstallmentAmount : parsedAmount,
        category: category.trim(),
        date,
        description: description || null,
        type,
        payment_status: type === 'installment' && parsedCurrentInstallment >= parsedTotalInstallments ? 'paid' : paymentStatus,
        due_day: type === 'variable' ? null : parsedDueDay,
        is_recurring: type === 'fixed',
        total_amount: type === 'installment' ? parsedTotalAmount : null,
        installment_amount: type === 'installment' ? parsedInstallmentAmount : null,
        total_installments: type === 'installment' ? parsedTotalInstallments : null,
        current_installment: type === 'installment' ? parsedCurrentInstallment : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <SelectField label="Tipo de gasto" name="type" value={type} options={expenseTypeOptions} onChange={(value) => setType(value as ExpenseType)} />
      <FormField label="Nombre" name="title" value={title} required onChange={setTitle} />
      {type === 'variable' ? <AmountInput label="Monto" name="amount" value={amount} onChange={setAmount} /> : null}
      {type === 'fixed' ? <AmountInput label="Monto mensual" name="amount" value={amount} onChange={setAmount} /> : null}
      {type === 'installment' ? (
        <>
          <AmountInput label="Valor total de la compra" name="totalAmount" value={totalAmount} onChange={setTotalAmount} />
          <AmountInput label="Valor de la cuota" name="installmentAmount" value={installmentAmount} onChange={setInstallmentAmount} />
          <FormField label="Total de cuotas" name="totalInstallments" type="number" min="1" value={totalInstallments} required onChange={setTotalInstallments} />
          <FormField label="Cuota actual" name="currentInstallment" type="number" min="0" value={currentInstallment} required onChange={setCurrentInstallment} />
        </>
      ) : null}
      <FormField label="Categoria" name="category" value={category} required onChange={setCategory} />
      {type === 'variable' ? <DateInput label="Fecha" name="date" value={date} onChange={setDate} /> : null}
      {type !== 'variable' ? <FormField label="Dia de pago" name="dueDay" type="number" min="1" value={dueDay} required onChange={setDueDay} /> : null}
      <SelectField
        label="Estado de pago"
        name="paymentStatus"
        value={paymentStatus}
        options={paymentStatusOptions}
        onChange={(value) => setPaymentStatus(value as PaymentStatus)}
      />
      <FormField label="Descripcion" name="description" value={description} onChange={setDescription} />
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button disabled={saving}>{saving ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
}
