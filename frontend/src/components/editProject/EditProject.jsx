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
  });

  const [errors, setErrors] = useState({});

  // Initialize form data from project
  useEffect(() => {
    if (project) {
      // Parse dates from MM/DD/YY to YYYY-MM-DD format for input
      const parseDate = (dateString) => {
        if (!dateString) return "";
        // Already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        const parts = dateString.split("/");
        if (parts.length === 3) {
          const month = parts[0].padStart(2, "0");
          const day = parts[1].padStart(2, "0");
          const year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
          return `${year}-${month}-${day}`;
        }
        // Try generic Date parse
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
        return "";
      };

      setFormData({
        title: project.title || "",
        description: project.description || "",
        startingDate: parseDate(project.startingDate) || "",
        endingDate: parseDate(project.endingDate) || "",
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

    // Format dates to YYYY-MM-DD format for backend
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

    // Create updated project object with original project ID
    const updatedProject = {
      ...project, // Keep all original fields including id
      title: formData.title.trim(),
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
    };

    // Call onUpdate callback - parent will handle closing modal after success
    onUpdate(updatedProject);

    // Don't close modal here - let parent handle it after successful API call
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
            lang="en"
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
            lang="en"
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