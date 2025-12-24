/**
 * TaskHeader - Header section with title and action icons
 * Matches wireframe layout
 *
 * Props:
 * - projectName: string (name of the project to display)
 * - onBack: function (callback when back arrow is clicked)
 * - onCreateTask: function (callback when "+" button is clicked)
 * - onCreateAppointment: function (callback when appointment button is clicked)
 */
import styles from "./taskHeader.module.css";

function TaskHeader({ projectName, onBack, onCreateTask, onCreateAppointment, onCreateTeam, onEditProject, onDeleteProject }) {
  return (
    <div className={styles.headerStyle}>
      <h1 className={styles.titleStyle}>
        {onBack && (
          <button
            onClick={onBack}
            className={styles.backButtonStyle}
            title="Back to Dashboard"
          >
            <img src="/arrow-left-svgrepo-com.svg" alt="arrow back to dashboard" width={30} />
          </button>
        )}
  {projectName ?? ""}
        {/* Edit/Delete buttons near project name */}
        <span style={{ marginLeft: 12, display: 'inline-flex', gap: 8 }}>
          {onEditProject && (
            <button
              className={styles.iconButtonStyle}
              title="Edit Project"
              onClick={onEditProject}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M20.7 7c.4-.4.4-1 0-1.4l-2.3-2.3c-.4-.4-1-.4-1.4 0l-1.8 1.8 3.7 3.7L20.7 7zM3 17.3V21h3.7l10.9-10.9-3.7-3.7L3 17.3z"/></svg>
            </button>
          )}
          {onDeleteProject && (
            <button
              className={styles.iconButtonStyle}
              title="Delete Project"
              onClick={onDeleteProject}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-1 6h2v10H8V9zm6 0h2v10h-2V9z"/></svg>
            </button>
          )}
        </span>
      </h1>

      <div className={styles.iconsContainerStyle}>
        {/* Appointment icon - Create Appointment */}
        {onCreateAppointment && (
          <button
            className={styles.iconButtonStyle}
            title="Create Appointment"
            onClick={onCreateAppointment}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#000">
              <path d="M16 2a1 1 0 0 1 .993.883L17 3v1h1a3 3 0 0 1 2.995 2.824L21 7v12a3 3 0 0 1-2.824 2.995L18 22H6a3 3 0 0 1-2.995-2.824L3 19V7a3 3 0 0 1 2.824-2.995L6 4h1V3a1 1 0 0 1 1.993-.117L9 3v1h6V3a1 1 0 0 1 1-1m3 7H5v9.625c0 .705.386 1.286.883 1.366L6 20h12c.513 0 .936-.53.993-1.215l.007-.16z"/>
              <path d="M12 12a1 1 0 0 1 .993.883L13 13v3a1 1 0 0 1-1.993.117L11 16v-2a1 1 0 0 1-.117-1.993L11 12z"/>
            </svg>
          </button>
        )}
        {/* Team icon - Create Team */}
        {onCreateTeam && (
          <button
            className={styles.iconButtonStyle}
            title="Create Team"
            onClick={onCreateTeam}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#000"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h8v-2.5c0-.93.28-1.79.76-2.52C9.8 13.38 8.95 13 8 13zm8 0c-.95 0-1.8.38-2.41.98.48.73.76 1.59.76 2.52V19h8v-2.5c0-2.33-4.67-3.5-6.35-3.5z"/></svg>
          </button>
        )}
        {/* Plus icon - Create Task */}
        {onCreateTask && (
          <button
            className={styles.iconButtonStyle}
            title="Create Task"
            onClick={onCreateTask}
          >
            <img src="/add-btn-icon.svg" alt="add icon" width={40} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskHeader;
