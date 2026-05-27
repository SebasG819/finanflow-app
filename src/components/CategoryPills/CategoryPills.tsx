import styles from './CategoryPills.module.css';

interface CategoryPillsProps {
  items: string[];
  active?: string;
}

export function CategoryPills({ items, active = 'Todos' }: CategoryPillsProps) {
  return (
    <div className={styles.scroller} role="tablist" aria-label="Categorias">
      {items.map((item) => (
        <button
          key={item}
          className={`${styles.pill} ${item === active ? styles.active : ''}`}
          role="tab"
          aria-selected={item === active}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
