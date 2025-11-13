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
 * - onStatusChange: function (callback when card is clicked for status change)
 * - onEdit: function (callback when edit button is clicked)
 */

import styles from './projectCard.module.css';

function ProjectCard({ title, description, priorityLabel, status, taskCount, onStatusChange, onEdit }) {
  
    const handleCardClick = (e) => {
      // Don't trigger status change if edit button is clicked
      if (e.target.closest('button')) {
        return;
      }
      // Call onStatusChange for status cycling
      if (onStatusChange) {
        onStatusChange();
      }
    };
  
    const handleEditClick = (e) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit();
      }
    };
  
    const priorityClass =
      priorityLabel === 'High Priority'
        ? styles.highPriority
        : priorityLabel === 'Important'
        ? styles.important
        : styles.normal;
    return (
      <div 
        onClick={handleCardClick}
        className={styles.cardStyle}
      >
        {/* Edit Button */}
        {onEdit && (
          <button
            className={styles.editButtonStyle}
            onClick={handleEditClick}
          >
            Edit
          </button>
        )}
  
        {/* Priority Tag */}
        {priorityLabel && (
          <div>
            <span className={`${styles.priorityStyle} ${priorityClass}`}>
              {priorityLabel}
            </span>
          </div>
        )}
        
        {/* Project Title */}
        <h3 className={styles.title}>
          {title}
        </h3>
        
        {/* Project Description */}
        <p className={styles.description}>
          {description}
        </p>
        
        {/* Task Count */}
        <div className={styles.taskCount}>
          Tasks: {taskCount}
        </div>
      </div>
    );
  }
  
  export default ProjectCard;