/**
 * DeleteProjectForm - Modal form for deleting a project
 * Displays project data in read-only mode before deletion
 *
 * Props:
 * - project: object (project to delete)
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked)
 */
import styles from "./deleteProjectModal.module.css";
function DeleteProjectForm({ project, onClose, onDelete }) {
  if (!project) {
    return null;
  }

  const handleDelete = () => {
    // Call onDelete callback
    onDelete(project.id);
    // Close modal
    onClose();
  };

  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Delete Project</h2>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Project Details */}
      <div className={styles.content}>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Name</label>
          <div className={styles.value}>{project.title || "Untitled Project"}</div>
        </div>

        <div className={styles.fieldContainer}>
          <label className={styles.label}>Starting Date</label>
          <div className={styles.value}>{project.startingDate || "Not set"}</div>
        </div>

        <div className={styles.fieldContainer}>
          <label className={styles.label}>Ending date</label>
          <div className={styles.value}>{project.endingDate || "Not set"}</div>
        </div>

        <div className={styles.fieldContainer}>
          <label className={styles.label}>Description</label>
          <div className={styles.value}>{project.description || "No description"}</div>
        </div>

        {project.teams && project.teams.length > 0 && (
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Teams</label>
            <div className={styles.tagsContainer}>
              {project.teams.map((team) => (
                <span key={team} className={styles.tag}>
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.users && project.users.length > 0 && (
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Users</label>
            <div className={styles.tagsContainer}>
              {project.users.map((user) => (
                <div key={user.id || user} className={styles.tag}>
                  <span>
                    {typeof user === "string" ? user : user.initial || user.name}
                  </span>
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

export default DeleteProjectForm;

