/**
 * ProgressBar - Displays progress count header for each status category
 * 
 * Props:
 * - count: number (count of projects in this category)
 * - label: string (category name: "In Progress", "Pending", "Completed")
 * - color: string (color theme: "purple", "yellow", "green")
 */

import styles from './progressBar.module.css';
function ProgressBar({ count, label, color }) {
    const colorClass = {
    purple: styles.purple,
    yellow: styles.yellow,
    green: styles.green
  }[color] || styles.purple;
  
   return (
    <div className={`${styles.progressBar} ${colorClass}`}>
      <div className={`${styles.countCircle} ${colorClass}`}>
        {count}
      </div>
      <span className={styles.labelText}>{label}</span>
    </div>
  );
  }
  
  export default ProgressBar;