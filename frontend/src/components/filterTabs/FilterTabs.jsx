// import { useState } from 'react';
import styles from "./filterTabs.module.css";
/**
 * FilterTabs - Filter buttons for switching views
 * Uses internal state to manage active tab
 *
 * Props:
 * - activeFilter: string (current active filter)
 * - onFilterChange: function (callback when filter changes)
 *
 * Tabs:
 * - "teams" - Teams button
 * - "byTotalTasks" - By Total Tasks button (default)
 * - "appointments" - Appointments button
 */
function FilterTabs({ activeFilter = "byTotalTasks", onFilterChange }) {
  const handleFilterChange = (filter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className={styles.tabsContainer}>
      <button
        onClick={() => handleFilterChange("teams")}
        className={`${styles.tabButton} ${
          activeFilter === "teams" ? styles.active : ""
        }`}
      >
        Teams
      </button>

      <button
        onClick={() => handleFilterChange("byTotalTasks")}
        className={`${styles.tabButton} ${
          activeFilter === "byTotalTasks" ? styles.active : ""
        }`}
      >
        By Total Tasks
      </button>

      <button
        onClick={() => handleFilterChange("appointments")}
        className={`${styles.tabButton} ${
          activeFilter === "appointments" ? styles.active : ""
        }`}
      >
        Appointments
      </button>
    </div>
  );
}

export default FilterTabs;
