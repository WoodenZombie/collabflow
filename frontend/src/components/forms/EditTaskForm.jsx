import { useState, useEffect } from 'react';
import UserAvatar from '../userAvatar/UserAvatar';
import styles from './editTask.module.css';
/**
 * EditTaskForm - Modal form for editing an existing task
 * 
 * Props:
 * - task: object (task to edit)
 * - onClose: function (callback to close modal)
 * - onUpdate: function (callback when form is submitted with updated task data)
 */
function EditTaskForm({ task, onClose, onUpdate, onCancel }) {
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

  // Load task data into form when component mounts or task changes
  useEffect(() => {
    if (task) {
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
        name: task.name || task.title || '',
        description: task.description || '',
        startingDate: parseDate(task.startingDate),
        endingDate: parseDate(task.endingDate),
        teams: task.teams || [],
        users: task.users || []
      });
    }
  }, [task]);

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

    // Create updated task object
    const updatedTask = {
      ...task, // Keep all existing fields
      name: formData.name.trim(),
      title: formData.name.trim(), // Update title to match name
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      teams: formData.teams,
      users: formData.users
    };

    // Call onUpdate callback
    onUpdate(updatedTask);

    // Close modal
    onClose();
  };

  if (!task) {
    return null;
  }

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={styles.headerStyle}>
            <h2 className={styles.titleStyle}>Edit Task Details</h2>
            <button
              type="button"
              className={styles.closeButtonStyle}
              onClick={onClose}
              aria-label="Close"
            >
              <div className="cross">
            </div>
            </button>
          </div>

          {/* Name Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Name</label>
            <input
              type="text"
              className={styles.inputStyle}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <div className={styles.errorStyle}>{errors.name}</div>}
          </div>

          {/* Starting Date Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Starting Date</label>
            <input
              type="date"
              className={styles.inputStyle}
              value={formData.startingDate}
              onChange={(e) => handleChange('startingDate', e.target.value)}
            />
            {errors.startingDate && <div className={styles.errorStyle}>{errors.startingDate}</div>}
          </div>

          {/* Ending Date Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Ending date</label>
            <input
              type="date"
              className={styles.inputStyle}
              value={formData.endingDate}
              onChange={(e) => handleChange('endingDate', e.target.value)}
            />
            {errors.endingDate && <div className={styles.errorStyle}>{errors.endingDate}</div>}
          </div>

          {/* Description Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Description</label>
            <textarea
              className={styles.textareaStyle}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <div className={styles.errorStyle}>{errors.description}</div>}
          </div>

          {/* Teams Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Teams</label>
            <select
              className={styles.teamSelectStyle}
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
              <div className={styles.teamTagsContainerStyle}>
                {formData.teams.map(team => (
                  <div key={team} className={styles.teamTagStyle}>
                    {team}
                    <button
                      type="button"
                      className={styles.removeTeamButtonStyle}
                      onClick={() => handleRemoveTeam(team)}
                      aria-label={`Remove ${team}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.teams && <div className={styles.errorStyle}>{errors.teams}</div>}
          </div>

          {/* Users Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.labelStyle}>Users</label>
            <select
              className={styles.userSelectStyle}
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
              <div className={styles.usersContainerStyle}>
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

          {/* Bottom actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className={styles.submitButtonStyle} style={{ background: '#64748B' }} onClick={() => {
              if (onCancel) onCancel();
            }}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButtonStyle}>
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskForm;