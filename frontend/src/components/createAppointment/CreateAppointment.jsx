import { useState } from "react";
import styles from "./createAppointment.module.css";

/**
 * CreateAppointmentForm - Modal form for creating a new appointment
 *
 * Props:
 * - onClose: function (callback to close modal)
 * - onCreate: function (callback when form is submitted with appointment data)
 * - projectId: number (required project ID)
 */
function CreateAppointmentForm({ onClose, onCreate, projectId }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    duration: 60, // Default 60 minutes
    location: "",
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    // Validate duration is a positive number
    if (formData.duration && (isNaN(formData.duration) || formData.duration <= 0)) {
      newErrors.duration = "Duration must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!projectId) {
      setErrors({ general: "Project ID is required" });
      return;
    }

    // Create new appointment object matching backend format
    const newAppointment = {
      projectId: parseInt (projectId),
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date.trim(),
      duration: parseInt(formData.duration) || 60,
      location: formData.location.trim(),
    };

    try {
      // Call onCreate callback (which will handle API call)
      await onCreate(newAppointment);
      // Close modal after successful creation
      onClose();
    } catch (error) {
      console.error("Error in CreateAppointmentForm:", error);
      setErrors({ general: error.message || "Failed to create appointment" });
      // Don't close modal on error so user can try again
    }
  };

  return (
    <div className={styles.overlayStyle} onClick={onClose}>
      <div className={styles.modalStyle} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={styles.headerStyle}>
            <h2 className={styles.titleStyle}>Create Appointment</h2>
            <button
              type="button"
              className={styles.closeButtonStyle}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className={styles.errorStyle}>{errors.general}</div>
          )}

          {/* Title Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Title *</label>
            <input
              type="text"
              className={styles.inputStyle}
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter appointment title"
            />
            {errors.title && (
              <div className={styles.errorStyle}>{errors.title}</div>
            )}
          </div>

          {/* Description Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Description *</label>
            <textarea
              className={styles.inputStyle}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter appointment description"
              rows={3}
            />
            {errors.description && (
              <div className={styles.errorStyle}>{errors.description}</div>
            )}
          </div>

          {/* Date Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Date *</label>
            <input
              type="date"
              className={styles.inputStyle}
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
            />
            {errors.date && (
              <div className={styles.errorStyle}>{errors.date}</div>
            )}
          </div>

          {/* Duration Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Duration (minutes) *</label>
            <input
              type="number"
              className={styles.inputStyle}
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              min="1"
              placeholder="60"
            />
            {errors.duration && (
              <div className={styles.errorStyle}>{errors.duration}</div>
            )}
          </div>

          {/* Location Field */}
          <div className={styles.fieldContainerStyle}>
            <label className={styles.labelStyle}>Location *</label>
            <input
              type="text"
              className={styles.inputStyle}
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Enter location"
            />
            {errors.location && (
              <div className={styles.errorStyle}>{errors.location}</div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitButtonStyle}>
            Create Appointment
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAppointmentForm;
