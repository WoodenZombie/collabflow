/**
 * ProjectHeader - Header section with action buttons
 * 
 * Props:
 * - onCreateTask: function (callback for Create Task button)
 * - onCreateAppointment: function (callback for Create Appointment button)
 * - onCreateTeam: function (callback for Create Team button)
 */


function ProjectHeader({ onCreateTask, onCreateAppointment, onCreateTeam }) {
    return (
      <div>
        <h1>Project</h1>
        
        <div>
          {/* Create Task Button */}
          <button onClick={onCreateTask}>
            Create Task
          </button>
          
          {/* Create Appointment Button */}
          <button onClick={onCreateAppointment}>
            Create Appointment
          </button>
          
          {/* Create Team Button */}
          <button onClick={onCreateTeam}>
            Create Team
          </button>
        </div>
      </div>
    );
  }
  
  export default ProjectHeader;

