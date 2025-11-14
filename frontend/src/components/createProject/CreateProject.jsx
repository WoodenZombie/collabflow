import { useState } from "react";

/**
 * CreateProjectForm - Modal form for creating a new project
 *
 * Props:
 * - onClose: function (callback to close modal)
 * - onCreate: function (callback when form is submitted with project data)
 */
function CreateProjectForm({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create new project object
    const newProject = {
      id: Date.now(), // Generate unique ID
      title: formData.title.trim(),
      description: formData.description.trim(),
      participants: [],
      progress: { waiting: 0, inProgress: 0, done: 0 },
    };

    // Call onCreate callback
    onCreate(newProject);

    // Close modal
    onClose();
  };

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div>
            <h2>Create a new Project</h2>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label>Title</label>
            <input
              type="text"
              placeholder="Project title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title && <div>{errors.title}</div>}
          </div>

          {/* Description Field */}
          <div>
            <label>Description</label>
            <textarea
              placeholder="Project description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && <div>{errors.description}</div>}
          </div>

          {/* Submit Button */}
          <button type="submit">Create new project</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectForm;
