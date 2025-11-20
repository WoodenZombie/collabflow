import { useState } from 'react';
import TeamTag from './../teamTag/TeamTag';
import UserAvatar from '../userAvatar/UserAvatar';
import styles from './deleteTask.module.css';

/**
 * DeleteTaskForm - Modal form for deleting a task
 * Displays task data in read-only mode
 * Delete button is ONLY visible when task status is "completed"
 * 
 * Props:
 * - task: {
 *     id: string,
 *     name: string,
 *     startingDate: string (format: "MM/DD/YY"),
 *     endingDate: string (format: "MM/DD/YY"),
 *     description: string,
 *     status: 'pending' | 'inProgress' | 'completed',
 *     teams: string[],
 *     users: Array<{ id: string, name: string, initial: string }>
 *   }
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked)
 */
function DeleteTaskForm({ task, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Call onDelete callback
    onDelete(task.id);
    // Close modal after a brief delay
    setTimeout(() => {
      setIsDeleting(false);
      onClose();
    }, 300);
  };

  // Check if task is completed (only then show Delete button)
  const isCompleted = task?.status === 'completed';

  if (!task) {
    return null;
  }

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.headerStyle}>
          <h2 className={styles.titleStyle}>Delete Task</h2>
          <button
            className={styles.closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            aria-label="Close"
          >
            <div className="cross">
            </div>
          </button>
        </div>

        {/* Content */}
        <div className={styles.contentStyle}>
          {/* Task Details */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Name</label>
            <div className={styles.valueStyle}>{task.name || task.title || 'N/A'}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Starting Date</label>
            <div className={styles.valueStyle}>{task.startingDate || 'N/A'}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Ending date</label>
            <div className={styles.valueStyle}>{task.endingDate || 'N/A'}</div>
          </div>

          <div className={`${styles.fieldContainer} ${styles.description}`}>
            <label className={styles.labelStyle}>Description</label>
            <div className={styles.descriptionValueStyle}>
              {task.description || 'Lorem ipsum'}
            </div>
          </div>

          {/* Teams Section */}
          {task.teams && task.teams.length > 0 && (
            <div>
              <h3 className={styles.sectionHeaderStyle}>Teams</h3>
              <div className={styles.teamsContainerStyle}>
                {task.teams.map((team, index) => (
                  <TeamTag key={index} name={team} />
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {task.users && task.users.length > 0 && (
            <div>
              <h3 className={styles.sectionHeaderStyle}>Users</h3>
              <div className={styles.usersContainerStyle}>
                {task.users.map((user) => (
                  <UserAvatar
                    key={user.id}
                    initial={user.initial}
                    name={user.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete Button - ONLY visible when status is "completed" */}
        {isCompleted && (
          <button
            className={styles.deleteButtonStyle}
            onClick={handleDelete}
            disabled={isDeleting}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#E63946';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#FF4D4D';
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

export default DeleteTaskForm;