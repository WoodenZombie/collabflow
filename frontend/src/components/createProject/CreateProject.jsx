import { useState, useEffect } from "react";
import styles from "./createProjectModal.module.css";
import { getAllUsers } from "../../services/userApi";

function CreateProjectForm({ onClose, onCreate, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingDate: "",
    endingDate: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]); // Array of {email, name}
  const [emailInput, setEmailInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Load available users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await getAllUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error("Failed to load users:", err);
        setUserError("Failed to load users. You can still type email manually.");
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('[data-user-suggestions]')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Filter users based on email input
  const filteredUsers = availableUsers.filter(
    (user) =>
      !selectedUsers.some((selected) => selected.email === user.email) &&
      user.email.toLowerCase().includes(emailInput.toLowerCase())
  );

  // Handle email input change
  const handleEmailInputChange = (value) => {
    setEmailInput(value);
    setShowSuggestions(value.length > 0 && filteredUsers.length > 0);
    setUserError("");
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    if (!selectedUsers.some((selected) => selected.email === user.email)) {
      setSelectedUsers([...selectedUsers, { email: user.email, name: user.name }]);
      setEmailInput("");
      setShowSuggestions(false);
    }
  };

  // Handle adding user by manual email entry
  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setUserError("Please enter a valid email address");
      return;
    }

    // Check if already added
    if (selectedUsers.some((selected) => selected.email.toLowerCase() === email.toLowerCase())) {
      setUserError("This user is already added");
      return;
    }

    // Try to find user name from available users
    const foundUser = availableUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    setSelectedUsers([
      ...selectedUsers,
      { email: email, name: foundUser?.name || email },
    ]);
    setEmailInput("");
    setShowSuggestions(false);
    setUserError("");
  };

  // Handle removing a user
  const handleRemoveUser = (emailToRemove) => {
    setSelectedUsers(selectedUsers.filter((user) => user.email !== emailToRemove));
  };

  // Handle key press in email input
  const handleEmailKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredUsers.length === 1) {
        handleSelectUser(filteredUsers[0]);
      } else {
        handleAddEmail();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

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
      userEmails: selectedUsers.map((user) => user.email), // Include selected user emails
      // Status will default to 'Planning' in backend
    };

    // Call onCreate callback - parent will handle closing modal after success
    // Parent should handle adding users after project creation
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

          {/* Users Field */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Add Users (Optional)</label>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ flex: 1, position: "relative" }} data-user-suggestions>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={
                      isLoadingUsers
                        ? "Loading users..."
                        : "Type email or select from list"
                    }
                    value={emailInput}
                    onChange={(e) => handleEmailInputChange(e.target.value)}
                    onKeyPress={handleEmailKeyPress}
                    onFocus={() => {
                      if (emailInput && filteredUsers.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    disabled={isLoadingUsers}
                  />
                  {showSuggestions && filteredUsers.length > 0 && (
                    <div
                      data-user-suggestions
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        marginTop: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 100,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f4f6",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f9fafb")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "transparent")
                          }
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            {user.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#777",
                              marginTop: "2px",
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={!emailInput.trim() || isLoadingUsers}
                  className={styles.addUserButton}
                  title="Add user"
                >
                  +
                </button>
              </div>
              {userError && (
                <div className={styles.error} style={{ marginTop: "4px" }}>
                  {userError}
                </div>
              )}
              {selectedUsers.length > 0 && (
                <div className={styles.tagsContainer}>
                  {selectedUsers.map((user) => (
                    <div key={user.email} className={styles.tag}>
                      <span>{user.name || user.email}</span>
                      <button
                        type="button"
                        className={styles.removeTagButton}
                        onClick={() => handleRemoveUser(user.email)}
                        title="Remove user"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? "Creating project..." : "Create new project"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectForm;