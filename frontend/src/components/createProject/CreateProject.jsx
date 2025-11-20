import { useState } from "react";
import styles from "./createProjectModal.module.css";

function CreateProjectForm({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingDate: "",
    endingDate: "",
    teams: [],
    users: [],
  });

  const [errors, setErrors] = useState({});

  // Available teams
  const availableTeams = ["Frontend", "Backend", "QA"];

  // Available users (mock data)
  const availableUsers = [
    { id: "1", name: "Alice", initial: "A" },
    { id: "2", name: "Bob", initial: "B" },
    { id: "3", name: "Charlie", initial: "C" },
  ];

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Real-time validation for date fields
      if (field === "startingDate" || field === "endingDate") {
        // Validate dates when both are filled
        if (updated.startingDate && updated.endingDate) {
          const startDate = new Date(updated.startingDate);
          const endDate = new Date(updated.endingDate);
          if (startDate > endDate) {
            setErrors((prev) => ({
              ...prev,
              endingDate: "Ending date must be after starting date",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              endingDate: "",
            }));
          }
        }
      }

      return updated;
    });

    // Clear error for this field when user starts typing
    if (errors[field] && field !== "endingDate") {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle team selection
  const handleTeamChange = (e) => {
    const selectedTeam = e.target.value;
    if (selectedTeam && !formData.teams.includes(selectedTeam)) {
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
      teams: prev.teams.filter((team) => team !== teamToRemove),
    }));
  };

  // Handle user selection
  const handleUserChange = (userId) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user && !formData.users.find((u) => u.id === userId)) {
      setFormData((prev) => ({
        ...prev,
        users: [...prev.users, user],
      }));
    }
  };

  // Remove user
  const handleRemoveUser = (userIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== userIdToRemove),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
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

    // Validate that starting date is not after ending date
    if (formData.startingDate && formData.endingDate) {
      const startDate = new Date(formData.startingDate);
      const endDate = new Date(formData.endingDate);
      if (startDate > endDate) {
        newErrors.endingDate = "Ending date must be after starting date";
      }
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

    // Format dates to YYYY-MM-DD format for backend (date input already provides this)
    // But keep the formatDate function for compatibility
    const formatDate = (dateString) => {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Otherwise parse and format
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    // Create new project object
    const newProject = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      teams: formData.teams,
      users: formData.users,
      // Status will default to 'Planning' in backend
    };

    // Call onCreate callback - parent will handle closing modal after success
    onCreate(newProject);
    
    // Don't close modal here - let parent handle it after successful API call
  };

  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create a new Project</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Title Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Project title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          {errors.title && <div className={styles.error}>{errors.title}</div>}
        </div>

        {/* Description Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Project description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          {errors.description && (
            <div className={styles.error}>{errors.description}</div>
          )}
        </div>

        {/* Duration Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Duration</label>
          <div className={styles.durationContainer}>
            <div className={styles.dateField}>
              <label className={styles.label}>Starting Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.startingDate}
                onChange={(e) => handleChange("startingDate", e.target.value)}
              />
              {errors.startingDate && (
                <div className={styles.error}>{errors.startingDate}</div>
              )}
            </div>
            <div className={styles.dateField}>
              <label className={styles.label}>Ending Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.endingDate}
                onChange={(e) => handleChange("endingDate", e.target.value)}
              />
              {errors.endingDate && (
                <div className={styles.error}>{errors.endingDate}</div>
              )}
            </div>
          </div>
        </div>

        {/* Teams Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Teams</label>
          <select
            className={styles.select}
            onChange={handleTeamChange}
            defaultValue=""
          >
            <option value="" disabled>
              Choose team
            </option>
            {availableTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          {formData.teams.length > 0 && (
            <div className={styles.tagsContainer}>
              {formData.teams.map((team) => (
                <div key={team} className={styles.tag}>
                  {team}
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={() => handleRemoveTeam(team)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Users</label>
          <div className={styles.userFieldContainer}>
            <div className={styles.tagsContainer}>
              {formData.users.map((user) => (
                <div key={user.id} className={styles.tag}>
                  <span>{user.initial}</span>
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addUserButton}
              onClick={() => {
                // Simple add user - could be improved with a dropdown
                const availableUser = availableUsers.find(
                  (u) =>
                    !formData.users.find((existing) => existing.id === u.id)
                );
                if (availableUser) {
                  handleUserChange(availableUser.id);
                }
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>
          Create new project
        </button>
      </form>
    </div>
  </div>
);
}

export default CreateProjectForm;
