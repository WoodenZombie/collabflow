import { useState } from "react";
import styles from "./createTask.module.css";
/**
 * CreateTaskForm - Modal form for creating a new task
 *
 * Props:
 * - onClose: function (callback to close modal)
 * - onCreate: function (callback when form is submitted with task data)
 * - availableTeams: array of team objects from the project
 */
function CreateTaskForm({ onClose, onCreate, availableTeams = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingDate: "",
    endingDate: "",
    teams: [],
    users: [],
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle team selection
  const handleTeamChange = (e) => {
    const selectedTeamId = e.target.value;
    const selectedTeam = availableTeams.find(team => String(team.id) === selectedTeamId);
    
    if (selectedTeam && !formData.teams.some(team => team.id === selectedTeam.id)) {
      setFormData((prev) => ({
        ...prev,
        teams: [...prev.teams, selectedTeam],
      }));
    }
    // Reset select to placeholder
    e.target.value = "";
  };

  // Remove team
  const handleRemoveTeam = (teamToRemove) => {
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team.id !== teamToRemove.id),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.startingDate) {
      newErrors.startingDate = "Starting date is required";
    }

    if (!formData.endingDate) {
      newErrors.endingDate = "Ending date is required";
    }

    if (formData.teams.length === 0) {
      newErrors.teams = "At least one team is required";
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

    // Create new task object
    // Note: dates are kept in YYYY-MM-DD format (from date input) for backend compatibility
    const newTask = {
      id: String(Date.now()), // Generate unique ID
      name: formData.name.trim(),
      title: formData.name.trim(), // Use name as title too
      description: formData.description.trim(),
      startingDate: formData.startingDate, // Keep as YYYY-MM-DD format
      endingDate: formData.endingDate, // Keep as YYYY-MM-DD format (will be mapped to due_date)
      status: "pending", // Default status
      priority: "Medium", // Default priority (must be 'High', 'Medium', or 'Low' for backend)
      taskCount: 0, // Default task count
      teams: formData.teams,
      users: formData.users, // Can be empty for now
    };

    // Call onCreate callback
    onCreate(newTask);

    // Close modal
    onClose();
  };

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={styles.headerStyle}>
            <h2 className={styles.titleStyle}>Create a new Task</h2>
            <button
              type="button"
              className={styles.closeButtonStyle}
              onClick={onClose}
              aria-label="Close"
            >
              <div className="cross"></div>
            </button>
          </div>

          {/* Name Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Name</label>
            <input
              type="text"
              className={styles.inputStyle}
              placeholder="Task"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <div className={styles.errorStyle}>{errors.name}</div>
            )}
          </div>

          {/* Description Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Description</label>
            <textarea
              className={styles.textareaStyle}
              placeholder="Lorem Ipsum"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && (
              <div className={styles.errorStyle}>{errors.description}</div>
            )}
          </div>

          {/* Starting Date Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Starting Date</label>
            <input
              type="date"
              className={styles.inputStyle}
              value={formData.startingDate}
              onChange={(e) => handleChange("startingDate", e.target.value)}
            />
            {errors.startingDate && (
              <div className={styles.errorStyle}>{errors.startingDate}</div>
            )}
          </div>

          {/* Ending Date Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Ending Date</label>
            <input
              type="date"
              className={styles.inputStyle}
              value={formData.endingDate}
              onChange={(e) => handleChange("endingDate", e.target.value)}
            />
            {errors.endingDate && (
              <div className={styles.errorStyle}>{errors.endingDate}</div>
            )}
          </div>

          {/* Teams Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Responsible Team</label>
            <select
              className={styles.teamSelectStyle}
              onChange={handleTeamChange}
              defaultValue=""
            >
              <option value="" disabled>
                Choose team
              </option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {formData.teams.length > 0 && (
              <div className={styles.teamTagsContainerStyle}>
                {formData.teams.map((team) => (
                  <div key={team.id} className={styles.teamTagStyle}>
                    {team.name}
                    <button
                      type="button"
                      className={styles.removeTeamButtonStyle}
                      onClick={() => handleRemoveTeam(team)}
                      aria-label={`Remove ${team.name}`}
                    >
                      <div className="cross"></div>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.teams && (
              <div className={styles.errorStyle}>{errors.teams}</div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitButtonStyle}>
            Create new task
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskForm;
