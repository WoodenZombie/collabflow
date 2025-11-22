// import { useState } from 'react';
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
function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div className={styles.tabsContainer}>
      <button
        onClick={() => onFilterChange('teams')}
        className={`${styles.tabButton} ${activeFilter === 'teams' ? styles.active : ''}`}
      >
        Teams
      </button>

      <button
        onClick={() => onFilterChange('byTotalTasks')}
        className={`${styles.tabButton} ${activeFilter === 'byTotalTasks' ? styles.active : ''}`}
      >
        By Total Tasks
      </button>

      <button
        onClick={() => onFilterChange('appointments')}
        className={`${styles.tabButton} ${activeFilter === 'appointments' ? styles.active : ''}`}
      >
        Appointments
      </button>
    </div>
  );
}

export default FilterTabs;