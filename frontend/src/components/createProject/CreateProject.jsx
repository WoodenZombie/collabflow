import { useState } from "react";

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

    // Format dates to match existing format (MM/DD/YY)
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${day}/${year}`;
    };

    // Create new project object
    const newProject = {
      id: Date.now(), // Generate unique ID
      title: formData.title.trim(),
      description: formData.description.trim(),
      startingDate: formatDate(formData.startingDate),
      endingDate: formatDate(formData.endingDate),
      teams: formData.teams,
      users: formData.users,
      participants: formData.users.map((u) => u.name),
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

          {/* Duration Field */}
          <div>
            <label>Duration</label>
            <div>
              <label>Starting Date</label>
              <input
                type="date"
                value={formData.startingDate}
                onChange={(e) => handleChange("startingDate", e.target.value)}
              />
              {errors.startingDate && <div>{errors.startingDate}</div>}
            </div>
            <div>
              <label>Ending Date</label>
              <input
                type="date"
                value={formData.endingDate}
                onChange={(e) => handleChange("endingDate", e.target.value)}
              />
              {errors.endingDate && <div>{errors.endingDate}</div>}
            </div>
          </div>

          {/* Teams Field */}
          <div>
            <label>Teams</label>
            <select onChange={handleTeamChange} defaultValue="">
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
              <div>
                {formData.teams.map((team) => (
                  <div key={team}>
                    {team}
                    <button
                      type="button"
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
          <div>
            <label>Users</label>
            <div>
              {formData.users.map((user) => (
                <div key={user.id}>
                  <span>{user.initial}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
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
          <button type="submit">Create new project</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectForm;
