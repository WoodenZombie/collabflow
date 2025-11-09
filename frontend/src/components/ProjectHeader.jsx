/**
 * ProjectHeader - Header section with title and action icons
 * Matches wireframe layout
 */
function ProjectHeader() {
    const headerStyle = {
      marginBottom: '24px'
    };
  
    const titleStyle = {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '16px'
    };
  
    const iconsContainerStyle = {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    };
  
    const iconButtonStyle = {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '1px solid #ddd',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '20px',
      transition: 'background-color 0.2s'
    };
  
    return (
      <div style={headerStyle}>
        <h1 style={titleStyle}>Project</h1>
        
        <div style={iconsContainerStyle}>
          {/* Plus icon - Create Task */}
          <button 
            style={iconButtonStyle}
            title="Create Task"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          >
            +
          </button>
          
          {/* Exclamation icon - Important */}
          <button 
            style={iconButtonStyle}
            title="Important"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          >
            !
          </button>
          
          {/* People icon - Teams */}
          <button 
            style={iconButtonStyle}
            title="Teams"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          >
            👥
          </button>
        </div>
      </div>
    );
  }
  
  export default ProjectHeader;