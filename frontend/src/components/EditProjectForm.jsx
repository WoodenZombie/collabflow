import { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';

/**
 * EditProjectForm - Modal form for editing an existing project
 * 
 * Props:
 * - project: object (project to edit)
 * - onClose: function (callback to close modal)
 * - onUpdate: function (callback when form is submitted with updated project data)
 */
function EditProjectForm({ project, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startingDate: '',
    endingDate: '',
    teams: [],
    users: []
  });

  const [errors, setErrors] = useState({});

  // Available teams
  const availableTeams = ['Frontend', 'Backend', 'QA'];

  // Mock users for adding
  const availableUsers = [
    { id: '1', name: 'Alice', initial: 'A' },
    { id: '2', name: 'Charlie', initial: 'C' },
    { id: '3', name: 'Bob', initial: 'B' },
    { id: '4', name: 'David', initial: 'D' },
    { id: '5', name: 'Eve', initial: 'E' },
    { id: '6', name: 'Frank', initial: 'F' },
    { id: '7', name: 'Grace', initial: 'G' },
    { id: '8', name: 'Henry', initial: 'H' },
    { id: '9', name: 'Ivy', initial: 'I' },
    { id: '10', name: 'Jack', initial: 'J' }
  ];

  // Load project data into form when component mounts or project changes
  useEffect(() => {
    if (project) {
      // Convert date format from MM/DD/YY to YYYY-MM-DD for date inputs
      const parseDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = '20' + parts[2];
          return `${year}-${month}-${day}`;
        }
        return '';
      };

      setFormData({
        name: project.name || project.title || '',
        description: project.description || '',
        startingDate: parseDate(project.startingDate),
        endingDate: parseDate(project.endingDate),
        teams: project.teams || [],
        users: project.users || []
      });
    }
  }, [project]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle team selection
  const handleTeamChange = (e) => {
    const selectedTeam = e.target.value;
    if (selectedTeam && !formData.teams.includes(selectedTeam)) {
      setFormData(prev => ({
        ...prev,
        teams: [...prev.teams, selectedTeam]
      }));
    }
    // Reset select to placeholder
    e.target.value = '';
  };

  // Remove team
  const handleRemoveTeam = (teamToRemove) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.filter(team => team !== teamToRemove)
    }));
  };

  // Handle user selection
  const handleUserChange = (e) => {
    const selectedUserId = e.target.value;
    if (selectedUserId) {
      const selectedUser = availableUsers.find(u => u.id === selectedUserId);
      if (selectedUser && !formData.users.some(u => u.id === selectedUserId)) {
        setFormData(prev => ({
          ...prev,
          users: [...prev.users, selectedUser]
        }));
      }
    }
    // Reset select to placeholder
    e.target.value = '';
  };

  // Remove user
  const handleRemoveUser = (userIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userIdToRemove)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startingDate) {
      newErrors.startingDate = 'Starting date is required';
    }

    if (!formData.endingDate) {
      newErrors.endingDate = 'Ending date is required';
    }

    if (formData.teams.length === 0) {
      newErrors.teams = 'At least one team is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format dates to match existing format (MM/DD/YY)
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${day}/${year}`;
    };

    // Create updated project object
    const updatedProject = {
      ...project, // Keep all existing fields
      name: formData.name.trim(),
      title: formData.name.trim(), // Update title to match name
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      teams: formData.teams,
      users: formData.users
    };

    // Call onUpdate callback
    onUpdate(updatedProject);

    // Close modal
    onClose();
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

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    color: '#333333',
    boxSizing: 'border-box'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const errorStyle = {
    fontSize: '12px',
    color: '#DC143C',
    marginTop: '4px'
  };

  // Team selection styles
  const teamSelectStyle = {
    ...inputStyle,
    marginBottom: '8px'
  };

  const teamTagsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  };

  const teamTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#E3F2FD',
    borderRadius: '4px',
    fontSize: '12px',
    gap: '6px'
  };

  const removeTeamButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#1976D2',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: 0,
    marginLeft: '4px'
  };

  // Users container styles
  const usersContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '8px',
    alignItems: 'center'
  };

  const userSelectStyle = {
    ...inputStyle,
    marginBottom: '8px'
  };

  const addUserButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
    color: '#666666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  };

  // Submit button style
  const submitButtonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#9E9E9E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '24px'
  };

  if (!project) {
    return null;
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>Edit Project Details</h2>
            <button
              type="button"
              style={closeButtonStyle}
              onClick={onClose}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Name Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          {/* Starting Date Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Starting Date</label>
            <input
              type="date"
              style={inputStyle}
              value={formData.startingDate}
              onChange={(e) => handleChange('startingDate', e.target.value)}
            />
            {errors.startingDate && <div style={errorStyle}>{errors.startingDate}</div>}
          </div>

          {/* Ending Date Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Ending date</label>
            <input
              type="date"
              style={inputStyle}
              value={formData.endingDate}
              onChange={(e) => handleChange('endingDate', e.target.value)}
            />
            {errors.endingDate && <div style={errorStyle}>{errors.endingDate}</div>}
          </div>

          {/* Description Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={textareaStyle}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <div style={errorStyle}>{errors.description}</div>}
          </div>

          {/* Teams Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Teams</label>
            <select
              style={teamSelectStyle}
              onChange={handleTeamChange}
              defaultValue=""
            >
              <option value="" disabled>Choose team</option>
              {availableTeams.map(team => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
            {formData.teams.length > 0 && (
              <div style={teamTagsContainerStyle}>
                {formData.teams.map(team => (
                  <div key={team} style={teamTagStyle}>
                    {team}
                    <button
                      type="button"
                      style={removeTeamButtonStyle}
                      onClick={() => handleRemoveTeam(team)}
                      aria-label={`Remove ${team}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.teams && <div style={errorStyle}>{errors.teams}</div>}
          </div>

          {/* Users Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Users</label>
            <select
              style={userSelectStyle}
              onChange={handleUserChange}
              defaultValue=""
            >
              <option value="" disabled>Add user</option>
              {availableUsers
                .filter(user => !formData.users.some(u => u.id === user.id))
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            {formData.users.length > 0 && (
              <div style={usersContainerStyle}>
                {formData.users.map(user => (
                  <div key={user.id} style={{ position: 'relative' }}>
                    <UserAvatar
                      initial={user.initial}
                      name={user.name}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#DC143C',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => handleRemoveUser(user.id)}
                      aria-label={`Remove ${user.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" style={submitButtonStyle}>
            Edit
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProjectForm;