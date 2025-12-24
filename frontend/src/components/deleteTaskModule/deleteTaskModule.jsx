/**
 * DeleteTaskModal - Modal form for deleting a task
 * Displays task data in read-only mode before deletion
 *
 * Props:
 * - task: object (task to delete)
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked, receives taskId)
 */
import styles from "../deleteProject/deleteProjectModal.module.css";
import UserAvatar from "../userAvatar/UserAvatar";

function DeleteTaskModal({ task, onClose, onDelete }) {
  if (!task) {
    return null;
  }

  const handleDelete = () => {
    // Call onDelete callback with task id
    if (onDelete && task.id) {
      onDelete(task.id);
    }
  };

  // Format date as DD/MM/YY
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    
    try {
      // Parse date string (could be YYYY-MM-DD, MM/DD/YY, or full datetime)
      let date;
      
      // Handle MM/DD/YY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
        const [month, day, year] = dateString.split('/');
        date = new Date(`20${year}`, month - 1, day);
      } 
      // Handle YYYY-MM-DD format
      else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } 
      // Try to parse as full datetime
      else {
        date = new Date(dateString);
      }
      
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Task</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Task Details */}
        <div className={styles.content}>
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Name</label>
            <div className={styles.value}>{task.name || task.title || "Untitled Task"}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Starting Date</label>
            <div className={styles.value}>{formatDate(task.startingDate)}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Ending date</label>
            <div className={styles.value}>{formatDate(task.endingDate)}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Description</label>
            <div className={styles.value}>{task.description || "No description"}</div>
          </div>

          {/* Teams Section */}
          {task.teams && task.teams.length > 0 && (
            <div className={styles.fieldContainer}>
              <label className={styles.label}>Teams</label>
              <div className={styles.tagsContainer}>
                {task.teams.map((team, index) => (
                  <span key={index} className={styles.tag}>
                    {team}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {task.users && task.users.length > 0 && (
            <div className={styles.fieldContainer}>
              <label className={styles.label}>Users</label>
              <div className={styles.tagsContainer}>
                {task.users.map((user) => (
                  <div key={user.id || user} className={styles.tag}>
                    {typeof user === "string" ? (
                      <span>{user}</span>
                    ) : (
                      <UserAvatar
                        initial={user.initial}
                        name={user.name}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button className={styles.deleteButton} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default DeleteTaskModal;