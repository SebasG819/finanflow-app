import { Laptop, Plane, Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { DataState } from '../../components/DataState/DataState';
import { GoalForm } from '../../components/FinanceForm/GoalForm';
import { GoalContributionModal } from '../../components/FinanceForm/GoalContributionModal';
import { GoalCard } from '../../components/GoalCard/GoalCard';
import { PageIntro } from '../../components/PageIntro/PageIntro';
import { StatCard } from '../../components/StatCard/StatCard';
import { useFinanceData } from '../../hooks/useFinanceData';
import type { GoalRecord } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import styles from './GoalsPage.module.css';

export function GoalsPage() {
  const { goals, loading, error, summary, createGoal, updateGoal, removeGoal, addGoalMoney } = useFinanceData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GoalRecord | null>(null);
  const [contributionGoal, setContributionGoal] = useState<GoalRecord | null>(null);
  const activeGoals = goals.filter((goal) => Number(goal.current ?? 0) < Number(goal.target));
  const completedGoals = goals.filter((goal) => Number(goal.current ?? 0) >= Number(goal.target));

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <PageIntro title="Metas" subtitle="Sigue el progreso de tus objetivos financieros" />
      <div className={styles.totalCard}>
        <StatCard label="Ahorro total en metas" value={formatCurrency(summary.totalSaved)} />
        <div className={styles.icons}>
          <span>$</span>
          <span>
            <Plane size={16} />
          </span>
          <span>
            <Laptop size={16} />
          </span>
          <b>+2</b>
        </div>
      </div>
      <div onClick={() => setShowForm(true)}>
        <ActionButton icon={Plus}>Nueva meta</ActionButton>
      </div>
      {showForm || editing ? (
        <GoalForm
          initial={editing}
          onCancel={closeForm}
          onSubmit={async (payload) => {
            if (editing) {
              await updateGoal(editing.id, payload);
            } else {
              await createGoal(payload);
            }
            closeForm();
          }}
        />
      ) : null}
      {loading ? <DataState title="Cargando metas..." /> : null}
      {error ? <DataState title="No se pudieron cargar las metas" message={error} /> : null}
      {!loading && !error && goals.length === 0 ? (
        <DataState title="Sin metas todavia" message="Crea tu primera meta para empezar a seguir tu progreso financiero." />
      ) : null}
      <section className={styles.section}>
        <h2>Metas activas</h2>
        {activeGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={(nextGoal) => {
              setEditing(nextGoal);
              setShowForm(false);
            }}
            onAddMoney={setContributionGoal}
            onRemove={removeGoal}
          />
        ))}
      </section>
      <section className={styles.section}>
        <h2>Metas completadas</h2>
        {completedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={(nextGoal) => {
              setEditing(nextGoal);
              setShowForm(false);
            }}
            onAddMoney={setContributionGoal}
            onRemove={removeGoal}
          />
        ))}
      </section>
      <GoalContributionModal
        goal={contributionGoal}
        open={Boolean(contributionGoal)}
        onClose={() => setContributionGoal(null)}
        onSubmit={addGoalMoney}
      />
    </div>
  );
}
