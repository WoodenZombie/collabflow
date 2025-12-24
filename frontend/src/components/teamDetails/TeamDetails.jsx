import React from "react";
import styles from "./teamDetails.module.css";
import UserAvatar from "../userAvatar/UserAvatar";

/**
 * TeamDetails - Split view showing team members (left) and team tasks (right)
 *
 * Props:
 * - team: { id, name, description, members: Array<{id,name,email,avatarUrl?>}> }
 * - tasks: Array<{ id, title, status }>
 * - onBack?: () => void
 * - onEditTeam?: (team) => void
 * - onDeleteTeam?: (teamId) => void
 * - onRemoveMember?: (teamId, userId) => void
 * - onAddMemberByEmail?: (teamId, email) => void
 */
function TeamDetails({
  team,
  tasks = [],
  onBack,
  onEditTeam,
  onDeleteTeam,
  onRemoveMember,
  onAddMemberByEmail,
}) {
  const [emailInput, setEmailInput] = React.useState("");

  // Render both columns always. If no team is provided, show placeholders and disable actions.
  const hasTeam = Boolean(team);

  const handleAddClick = () => {
    const email = emailInput.trim();
    if (!email) return;
    if (onAddMemberByEmail) onAddMemberByEmail(team.id, email);
    setEmailInput("");
  };

  return (
    <div className={styles.container}>
      {/* Split content */}
      <div className={styles.splitGrid}>
        {/* Left: Members */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Members</h2>
          </div>
          <div className={styles.membersList}>
            {(!(team && team.members) || team.members.length === 0) && hasTeam && (
              <div className={styles.empty}>No members yet</div>
            )}
            {(team && team.members || []).map((user) => (
              <div key={user.id || user} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  <UserAvatar
                    initial={(user.name || "?").charAt(0).toUpperCase()}
                    name={user.name || String(user)}
                  />
                </div>
                {onRemoveMember && (
                  <button
                    className={styles.removeIcon}
                    title="Remove user from team"
                    onClick={() => hasTeam && onRemoveMember(team.id, user.id || user)}
                    disabled={!hasTeam}
                    style={{ opacity: hasTeam ? 1 : 0.5, cursor: hasTeam ? 'pointer' : 'not-allowed' }}
                  >
                    {/* Trash icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#C62828"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-1 6h2v10H8V9zm6 0h2v10h-2V9z"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.addMemberRow}>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter user email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={!hasTeam}
            />
            <button
              className={styles.addButton}
              onClick={handleAddClick}
              disabled={!emailInput.trim() || !hasTeam}
              title={hasTeam ? 'Add user by email' : 'Select a team to add members'}
              style={{ opacity: hasTeam ? 1 : 0.5, cursor: hasTeam ? 'pointer' : 'not-allowed' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tasks</h2>
          </div>
          <div className={styles.tasksList}>
            {(!tasks || tasks.length === 0) && hasTeam && (
              <div className={styles.empty}>No task yet</div>
            )}
            {(tasks || []).map((t) => (
              <div key={t.id} className={styles.taskRow}>
                <div className={styles.taskTitle}>{t.title || t.name || `Task #${t.id}`}</div>
                <div className={styles.taskStatus}>
                  {t.status === "inProgress" ? "In Progress" : t.status === "completed" ? "Completed" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDetails;
