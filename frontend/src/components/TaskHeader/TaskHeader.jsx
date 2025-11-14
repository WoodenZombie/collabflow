/**
 * TaskHeader - Header section with title and action icons
 * Matches wireframe layout
 *
 * Props:
 * - onCreateTask: function (callback when "+" button is clicked)
 */
import styles from "./taskHeader.module.css";

function TaskHeader({ onCreateTask }) {
  return (
    <div className={styles.headerStyle}>
      <h1 className={styles.titleStyle}>Project name</h1>

      <div className={styles.iconsContainerStyle}>
        {/* Plus icon - Create Task */}
        <button
          className={styles.iconButtonStyle}
          title="Create Task"
          onClick={onCreateTask}
        >
          <img src="add-btn-icon.svg" alt="add icon" width={40} />
        </button>
      </div>
    </div>
  );
}

export default TaskHeader;
