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
 * - onStatusChange: function (callback when card is clicked for status change)
 * - onEdit: function (callback when edit button is clicked)
 * - onDelete: function (callback when delete button is clicked)
 */

import styles from "./taskCard.module.css";

function TaskCard({
  title,
  description,
  priorityLabel,
  status,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const handleCardClick = (e) => {
    // Don't trigger status change if button is clicked
    if (e.target.closest("button")) {
      return;
    }
    // Call onStatusChange for status cycling
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const priorityClass =
    priorityLabel === "High Priority"
      ? styles.highPriority
      : priorityLabel === "Important"
      ? styles.important
      : styles.normal;

  return (
    <div onClick={handleCardClick} className={styles.cardStyle}>
      {/* Action Buttons Container */}
      <div className={styles.actionsContainer}>
      {/* Edit Button */}
      {onEdit && (
        <button className={styles.editButtonStyle} onClick={handleEditClick}>
          Edit
        </button>
      )}

        {/* Delete Button */}
        {onDelete && (
          <button className={styles.deleteButtonStyle} onClick={handleDeleteClick}>
            Delete
          </button>
        )}
      </div>

      {/* Priority Tag */}
      {priorityLabel && (
        <div>
          <span className={`${styles.priorityStyle} ${priorityClass}`}>
            {priorityLabel}
          </span>
        </div>
      )}

      {/* Task Title */}
      <h3 className={styles.title}>{title}</h3>

      {/* Task Description */}
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default TaskCard;
