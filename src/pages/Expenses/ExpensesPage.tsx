import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { CategoryPills } from '../../components/CategoryPills/CategoryPills';
import { DataState } from '../../components/DataState/DataState';
import { ExpenseFormModal } from '../../components/FinanceForm/ExpenseFormModal';
import { PageIntro } from '../../components/PageIntro/PageIntro';
import { StatCard } from '../../components/StatCard/StatCard';
import { TransactionList } from '../../components/TransactionList/TransactionList';
import { useFinanceData } from '../../hooks/useFinanceData';
import type { Expense } from '../../types/finance';
import { formatCurrency, formatVariation } from '../../utils/formatters';
import styles from './ExpensesPage.module.css';

const expenseFilters = ['Todos', 'Alimentacion', 'Transporte'];

export function ExpensesPage() {
  const { expenses, loading, error, summary, createExpense, updateExpense, removeExpense, markInstallmentPaid } = useFinanceData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <PageIntro title="Gastos" subtitle="Controla tus gastos del mes" />
      <StatCard
        label="Total gastado en mayo"
        value={formatCurrency(summary.monthlyExpenses)}
        trend={formatVariation(summary.expenseVariation)}
        tone={(summary.expenseVariation ?? 0) > 0 ? 'negative' : 'positive'}
      />
      <ActionButton icon={Plus} onClick={() => setShowForm(true)}>
        Agregar gasto
      </ActionButton>
      <CategoryPills items={expenseFilters} />
      {loading ? <DataState title="Cargando gastos..." /> : null}
      {error ? <DataState title="No se pudieron cargar los gastos" message={error} /> : null}
      {!loading && !error && expenses.length === 0 ? (
        <DataState title="Sin gastos todavia" message="Agrega tu primer gasto para empezar a ver estadisticas." />
      ) : null}
      {!loading && !error && expenses.length > 0 ? (
        <TransactionList
          transactions={expenses}
          kind="expense"
          onEdit={(expense) => {
            setEditing(expense as Expense);
            setShowForm(false);
          }}
          onRemove={removeExpense}
          onMarkInstallmentPaid={markInstallmentPaid}
        />
      ) : null}
      <ExpenseFormModal
        open={showForm || Boolean(editing)}
        initial={editing}
        onClose={closeForm}
        onSubmit={async (payload) => {
          if (editing) {
            await updateExpense(editing.id, payload);
          } else {
            await createExpense(payload);
          }
          closeForm();
        }}
      />
    </div>
  );
}
