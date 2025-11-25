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
            📅
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
