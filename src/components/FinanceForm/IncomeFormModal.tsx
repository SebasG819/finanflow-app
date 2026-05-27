import type { Income, IncomeInsert } from '../../types/finance';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { IncomeForm } from './IncomeForm';

interface IncomeFormModalProps {
  open: boolean;
  initial?: Income | null;
  onClose: () => void;
  onSubmit: (payload: Omit<IncomeInsert, 'user_id'>) => Promise<void>;
}

export function IncomeFormModal({ open, initial, onClose, onSubmit }: IncomeFormModalProps) {
  return (
    <BottomSheet title={initial ? 'Editar ingreso' : 'Agregar ingreso'} open={open} onClose={onClose}>
      <IncomeForm initial={initial} onCancel={onClose} onSubmit={onSubmit} />
    </BottomSheet>
  );
}
