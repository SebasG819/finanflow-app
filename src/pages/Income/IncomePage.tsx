import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { CategoryPills } from '../../components/CategoryPills/CategoryPills';
import { DataState } from '../../components/DataState/DataState';
import { IncomeFormModal } from '../../components/FinanceForm/IncomeFormModal';
import { PageIntro } from '../../components/PageIntro/PageIntro';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { StatCard } from '../../components/StatCard/StatCard';
import { TransactionList } from '../../components/TransactionList/TransactionList';
import { useFinanceData } from '../../hooks/useFinanceData';
import type { Income } from '../../types/finance';
import { formatCurrency, formatVariation } from '../../utils/formatters';
import styles from './IncomePage.module.css';

const incomeFilters = ['Todos', 'Salario', 'Freelance', 'Ventas'];

export function IncomePage() {
  const { incomes, loading, error, summary, createIncome, updateIncome, removeIncome } = useFinanceData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <PageIntro title="Ingresos" subtitle="Administra tus ingresos del mes" />
      <StatCard
        label="Total ingresos en mayo"
        value={formatCurrency(summary.monthlyIncome)}
        trend={formatVariation(summary.incomeVariation)}
        tone="positive"
      />
      <ActionButton icon={Plus} onClick={() => setShowForm(true)}>
        Agregar ingreso
      </ActionButton>
      <CategoryPills items={incomeFilters} />
      <SectionHeader title="Transacciones recientes" action="Ver todo" />
      {loading ? <DataState title="Cargando ingresos..." /> : null}
      {error ? <DataState title="No se pudieron cargar los ingresos" message={error} /> : null}
      {!loading && !error && incomes.length === 0 ? (
        <DataState title="Sin ingresos todavia" message="Registra tu primer ingreso para calcular tu balance." />
      ) : null}
      {!loading && !error && incomes.length > 0 ? (
        <TransactionList
          transactions={incomes}
          kind="income"
          onEdit={(income) => {
            setEditing(income as Income);
            setShowForm(false);
          }}
          onRemove={removeIncome}
        />
      ) : null}
      <IncomeFormModal
        open={showForm || Boolean(editing)}
        initial={editing}
        onClose={closeForm}
        onSubmit={async (payload) => {
          if (editing) {
            await updateIncome(editing.id, payload);
          } else {
            await createIncome(payload);
          }
          closeForm();
        }}
      />
    </div>
  );
}
