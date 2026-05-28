import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { DataState } from '../../components/DataState/DataState';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { StatCard } from '../../components/StatCard/StatCard';
import { TransactionList } from '../../components/TransactionList/TransactionList';
import { useFinanceData } from '../../hooks/useFinanceData';
import { formatCurrency, formatVariation } from '../../utils/formatters';
import styles from './ReportsPage.module.css';

export function ReportsPage() {
  const { expenses, loading, error, summary } = useFinanceData();
  const criticalTransactions = expenses.filter((item) => Number(item.amount) > 500);
  const maxExpense = Math.max(...summary.trends.map((item) => item.expenses), 1000);
  const currentMonthLabel = summary.trends[summary.trends.length - 1]?.month ?? '';

  return (
    <div className={styles.page}>
      {loading ? <DataState title="Cargando reportes..." /> : null}
      {error ? <DataState title="No se pudieron cargar los reportes" message={error} /> : null}
      <div className={styles.topStats}>
        <StatCard
          label="Total gastado"
          value={formatCurrency(summary.monthlyExpenses)}
          trend={formatVariation(summary.expenseVariation)}
          tone={(summary.expenseVariation ?? 0) > 0 ? 'negative' : 'positive'}
          compact
        />
        <StatCard
          label="Total ahorrado"
          value={formatCurrency(Math.max(summary.balance, 0))}
          trend={formatVariation(summary.balanceVariation)}
          tone={(summary.balanceVariation ?? 0) < 0 ? 'negative' : 'positive'}
          compact
        />
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
        {summary.hasTrendData ? (
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
        ) : (
          <DataState title="Sin tendencia" message="Aquí verás tu tendencia mensual cuando registres ingresos y gastos." />
        )}
      </ChartCard>

      <ChartCard title="Desglose de gastos">
        {summary.expenseBreakdown.length ? (
          <div className={styles.donutGrid}>
            <PieChart width={126} height={126}>
              <Pie data={summary.expenseBreakdown} innerRadius={42} outerRadius={58} dataKey="value" startAngle={0} endAngle={360}>
                {summary.expenseBreakdown.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
            <div className={styles.centerText}>{currentMonthLabel}</div>
            <div className={styles.legend}>
              {summary.expenseBreakdown.map((item) => (
                <div key={item.name}>
                  <span style={{ background: item.color }} />
                  <p>{item.name}</p>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DataState title="Sin categorias" message="Aquí se mostrará cómo se distribuyen tus gastos por categoría." />
        )}
      </ChartCard>

      <ChartCard title="Comparacion mensual">
        {summary.hasSavingsData && summary.savingsPercent !== null ? (
          <>
            <div className={styles.compareHead}>
              <span>Ingresos vs Gastos</span>
              {summary.incomeVariation !== null ? <b>{formatVariation(summary.incomeVariation, 'ingresos')}</b> : null}
              {summary.expenseVariation !== null ? <b className={styles.down}>{formatVariation(summary.expenseVariation, 'gastos')}</b> : null}
            </div>
            <ProgressBar value={summary.savingsPercent} color="green" />
            <p className={styles.note}>Ahorro del mes: {summary.savingsPercent}%.</p>
          </>
        ) : (
          <DataState title="Sin comparacion" message="Aquí verás tu porcentaje de ahorro cuando tengas ingresos y gastos registrados." />
        )}
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
