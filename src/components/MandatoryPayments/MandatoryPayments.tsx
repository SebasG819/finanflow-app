import type { Expense } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getExpenseMetrics } from '../../utils/financeCalculations';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import styles from './MandatoryPayments.module.css';

interface MandatoryPaymentsProps {
  expenses: Expense[];
  total: number;
  freeBalance: number;
  onMarkInstallmentPaid?: (expense: Expense) => void;
}

const labels = {
  fixed: 'Fijo mensual',
  installment: 'Credito',
  variable: 'Variable',
};

export function MandatoryPayments({ expenses, total, freeBalance, onMarkInstallmentPaid }: MandatoryPaymentsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2>Pagos obligatorios del mes</h2>
          <p>Total obligatorio {formatCurrency(total)}</p>
        </div>
        <strong>{formatCurrency(freeBalance)}</strong>
      </div>
      {expenses.length === 0 ? (
        <div className={styles.empty}>No tienes pagos obligatorios pendientes.</div>
      ) : (
        <div className={styles.list}>
          {expenses.map((expense) => {
            const metrics = getExpenseMetrics(expense);

            return (
              <article className={styles.item} key={expense.id}>
                <div className={styles.itemHead}>
                  <div>
                    <strong>{expense.title}</strong>
                    <span>
                      Dia {expense.due_day ?? '-'} • {labels[expense.type]}
                    </span>
                  </div>
                  <b>{formatCurrency(metrics.monthlyAmount)}</b>
                </div>
                <div className={styles.meta}>
                  <span className={styles.status}>Pendiente</span>
                  {metrics.installmentLabel ? <span>{metrics.installmentLabel}</span> : null}
                </div>
                {expense.type === 'installment' ? (
                  <>
                    <ProgressBar value={metrics.progressPercent} color="purple" />
                    <div className={styles.installmentFoot}>
                      <span>Saldo restante {formatCurrency(metrics.remainingAmount)}</span>
                      {onMarkInstallmentPaid ? <button onClick={() => onMarkInstallmentPaid(expense)}>Marcar cuota como pagada</button> : null}
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
