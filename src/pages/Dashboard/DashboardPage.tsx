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
import { formatCurrency, formatVariation } from '../../utils/formatters';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { expenses, loading, error, summary, createExpense, createIncome, markInstallmentPaid } = useFinanceData();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const hasBreakdown = summary.expenseBreakdown.length > 0;

  return (
    <div className={styles.page}>
      <PageIntro title="Dashboard" subtitle="Controla tus gastos del mes" />
      {loading ? <DataState title="Cargando dashboard..." /> : null}
      {error ? <DataState title="No se pudo cargar tu resumen" message={error} /> : null}
      <StatCard
        label="Balance disponible"
        value={formatCurrency(summary.balance)}
        trend={formatVariation(summary.balanceVariation)}
        tone={(summary.balanceVariation ?? 0) < 0 ? 'negative' : 'positive'}
      />

      <div className={styles.twoUp}>
        <StatCard label="Ingresos" value={formatCurrency(summary.monthlyIncome)} compact />
        <StatCard
          label="Gastos"
          value={formatCurrency(summary.monthlyExpenses)}
          trend={formatVariation(summary.expenseVariation)}
          tone={(summary.expenseVariation ?? 0) > 0 ? 'negative' : 'positive'}
          compact
        />
      </div>
      {!summary.hasIncome ? (
        <DataState title="Ingresos pendientes" message="Aquí se mostrará tu ingreso mensual cuando registres tu primer ingreso." />
      ) : null}
      {!summary.hasExpenses ? (
        <DataState title="Gastos pendientes" message="Aquí se mostrará el total de tus gastos cuando agregues tu primer gasto." />
      ) : null}

      <SummaryStrip label="Movimientos" value={`${expenses.length}`} />

      <div className={styles.balanceGrid}>
        <StatCard label="Obligatorio pendiente" value={formatCurrency(summary.mandatoryPendingMonth)} compact />
        <StatCard
          label="Balance libre"
          value={formatCurrency(summary.freeBalance)}
          trend={summary.savingsPercent === null ? undefined : `${summary.savingsPercent}% ahorro`}
          tone="positive"
          compact
        />
      </div>
      {!summary.hasSavingsData ? (
        <DataState title="Ahorro pendiente" message="Aquí verás tu porcentaje de ahorro cuando tengas ingresos y gastos registrados." />
      ) : null}

      <MandatoryPayments
        expenses={summary.mandatoryExpenses}
        total={summary.mandatoryPendingMonth}
        freeBalance={summary.freeBalance}
        onMarkInstallmentPaid={markInstallmentPaid}
      />

      <ChartCard title="Desglose de gastos">
        {hasBreakdown ? (
          <div className={styles.breakdown}>
            <PieChart width={118} height={118}>
              <Pie data={summary.expenseBreakdown} innerRadius={42} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270}>
                {summary.expenseBreakdown.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
            <div className={styles.legend}>
              {summary.expenseBreakdown.map((item) => (
                <div key={item.name}>
                  <span style={{ background: item.color }} />
                  <strong>{item.name}</strong>
                  <b>{item.value}%</b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DataState title="Sin desglose" message="Aquí se mostrará cómo se distribuyen tus gastos por categoría." />
        )}
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
