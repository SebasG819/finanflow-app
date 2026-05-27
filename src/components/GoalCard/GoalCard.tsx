import { CheckCircle2 } from 'lucide-react';
import type { GoalRecord } from '../../types/finance';
import { formatCurrency, getPercent } from '../../utils/formatters';
import { iconMap, type IconName } from '../../utils/iconMap';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import styles from './GoalCard.module.css';

interface GoalCardProps {
  goal: GoalRecord;
  onEdit?: (goal: GoalRecord) => void;
  onAddMoney?: (goal: GoalRecord) => void;
  onRemove?: (id: string) => void;
}

export function GoalCard({ goal, onEdit, onAddMoney, onRemove }: GoalCardProps) {
  const current = Number(goal.current ?? 0);
  const progress = getPercent(current, Number(goal.target));
  const iconName = goal.category?.toLowerCase().includes('viaj') ? 'plane' : 'laptop';
  const Icon = iconMap[iconName as IconName];

  if (progress >= 100) {
    return (
      <article className={styles.completed}>
        <div className={styles.check}>
          <CheckCircle2 size={21} />
        </div>
        <div className={styles.copy}>
          <strong>{goal.title}</strong>
          <span>Completado</span>
        </div>
        <span className={styles.badge}>Completado</span>
        <strong className={styles.saved}>{formatCurrency(current)}</strong>
        <div className={styles.actions}>
          {onEdit ? <button onClick={() => onEdit(goal)}>Editar</button> : null}
          {onAddMoney ? <button onClick={() => onAddMoney(goal)}>Añadir dinero</button> : null}
          {onRemove ? <button onClick={() => onRemove(goal.id)}>Eliminar</button> : null}
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Icon size={26} />
      </div>
      <div className={styles.copy}>
        <strong>{goal.title}</strong>
        <span>
          {goal.category ?? 'Meta'} • {goal.deadline ?? 'Sin fecha'}
        </span>
      </div>
      <strong className={styles.percent}>{progress}%</strong>
      <div className={styles.progress}>
        <ProgressBar value={progress} color={goal.category === 'Viajes' ? 'purple' : 'blue'} />
        <div className={styles.range}>
          <span>{formatCurrency(current)}</span>
          <span>de {formatCurrency(goal.target)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        {onEdit ? <button onClick={() => onEdit(goal)}>Editar</button> : null}
        {onAddMoney ? <button onClick={() => onAddMoney(goal)}>Añadir dinero</button> : null}
        {onRemove ? <button onClick={() => onRemove(goal.id)}>Eliminar</button> : null}
      </div>
    </article>
  );
}
