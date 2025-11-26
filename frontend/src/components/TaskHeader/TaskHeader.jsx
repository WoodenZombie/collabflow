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

function TaskHeader({ projectName, onBack, onCreateTask, onCreateAppointment }) {
  return (
    <div className={styles.headerStyle}>
      <h1 className={styles.titleStyle}>
        {onBack && (
          <button
            onClick={onBack}
            className={styles.backButtonStyle}
            title="Back to Dashboard"
          >
            <img src="../arrow-left-svgrepo-com.svg" alt="arrow back to dashboard" width={30} />
          </button>
        )}
        {projectName || "Project name"}
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
        {/* Plus icon - Create Task */}
        <button
          className={styles.iconButtonStyle}
          title="Create Task"
          onClick={onCreateTask}
        >
          <img src="/add-btn-icon.svg" alt="add icon" width={40} />
        </button>
      </div>
    </div>
  );
}

export default TaskHeader;
