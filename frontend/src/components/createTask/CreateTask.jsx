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

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Real-time validation for date fields
      if (field === "startingDate" || field === "endingDate") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validate that dates are not in the past
        if (field === "startingDate" && value) {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            setErrors((prev) => ({
              ...prev,
              startingDate: "Starting date cannot be in the past",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              startingDate: "",
            }));
          }
        }

        if (field === "endingDate" && value) {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            setErrors((prev) => ({
              ...prev,
              endingDate: "Ending date cannot be in the past",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              endingDate: "",
            }));
          }
        }

        // Validate dates when both are filled
        if (updated.startingDate && updated.endingDate) {
          const startDate = new Date(updated.startingDate);
          const endDate = new Date(updated.endingDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          if (startDate > endDate) {
            setErrors((prev) => ({
              ...prev,
              endingDate: "Ending date must be after starting date",
            }));
          } else if (startDate >= today && endDate >= today) {
            // Clear ending date error if both dates are valid
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
    if (errors[field] && field !== "endingDate" && field !== "startingDate") {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.startingDate) {
      newErrors.startingDate = "Starting date is required";
    } else {
      const startDate = new Date(formData.startingDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startingDate = "Starting date cannot be in the past";
      }
    }

    if (!formData.endingDate) {
      newErrors.endingDate = "Ending date is required";
    } else {
      const endDate = new Date(formData.endingDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) {
        newErrors.endingDate = "Ending date cannot be in the past";
      }
    }

    // Validate that starting date is not after ending date
    if (formData.startingDate && formData.endingDate) {
      const startDate = new Date(formData.startingDate);
      const endDate = new Date(formData.endingDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      if (startDate > endDate) {
        newErrors.endingDate = "Ending date must be after starting date";
      }
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
              lang="en"
              className={styles.inputStyle}
              min={todayDate}
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
              lang="en"
              className={styles.inputStyle}
              min={todayDate}
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