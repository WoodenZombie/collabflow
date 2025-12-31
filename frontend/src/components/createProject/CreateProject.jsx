import { useState } from "react";
import styles from "./createProjectModal.module.css";

function CreateProjectForm({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingDate: "",
    endingDate: "",
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
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
                  min={todayDate}
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
                  min={todayDate}
                  value={formData.endingDate}
                  onChange={(e) => handleChange("endingDate", e.target.value)}
                />
                {errors.endingDate && (
                  <div className={styles.error}>{errors.endingDate}</div>
                )}
              </div>
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