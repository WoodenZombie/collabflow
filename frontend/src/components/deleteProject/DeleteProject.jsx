/**
 * DeleteProjectForm - Modal form for deleting a project
 * Displays project data in read-only mode before deletion
 *
 * Props:
 * - project: object (project to delete)
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked)
 */
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
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div>
          <h2>Delete Project</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Project Details */}
        <div>
          <div>
            <label>Name</label>
            <div>{project.title || "Untitled Project"}</div>
          </div>

          <div>
            <label>Starting Date</label>
            <div>{project.startingDate || ""}</div>
          </div>

          <div>
            <label>Ending date</label>
            <div>{project.endingDate || ""}</div>
          </div>

          <div>
            <label>Description</label>
            <div>{project.description || "No description"}</div>
          </div>

          {project.teams && project.teams.length > 0 && (
            <div>
              <label>Teams</label>
              <div>
                {project.teams.map((team) => (
                  <span key={team}>{team}</span>
                ))}
              </div>
            </div>
          )}

          {project.users && project.users.length > 0 && (
            <div>
              <label>Users</label>
              <div>
                {project.users.map((user) => (
                  <div key={user.id || user}>
                    <span>{typeof user === "string" ? user : user.initial || user.name}</span>
                  </div>
                ))}
                <button>+</button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}

export default DeleteProjectForm;

