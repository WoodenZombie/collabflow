import { useNavigate } from "react-router-dom";
import styles from "./projectCard.module.css";

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const statusLabels = {
    waiting: "Waiting",
    inProgress: "In Progress",
    done: "Done",
  };

  // Validate project exists and has required fields
  if (!project || !project.id) {
    return null;
  }

  const handleClick = () => {
    // Navigate to tasks page with project ID
    if (project.id) {
      navigate(`/tasks/${project.id}`);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    // Navigate to tasks page with project ID and open create task modal
    if (project.id) {
      navigate(`/tasks/${project.id}?createTask=true`);
    }
  };

return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <div className={styles.title}>{project.title || "Untitled Project"}</div>
        <button className={styles.addButton} onClick={handleButtonClick}>+</button>
      </div>

      <div className={styles.description}>
        {project.description || "No description"}
      </div>

      {project.participants && project.participants.length > 0 && (
        <div className={styles.participants}>
          {project.participants.map((p, idx) => (
            <div key={idx} className={styles.participant}>{p}</div>
          ))}
        </div>
      )}

      {project.progress && (
        <div className={styles.progress}>
          {Object.entries(project.progress).map(([status, count]) => (
            <div
              key={status}
              className={`${styles.progressSegment} ${styles[status]}`}
            >
              {statusLabels[status]}: {count}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectCard;
