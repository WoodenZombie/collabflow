import { useState } from 'react';
import TeamTag from './TeamTag';
import UserAvatar from './UserAvatar';

/**
 * DeleteProjectForm - Modal form for deleting a project
 * Displays project data in read-only mode
 * 
 * Props:
 * - project: {
 *     id: string,
 *     name: string,
 *     startingDate: string (format: "MM/DD/YY"),
 *     endingDate: string (format: "MM/DD/YY"),
 *     description: string,
 *     teams: string[],
 *     users: Array<{ id: string, name: string, initial: string }>
 *   }
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked)
 */

function DeleteProjectForm({ project, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Call onDelete callback
    onDelete(project.id);
    // Close modal after a brief delay
    setTimeout(() => {
      setIsDeleting(false);
      onClose();
    }, 300);
  };

  // Modal overlay styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  // Modal content styles
  const modalStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    position: 'relative'
  };

  // Header styles
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    margin: 0
  };

  const closeButtonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    color: '#666666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  };

  // Field container styles
  const fieldContainerStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
    marginBottom: '8px',
    display: 'block'
  };

  const valueStyle = {
    fontSize: '14px',
    color: '#666666',
    padding: '8px 0',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
    minHeight: '20px'
  };

  const descriptionValueStyle = {
    ...valueStyle,
    color: '#999999',
    fontStyle: 'italic'
  };

  // Section header styles
  const sectionHeaderStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333333',
    marginTop: '24px',
    marginBottom: '12px'
  };

  // Teams container styles
  const teamsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  };

  // Users container styles
  const usersContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '8px',
    alignItems: 'center'
  };

  // Delete button styles
  const deleteButtonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#DC143C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    marginTop: '32px',
    transition: 'background-color 0.2s, opacity 0.2s',
    opacity: isDeleting ? 0.7 : 1
  };

  if (!project) {
    return null;
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Delete Project</h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Project Details */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Name</label>
          <div style={valueStyle}>{project.name || project.title || 'N/A'}</div>
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Starting Date</label>
          <div style={valueStyle}>{project.startingDate || 'N/A'}</div>
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Ending date</label>
          <div style={valueStyle}>{project.endingDate || 'N/A'}</div>
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Description</label>
          <div style={descriptionValueStyle}>
            {project.description || 'Lorem ipsum'}
          </div>
        </div>

        {/* Teams Section */}
        {project.teams && project.teams.length > 0 && (
          <div>
            <h3 style={sectionHeaderStyle}>Teams</h3>
            <div style={teamsContainerStyle}>
              {project.teams.map((team, index) => (
                <TeamTag key={index} name={team} />
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {project.users && project.users.length > 0 && (
          <div>
            <h3 style={sectionHeaderStyle}>Users</h3>
            <div style={usersContainerStyle}>
              {project.users.map((user) => (
                <UserAvatar
                  key={user.id}
                  initial={user.initial}
                  name={user.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          style={deleteButtonStyle}
          onClick={handleDelete}
          disabled={isDeleting}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = '#B22222';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = '#DC143C';
            }
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export default DeleteProjectForm;