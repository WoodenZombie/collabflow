/**
 * ProjectHeader - Header section with title and action icons
 * Matches wireframe layout
 * 
 * Props:
 * - onCreateProject: function (callback when "+" button is clicked)
 */
import styles from './projectHeader.module.css';

function ProjectHeader({ onCreateProject }) {

    return (
      <div className={styles.headerStyle}>
        <h1 className={styles.titleStyle}>Project</h1>
        
        <div className={styles.iconsContainerStyle}>
          {/* Plus icon - Create Project */}
          <button 
            className={styles.iconButtonStyle}
            title="Create Project"
            onClick={onCreateProject}
          >
            <img src="add-btn-icon.svg" alt="add icon" width={40} />
          </button>
          
          {/* Exclamation icon - Important */}
          <button 
            className={styles.iconButtonStyle}
            title="Important"
          >
            <img src="alert-circle-outline.svg" alt="emblem important" width={40} />
          </button>
          
          {/* People icon - Teams */}
          <button 
            className={styles.iconButtonStyle}
            title="Teams"
          >
            <img src="user-icon.svg" alt="user icon" width={40} />
          </button>
        </div>
      </div>
    );
  }
  
  export default ProjectHeader;