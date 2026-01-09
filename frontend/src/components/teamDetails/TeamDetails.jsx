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
 * - isAddingMember?: boolean
 * - availableUsers?: Array<{id, name, email}> - List of available users for selection
 */
function TeamDetails({
  team,
  tasks = [],
  onBack,
  onEditTeam,
  onDeleteTeam,
  onRemoveMember,
  onAddMemberByEmail,
  isAddingMember = false,
  availableUsers = [],
}) {
  const [emailInput, setEmailInput] = React.useState("");
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  // Render both columns always. If no team is provided, show placeholders and disable actions.
  const hasTeam = Boolean(team);

  // Debug logging
  React.useEffect(() => {
    console.log('TeamDetails props:', { 
      hasTeam, 
      onRemoveMember: !!onRemoveMember, 
      membersCount: team?.members?.length,
      teamId: team?.id 
    });
  }, [hasTeam, onRemoveMember, team]);

  const handleAddClick = () => {
    const email = emailInput.trim();
    if (!email) return;
    if (onAddMemberByEmail) {
      onAddMemberByEmail(team.id, email);
      setEmailInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddClick();
    }
  };

  const handleUserSelect = (email) => {
    setEmailInput(email);
    setShowUserDropdown(false);
  };

  // Filter out users that are already team members
  const existingMemberEmails = team && team.members 
    ? team.members.map(m => m.email || m).filter(Boolean)
    : [];
  
  const availableUsersToShow = availableUsers.filter(
    user => !existingMemberEmails.includes(user.email)
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('[data-user-dropdown]')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserDropdown]);

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
            {(team && team.members || []).map((user, index) => {
              const userId = user.id || (typeof user === 'object' ? (user.user_id || user.id) : user);
              const canRemove = hasTeam && onRemoveMember;
              
              console.log(`Member ${index}:`, { 
                user, 
                userId, 
                hasTeam, 
                onRemoveMember: !!onRemoveMember, 
                canRemove 
              });

              return (
                <div 
                  key={user.id || user || index} 
                  className={styles.memberRow}
                  onClick={(e) => {
                    // Prevent row click from interfering with button click
                    if (e.target.closest('button')) {
                      return;
                    }
                    console.log('Member row clicked (not button)');
                  }}
                  style={{ position: 'relative' }}
                >
                  <div className={styles.memberInfo}>
                    <UserAvatar
                      initial={(user.name || "?").charAt(0).toUpperCase()}
                      name={user.name || String(user)}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "#333" }}>
                        {user.name || "Unknown User"}
                      </div>
                      {user.email && (
                        <div style={{ fontSize: "12px", color: "#777" }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.removeIcon}
                    title={canRemove ? "Remove user from team" : "Only Project Managers can remove members"}
                    onClick={(e) => {
                      console.log('=== REMOVE BUTTON CLICKED ===');
                      console.log('Event:', e);
                      console.log('Event target:', e.target);
                      console.log('Event currentTarget:', e.currentTarget);
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log('Remove button clicked:', { 
                        hasTeam, 
                        onRemoveMember: !!onRemoveMember,
                        onRemoveMemberType: typeof onRemoveMember,
                        user, 
                        userId,
                        teamId: team?.id,
                        canRemove
                      });
                      
                      if (!hasTeam) {
                        console.error('Cannot remove: No team');
                        alert('No team selected.');
                        return;
                      }
                      
                      if (!onRemoveMember) {
                        console.error('Cannot remove: onRemoveMember is not provided');
                        alert('Remove functionality is not available. Only Project Managers can remove members.');
                        return;
                      }
                      
                      if (canRemove) {
                        console.log('Calling onRemoveMember with:', { teamId: team.id, userId, user });
                        try {
                          onRemoveMember(team.id, userId);
                          console.log('onRemoveMember called successfully');
                        } catch (error) {
                          console.error('Error calling onRemoveMember:', error);
                          alert('Error removing member: ' + error.message);
                        }
                      } else {
                        console.warn('Cannot remove member:', { 
                          hasTeam, 
                          onRemoveMember: !!onRemoveMember,
                          reason: !hasTeam ? 'No team' : !onRemoveMember ? 'onRemoveMember not provided' : 'Unknown'
                        });
                        alert('Only Project Managers can remove members from teams.');
                      }
                    }}
                    disabled={!canRemove}
                    style={{ 
                      opacity: canRemove ? 1 : 0.5, 
                      cursor: canRemove ? 'pointer' : 'not-allowed',
                      pointerEvents: canRemove ? 'auto' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      minWidth: '24px',
                      minHeight: '24px',
                      zIndex: 10,
                      position: 'relative'
                    }}
                    onMouseDown={(e) => {
                      console.log('Remove button mouseDown');
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      console.log('Remove button mouseUp');
                      e.stopPropagation();
                    }}
                  >
                    {/* Trash icon */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="#C62828"
                      style={{ pointerEvents: 'none' }}
                    >
                      <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-1 6h2v10H8V9zm6 0h2v10h-2V9z"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {onAddMemberByEmail && (
            <div className={styles.addMemberRow}>
              <div style={{ position: "relative", flex: 1 }} data-user-dropdown>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Enter user email or select from list"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setShowUserDropdown(false);
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => availableUsersToShow.length > 0 && setShowUserDropdown(true)}
                  disabled={!hasTeam || isAddingMember}
                  list="user-email-list"
                />
                {availableUsersToShow.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    disabled={!hasTeam || isAddingMember}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: (!hasTeam || isAddingMember) ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      color: "#666",
                      padding: "4px 8px",
                    }}
                    title="Show available users"
                  >
                    ▼
                  </button>
                )}
                {showUserDropdown && availableUsersToShow.length > 0 && (
                  <div
                    data-user-dropdown
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
                    {availableUsersToShow.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user.email)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f3f4f6",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                      >
                        <div style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
                          {user.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={styles.addButton}
                onClick={handleAddClick}
                disabled={!emailInput.trim() || !hasTeam || isAddingMember}
                title={hasTeam ? (isAddingMember ? 'Adding user...' : 'Add user by email') : 'Select a team to add members'}
                style={{ 
                  opacity: (hasTeam && !isAddingMember && emailInput.trim()) ? 1 : 0.5, 
                  cursor: (hasTeam && !isAddingMember && emailInput.trim()) ? 'pointer' : 'not-allowed' 
                }}
              >
                {isAddingMember ? "..." : "+"}
              </button>
            </div>
          )}
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
