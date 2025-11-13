import { useState } from 'react';
import styles from './filterTabs.module.css';
/**
 * FilterTabs - Filter buttons for switching views
 * Uses internal state to manage active tab
 * 
 * Tabs:
 * - "teams" - Teams button
 * - "byTotalTasks" - By Total Tasks button (default)
 * - "appointments" - Appointments button
 */
function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState('byTotalTasks');

  return (
    <div className={styles.tabsContainer}>
    <button
      onClick={() => setActiveFilter('teams')}
      className={styles.tabButton}
    >
      Teams
    </button>

    <button
      onClick={() => setActiveFilter('byTotalTasks')}
      className={`${styles.tabButton} ${activeFilter === 'byTotalTasks' ? styles.active : ''}`}
    >
      By Total Tasks
    </button>

    <button
      onClick={() => setActiveFilter('appointments')}
      className={`${styles.tabButton} ${activeFilter === 'appointments' ? styles.active : ''}`}
    >
      Appointments
    </button>
</div>

  );
}

export default FilterTabs;