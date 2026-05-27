import { Plus, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { DataState } from '../../components/DataState/DataState';
import { ExpenseFormModal } from '../../components/FinanceForm/ExpenseFormModal';
import { IncomeFormModal } from '../../components/FinanceForm/IncomeFormModal';
import { MandatoryPayments } from '../../components/MandatoryPayments/MandatoryPayments';
import { PageIntro } from '../../components/PageIntro/PageIntro';
import { StatCard } from '../../components/StatCard/StatCard';
import { SummaryStrip } from '../../components/SummaryStrip/SummaryStrip';
import { useFinanceData } from '../../hooks/useFinanceData';
import { formatCurrency } from '../../utils/formatters';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { expenses, loading, error, summary, createExpense, createIncome, markInstallmentPaid } = useFinanceData();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const breakdown = summary.expenseBreakdown.length
    ? summary.expenseBreakdown
    : [{ name: 'Sin gastos', value: 100, color: '#d7e5ff' }];

  return (
    <div className={styles.page}>
      <PageIntro title="Dashboard" subtitle="Controla tus gastos del mes" />
      {loading ? <DataState title="Cargando dashboard..." /> : null}
      {error ? <DataState title="No se pudo cargar tu resumen" message={error} /> : null}
      <StatCard label="Balance disponible" value={formatCurrency(summary.balance)} trend="↗ +4.2% este mes" tone="positive" />

      <div className={styles.twoUp}>
        <StatCard label="Ingresos" value={formatCurrency(summary.monthlyIncome)} compact />
        <StatCard label="Gastos" value={formatCurrency(summary.monthlyExpenses)} trend="↘ 8% mas" tone="negative" compact />
      </div>

      <SummaryStrip label="Movimientos" value={`${expenses.length}`} />

      <div className={styles.balanceGrid}>
        <StatCard label="Obligatorio pendiente" value={formatCurrency(summary.mandatoryPendingMonth)} compact />
        <StatCard label="Balance libre" value={formatCurrency(summary.freeBalance)} trend={`${summary.savingsPercent}% ahorro`} tone="positive" compact />
      </div>

      <MandatoryPayments
        expenses={summary.mandatoryExpenses}
        total={summary.mandatoryPendingMonth}
        freeBalance={summary.freeBalance}
        onMarkInstallmentPaid={markInstallmentPaid}
      />

      <ChartCard title="Desglose de gastos">
        <div className={styles.breakdown}>
          <PieChart width={118} height={118}>
            <Pie data={breakdown} innerRadius={42} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270}>
              {breakdown.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
          <div className={styles.legend}>
            {breakdown.map((item) => (
              <div key={item.name}>
                <span style={{ background: item.color }} />
                <strong>{item.name}</strong>
                <b>{item.value}%</b>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <div className={styles.actions}>
        <ActionButton icon={Plus} onClick={() => setExpenseModalOpen(true)}>
          Agregar gasto
        </ActionButton>
        <ActionButton icon={WalletCards} variant="outline" onClick={() => setIncomeModalOpen(true)}>
          Agregar ingreso
        </ActionButton>
      </div>
      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSubmit={async (payload) => {
          await createExpense(payload);
          setExpenseModalOpen(false);
        }}
      />
      <IncomeFormModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSubmit={async (payload) => {
          await createIncome(payload);
          setIncomeModalOpen(false);
        }}
      />
    </div>
  );
}
