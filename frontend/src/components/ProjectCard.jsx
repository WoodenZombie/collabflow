/**
 * ProjectCard - Displays individual project information
 * Clicking the card cycles status: Pending → In Progress → Completed → Pending
 * 
 * Props:
 * - title: string (project title)
 * - description: string (project description)
 * - priorityLabel: string (priority label like "High Priority", "Important", etc.)
 * - status: 'pending' | 'inProgress' | 'completed'
 * - taskCount: number (number of tasks)
 * - onStatusChange: function (callback when card is clicked)
 */
function ProjectCard({ title, description, priorityLabel, status, taskCount, onStatusChange }) {
    // Status color mapping
    const statusColors = {
      'pending': '#FFA500', // Orange/Yellow
      'inProgress': '#9370DB', // Purple
      'completed': '#32CD32' // Green
    };
  
    const cardStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '12px',
      marginBottom: '12px',
      border: `2px solid ${statusColors[status]}`,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
  
    const priorityStyle = {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      marginBottom: '8px',
      backgroundColor: priorityLabel === 'High Priority' ? '#FFE4E1' : 
                       priorityLabel === 'Important' ? '#E6E6FA' : '#F0F0F0',
      color: priorityLabel === 'High Priority' ? '#DC143C' : 
             priorityLabel === 'Important' ? '#9370DB' : '#666'
    };
  
    return (
      <div 
        onClick={onStatusChange}
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        {/* Priority Tag */}
        {priorityLabel && (
          <div>
            <span style={priorityStyle}>{priorityLabel}</span>
          </div>
        )}
        
        {/* Project Title */}
        <h3 style={{ margin: '8px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {title}
        </h3>
        
        {/* Project Description */}
        <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
          {description}
        </p>
        
        {/* Task Count */}
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
          Tasks: {taskCount}
        </div>
      </div>
    );
  }
  
  export default ProjectCard;