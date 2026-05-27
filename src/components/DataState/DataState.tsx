import styles from './DataState.module.css';

interface DataStateProps {
  title: string;
  message?: string;
}

export function DataState({ title, message }: DataStateProps) {
  return (
    <div className={styles.state}>
      <strong>{title}</strong>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
