import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import styles from "./projectCard.module.css";

function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const statusLabels = {
    waiting: "Waiting",
    inProgress: "In Progress",
    done: "Done",
  };

  // Validate project exists and has required fields
  if (!project || !project.id) {
    return null;
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen && 
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleClick = () => {
    // Navigate to tasks page with project ID
    if (project.id) {
      navigate(`/tasks/${project.id}`);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const total = (project.progress?.waiting || 0) + (project.progress?.inProgress || 0) + (project.progress?.done || 0);
  const done = (project.progress?.done || 0);
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <div className={styles.title}>{project.title || "Untitled Project"}</div>
        <div className={styles.cardActions}>
          <button 
            ref={buttonRef}
            className={styles.moreButton} 
            title="More" 
            onClick={toggleMenu}
          >
            ⋯
          </button>
          <div 
            ref={menuRef}
            className={`${styles.dropdownMenu} ${isMenuOpen ? styles.dropdownMenuOpen : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.menuItem} 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onEdit();
              }}
            >
              Edit
            </button>
            <button 
              className={styles.menuItem} 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
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

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${completion}%` }} />
      </div>
      <div className={styles.progressSummary}>{done}/{total} tasks completed</div>
    </div>
  );
}

export default ProjectCard;
