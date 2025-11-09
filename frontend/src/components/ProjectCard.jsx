/**
 * ProjectCard - Displays individual project information 
 * 
 * Props:
 * - project: {
 *     id: string,
 *     name: string (Project.Name),
 *     description: string,
 *     priority: string,
 *     participants: Array,
 *     pending: number (Project.Pending),
 *     inProgress: number,
 *     done: number (Project.Done),
 *     currentStatus: 'pending' | 'inProgress' | 'completed'
 *   }
 * - onStatusChange: function (optional callback for status change)
 */
function ProjectCard({ project, onStatusChange }) {
  return (
    <div>
      {/* Priority Tag */}
      {project.priority && (
        <div>
          <span>{project.priority}</span>
        </div>
      )}
      
      {/* Project Name - Project.Name from spec */}
      <h3>{project.name}</h3>
      
      {/* Project Description */}
      <p>{project.description}</p>
      
      {/* Participants - will be displayed when Teams view is active */}
      {project.participants && project.participants.length > 0 && (
        <div>
          <span>Participants: {project.participants.length}</span>
        </div>
      )}
      
      {/* Progress counts - Project.Pending, Project.Done, Project.Progress */}
      <div>
        <span>Pending: {project.pending}</span>
        <span>In Progress: {project.inProgress}</span>
        <span>Done: {project.done}</span>
      </div>
      
      {/* Current Status Display */}
      <div>
        <span>Current Status: {project.currentStatus}</span>
      </div>
    </div>
  );
}

export default ProjectCard;