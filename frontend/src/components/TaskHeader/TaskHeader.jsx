/**
 * TaskHeader - Header section with title and action icons
 * Matches wireframe layout
 *
 * Props:
 * - projectName: string (name of the project to display)
 * - onBack: function (callback when back arrow is clicked)
 * - onCreateTask: function (callback when "+" button is clicked)
 */
import styles from "./taskHeader.module.css";

function TaskHeader({ projectName, onBack, onCreateTask }) {
  return (
    <div className={styles.headerStyle}>
      <h1 className={styles.titleStyle}>
        {onBack && (
          <button
            onClick={onBack}
            className={styles.backButtonStyle}
            title="Back to Dashboard"
          >
            &lt;
          </button>
        )}
        {projectName || "Project name"}
      </h1>

      <div className={styles.iconsContainerStyle}>
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
