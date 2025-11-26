import styles from '../deleteProject/deleteProjectModal.module.css';
import UserAvatar from '../userAvatar/UserAvatar';

function DeleteTeamForm({ team, allUsers, onClose, onDelete }) {
  if (!team) return null;

  const members = team.members
    ? team.members
        .map(id => allUsers.find(u => u.id === id))
        .filter(Boolean)
    : [];

  const handleDelete = () => {
    onDelete(team.id);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Team</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Read-only */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Name</label>
            <div className={styles.value}>{team.name}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Description</label>
            <div className={styles.value}>{team.description || "No description"}</div>
          </div>

          {/* Participants */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Participants</label>
            <div className={styles.tagsContainer}>
              {members.length > 0 ? (
                members.map((user) => (
                  <div key={user.id}>
                    <UserAvatar initial={user.initial} name={user.name} />
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '14px', color: '#999' }}>No members</span>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button className={styles.deleteButton} onClick={handleDelete}>
          Delete Team
        </button>
      </div>
    </div>
  );
}

export default DeleteTeamForm;