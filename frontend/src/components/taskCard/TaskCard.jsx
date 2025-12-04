/**
 * TaskCard - Displays individual task information
 * Clicking the card cycles status: Pending → In Progress → Completed → Pending
 *
 * Props:
 * - title: string (task title)
 * - description: string (task description)
 * - priorityLabel: string (priority label like "High Priority", "Important", etc.)
 * - status: 'pending' | 'inProgress' | 'completed'
 * - taskCount: number (number of tasks)
 * - responsiblePerson: string (optional)
 * - endDate: string (optional)
 * - onClick: function (callback when card is clicked to open actions)
 */

import styles from "./taskCard.module.css";

function TaskCard({
  title,
  description,
  priorityLabel,
  status,
  taskCount,
  responsiblePerson,
  endDate,
  onClick,
}) {
  const handleCardClick = (e) => {
    if (onClick) onClick();
  };

  const priorityClass =
    priorityLabel === "High Priority"
      ? styles.highPriority
      : priorityLabel === "Important"
      ? styles.important
      : styles.normal;

  // Format end date to DD.MM.YYYY (no time)
  const formatEndDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Handle ISO or YYYY-MM-DD and similar
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    } catch {
      return null;
    }
  };

  return (
    <div onClick={handleCardClick} className={styles.cardStyle}>
      {/* Name */}
      <h3 className={styles.title}>{title || "Title: Not provided"}</h3>

      {/* Description right after name */}
      <p className={styles.description}>{description || "Description: Not provided"}</p>

      {/* End date (formatted) */}
      <div className={styles.metaRow}>
        <strong>End date:</strong>&nbsp;
        <span>{formatEndDate(endDate) || "Not provided"}</span>
      </div>

      {/* Responsible person */}
      <div className={styles.metaRow}>
        <strong>Responsible:</strong>&nbsp;
        <span>{responsiblePerson || "Not provided"}</span>
      </div>
    </div>
  );
}

export default TaskCard;
