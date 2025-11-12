import { useState } from 'react';
import TeamTag from './../teamTag/TeamTag';
import UserAvatar from '../userAvatar/UserAvatar';
import styles from './deleteProject.module.css';

/**
 * DeleteProjectForm - Modal form for deleting a project
 * Displays project data in read-only mode
 * Delete button is ONLY visible when project status is "completed"
 * 
 * Props:
 * - project: {
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
function DeleteProjectForm({ project, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Call onDelete callback
    onDelete(project.id);
    // Close modal after a brief delay
    setTimeout(() => {
      setIsDeleting(false);
      onClose();
    }, 300);
  };

  // Check if project is completed (only then show Delete button)
  const isCompleted = project?.status === 'completed';

  if (!project) {
    return null;
  }

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.headerStyle}>
          <h2 className={styles.titleStyle}>Delete Project</h2>
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
          {/* Project Details */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Name</label>
            <div className={styles.valueStyle}>{project.name || project.title || 'N/A'}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Starting Date</label>
            <div className={styles.valueStyle}>{project.startingDate || 'N/A'}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Ending date</label>
            <div className={styles.valueStyle}>{project.endingDate || 'N/A'}</div>
          </div>

          <div className={`${styles.fieldContainer} ${styles.description}`}>
            <label className={styles.labelStyle}>Description</label>
            <div className={styles.descriptionValueStyle}>
              {project.description || 'Lorem ipsum'}
            </div>
          </div>

          {/* Teams Section */}
          {project.teams && project.teams.length > 0 && (
            <div>
              <h3 className={styles.sectionHeaderStyle}>Teams</h3>
              <div className={styles.teamsContainerStyle}>
                {project.teams.map((team, index) => (
                  <TeamTag key={index} name={team} />
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {project.users && project.users.length > 0 && (
            <div>
              <h3 className={styles.sectionHeaderStyle}>Users</h3>
              <div className={styles.usersContainerStyle}>
                {project.users.map((user) => (
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

export default DeleteProjectForm;