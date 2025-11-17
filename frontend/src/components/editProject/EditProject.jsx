import { useState, useEffect } from "react";
import styles from "./editProject.module.css";
/**
 * EditProjectForm - Modal form for editing a project
 *
 * Props:
 * - project: object (project to edit)
 * - onClose: function (callback to close modal)
 * - onUpdate: function (callback when form is submitted with updated project data)
 */
function EditProjectForm({ project, onClose, onUpdate }) {
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

  // Initialize form data from project
  useEffect(() => {
    if (project) {
      // Parse dates from MM/DD/YY to YYYY-MM-DD format for input
      const parseDate = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("/");
        if (parts.length === 3) {
          const month = parts[0].padStart(2, "0");
          const day = parts[1].padStart(2, "0");
          const year = "20" + parts[2];
          return `${year}-${month}-${day}`;
        }
        return "";
      };

      setFormData({
        title: project.title || "",
        description: project.description || "",
        startingDate: parseDate(project.startingDate) || "",
        endingDate: parseDate(project.endingDate) || "",
        teams: project.teams || [],
        users: project.users || [],
      });
    }
  }, [project]);

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

    // Format dates to match existing format (MM/DD/YY)
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${day}/${year}`;
    };

    // Create updated project object
    const updatedProject = {
      ...project,
      title: formData.title.trim(),
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      teams: formData.teams,
      users: formData.users,
      participants: formData.users.map((u) => u.name),
    };

    // Call onUpdate callback
    onUpdate(updatedProject);

    // Close modal
    onClose();
  };

  if (!project) {
    return null;
  }

  return (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Project Details</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Name Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Name</label>
          <div className={styles.field}>
            <div className={styles.currentValue}>
            {project.title || "Untitled Project"}
          </div>
          <input
            type="text"
            className={styles.input}
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          </div>
          {errors.title && <div className={styles.error}>{errors.title}</div>}
        </div>

        {/* Starting Date Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Starting Date</label>
            <div className={styles.currentValue}>
            {project.startingDate || "Not set"}
          </div>
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

        {/* Ending Date Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Ending date</label>
          <div className={styles.currentValue}>
            {project.endingDate || "Not set"}
          </div>
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

        {/* Description Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Description</label>
          <div className={styles.currentValue}>
            {project.description || "No description"}
          </div>
          <textarea
            className={styles.textarea}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          {errors.description && (
            <div className={styles.error}>{errors.description}</div>
          )}
        </div>

        {/* Teams Field */}
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Teams</label>
          <div className={styles.currentValueTagsContainer}>
            {project.teams && project.teams.length > 0 ? (
              project.teams.map((team) => (
                <span key={team} className={styles.currentValueTag}>
                  {team}
                </span>
              ))
            ) : (
              <span className={styles.currentValueTag}>No teams</span>
            )}
          </div>
          <select
            className={styles.select}
            onChange={handleTeamChange}
            defaultValue=""
          >
            <option value="" disabled>
              Choose team to add
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
          <div className={styles.currentValueTagsContainer}>
            {project.users && project.users.length > 0 ? (
              project.users.map((user) => (
                <div
                  key={typeof user === "string" ? user : user.id || user}
                  className={styles.currentValueTag}
                >
                  {typeof user === "string"
                    ? user
                    : user.initial || user.name || "?"}
                </div>
              ))
            ) : (
              <span className={styles.currentValueTag}>No users</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.tagsContainer} style={{ flexGrow: 1, marginTop: 0 }}>
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
          Edit
        </button>
      </form>
    </div>
  </div>
);
}

export default EditProjectForm;
