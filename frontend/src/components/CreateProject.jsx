import { useState } from 'react';

/**
 * CreateProjectForm - Modal form for creating a new project
 * 
 * Props:
 * - onClose: function (callback to close modal)
 * - onCreate: function (callback when form is submitted with project data)
 */
function CreateProjectForm({ onClose, onCreate }) {
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

    // Create new project object
    const newProject = {
      id: String(Date.now()), // Generate unique ID
      name: formData.name.trim(),
      title: formData.name.trim(), // Use name as title too
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      status: 'pending', // Default status
      priority: 'Not that important', // Default priority
      taskCount: 0, // Default task count
      teams: formData.teams,
      users: formData.users // Can be empty for now
    };

    // Call onCreate callback
    onCreate(newProject);

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

  // Submit button style
  const submitButtonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '24px'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>Create a new Project</h2>
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
              placeholder="Task"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          {/* Description Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={textareaStyle}
              placeholder="Lorem Ipsum"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <div style={errorStyle}>{errors.description}</div>}
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
            <label style={labelStyle}>Ending Date</label>
            <input
              type="date"
              style={inputStyle}
              value={formData.endingDate}
              onChange={(e) => handleChange('endingDate', e.target.value)}
            />
            {errors.endingDate && <div style={errorStyle}>{errors.endingDate}</div>}
          </div>

          {/* Teams Field */}
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Responsible Team</label>
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

          {/* Submit Button */}
          <button type="submit" style={submitButtonStyle}>
            Create new project
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectForm;