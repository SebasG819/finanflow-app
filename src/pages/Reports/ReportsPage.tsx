import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { DataState } from '../../components/DataState/DataState';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { StatCard } from '../../components/StatCard/StatCard';
import { TransactionList } from '../../components/TransactionList/TransactionList';
import { useFinanceData } from '../../hooks/useFinanceData';
import { formatCurrency } from '../../utils/formatters';
import styles from './ReportsPage.module.css';

export function ReportsPage() {
  const { expenses, loading, error, summary } = useFinanceData();
  const criticalTransactions = expenses.filter((item) => Number(item.amount) > 500);
  const breakdown = summary.expenseBreakdown.length
    ? summary.expenseBreakdown
    : [{ name: 'Sin gastos', value: 100, color: '#d7e5ff' }];
  const maxExpense = Math.max(...summary.trends.map((item) => item.expenses), 1000);

  return (
    <div className={styles.page}>
      {loading ? <DataState title="Cargando reportes..." /> : null}
      {error ? <DataState title="No se pudieron cargar los reportes" message={error} /> : null}
      <div className={styles.topStats}>
        <StatCard label="Total gastado" value={formatCurrency(summary.monthlyExpenses)} trend="↗ +8%" tone="negative" compact />
        <StatCard label="Total ahorrado" value={formatCurrency(Math.max(summary.balance, 0))} trend="↗ +12%" tone="positive" compact />
      </div>

      <ChartCard
        title="Tendencia de gastos"
        action={
          <div className={styles.segmented}>
            <button>Semanal</button>
            <button className={styles.segmentActive}>Mensual</button>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={summary.trends} barSize={32}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7b818d', fontSize: 11 }} />
            <YAxis hide domain={[0, maxExpense]} />
            <Bar dataKey="expenses" radius={[2, 2, 0, 0]}>
              {summary.trends.map((item, index) => (
                <Cell key={item.month} fill={index === summary.trends.length - 1 ? '#2447a8' : '#cfe0fb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Desglose de gastos">
        <div className={styles.donutGrid}>
          <PieChart width={126} height={126}>
            <Pie data={breakdown} innerRadius={42} outerRadius={58} dataKey="value" startAngle={0} endAngle={360}>
              {breakdown.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
          <div className={styles.centerText}>Junio</div>
          <div className={styles.legend}>
            {breakdown.map((item) => (
              <div key={item.name}>
                <span style={{ background: item.color }} />
                <p>{item.name}</p>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Comparacion mensual">
        <div className={styles.compareHead}>
          <span>Ingresos vs Gastos</span>
          <b>↗ 2.4k</b>
          <b className={styles.down}>↘ 1.8k</b>
        </div>
        <ProgressBar value={60} color="green" />
        <p className={styles.note}>Este mes has ahorrado un 15% mas que el mes pasado.</p>
      </ChartCard>

      <div className={styles.sectionHead}>
        <h2>Transacciones criticas</h2>
        <a href="/reports">Ver todas</a>
      </div>
      {criticalTransactions.length ? (
        <TransactionList transactions={criticalTransactions} kind="expense" />
      ) : (
        <DataState title="Sin transacciones criticas" message="Cuando un gasto supere 500 aparecera aqui." />
      )}
    </div>
  );
}
