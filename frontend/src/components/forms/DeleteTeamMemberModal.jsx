import styles from '../deleteProject/deleteProjectModal.module.css';
import UserAvatar from '../userAvatar/UserAvatar';

function DeleteTeamMemberModal({ user, teamName, onClose, onConfirm }) {
  console.log('DeleteTeamMemberModal rendered:', { user, teamName, onClose: !!onClose, onConfirm: !!onConfirm });
  
  if (!user) {
    console.warn('DeleteTeamMemberModal: user is null');
    return null;
  }

  const handleConfirm = () => {
    console.log('DeleteTeamMemberModal: handleConfirm called');
    if (onConfirm) {
      console.log('DeleteTeamMemberModal: calling onConfirm');
      onConfirm();
    } else {
      console.error('DeleteTeamMemberModal: onConfirm is not provided');
    }
    if (onClose) {
      console.log('DeleteTeamMemberModal: calling onClose');
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Remove Team Member</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
            Are you sure you want to remove this user from the team <strong>{teamName}</strong>?
          </p>

          {/* User Info */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>User</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <UserAvatar
                initial={(user.name || "?").charAt(0).toUpperCase()}
                name={user.name || String(user)}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#333" }}>
                  {user.name || "Unknown User"}
                </div>
                {user.email && (
                  <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#F2F2F7',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            Cancel
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#C62828',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTeamMemberModal;
