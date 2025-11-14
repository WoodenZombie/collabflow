import { useNavigate } from "react-router-dom";

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
    // TODO: Add functionality for the + button
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <div>{project.title || "Untitled Project"}</div>
      <div>{project.description || "No description"}</div>
      {project.participants && project.participants.length > 0 && (
        <div>Participants: {project.participants.join(", ")}</div>
      )}
      {project.progress && (
        <div>
          {Object.entries(project.progress).map(([status, count]) => (
            <div key={status}>
              {statusLabels[status]}: {count}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleButtonClick}>+</button>
    </div>
  );
}

export default ProjectCard;
