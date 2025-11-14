import { useState, useEffect } from "react";

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
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div>
            <h2>Edit Project Details</h2>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Name Field */}
          <div>
            <label>Name</label>
            <div>{project.title || "Untitled Project"}</div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title && <div>{errors.title}</div>}
          </div>

          {/* Starting Date Field */}
          <div>
            <label>Starting Date</label>
            <div>{project.startingDate || ""}</div>
            <input
              type="date"
              value={formData.startingDate}
              onChange={(e) => handleChange("startingDate", e.target.value)}
            />
            {errors.startingDate && <div>{errors.startingDate}</div>}
          </div>

          {/* Ending Date Field */}
          <div>
            <label>Ending date</label>
            <div>{project.endingDate || ""}</div>
            <input
              type="date"
              value={formData.endingDate}
              onChange={(e) => handleChange("endingDate", e.target.value)}
            />
            {errors.endingDate && <div>{errors.endingDate}</div>}
          </div>

          {/* Description Field */}
          <div>
            <label>Description</label>
            <div>{project.description || "No description"}</div>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && <div>{errors.description}</div>}
          </div>

          {/* Teams Field */}
          <div>
            <label>Teams</label>
            <div>
              {project.teams && project.teams.length > 0 ? (
                project.teams.map((team) => <span key={team}>{team}</span>)
              ) : (
                <span>No teams</span>
              )}
            </div>
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
              {project.users && project.users.length > 0 ? (
                project.users.map((user) => (
                  <div key={typeof user === "string" ? user : user.id || user}>
                    <span>
                      {typeof user === "string"
                        ? user
                        : user.initial || user.name || "?"}
                    </span>
                  </div>
                ))
              ) : (
                <span>No users</span>
              )}
            </div>
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
          <button type="submit">Edit</button>
        </form>
      </div>
    </div>
  );
}

export default EditProjectForm;
