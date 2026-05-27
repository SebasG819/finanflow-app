import { ChevronRight } from 'lucide-react';
import type { Expense, Income } from '../../types/finance';
import { formatCurrency, formatSignedCurrency } from '../../utils/formatters';
import { getExpenseMetrics } from '../../utils/financeCalculations';
import { iconMap, type IconName } from '../../utils/iconMap';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import styles from './TransactionList.module.css';

interface TransactionListProps {
  transactions: Array<Expense | Income>;
  kind: 'expense' | 'income';
  limit?: number;
  onEdit?: (transaction: Expense | Income) => void;
  onRemove?: (id: string) => void;
  onMarkInstallmentPaid?: (expense: Expense) => void;
}

const getIcon = (transaction: Expense | Income, kind: 'expense' | 'income') => {
  if (kind === 'income') return 'cash';
  const category = 'category' in transaction ? transaction.category.toLowerCase() : '';
  if (category.includes('transporte')) return 'fuel';
  if (category.includes('servicio')) return 'wifi';
  if (category.includes('ocio')) return 'utensils';
  return 'shopping';
};

const typeLabel = {
  fixed: 'Fijo mensual',
  installment: 'Credito',
  variable: 'Variable',
};

const statusLabel = {
  paid: 'Pagado',
  pending: 'Pendiente',
};

export function TransactionList({ transactions, kind, limit, onEdit, onRemove, onMarkInstallmentPaid }: TransactionListProps) {
  const visibleTransactions = typeof limit === 'number' ? transactions.slice(0, limit) : transactions;

  return (
    <div className={styles.list}>
      {visibleTransactions.map((transaction) => {
        const Icon = iconMap[getIcon(transaction, kind) as IconName];
        const subtitle =
          'category' in transaction
            ? `${transaction.category} • ${transaction.date}`
            : `${transaction.source} • ${transaction.date}`;
        const metrics = 'category' in transaction ? getExpenseMetrics(transaction) : null;
        const amount = metrics?.monthlyAmount ?? transaction.amount;

        return (
          <article className={styles.item} key={transaction.id}>
            <div className={`${styles.iconWrap} ${styles[kind]}`}>
              <Icon size={24} strokeWidth={2.2} />
            </div>
            <div className={styles.copy}>
              <strong>{transaction.title}</strong>
              <span>{subtitle}</span>
            </div>
            <span className={`${styles.amount} ${styles[kind]}`}>
              {formatSignedCurrency(kind === 'expense' ? -amount : amount)}
            </span>
            {'category' in transaction ? (
              <div className={styles.expenseMeta}>
                <span className={styles.badge}>{typeLabel[transaction.type]}</span>
                <span className={`${styles.badge} ${styles[transaction.payment_status]}`}>{statusLabel[transaction.payment_status]}</span>
                {metrics?.installmentLabel ? <span className={styles.badge}>{metrics.installmentLabel}</span> : null}
              </div>
            ) : null}
            {'category' in transaction && transaction.type === 'installment' && metrics ? (
              <div className={styles.installment}>
                <ProgressBar value={metrics.progressPercent} color="purple" />
                <div>
                  <span>Saldo restante {formatCurrency(metrics.remainingAmount)}</span>
                  {onMarkInstallmentPaid && transaction.payment_status === 'pending' ? (
                    <button onClick={() => onMarkInstallmentPaid(transaction)}>Marcar cuota como pagada</button>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className={styles.rowActions}>
              {onEdit ? (
                <button onClick={() => onEdit(transaction)} aria-label={`Editar ${transaction.title}`}>
                  Editar
                </button>
              ) : null}
              {onRemove ? (
                <button onClick={() => onRemove(transaction.id)} aria-label={`Eliminar ${transaction.title}`}>
                  Eliminar
                </button>
              ) : null}
            </div>
            {!onEdit && kind === 'expense' ? <ChevronRight className={styles.chevron} size={19} /> : null}
          </article>
        );
      })}
    </div>
  );
}
