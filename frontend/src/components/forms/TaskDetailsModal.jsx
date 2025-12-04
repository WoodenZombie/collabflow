import UserAvatar from '../userAvatar/UserAvatar';
import styles from './editTask.module.css';

/**
 * TaskDetailsModal - Read-only task details modal styled like EditTaskForm
 *
 * Props:
 * - task: object (task to display)
 * - onClose: function (close modal)
 * - onEdit: function (trigger edit flow)
 */
function TaskDetailsModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null;

  // Format MM/DD/YY to YYYY-MM-DD for date inputs
  const parseDate = (dateString) => {
    if (!dateString) return '';
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = '20' + parts[2];
      return `${year}-${month}-${day}`;
    }
    // Try generic Date parse
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  };

  const teams = task.teams || [];
  const users = task.users || [];

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.headerStyle}>
          <h2 className={styles.titleStyle}>Task Details</h2>
          <button
            type="button"
            className={styles.closeButtonStyle}
            onClick={onClose}
            aria-label="Close"
          >
            <div className="cross" />
          </button>
        </div>

        {/* Name */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Name</label>
          <input
            type="text"
            className={styles.inputStyle}
            value={task.name || task.title || ''}
            readOnly
            disabled
          />
        </div>

        {/* Starting Date */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Starting Date</label>
          <input
            type="date"
            className={styles.inputStyle}
            value={parseDate(task.startingDate)}
            readOnly
            disabled
          />
        </div>

        {/* Ending Date */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Ending date</label>
          <input
            type="date"
            className={styles.inputStyle}
            value={parseDate(task.endingDate)}
            readOnly
            disabled
          />
        </div>

        {/* Description */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Description</label>
          <textarea
            className={styles.textareaStyle}
            value={task.description || ''}
            readOnly
            disabled
          />
        </div>

        {/* Teams */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Teams</label>
          {teams.length > 0 ? (
            <div className={styles.teamTagsContainerStyle}>
              {teams.map((team) => (
                <div key={team} className={styles.teamTagStyle}>{team}</div>
              ))}
            </div>
          ) : (
            <div className={styles.errorStyle} style={{ color: '#475569' }}>Not provided</div>
          )}
        </div>

        {/* Users */}
        <div className={styles.fieldContainer}>
          <label className={styles.labelStyle}>Users</label>
          {users.length > 0 ? (
            <div className={styles.usersContainerStyle}>
              {users.map((user) => (
                <UserAvatar key={user.id || user} initial={user.initial || '?'} name={user.name || String(user)} />
              ))}
            </div>
          ) : (
            <div className={styles.errorStyle} style={{ color: '#475569' }}>Not provided</div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'nowrap' }}>
          <button
            onClick={onEdit}
            className={`${styles.actionButtonStyle} ${styles.primaryButtonStyle}`}
            type="button"
          >
            Edit Task
          </button>
          <button
            onClick={onDelete}
            className={`${styles.actionButtonStyle} ${styles.dangerButtonStyle}`}
            type="button"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;