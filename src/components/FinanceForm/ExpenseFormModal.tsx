import type { Expense, ExpenseInsert } from '../../types/finance';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseFormModalProps {
  open: boolean;
  initial?: Expense | null;
  onClose: () => void;
  onSubmit: (payload: Omit<ExpenseInsert, 'user_id'>) => Promise<void>;
}

export function ExpenseFormModal({ open, initial, onClose, onSubmit }: ExpenseFormModalProps) {
  return (
    <BottomSheet title={initial ? 'Editar gasto' : 'Agregar gasto'} open={open} onClose={onClose}>
      <ExpenseForm initial={initial} onCancel={onClose} onSubmit={onSubmit} />
    </BottomSheet>
  );
}
